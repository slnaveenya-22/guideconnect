import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle, CheckCircle2, Upload, X } from 'lucide-react';
import TagInput from './TagInput';

const CATEGORIES = ['FOOD','HERITAGE','SHOPPING','CULTURE','SIGHTSEEING','NATURE','OTHER'];

export default function ExperienceForm({ initial, onSubmit, submitLabel = 'Save' }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: initial?.title || '',
    category: initial?.category || 'FOOD',
    city: initial?.city || '',
    description: initial?.description || '',
    durationMinutes: initial?.durationMinutes || 120,
    price: initial?.price ? String(Math.round(initial.price / 100)) : '',
    maxGroupSize: initial?.maxGroupSize || 5,
    languages: initial?.languages || [],
  });
  const [images, setImages] = useState([]); // File[] for upload
  const [existingImages] = useState(initial?.images || []);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleImages(e) {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files].slice(0, 5));
  }

  function removeImage(i) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('category', form.category);
      fd.append('city', form.city);
      fd.append('description', form.description);
      fd.append('durationMinutes', String(Number(form.durationMinutes)));
      fd.append('price', String(Number(form.price) * 100)); // rupees → paise
      fd.append('maxGroupSize', String(Number(form.maxGroupSize)));
      form.languages.forEach((l) => fd.append('languages', l));
      images.forEach((img) => fd.append('images', img));

      await onSubmit(fd);
      navigate('/guide/experiences');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger d-flex align-items-center gap-2">
        <AlertCircle size={16} /> {error}
      </div>}

      <div className="card p-4 mb-3">
        <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>Basic Details</h6>

        <div className="mb-3">
          <label className="form-label">Title *</label>
          <input
            className="form-control"
            placeholder="Coimbatore Street Food Walk"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            required
            minLength={5}
            maxLength={120}
          />
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label">Category *</label>
            <select className="form-select" value={form.category} onChange={(e) => update('category', e.target.value)} required>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">City *</label>
            <input className="form-control" placeholder="Coimbatore" value={form.city} onChange={(e) => update('city', e.target.value)} required />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Description *</label>
          <textarea
            className="form-control"
            rows={5}
            placeholder="What will travelers experience? What's included? What makes this special?"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            required
            minLength={20}
            maxLength={2000}
          />
          <small className="text-muted-2">{form.description.length}/2000</small>
        </div>
      </div>

      <div className="card p-4 mb-3">
        <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>Pricing & Logistics</h6>

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Duration (minutes) *</label>
            <input type="number" className="form-control" min={30} max={1440} value={form.durationMinutes} onChange={(e) => update('durationMinutes', e.target.value)} required />
            <small className="text-muted-2">E.g. 180 = 3 hours</small>
          </div>
          <div className="col-md-4">
            <label className="form-label">Price per person (₹) *</label>
            <input type="number" className="form-control" min={0} value={form.price} onChange={(e) => update('price', e.target.value)} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Max group size *</label>
            <input type="number" className="form-control" min={1} max={20} value={form.maxGroupSize} onChange={(e) => update('maxGroupSize', e.target.value)} required />
          </div>
        </div>

        <div className="mt-3">
          <label className="form-label">Languages offered *</label>
          <TagInput value={form.languages} onChange={(v) => update('languages', v)} placeholder="English, Tamil..." />
        </div>
      </div>

      <div className="card p-4 mb-3">
        <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>Photos</h6>

        {existingImages.length > 0 && (
          <div className="mb-3">
            <div className="text-muted-2 mb-2" style={{ fontSize: '0.85rem' }}>Current images:</div>
            <div className="d-flex gap-2 flex-wrap">
              {existingImages.map((url, i) => (
                <img key={i} src={url} alt="" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
              ))}
            </div>
          </div>
        )}

        <label className="form-label">Add images (up to 5)</label>
        <input type="file" className="form-control" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImages} />

        {images.length > 0 && (
          <div className="d-flex gap-2 flex-wrap mt-3">
            {images.map((file, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={URL.createObjectURL(file)} alt="" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8 }} />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', background: '#dc2626', color: '#fff', border: 'none', fontSize: 12, cursor: 'pointer' }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="d-flex gap-2 justify-content-end">
        <button type="button" className="btn btn-outline-navy" onClick={() => navigate('/guide/experiences')}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          <Save size={16} className="me-1" />
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}