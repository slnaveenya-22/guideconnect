import api from './axios';

export async function getConversation(bookingId) {
  const res = await api.get(`/bookings/${bookingId}/conversation`);
  return res.data.data;
}

export async function getMessages(conversationId) {
  const res = await api.get(`/conversations/${conversationId}/messages`);
  return res.data.data;
}

// Fallback for sending (if Socket fails, or for initial load)
export async function sendMessageREST(conversationId, content) {
  const res = await api.post(`/conversations/${conversationId}/messages`, { content });
  return res.data.data;
}