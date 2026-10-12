import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Compass, LayoutDashboard, Calendar, MessageSquare,
  Star, User, LogOut, ChevronDown,
  Briefcase, ShieldCheck, Users, Flag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setOpen(false);
    navigate('/');
  }

  const initials = (user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const dashboardPath =
    user?.role === 'TOURIST' ? '/tourist/dashboard'
    : user?.role === 'GUIDE' ? '/guide/dashboard'
    : '/admin/dashboard';

  return (
    <nav className="gc-navbar">
      <div className="container d-flex align-items-center">
        <Link to="/" className="gc-logo">
          <span className="gc-logo-mark"><Compass size={18} /></span>
          GuideConnect
        </Link>

        <div className="d-none d-md-flex align-items-center ms-4 gap-1">
          <NavLink to="/" end className={({ isActive }) => `gc-nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/guides" className={({ isActive }) => `gc-nav-link ${isActive ? 'active' : ''}`}>
            Explore Guides
          </NavLink>
        </div>

        {/* Right side */}
        <div className="d-flex align-items-center gap-2 ms-auto">
          {!user && (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}

          {user && (
            <div className="position-relative" ref={ref}>
              <button
                className="btn btn-ghost btn-sm d-flex align-items-center gap-2"
                onClick={() => setOpen(!open)}
                style={{ paddingLeft: 6 }}
              >
                <div
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--gc-primary), var(--gc-navy))',
                    color: '#fff', fontWeight: 700, fontSize: '0.75rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {initials}
                </div>
                <span className="d-none d-md-inline" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown size={14} style={{ opacity: 0.6 }} />
              </button>

              {open && (
                <div
                  className="card shadow-lg position-absolute"
                  style={{
                    right: 0, top: '100%', marginTop: 8, minWidth: 220, padding: 8, zIndex: 1000,
                  }}
                >
                  <div className="px-3 py-2 border-bottom mb-2">
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
                    <span className="gc-badge gc-badge-gray mt-1" style={{ fontSize: '0.7rem' }}>
                      {user.role}
                    </span>
                  </div>

                  {/* Role-aware links */}
                  {user.role === 'TOURIST' && (
                    <>
                      <Link to="/tourist/dashboard" className="gc-sidebar-link" onClick={() => setOpen(false)}>
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      <Link to="/tourist/bookings" className="gc-sidebar-link" onClick={() => setOpen(false)}>
                        <Calendar size={16} /> My Bookings
                      </Link>
                      <Link to="/tourist/messages" className="gc-sidebar-link" onClick={() => setOpen(false)}>
                        <MessageSquare size={16} /> Messages
                      </Link>
                      <Link to="/tourist/profile" className="gc-sidebar-link" onClick={() => setOpen(false)}>
                        <User size={16} /> Profile
                      </Link>
                    </>
                  )}

                  {user.role === 'GUIDE' && (
                    <>
                      <Link to="/guide/dashboard" className="gc-sidebar-link" onClick={() => setOpen(false)}>
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      <Link to="/guide/profile" className="gc-sidebar-link" onClick={() => setOpen(false)}>
                        <User size={16} /> My Profile
                      </Link>
                      <Link to="/guide/experiences" className="gc-sidebar-link" onClick={() => setOpen(false)}>
                        <Briefcase size={16} /> Experiences
                      </Link>
                      <Link to="/guide/bookings" className="gc-sidebar-link" onClick={() => setOpen(false)}>
                        <MessageSquare size={16} /> Requests
                      </Link>
                    </>
                  )}

                  {user.role === 'ADMIN' && (
                    <>
                      <Link to="/admin/dashboard" className="gc-sidebar-link" onClick={() => setOpen(false)}>
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>
                      <Link to="/admin/verifications" className="gc-sidebar-link" onClick={() => setOpen(false)}>
                        <ShieldCheck size={16} /> Verifications
                      </Link>
                      <Link to="/admin/users" className="gc-sidebar-link" onClick={() => setOpen(false)}>
                        <Users size={16} /> Users
                      </Link>
                      <Link to="/admin/reports" className="gc-sidebar-link" onClick={() => setOpen(false)}>
                        <Flag size={16} /> Reports
                      </Link>
                    </>
                  )}

                  <hr className="my-2" />

                  <button
                    onClick={handleLogout}
                    className="gc-sidebar-link w-100 border-0 bg-transparent text-start"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}