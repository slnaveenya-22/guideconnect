import { LayoutDashboard, User, Briefcase, Calendar, MessageSquare, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';

export default function GuideDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout
      title={`Good morning, ${user?.name?.split(' ')[0] || 'Guide'}! ☀️`}
      subtitle="Here's what's happening with your guide account"
    >
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="gc-stat">
            <div className="gc-stat-label">Active Bookings</div>
            <div className="gc-stat-value">0</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="gc-stat">
            <div className="gc-stat-label">Pending Requests</div>
            <div className="gc-stat-value">0</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="gc-stat">
            <div className="gc-stat-label">Average Rating</div>
            <div className="gc-stat-value">—</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="gc-stat">
            <div className="gc-stat-label">Verification</div>
            <div className="gc-stat-value" style={{ fontSize: '1.1rem', paddingTop: 6 }}>
              <span className="gc-badge gc-badge-amber">Not Submitted</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-7">
          <h5 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
            Recent Booking Requests
          </h5>
          <div className="card p-4 text-center text-muted-2">
            <p className="mb-0">No booking requests yet.</p>
            <p className="mb-0" style={{ fontSize: '0.85rem' }}>
              Once you complete your profile and add experiences, requests will appear here.
            </p>
          </div>
        </div>

        <div className="col-md-5">
          <h5 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
            Getting Started
          </h5>
          <div className="card p-3">
            <div className="d-flex align-items-center gap-3 mb-3 pb-3" style={{ borderBottom: '1px solid var(--gc-border)' }}>
              <div className="gc-feature-icon" style={{ width: 32, height: 32 }}><User size={15} /></div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Complete your profile</div>
            </div>
            <div className="d-flex align-items-center gap-3 mb-3 pb-3" style={{ borderBottom: '1px solid var(--gc-border)' }}>
              <div className="gc-feature-icon" style={{ width: 32, height: 32 }}><Briefcase size={15} /></div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Add your first experience</div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <div className="gc-feature-icon" style={{ width: 32, height: 32 }}><Calendar size={15} /></div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Set your availability</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}