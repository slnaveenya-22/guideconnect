import api from './axios';

export async function submitReview(bookingId, data) {
  // data: { rating, comment }
  const res = await api.post(`/bookings/${bookingId}/review`, data);
  return res.data.data;
}

export async function getGuideReviews(guideId) {
  const res = await api.get(`/guides/${guideId}/reviews`);
  return res.data.data; // Returns { reviews: [...], avgRating, reviewCount }
}