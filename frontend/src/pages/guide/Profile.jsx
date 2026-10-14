import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import TagInput from '../../components/TagInput';
import {
  getMyGuideProfile, createMyGuideProfile, updateMyGuideProfile,
} from '../../api/guides';

const EMPTY_FORM = {
  bio: '',
  city: '',
  country: 'India',
  languages: [],
  expertise: [],
  serviceAreas: [],
  yearsOfExperience: 0,
  hourlyRate: '',
};

export default function GuideProfileManage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load existing profile
  useEffect(() => {
    getMyGuideProfile()
      .then((data) => {
        setForm({
          bio: data.bio || '',
          city: data.city || '',
          country: data.country || 'India',
          languages: data.languages || [],
          expertise: data.expertise || [],
          serviceAreas: data.serviceAreas || [],
          yearsOfExperience: data.yearsOfExperience || 0,
          hourlyRate: data.hourlyRate ? String(data.hourlyRate) : '',
        });
        setExists(true);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setExists(false); // no profile yet
        } else {
          setError(err.response?.data?.message || 'Failed to load profile');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload = {
        ...form,
        yearsOfExperience: Number(form.yearsOfExperience) || 0,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) * 100 : null, // rupees → paise
      };

      if (exists) {
        await updateMyGuideProfile(payload);
        setSuccess('Profile updated successfully');
      } else {
        await createMyGuideProfile(payload);
        setExists(true);
        setSuccess('Profile created! You can now submit for verification.');
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  // Completion %
  const completion = (() => {
    const fields = ['bio', 'city', 'languages', 'expertise', 'serviceAreas'];
    const filled = fields.filter((f) => {
      const v = form[f];
      return Array.isArray(v) ? v.length > 0 : v && String(v).trim().length > 0;
    }).length;
    return Math.round((filled / fields.length) * 100);
  })();

  if (loading) {
    return (
      <DashboardLayout title="My Guide Profile">
        <div className="text-center py-5 text-muted-2">Loading…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="My Guide Profile"
      subtitle={exists ? 'Update your public profile' : 'Complete your profile to appear in search'}
    >
      {/* Completion bar */}
      <div className="card p-3 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Profile completion</span>
          <span style={{ fontWeight: 700, color: completion === 100 ? '#059669' : 'var(--gc-primary)' }}>
            {completion}%
          </span>
        </div>
        <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
          <div            style={{
              width: `${completion}%`,
              height: '100%',
              background: completion === 100 ? '#10b981' : 'var(--gc-primary)',
              transition: 'width 0.3s',
            }}
          />
        </div>
        {completion < 100 && (
          <p className="text-muted-2 mb-0 mt-2" style={{ fontSize: '0.8rem' }}>
            Complete all fields to improve your visibility in search results.
          </p>
        )}
      </div>

      {error && <div className="alert alert-danger d-flex align-items-center gap-2">
        <AlertCircle size={16} /> {error}
      </div>}
      {success && <div className="alert alert-success d-flex align-items-center gap-2">
        <CheckCircle2 size={16} /> {success}
      </div>}

      <form onSubmit={handleSubmit}>
        <div className="card p-4 mb-3">
          <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
            Basic Information
          </h6>

          <div className="mb-3">
            <label className="form-label">Bio *</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Tell travelers about yourself, your knowledge of the city, what makes you a great guide..."
              value={form.bio}
              onChange={(e) => update('bio', e.target.value)}
              required
              minLength={20}
              maxLength={1000}
            />
            <small className="text-muted-2">{form.bio.length}/1000</small>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">City *</label>
              <input
                className="form-control"
                placeholder="Coimbatore"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Country</label>
              <input
                className="form-control"
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card p-4 mb-3">
          <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
            Languages & Expertise
          </h6>

          <div className="mb-3">
            <label className="form-label">Languages you speak *</label>
            <TagInput
              value={form.languages}
              onChange={(v) => update('languages', v)}
              placeholder="English, Tamil..."
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Areas of expertise *</label>
            <TagInput
              value={form.expertise}
              onChange={(v) => update('expertise', v)}
              placeholder="Food, History, Nature..."
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Service areas (cities you cover)</label>
            <TagInput
              value={form.serviceAreas}
              onChange={(v) => update('serviceAreas', v)}
              placeholder="Coimbatore, Ooty, Mettupalayam..."
            />
          </div>
        </div>

        <div className="card p-4 mb-3">
          <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
            Pricing & Experience
          </h6>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Years of experience</label>
              <input
                type="number"
                className="form-control"
                min={0}
                value={form.yearsOfExperience}
                onChange={(e) => update('yearsOfExperience', e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Hourly rate (in ₹)</label>
              <input
                type="number"
                className="form-control"
                placeholder="800"
                min={0}
                value={form.hourlyRate}
                onChange={(e) => update('hourlyRate', e.target.value)}
              />
              <small className="text-muted-2">
                Informational only. Payment is arranged directly with the tourist.
              </small>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <button
            type="button"
            className="btn btn-outline-navy"
            onClick={() => navigate('/guide/dashboard')}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={16} className="me-1" />
            {saving ? 'Saving…' : exists ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}