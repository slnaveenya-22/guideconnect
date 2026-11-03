import api from './axios';

// --- For Guides ---
export async function getExperienceAvailability(experienceId) {
  const res = await api.get(`/availability/experience/${experienceId}`);
  return res.data.data;
}

export async function addAvailabilitySlot(data) {
  // data now needs to include experienceId
  const res = await api.post('/availability', data);
  return res.data.data;
}

export async function deleteAvailabilitySlot(id) {
  const res = await api.delete(`/availability/${id}`);
  return res.data;
}

// --- For Tourists (Public) ---
export async function getPublicExperienceAvailability(experienceId) {
  const res = await api.get(`/experiences/${experienceId}/availability`);
  return res.data.data;
}