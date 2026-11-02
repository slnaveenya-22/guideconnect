import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { getMyBookings } from '../../api/bookings';
import { getGreeting, getGreetingEmoji } from '../../utils/greeting';

export default function TouristDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Calculate stats
  const pending = bookings.filter((b) => b.status === 'PENDING').length;
  const upcoming = bookings.filter((b) => b.status === 'ACCEPTED').length;
  const completed = bookings.filter((b) => b.status === 'COMPLETED').length;

  // Get the next upcoming trip (if any)
  const nextTrip = bookings
    .filter((b) => b.status === 'ACCEPTED')
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  return (
    <DashboardLayout
      title={`${getGreeting()}, ${user?.name?.split(' ')[0] || 'Traveler'} ${getGreetingEmoji()}`}
      subtitle="Ready for your next adventure?"
    >
      {/* Quick stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="gc-stat">
            <div className="gc-stat-label d-flex align-items-center gap-2">
              <Clock size={14} /> Pending Requests
            </div>
            <div className="gc-stat-value">{loading ? '—' : pending}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="gc-stat">
            <div className="gc-stat-label d-flex align-items-center gap-2">
              <Calendar size={14} /> Upcoming Trips
            </div>
            <div className="gc-stat-value">{loading ? '—' : upcoming}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="gc-stat">
            <div className="gc-stat-label d-flex align-items-center gap-2">
              <CheckCircle2 size={14} /> Completed
            </div>
            <div className="gc-stat-value">{loading ? '—' : completed}</div>
          </div>
        </div>
      </div>

      {/* Next Trip Widget */}
      {nextTrip && (
        <div className="card p-4 mb-4" style={{ borderLeft: '4px solid var(--gc-primary)' }}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <div className="text-primary" style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Next Adventure
              </div>
              <h5 style={{ fontWeight: 800, margin: '0.25rem 0', color: 'var(--gc-navy)' }}>
                {nextTrip.experience?.title}
              </h5>
              <div className="text-muted-2 d-flex gap-3" style={{ fontSize: '0.9rem' }}>
                <span><MapPin size={14} className="me-1" />{nextTrip.experience?.city}</span>
                <span><Calendar size={14} className="me-1" />{new Date(nextTrip.date).toLocaleDateString()}</span>
              </div>
            </div>
            <Link to="/tourist/bookings" className="btn btn-outline-navy btn-sm">
              View Details
            </Link>
          </div>
        </div>
      )}

      {/* Explore CTA */}
      <div
        className="p-4 mb-4"
        style={{
          background: 'linear-gradient(135deg, var(--gc-navy), #1e4976)',
          borderRadius: 16,
          color: '#fff',
        }}
      >
        <h4 style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>Explore Local Guides</h4>
        <p className="mb-3" style={{ opacity: 0.85 }}>
          Find the perfect guide for your next trip — filter by destination, language, and interests.
        </p>
        <Link to="/guides" className="btn btn-primary">Browse Guides</Link>
      </div>
    </DashboardLayout>
  );
}