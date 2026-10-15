import api from './axios';

// ---- Public ----

export async function searchExperiences(params = {}) {
  const res = await api.get('/experiences', { params });
  return res.data; // { success, data, pagination }
}

export async function getExperienceById(id) {
  const res = await api.get(`/experiences/${id}`);
  return res.data.data;
}

export async function getGuideExperiences(guideId) {
  const res = await api.get(`/guides/${guideId}/experiences`);
  return res.data.data;
}

// ---- Guide-owned ----

export async function getMyExperiences() {
  const res = await api.get('/guide/experiences');
  return res.data.data;
}

export async function createExperience(formData) {
  const res = await api.post('/experiences', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function updateExperience(id, formData) {
  const res = await api.patch(`/experiences/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function deleteExperience(id) {
  const res = await api.delete(`/experiences/${id}`);
  return res.data.data;
}