import { useState } from 'react';
import { User, Mail, Shield, Save, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function TouristProfile() {
  const { user } = useAuth();
  
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '', // Email is usually read-only
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Assuming backend has PATCH /users/me or similar. 
      // If not, you can comment this out and just make the form read-only.
      await api.patch('/auth/me', { name: form.name });
      setSuccess('Profile updated successfully!');
      
      // Update local storage so it reflects immediately in the navbar
      const updatedUser = { ...user, name: form.name };
      localStorage.setItem('gc_user', JSON.stringify(updatedUser));
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your account details">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          
          {error && <div className="alert alert-danger d-flex align-items-center gap-2"><AlertCircle size={16}/> {error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="card p-4">
            <div className="d-flex align-items-center gap-3 mb-4 pb-4 border-bottom">
              <div 
                style={{ 
                  width: 64, height: 64, borderRadius: '50%', 
                  background: 'var(--gc-primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 800
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h5 style={{ fontWeight: 700, color: 'var(--gc-navy)', margin: 0 }}>{user?.name}</h5>
                <span className="gc-badge gc-badge-blue mt-1">TOURIST</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: 38 }}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
                  <input
                    type="email"
                    className="form-control"
                    style={{ paddingLeft: 38, background: '#f8fafc' }}
                    value={form.email}
                    disabled
                  />
                </div>
                <small className="text-muted-2">Email cannot be changed.</small>
              </div>

              <div className="mb-4">
                <label className="form-label">Account Type</label>
                <div style={{ position: 'relative' }}>
                  <Shield size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: 38, background: '#f8fafc' }}
                    value="Tourist Account"
                    disabled
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                <Save size={16} className="me-1" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}