import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Calendar, MessageSquare,
  Star, User, LogOut, Compass, Briefcase,
  Users, ShieldCheck, BarChart3, Flag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const sidebarConfig = {
  TOURIST: [
    { to: '/tourist/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/guides',            icon: MapPin,          label: 'Explore Guides' },
    { to: '/tourist/bookings',  icon: Calendar,        label: 'My Bookings' },
    { to: '/tourist/messages',  icon: MessageSquare,   label: 'Messages' },
    { to: '/tourist/reviews',   icon: Star,            label: 'Reviews' },
    { to: '/tourist/profile',   icon: User,            label: 'Profile' },
  ],
  GUIDE: [
    { to: '/guide/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/guide/profile',     icon: User,            label: 'My Profile' },
    { to: '/guide/experiences', icon: Briefcase,       label: 'Experiences' },
    { to: '/guide/availability',icon: Calendar,        label: 'Availability' },
    { to: '/guide/bookings',    icon: MessageSquare,   label: 'Booking Requests' },
    { to: '/guide/reviews',     icon: Star,            label: 'Reviews' },
  ],
  ADMIN: [
    { to: '/admin/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/verifications', icon: ShieldCheck,     label: 'Verifications' },
    { to: '/admin/users',         icon: Users,           label: 'Users' },
    { to: '/admin/reports',       icon: Flag,            label: 'Reports' },
    { to: '/admin/analytics',     icon: BarChart3,       label: 'Analytics' },
  ],
};

export default function DashboardLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = sidebarConfig[user?.role] || [];

  function handleLogout() {
    logout();
    navigate('/');
  }

  const initials = (user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="gc-dash">
      {/* ───── SIDEBAR ───── */}
      <aside className="gc-sidebar">
        {/* Brand */}
        <Link to="/" className="d-flex align-items-center gap-2 px-2 mb-4">
          <span className="gc-logo-mark" style={{ width: 28, height: 28 }}>
            <Compass size={15} />
          </span>
          <span style={{ fontWeight: 800, color: 'var(--gc-navy)', fontSize: '0.95rem' }}>
            GuideConnect
          </span>
        </Link>

        {/* User chip */}
        <div
          className="d-flex align-items-center gap-2 mb-4 p-2"
          style={{
            background: 'var(--gc-bg)',
            borderRadius: 10,
            border: '1px solid var(--gc-border)',
          }}
        >
          <div
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--gc-primary), var(--gc-navy))',
              color: '#fff', fontWeight: 700, fontSize: '0.8rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gc-navy)', lineHeight: 1.1 }}
              className="text-truncate"
              title={user?.name}
            >
              {user?.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--gc-muted)', fontWeight: 600, letterSpacing: '0.03em' }}>
              {user?.role}
            </div>
          </div>
        </div>

        {/* Nav links */}
        <div className="gc-sidebar-group">
          <div className="gc-sidebar-label">Menu</div>
          {links.map((item) => (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              end
              className={({ isActive }) => `gc-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Logout pinned to bottom */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--gc-border)' }}>
          <button
            onClick={handleLogout}
            className="gc-sidebar-link w-100 border-0 bg-transparent text-start"
            style={{ cursor: 'pointer' }}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* ───── MAIN ───── */}
      <main className="gc-dash-content">
        {title && (
          <div className="mb-4">
            <h2 style={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--gc-navy)', marginBottom: '0.25rem' }}>
              {title}
            </h2>
            {subtitle && <p className="text-muted-2 mb-0">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}