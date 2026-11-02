import api from './axios';

export async function getMyAvailability() {
  const res = await api.get('/availability/mine');
  return res.data.data;
}

export async function addAvailabilitySlot(data) {
  const res = await api.post('/availability', data);
  return res.data.data;
}

export async function deleteAvailabilitySlot(id) {
  const res = await api.delete(`/availability/${id}`);
  return res.data;
}

export async function getGuideAvailability(guideId) {
  const res = await api.get(`/guides/${guideId}/availability`);
  return res.data.data;
}