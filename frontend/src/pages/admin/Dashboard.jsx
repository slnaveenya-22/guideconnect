import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, Briefcase, TrendingUp, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { getAdminStats } from '../../api/admin';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data || res)) 
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout
      title={`Admin Dashboard`}
      subtitle="Platform overview and moderation"
    >
      {/* Stats row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="gc-stat">
            <div className="gc-stat-label d-flex align-items-center gap-2">
              <Users size={14} /> Total Users
            </div>
            <div className="gc-stat-value">{loading ? '—' : stats?.users?.total || 0}</div>
          </div>
        </div>
        
        <div className="col-6 col-md-3">
          <div className="gc-stat">
            <div className="gc-stat-label d-flex align-items-center gap-2">
              <Briefcase size={14} /> Total Guides
            </div>
            <div className="gc-stat-value">{loading ? '—' : stats?.users?.guides || 0}</div>
          </div>
        </div>
        
        <div className="col-6 col-md-3">
          <div className="gc-stat">
            <div className="gc-stat-label d-flex align-items-center gap-2">
              <TrendingUp size={14} /> Total Bookings
            </div>
            <div className="gc-stat-value">{loading ? '—' : stats?.bookings?.total || 0}</div>
          </div>
        </div>
        
        <div className="col-6 col-md-3">
          <div className="gc-stat">
            <div className="gc-stat-label d-flex align-items-center gap-2 text-warning">
              <ShieldCheck size={14} /> Pending Verifications
            </div>
            <div className="gc-stat-value" style={{ color: stats?.verifications?.pending > 0 ? '#f59e0b' : 'inherit' }}>
              {loading ? '—' : stats?.verifications?.pending || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <h5 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
        Moderation Queue
      </h5>
      <div className="card p-3 mb-4">
        <Link to="/admin/verifications" className="d-flex align-items-center gap-3 p-3 text-decoration-none" style={{ color: 'inherit', borderBottom: '1px solid var(--gc-border)' }}>
          <div className="gc-feature-icon" style={{ width: 40, height: 40 }}><ShieldCheck size={20} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--gc-navy)' }}>Review Verifications</div>
            <div className="text-muted-2" style={{ fontSize: '0.85rem' }}>Approve or reject guide documents</div>
          </div>
          <ChevronRight size={18} className="text-muted-2" />
        </Link>
        
        <Link to="/admin/users" className="d-flex align-items-center gap-3 p-3 text-decoration-none" style={{ color: 'inherit' }}>
          <div className="gc-feature-icon" style={{ width: 40, height: 40 }}><Users size={20} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--gc-navy)' }}>Manage Users</div>
            <div className="text-muted-2" style={{ fontSize: '0.85rem' }}>View accounts and suspend users</div>
          </div>
          <ChevronRight size={18} className="text-muted-2" />
        </Link>
      </div>
    </DashboardLayout>
  );
}