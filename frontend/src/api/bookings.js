import api from './axios';

export async function createBooking(data) {
  const res = await api.post('/bookings', data);
  return res.data.data;
}

export async function getMyBookings() {
  const res = await api.get('/bookings/my');
  return res.data.data;
}

export async function acceptBooking(id) {
  const res = await api.patch(`/bookings/${id}/accept`);
  return res.data.data;
}

export async function rejectBooking(id) {
  const res = await api.patch(`/bookings/${id}/reject`);
  return res.data.data;
}

export async function cancelBooking(id) {
  const res = await api.patch(`/bookings/${id}/cancel`);
  return res.data.data;
}