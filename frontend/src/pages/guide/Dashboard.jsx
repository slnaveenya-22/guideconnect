import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, User, Briefcase, Calendar, MessageSquare, Star,
  ShieldCheck, ChevronRight, CheckCircle2, Clock, XCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { getMyGuideProfile, getMyVerification } from '../../api/guides';
import { getGreeting, getGreetingEmoji } from '../../utils/greeting';

function completionOf(profile) {
  if (!profile) return 0;
  const fields = ['bio', 'city', 'languages', 'expertise', 'serviceAreas'];
  const filled = fields.filter((f) => {
    const v = profile[f];
    return Array.isArray(v) ? v.length > 0 : v && String(v).trim().length > 0;
  }).length;
  return Math.round((filled / fields.length) * 100);
}

export default function GuideDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getMyGuideProfile(), getMyVerification()])
      .then(([p, v]) => {
        if (p.status === 'fulfilled') setProfile(p.value);
        if (v.status === 'fulfilled') setVerification(v.value);
      })
      .finally(() => setLoading(false));
  }, []);

  const completion = completionOf(profile);
  const vStatus = verification?.status || 'NOT_SUBMITTED';

  return (
    <DashboardLayout
  title={`${getGreeting()}, ${user?.name?.split(' ')[0] || 'Guide'} ${getGreetingEmoji()}`}
  subtitle="Here's what's happening with your guide account"
>
      {/* Stats */}
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
            <div className="gc-stat-value">{profile?.avgRating ? profile.avgRating.toFixed(1) : '—'}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="gc-stat">
            <div className="gc-stat-label">Verification</div>
            <div className="gc-stat-value" style={{ fontSize: '1rem', paddingTop: 6 }}>
              {vStatus === 'APPROVED' && <span className="gc-badge gc-badge-green">✓ Verified</span>}
              {vStatus === 'PENDING'  && <span className="gc-badge gc-badge-amber">Pending</span>}
              {vStatus === 'REJECTED' && <span className="gc-badge gc-badge-red">Rejected</span>}
              {vStatus === 'NOT_SUBMITTED' && <span className="gc-badge gc-badge-gray">Not Submitted</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Getting started / progress */}
      <div className="row g-4">
        <div className="col-md-7">
          <h5 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
            Getting Started
          </h5>
          <div className="card p-3">
            {/* Profile completion step */}
            <Link
              to="/guide/profile"
              className="d-flex align-items-center gap-3 p-3 text-decoration-none"
              style={{ borderBottom: '1px solid var(--gc-border)', color: 'inherit' }}
            >
              <div className="gc-feature-icon" style={{ width: 36, height: 36, borderRadius: 8 }}>
                <User size={17} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gc-navy)' }}>
                  Complete your profile
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--gc-muted)' }}>
                  {completion}% complete
                </div>
                <div style={{ height: 5, background: '#e2e8f0', borderRadius: 3, marginTop: 6, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${completion}%`, height: '100%',
                      background: completion === 100 ? '#10b981' : 'var(--gc-primary)',
                    }}
                  />
                </div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--gc-muted)' }} />
            </Link>

            {/* Verification step */}
            <Link
              to="/guide/verification"
              className="d-flex align-items-center gap-3 p-3 text-decoration-none"
              style={{ borderBottom: '1px solid var(--gc-border)', color: 'inherit' }}
            >
              <div className="gc-feature-icon" style={{ width: 36, height: 36, borderRadius: 8 }}>
                <ShieldCheck size={17} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gc-navy)' }}>
                  Get verified
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--gc-muted)' }}>
                  {vStatus === 'APPROVED' ? 'Verified ✓' :
                   vStatus === 'PENDING' ? 'Under review' :
                   vStatus === 'REJECTED' ? 'Action needed' :
                   'Not submitted yet'}
                </div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--gc-muted)' }} />
            </Link>

            {/* Experiences step */}
            <Link
              to="/guide/experiences"
              className="d-flex align-items-center gap-3 p-3 text-decoration-none"
              style={{ color: 'inherit' }}
            >
              <div className="gc-feature-icon" style={{ width: 36, height: 36, borderRadius: 8 }}>
                <Briefcase size={17} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gc-navy)' }}>
                  Add an experience
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--gc-muted)' }}>
                  Coming in Module 3
                </div>
              </div>
              <ChevronRight size={18} style={{ color: 'var(--gc-muted)' }} />
            </Link>
          </div>
        </div>

        <div className="col-md-5">
          <h5 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
            Recent Booking Requests
          </h5>
          <div className="card p-4 text-center text-muted-2">
            <MessageSquare size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
            <p className="mb-0">No booking requests yet.</p>
            <p className="mb-0" style={{ fontSize: '0.85rem' }}>
              Requests will appear once Module 5 is live.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}