import { useAuth } from '../../context/AuthContext';

export default function TouristDashboard() {
  const { user } = useAuth();
  return (
    <div className="container py-5">
      <h2>Tourist Dashboard</h2>
      <p className="text-muted">Welcome, {user?.name}!</p>
      <p>Your bookings, recommendations, and itineraries will appear here.</p>
    </div>
  );
}