import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'TOURIST' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleRole, setGoogleRole] = useState('TOURIST');

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

  async function handleGoogleSuccess(credentialResponse) {
    setError('');
    setSuccess('');
    try {
      const user = await loginWithGoogle(credentialResponse.credential, googleRole);
      if (user.role === 'TOURIST') navigate('/tourist/dashboard');
      else if (user.role === 'GUIDE') navigate('/guide/dashboard');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-up failed');
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

          <div className="mb-2">
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Sign up as:</label>
            <select
              className="form-select form-select-sm"
              value={googleRole}
              onChange={(e) => setGoogleRole(e.target.value)}
            >
              <option value="TOURIST">Tourist</option>
              <option value="GUIDE">Local Guide</option>
            </select>
          </div>

          <div className="d-flex justify-content-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-up failed. Please try again.')}
              theme="outline"
              size="large"
              width="100%"
              text="signup_with"
              shape="rectangular"
            />
          </div>

          <p className="text-center text-muted-2 mt-4 mb-0" style={{ fontSize: '0.9rem' }}>
            Have an account? <Link to="/login" className="text-primary fw-semibold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}