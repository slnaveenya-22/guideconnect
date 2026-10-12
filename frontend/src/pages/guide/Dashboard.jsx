import { useAuth } from '../../context/AuthContext';

export default function GuideDashboard() {
  const { user } = useAuth();
  return (
    <div className="container py-5">
      <h2>Guide Dashboard</h2>
      <p className="text-muted">Welcome, {user?.name}!</p>
      <p>You'll manage your profile, experiences, and bookings here.</p>
    </div>
  );
}