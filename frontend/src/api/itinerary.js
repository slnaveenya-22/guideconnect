import api from './axios';

export async function getItinerary(bookingId) {
  const res = await api.get(`/bookings/${bookingId}/itinerary`);
  return res.data.data;
}

export async function addItineraryItem(bookingId, data) {
  const res = await api.post(`/bookings/${bookingId}/itinerary/items`, data);
  return res.data.data;
}

export async function deleteItineraryItem(bookingId, itemId) {
  const res = await api.delete(`/bookings/${bookingId}/itinerary/items/${itemId}`);
  return res.data;
}