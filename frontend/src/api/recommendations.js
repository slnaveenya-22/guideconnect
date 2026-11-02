import api from './axios';

export async function getRecommendations(params) {
  // params: { city, date, language, category, interests (comma separated), maxPrice }
  const res = await api.get('/recommendations/guides', { params });
  return res.data.data;
}

export async function previewRecommendations(body) {
  const res = await api.post('/recommendations/preview', body);
  return res.data.data;
}