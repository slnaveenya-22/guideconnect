import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { getConversation, getMessages } from '../api/chat';
import { useAuth } from '../context/AuthContext';

let socket;

export default function ChatWindow() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conversation, setConversation] = useState(null);
  
  const messagesEndRef = useRef(null);

  // 1. Fetch conversation metadata & message history
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getConversation(bookingId)
      .then((conv) => {
        if (!isMounted) return;
        setConversation(conv);
        return getMessages(conv.id);
      })
      .then((history) => {
        if (isMounted) setMessages(history || []);
      })
      .catch((err) => {
        if (isMounted) setError(err.response?.data?.message || 'Failed to load chat');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [bookingId]);

  // 2. Setup Socket.IO when conversation is loaded
  useEffect(() => {
    if (!conversation) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    // Connect with JWT
    socket = io(socketUrl, {
      auth: { token: localStorage.getItem('gc_token') }
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected');
      // ✅ FIX 1: Match backend event name
      socket.emit('conversation:join', conversation.id, (res) => {
        console.log('Joined room:', res);
      });
    });

    // ✅ FIX 2: Match backend event name
    socket.on('message:new', (message) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [conversation]);

  // 3. Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Send message
  function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !socket || !conversation) return;

    const messageData = {
      conversationId: conversation.id,
      content: input.trim(),
    };

    // ✅ FIX 3: Match backend event name and handle callback
    socket.emit('message:send', messageData, (res) => {
      if (res.success) {
        setInput(''); // Clear input only if successful
      } else {
        alert('Failed to send message: ' + res.message);
      }
    });
  }

  const otherParty = user?.role === 'GUIDE' ? conversation?.tourist : conversation?.guide;
  const isGuide = user?.role === 'GUIDE';
  const backLink = isGuide ? '/guide/messages' : '/tourist/messages';

  if (loading) {
    return (
      <DashboardLayout title="Messages">
        <div className="text-center py-5 text-muted-2">
          <Loader2 size={32} className="spinner-border text-primary mb-3 border-0" />
          <p>Loading conversation...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Messages">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-outline-navy" onClick={() => navigate(backLink)}>
          Back to Inbox
        </button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Chat Container */}
      <div className="card d-flex flex-column" style={{ height: 'calc(100vh - 140px)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div className="p-3 border-bottom d-flex align-items-center gap-3 bg-white">
          <button className="btn btn-ghost btn-sm px-2" onClick={() => navigate(backLink)}>
            <ArrowLeft size={18} />
          </button>
          <div 
            style={{ 
              width: 40, height: 40, borderRadius: '50%', 
              background: 'var(--gc-navy)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700
            }}
          >
            {otherParty?.name?.charAt(0) || '?'}
          </div>
          <div>
            <h6 style={{ margin: 0, fontWeight: 700, color: 'var(--gc-navy)' }}>
              {otherParty?.name || 'Chat'}
            </h6>
            <small className="text-muted-2">Re: {conversation?.booking?.experience?.title || 'Experience'}</small>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          className="p-3 flex-grow-1" 
          style={{ 
            overflowY: 'auto', 
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          {messages.length === 0 ? (
            <div className="text-center text-muted-2 mt-5">
              <p>No messages yet.</p>
              <p style={{ fontSize: '0.85rem' }}>Say hello to start planning your trip!</p>
            </div>
          ) : (
            messages.map((msg) => {
              // ✅ FIX 4: Check sender.id since the backend includes the nested sender object
              const isMe = msg.sender?.id === user.id || msg.senderId === user.id;
              
              return (
                <div 
                  key={msg.id} 
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '75%',
                  }}
                >
                  <div style={{
                    background: isMe ? 'var(--gc-primary)' : '#fff',
                    color: isMe ? '#fff' : 'var(--gc-text)',
                    padding: '0.6rem 1rem',
                    borderRadius: 12,
                    borderBottomRightRadius: isMe ? 2 : 12,
                    borderBottomLeftRadius: !isMe ? 2 : 12,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    fontSize: '0.95rem'
                  }}>
                    {msg.content}
                  </div>
                  <div 
                    style={{ 
                      fontSize: '0.7rem', 
                      color: '#94a3b8', 
                      textAlign: isMe ? 'right' : 'left',
                      marginTop: 2,
                      padding: '0 4px'
                    }}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-top bg-white">
          <form onSubmit={handleSend} className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ borderRadius: 20, paddingLeft: 16 }}
            />
            <button 
              type="submit" 
              className="btn btn-primary d-flex align-items-center justify-content-center"
              style={{ width: 45, height: 45, borderRadius: '50%', padding: 0 }}
              disabled={!input.trim() || !socket?.connected}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
        
      </div>
    </DashboardLayout>
  );
}