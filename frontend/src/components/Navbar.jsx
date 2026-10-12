import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          GuideConnect
        </Link>

        <div className="d-flex align-items-center gap-3 ms-auto">
          <Link className="nav-link" to="/guides">Explore Guides</Link>

          {!user && (
            <>
              <Link className="nav-link" to="/login">Login</Link>
              <Link className="btn btn-primary btn-sm" to="/register">Sign Up</Link>
            </>
          )}

          {user && (
            <>
              <span className="text-muted small">
                Hi, {user.name}{' '}
                <span className="badge bg-secondary">{user.role}</span>
              </span>

              {user.role === 'TOURIST' && (
                <Link className="nav-link" to="/tourist/dashboard">Dashboard</Link>
              )}
              {user.role === 'GUIDE' && (
                <Link className="nav-link" to="/guide/dashboard">Dashboard</Link>
              )}
              {user.role === 'ADMIN' && (
                <Link className="nav-link" to="/admin/dashboard">Admin</Link>
              )}

              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}