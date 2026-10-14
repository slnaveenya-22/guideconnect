import { ShieldCheck, Users, Flag, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { getGreeting, getGreetingEmoji } from '../../utils/greeting';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout
  title={`${getGreeting()}, ${user?.name?.split(' ')[0] || 'Admin'} ${getGreetingEmoji()}`}
  subtitle="Here's what's happening on GuideConnect"
>
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="gc-stat">
            <div className="gc-stat-label">Total Users</div>
            <div className="gc-stat-value">0</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="gc-stat">
            <div className="gc-stat-label">Total Guides</div>
            <div className="gc-stat-value">0</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="gc-stat">
            <div className="gc-stat-label">Pending Verifications</div>
            <div className="gc-stat-value">0</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="gc-stat">
            <div className="gc-stat-label">Total Bookings</div>
            <div className="gc-stat-value">0</div>
          </div>
        </div>
      </div>

      <h5 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
        Pending Verifications
      </h5>
      <div className="card p-4 text-center text-muted-2 mb-4">
        <ShieldCheck size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
        <p className="mb-0">No pending verification requests.</p>
        <p className="mb-0" style={{ fontSize: '0.85rem' }}>
          Once guides submit their documents, they'll appear here for review.
        </p>
      </div>

      <h5 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
        Recent Reports
      </h5>
      <div className="card p-4 text-center text-muted-2">
        <Flag size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
        <p className="mb-0">No reports to review.</p>
      </div>
    </DashboardLayout>
  );
}