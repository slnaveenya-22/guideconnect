import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

async function handleGoogleSuccess(credentialResponse) {
  setError('');
  try {
    const user = await loginWithGoogle(credentialResponse.credential);
    if (user.role === 'TOURIST') navigate('/tourist/dashboard');
    else if (user.role === 'GUIDE') navigate('/guide/dashboard');
    else navigate('/admin/dashboard');
  } catch (err) {
    setError(err.response?.data?.message || 'Google sign-in failed');
  }
}

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'TOURIST') navigate('/tourist/dashboard');
      else if (user.role === 'GUIDE') navigate('/guide/dashboard');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="gc-auth-wrap">
      {/* LEFT VISUAL */}
      <div className="gc-auth-visual">
        <Link
          to="/"
          className="d-flex align-items-center gap-2"
          style={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem' }}
        >
          <span className="gc-logo-mark"><Compass size={18} /></span>
          GuideConnect
        </Link>

        <div>
          <h2>Your next adventure starts here.</h2>
          <p>Join our community of travelers and local guides.</p>
        </div>

        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          © {new Date().getFullYear()} GuideConnect
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="gc-auth-form-side">
        <div className="gc-auth-form">
          <div className="gc-tab-pill">
            <Link to="/login" className="active">Login</Link>
            <Link to="/register">Register</Link>
          </div>

          <h3 style={{ fontWeight: 800, color: 'var(--gc-navy)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Welcome back
          </h3>
          <p className="text-muted-2 mb-4">Please login to your account.</p>

          {error && <div className="alert alert-danger py-2" style={{ fontSize: '0.9rem' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }}
                />
                <input
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                  style={{ paddingLeft: 38 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label">Password</label>
                <a className="text-primary" style={{ fontSize: '0.8rem' }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }}
                />
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  style={{ paddingLeft: 38 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="btn btn-primary w-100" disabled={loading} style={{ padding: '0.75rem' }}>
              {loading ? 'Logging in…' : 'Login'}
            </button>
          </form>

          <div className="d-flex align-items-center gap-2 my-3">
            <hr className="flex-grow-1 m-0" style={{ opacity: 0.15 }} />
            <span className="text-muted-2" style={{ fontSize: '0.8rem' }}>or continue with</span>
            <hr className="flex-grow-1 m-0" style={{ opacity: 0.15 }} />
          </div>

          <div className="d-flex justify-content-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-in failed. Please try again.')}
              theme="outline"
              size="large"
              width="100%"
              text="continue_with"
              shape="rectangular"
            />
          </div>

          <p className="text-center text-muted-2 mt-4 mb-0" style={{ fontSize: '0.9rem' }}>
            Don't have an account? <Link to="/register" className="text-primary fw-semibold">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}