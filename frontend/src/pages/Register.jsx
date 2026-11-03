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

  function validateForm() {
    // 1. Email Standard Check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address (e.g., name@domain.com).');
      return false;
    }

    // 2. Password Check
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(form.password)) {
      setError('Password must contain at least 1 special character (e.g., @, #, $, !).');
      return false;
    }

    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) return; 

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
      <div className="gc-auth-visual">
        <Link to="/" className="d-flex align-items-center gap-2" style={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem' }}>
          <span className="gc-logo-mark"><Compass size={18} /></span>
          GuideConnect
        </Link>
        <div>
          <h2>Create your account.</h2>
          <p>Start planning your next trip with a trusted local guide.</p>
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>© {new Date().getFullYear()} GuideConnect</div>
      </div>

      <div className="gc-auth-form-side">
        <div className="gc-auth-form">
          <div className="gc-tab-pill">
            <Link to="/login">Login</Link>
            <Link to="/register" className="active">Register</Link>
          </div>

          <h3 style={{ fontWeight: 800, color: 'var(--gc-navy)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Get started</h3>
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
                <input className="form-control" placeholder="Your name" style={{ paddingLeft: 38 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
                <input type="email" className="form-control" placeholder="you@example.com" style={{ paddingLeft: 38 }} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
                <input type="password" className="form-control" placeholder="Min 6 chars, 1 special" style={{ paddingLeft: 38 }} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">I want to join as</label>
              <div className="row g-2">
                <div className="col-6">
                  <div onClick={() => setForm({ ...form, role: 'TOURIST' })} className="p-3 text-center" style={{ border: `2px solid ${form.role === 'TOURIST' ? 'var(--gc-primary)' : 'var(--gc-border)'}`, borderRadius: 10, cursor: 'pointer', background: form.role === 'TOURIST' ? 'rgba(37,99,235,0.05)' : '#fff', transition: 'all 0.15s' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>Tourist</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gc-muted)' }}>Book experiences</div>
                  </div>
                </div>
                <div className="col-6">
                  <div onClick={() => setForm({ ...form, role: 'GUIDE' })} className="p-3 text-center" style={{ border: `2px solid ${form.role === 'GUIDE' ? 'var(--gc-primary)' : 'var(--gc-border)'}`, borderRadius: 10, cursor: 'pointer', background: form.role === 'GUIDE' ? 'rgba(37,99,235,0.05)' : '#fff', transition: 'all 0.15s' }}>
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

          <p className="text-center text-muted-2 mt-4 mb-0" style={{ fontSize: '0.9rem' }}>
            Have an account? <Link to="/login" className="text-primary fw-semibold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}