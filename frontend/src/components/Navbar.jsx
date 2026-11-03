import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Menu, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/guides?city=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  }

  function handleLogout() {
    logout();
    setDropdownOpen(false);
    navigate('/');
  }

  const initials = (user?.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  
  // Determine the correct dashboard link based on role
  const dashboardLink = 
    user?.role === 'TOURIST' ? '/tourist/dashboard' :
    user?.role === 'GUIDE' ? '/guide/dashboard' : '/admin/dashboard';

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid var(--gc-border)',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      
      {/* Hamburger Button (only shows if toggleSidebar is passed, i.e., user is logged in) */}
      {toggleSidebar && (
        <button 
          onClick={toggleSidebar}
          className="btn btn-ghost p-2 me-3"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Menu size={22} color="var(--gc-navy)" />
        </button>
      )}

      {/* Public Links */}
      <div className="d-flex align-items-center gap-4">
        <NavLink to="/" className={({ isActive }) => `gc-nav-link ${isActive ? 'active' : ''}`}>
          Home
        </NavLink>
        <NavLink to="/guides" className={({ isActive }) => `gc-nav-link ${isActive ? 'active' : ''}`}>
          Explore Guides
        </NavLink>
      </div>

      {/* Right Side: Search, Auth Buttons, or User Avatar */}
      <div className="ms-auto d-flex align-items-center gap-3">
        
        {/* Functional Search Bar */}
        <form onSubmit={handleSearch} style={{ position: 'relative', width: 250 }} className="d-none d-md-block me-3">
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
          <input 
            type="text" 
            className="form-control form-control-sm" 
            placeholder="Search destinations..." 
            style={{ paddingLeft: 36, borderRadius: 20, background: 'var(--gc-bg)', border: 'none' }} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* If NOT logged in, show Login/Signup buttons */}
        {!user && (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}

        {/* If logged in, show User Avatar Dropdown */}
        {user && (
          <div className="position-relative" ref={dropdownRef}>
            <button
              className="btn btn-ghost btn-sm d-flex align-items-center gap-2"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ paddingLeft: 6 }}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gc-primary), var(--gc-navy))', color: '#fff', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {initials}
              </div>
              <span className="d-none d-md-inline" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {user.name.split(' ')[0]}
              </span>
            </button>

            {dropdownOpen && (
              <div className="card shadow-lg position-absolute" style={{ right: 0, top: '100%', marginTop: 8, minWidth: 200, padding: 8, zIndex: 1000 }}>
                <div className="px-3 py-2 border-bottom mb-2">
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
                  <span className="gc-badge gc-badge-gray mt-1" style={{ fontSize: '0.7rem' }}>{user.role}</span>
                </div>
                
                <Link to={dashboardLink} className="gc-sidebar-link" onClick={() => setDropdownOpen(false)}>
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                {user.role === 'TOURIST' && (
                  <Link to="/tourist/profile" className="gc-sidebar-link" onClick={() => setDropdownOpen(false)}>
                    <User size={16} /> Profile
                  </Link>
                )}

                <hr className="my-2" />
                
                <button onClick={handleLogout} className="gc-sidebar-link w-100 border-0 bg-transparent text-start">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}