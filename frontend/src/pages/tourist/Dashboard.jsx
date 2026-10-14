import { Link } from 'react-router-dom';
import { LayoutDashboard, MapPin, Calendar, MessageSquare, Star, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { getGreeting, getGreetingEmoji } from '../../utils/greeting';

export default function TouristDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout
  title={`${getGreeting()}, ${user?.name?.split(' ')[0] || 'Traveler'} ${getGreetingEmoji()}`}
  subtitle="Ready for your next adventure?"
    >
      {/* Quick stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="gc-stat">
            <div className="gc-stat-label">Pending Requests</div>
            <div className="gc-stat-value">0</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="gc-stat">
            <div className="gc-stat-label">Upcoming Trips</div>
            <div className="gc-stat-value">0</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="gc-stat">
            <div className="gc-stat-label">Completed</div>
            <div className="gc-stat-value">0</div>
          </div>
        </div>
      </div>

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

      {/* Recommendations placeholder */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 style={{ fontWeight: 700, color: 'var(--gc-navy)', margin: 0 }}>
            Recommended Guides for You
          </h5>
          <Link to="/guides" className="btn btn-ghost btn-sm">View all →</Link>
        </div>

        <div className="row g-3">
          {[1, 2, 3].map((i) => (
            <div className="col-md-4" key={i}>
              <div className="card p-3 card-hover">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: `hsl(${i * 60}, 60%, 80%)`,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Guide {i}</div>
                    <div className="text-muted-2" style={{ fontSize: '0.8rem' }}>Coimbatore, India</div>
                  </div>
                </div>
                <p className="text-muted-2 mb-2" style={{ fontSize: '0.85rem' }}>
                  Available once the backend module 2 is live.
                </p>
                <button className="btn btn-outline-navy btn-sm w-100" disabled>
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}