import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ChevronRight, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { getMyBookings } from '../api/bookings';
import { useAuth } from '../context/AuthContext';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isGuide = user?.role === 'GUIDE';

  useEffect(() => {
    // Fetch all bookings and filter for ones where chat is active
    getMyBookings()
      .then((bookings) => {
        // Chat is only available for ACCEPTED or COMPLETED bookings
        const activeBookings = bookings.filter((b) => 
          ['ACCEPTED', 'COMPLETED'].includes(b.status)
        );
        
        // Sort by date (newest first)
        activeBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
        setConversations(activeBookings);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load conversations');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout
      title="Messages"
      subtitle={`Chat with your ${isGuide ? 'tourists' : 'guides'} to plan the trip`}
    >
      {error && <div className="alert alert-danger">{error}</div>}

      {loading && (
        <div className="text-center py-5 text-muted-2">
          <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
          <p>Loading your messages...</p>
        </div>
      )}

      {!loading && conversations.length === 0 && (
        <div className="card p-5 text-center text-muted-2">
          <div className="gc-feature-icon mx-auto mb-3" style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(37,99,235,0.1)', color: 'var(--gc-primary)' }}>
            <MessageSquare size={28} />
          </div>
          <h5 style={{ fontWeight: 700, color: 'var(--gc-navy)' }}>No active conversations</h5>
          <p className="mb-0">
            Chats become available once a booking request is accepted by the {isGuide ? 'tourist' : 'guide'}.
          </p>
          {!isGuide && (
            <Link to="/guides" className="btn btn-primary mt-3 mx-auto">
              Explore Guides
            </Link>
          )}
        </div>
      )}

      {!loading && conversations.length > 0 && (
        <div className="card overflow-hidden">
          <div className="list-group list-group-flush">
            {conversations.map((booking) => {
              // Determine who the other person is
              const otherParty = isGuide ? booking.tourist : booking.guide;
              const initials = otherParty?.name
                ?.split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || '?';

              // Generate a color for the avatar based on the booking ID
              const avatarColor = `hsl(${(booking.id * 60) % 360}, 60%, 55%)`;

              return (
                <Link
                  key={booking.id}
                  to={`/${isGuide ? 'guide' : 'tourist'}/messages/${booking.id}`}
                  className="list-group-item list-group-item-action p-3 d-flex align-items-center gap-3"
                  style={{ borderLeft: '3px solid transparent', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderLeftColor = 'var(--gc-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderLeftColor = 'transparent'}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: avatarColor,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1rem',
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>

                  {/* Message Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', margin: 0 }}>
                        {otherParty?.name}
                      </h6>
                      <small className="text-muted-2" style={{ fontSize: '0.75rem' }}>
                        {new Date(booking.scheduledDate || booking.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </small>
                    </div>
                    <div className="text-muted-2 text-truncate d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                      <span className="d-flex align-items-center gap-1">
                        <CheckCircle2 size={12} style={{ color: '#10b981' }} />
                        Booking Confirmed
                      </span>
                      <span>·</span>
                      <span>{booking.experience?.title}</span>
                    </div>
                  </div>

                  {/* Chevron */}
                  <ChevronRight size={18} className="text-muted-2" style={{ flexShrink: 0 }} />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}