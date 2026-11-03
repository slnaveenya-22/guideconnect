import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  // Modes: 'login' | 'forgot-email' | 'forgot-otp'
  const [mode, setMode] = useState('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError(''); setMessage('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'TOURIST') navigate('/tourist/dashboard');
      else if (user.role === 'GUIDE') navigate('/guide/dashboard');
      else navigate('/admin/dashboard');
    } catch (err) {
      const errorCode = err.response?.data?.code;
      const errorMsg = err.response?.data?.message;
      
      if (errorCode === 'USE_GOOGLE_SIGNIN') {
         setError('Your account was created with Google. Please click "Continue with Google" below.');
      } else {
         setError(errorMsg || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  }

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

  // --- FORGOT PASSWORD FLOW ---
  async function handleSendOtp(e) {
    e.preventDefault();
    setError(''); setMessage('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('OTP sent to your email!');
      setMode('forgot-otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError(''); setMessage('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setMessage('Password reset successfully! You can now login.');
      setTimeout(() => setMode('login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
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
          <h2>Your next adventure starts here.</h2>
          <p>Join our community of travelers and local guides.</p>
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>© {new Date().getFullYear()} GuideConnect</div>
      </div>

      <div className="gc-auth-form-side">
        <div className="gc-auth-form">
          
          {mode === 'login' && (
            <>
              <div className="gc-tab-pill">
                <Link to="/login" className="active">Login</Link>
                <Link to="/register">Register</Link>
              </div>
              <h3 style={{ fontWeight: 800, color: 'var(--gc-navy)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Welcome back</h3>
              <p className="text-muted-2 mb-4">Please login to your account.</p>

              {error && <div className="alert alert-danger py-2" style={{ fontSize: '0.9rem' }}>{error}</div>}

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label">Email address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
                    <input type="email" className="form-control" placeholder="you@example.com" style={{ paddingLeft: 38 }} value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <label className="form-label">Password</label>
                    <button type="button" className="btn btn-link p-0 text-primary" style={{ fontSize: '0.8rem', textDecoration: 'none' }} onClick={() => { setMode('forgot-email'); setError(''); setMessage(''); }}>
                      Forgot password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      className="form-control" 
                      placeholder="••••••••" 
                      style={{ paddingLeft: 38, paddingRight: 40 }} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                    />
                    <button
                      type="button"
                      className="btn border-0 position-absolute top-50 end-0 translate-middle-y pe-3"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: 'transparent' }}
                    >
                      {showPassword ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
                    </button>
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
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google sign-in failed')} text="continue_with" />
              </div>
            </>
          )}

          {mode === 'forgot-email' && (
            <>
              <button className="btn btn-ghost btn-sm px-0 mb-3" onClick={() => setMode('login')}>
                <ArrowLeft size={16} className="me-1" /> Back to Login
              </button>
              <h3 style={{ fontWeight: 800, color: 'var(--gc-navy)' }}>Reset Password</h3>
              <p className="text-muted-2 mb-4">Enter your email and we'll send you an OTP.</p>
              {error && <div className="alert alert-danger py-2" style={{ fontSize: '0.9rem' }}>{error}</div>}
              <form onSubmit={handleSendOtp}>
                <div className="mb-3">
                  <label className="form-label">Email address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
                    <input type="email" className="form-control" style={{ paddingLeft: 38 }} value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {mode === 'forgot-otp' && (
            <>
              <button className="btn btn-ghost btn-sm px-0 mb-3" onClick={() => setMode('forgot-email')}>
                <ArrowLeft size={16} className="me-1" /> Back
              </button>
              <h3 style={{ fontWeight: 800, color: 'var(--gc-navy)' }}>Enter OTP</h3>
              <p className="text-muted-2 mb-4">We sent a code to {email}</p>
              
              {message && <div className="alert alert-success py-2" style={{ fontSize: '0.9rem' }}>{message}</div>}
              {error && <div className="alert alert-danger py-2" style={{ fontSize: '0.9rem' }}>{error}</div>}
              
              <form onSubmit={handleResetPassword}>
                <div className="mb-3">
                  <label className="form-label">6-digit OTP</label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
                    <input type="text" className="form-control" placeholder="123456" style={{ paddingLeft: 38, letterSpacing: 4, fontWeight: 'bold' }} maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} required />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
                    <input 
                      type={showNewPassword ? 'text' : 'password'} 
                      className="form-control" 
                      placeholder="Min 6 chars, 1 special" 
                      style={{ paddingLeft: 38, paddingRight: 40 }} 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      required 
                    />
                    <button
                      type="button"
                      className="btn border-0 position-absolute top-50 end-0 translate-middle-y pe-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ background: 'transparent' }}
                    >
                      {showNewPassword ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-muted-2 mt-4 mb-0" style={{ fontSize: '0.9rem' }}>
            Don't have an account? <Link to="/register" className="text-primary fw-semibold">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}