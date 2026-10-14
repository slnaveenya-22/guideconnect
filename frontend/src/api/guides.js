import api from './axios';

// ---- Public guide search & profile ----

export async function searchGuides(params = {}) {
  const res = await api.get('/guides', { params });
  return res.data; // { success, data: [...], pagination }
}

export async function getGuideById(id) {
  const res = await api.get(`/guides/${id}`);
  return res.data.data;
}

export async function getGuideExperiences(id) {
  const res = await api.get(`/guides/${id}/experiences`);
  return res.data.data;
}

// ---- Own guide profile (guide role) ----

export async function getMyGuideProfile() {
  const res = await api.get('/guide/profile');
  return res.data.data;
}

export async function createMyGuideProfile(payload) {
  const res = await api.post('/guide/profile', payload);
  return res.data.data;
}

export async function updateMyGuideProfile(payload) {
  const res = await api.patch('/guide/profile', payload);
  return res.data.data;
}

// ---- Verification ----

export async function submitVerification(formData) {
  const res = await api.post('/guide/verification', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function getMyVerification() {
  const res = await api.get('/guide/verification');
  return res.data.data;
}