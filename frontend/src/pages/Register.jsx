import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'TOURIST' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register(form);
      setSuccess('Registration successful! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <h2>Create your account.</h2>
          <p>Start planning your next trip with a trusted local guide.</p>
        </div>

        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          © {new Date().getFullYear()} GuideConnect
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="gc-auth-form-side">
        <div className="gc-auth-form">
          <div className="gc-tab-pill">
            <Link to="/login">Login</Link>
            <Link to="/register" className="active">Register</Link>
          </div>

          <h3 style={{ fontWeight: 800, color: 'var(--gc-navy)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Get started
          </h3>
          <p className="text-muted-2 mb-4">Create your GuideConnect account.</p>

          {error && <div className="alert alert-danger py-2" style={{ fontSize: '0.9rem' }}>{error}</div>}
          {success && (
            <div className="alert alert-success py-2 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
                <input
                  className="form-control"
                  placeholder="Your name"
                  style={{ paddingLeft: 38 }}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  minLength={2}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
                <input
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                  style={{ paddingLeft: 38 }}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 6 characters"
                  style={{ paddingLeft: 38 }}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">I want to join as</label>
              <div className="row g-2">
                <div className="col-6">
                  <div
                    onClick={() => setForm({ ...form, role: 'TOURIST' })}
                    className="p-3 text-center"
                    style={{
                      border: `2px solid ${form.role === 'TOURIST' ? 'var(--gc-primary)' : 'var(--gc-border)'}`,
                      borderRadius: 10,
                      cursor: 'pointer',
                      background: form.role === 'TOURIST' ? 'rgba(37,99,235,0.05)' : '#fff',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>Tourist</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gc-muted)' }}>Book experiences</div>
                  </div>
                </div>
                <div className="col-6">
                  <div
                    onClick={() => setForm({ ...form, role: 'GUIDE' })}
                    className="p-3 text-center"
                    style={{
                      border: `2px solid ${form.role === 'GUIDE' ? 'var(--gc-primary)' : 'var(--gc-border)'}`,
                      borderRadius: 10,
                      cursor: 'pointer',
                      background: form.role === 'GUIDE' ? 'rgba(37,99,235,0.05)' : '#fff',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>Local Guide</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gc-muted)' }}>Offer experiences</div>
                  </div>
                </div>
              </div>
            </div>

            <button className="btn btn-primary w-100" disabled={loading} style={{ padding: '0.75rem' }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="d-flex align-items-center gap-2 my-3">
            <hr className="flex-grow-1 m-0" style={{ opacity: 0.15 }} />
            <span className="text-muted-2" style={{ fontSize: '0.8rem' }}>or continue with</span>
            <hr className="flex-grow-1 m-0" style={{ opacity: 0.15 }} />
          </div>

          <button className="btn btn-outline-navy w-100 d-flex align-items-center justify-content-center gap-2" disabled>
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-muted-2 mt-4 mb-0" style={{ fontSize: '0.9rem' }}>
            Have an account? <Link to="/login" className="text-primary fw-semibold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}