import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Calendar, MessageSquare,
  Star, User, LogOut, Compass, Briefcase,
  Users, ShieldCheck, Sparkles, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    toggleSidebar(); // close sidebar
    navigate('/');
  }

  // If no user, return null (empty sidebar)
  if (!user) return null;

  const roleLinks = {
    TOURIST: [
      { to: '/tourist/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/tourist/recommendations', icon: Sparkles, label: 'Smart Match' },
      { to: '/tourist/bookings', icon: Calendar, label: 'My Bookings' },
      { to: '/tourist/messages', icon: MessageSquare, label: 'Messages' },
      { to: '/tourist/reviews', icon: Star, label: 'Reviews' },
      { to: '/tourist/profile', icon: User, label: 'Profile' },
    ],
    GUIDE: [
      { to: '/guide/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/guide/profile', icon: User, label: 'My Profile' },
      { to: '/guide/verification', icon: ShieldCheck, label: 'Verification' },
      { to: '/guide/experiences', icon: Briefcase, label: 'Experiences' },
     // { to: '/guide/availability', icon: Calendar, label: 'Availability' },
      { to: '/guide/bookings', icon: MessageSquare, label: 'Requests' },
      { to: '/guide/messages', icon: MessageSquare, label: 'Messages' },
      { to: '/guide/reviews', icon: Star, label: 'Reviews' },
    ],
    ADMIN: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/verifications', icon: ShieldCheck, label: 'Verifications' },
      { to: '/admin/users', icon: Users, label: 'Users' },
    ],
  };

  const links = roleLinks[user.role] || [];
  const initials = (user.name || 'G').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      {/* 1. The Dimmed Background Overlay */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', 
            zIndex: 1040,
            transition: 'opacity 0.3s',
            backdropFilter: 'blur(2px)' 
          }}
        />
      )}

      {/* 2. The Sidebar Drawer */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: isOpen ? 0 : -280, 
        width: 280,
        height: '100vh',
        background: '#fff',
        zIndex: 1050,
        transition: 'left 0.3s ease',
        boxShadow: isOpen ? '4px 0 24px rgba(0,0,0,0.1)' : 'none',
        display: 'flex',
        flexDirection: 'column',
      }}>
        
        {/* Header with Logo and Close Button */}
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" onClick={toggleSidebar} className="d-flex align-items-center gap-2" style={{ textDecoration: 'none' }}>
            <span className="gc-logo-mark" style={{ width: 32, height: 32 }}>
              <Compass size={18} />
            </span>
            <span style={{ fontWeight: 800, color: 'var(--gc-navy)', fontSize: '1.15rem' }}>
              GuideConnect
            </span>
          </Link>
          <button onClick={toggleSidebar} className="btn btn-ghost p-1">
            <X size={20} color="var(--gc-muted)" />
          </button>
        </div>

        {/* User Chip */}
        <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
          <div className="d-flex align-items-center gap-2 p-2" style={{ background: 'var(--gc-bg)', borderRadius: 10, border: '1px solid var(--gc-border)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gc-primary)', color: '#fff', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="text-truncate" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gc-navy)', lineHeight: 1.1 }}>{user.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--gc-muted)', fontWeight: 600 }}>{user.role}</div>
            </div>
          </div>
        </div>

        {/* Navigation Links (Role-specific only) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem' }}>
          <div className="gc-sidebar-label">Menu</div>
          {links.map((item) => (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              end
              onClick={toggleSidebar}
              className={({ isActive }) => `gc-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={17} style={{ flexShrink: 0 }} />
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Logout */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--gc-border)' }}>
          <button onClick={handleLogout} className="gc-sidebar-link w-100 border-0 bg-transparent text-start" style={{ cursor: 'pointer' }}>
            <LogOut size={17} style={{ flexShrink: 0 }} /> Logout
          </button>
        </div>

      </aside>
    </>
  );
}