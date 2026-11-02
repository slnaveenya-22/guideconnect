import api from './axios';

export async function getAdminStats() {
  const res = await api.get('/admin/stats');
  return res.data.data;
}

export async function getPendingVerifications() {
  const res = await api.get('/admin/verifications');
  return res.data.data;
}

export async function reviewVerification(id, status, rejectionReason = null) {
  const res = await api.patch(`/admin/verifications/${id}`, { status, rejectionReason });
  return res.data.data;
}

export async function getAllUsers() {
  const res = await api.get('/admin/users');
  return res.data.data;
}

export async function toggleUserStatus(id, isActive) {
  const res = await api.patch(`/admin/users/${id}/suspend`, { isActive });
  return res.data.data;
}