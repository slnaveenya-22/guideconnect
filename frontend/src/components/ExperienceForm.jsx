import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, AlertCircle, X } from 'lucide-react';

const CATEGORIES = ['FOOD', 'HERITAGE', 'SHOPPING', 'CULTURE', 'SIGHTSEEING', 'NATURE', 'OTHER'];
const LANGUAGES = ['English', 'Tamil', 'Hindi', 'Malayalam', 'Kannada', 'Telugu', 'French', 'German', 'Spanish'];
const TAMIL_NADU_CITIES = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 
  'Tirunelveli', 'Tiruppur', 'Vellore', 'Erode', 'Thoothukkudi', 
  'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur', 
  'Udhagamandalam (Ooty)', 'Hosur', 'Nagercoil', 'Kanchipuram', 
  'Kumarapalayam', 'Karaikkudi', 'Neyveli', 'Cuddalore', 'Kumbakonam', 
  'Tiruvannamalai', 'Pollachi', 'Rajapalayam', 'Gudiyatham', 'Pudukkottai', 
  'Vaniyambadi', 'Ambur', 'Nagapattinam', 'Kanyakumari', 'Kodaikanal'
];

// Helper to fix broken image URLs
const getImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=60';
  if (url.startsWith('http')) return url; // Cloudinary or external link
  // Local file path from backend (e.g., 'uploads/123.jpg')
  return `http://localhost:5000/${url.replace(/\\/g, '/')}`;
};

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
  
  const [images, setImages] = useState([]); 
  const [existingImages, setExistingImages] = useState(initial?.images || []);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleLanguage(lang) {
    setForm((f) => {
      const exists = f.languages.includes(lang);
      return {
        ...f,
        languages: exists 
          ? f.languages.filter(l => l !== lang) 
          : [...f.languages, lang]
      };
    });
  }

  function handleImages(e) {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files].slice(0, 5));
  }

  function removeNewImage(i) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  // If the backend supports deleting existing images, you'd call an API here. 
  // For now, we just hide it from the UI.
  function removeExistingImage(i) {
    setExistingImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.languages.length === 0) {
      setError('Please select at least one language.');
      return;
    }

    setSaving(true);

    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('category', form.category);
      fd.append('city', form.city);
      fd.append('description', form.description);
      fd.append('durationMinutes', String(Number(form.durationMinutes)));
      fd.append('price', String(Number(form.price) * 100)); // rupees to paise
      fd.append('maxGroupSize', String(Number(form.maxGroupSize)));
      
      form.languages.forEach((l) => fd.append('languages', l));
      
      // If editing, pass the remaining existing images so the backend knows to keep them
      if (initial) {
        fd.append('existingImages', JSON.stringify(existingImages));
      }

      images.forEach((img) => fd.append('images', img));

      await onSubmit(fd);
      navigate('/guide/experiences');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please check all fields and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger d-flex align-items-center gap-2">
        <AlertCircle size={16} /> {error}
      </div>}

      {/* SECTION 1: Basic Details */}
      <div className="card p-4 mb-4 shadow-sm border-0">
        <h6 className="fw-bold mb-4" style={{ color: 'var(--gc-navy)' }}>Basic Details</h6>

        <div className="mb-3">
          <label className="form-label">Title *</label>
          <input
            className="form-control"
            placeholder="e.g. Coimbatore Street Food Walk"
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
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">City *</label>
            <select className="form-select" value={form.city} onChange={(e) => update('city', e.target.value)} required>
              <option value="" disabled>Select a city</option>
              {TAMIL_NADU_CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-0">
          <label className="form-label">Description *</label>
          <textarea
            className="form-control"
            rows={4}
            placeholder="What will travelers experience? What's included? What makes this special?"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            required
            minLength={20}
            maxLength={2000}
          />
          <small className="text-muted" style={{ fontSize: '0.75rem' }}>{form.description.length}/2000 characters</small>
        </div>
      </div>

      {/* SECTION 2: Pricing & Logistics */}
      <div className="card p-4 mb-4 shadow-sm border-0">
        <h6 className="fw-bold mb-4" style={{ color: 'var(--gc-navy)' }}>Pricing & Logistics</h6>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="form-label">Duration (minutes) *</label>
            <input type="number" className="form-control" min={30} max={1440} value={form.durationMinutes} onChange={(e) => update('durationMinutes', e.target.value)} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Price per person (₹) *</label>
            <input type="number" className="form-control" min={0} value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="e.g. 800" required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Max group size *</label>
            <input type="number" className="form-control" min={1} max={20} value={form.maxGroupSize} onChange={(e) => update('maxGroupSize', e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="form-label mb-2">Languages offered *</label>
          <div className="d-flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => {
              const isSelected = form.languages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className="btn btn-sm"
                  style={{
                    background: isSelected ? 'var(--gc-primary)' : '#f1f5f9',
                    color: isSelected ? '#fff' : 'var(--gc-text)',
                    border: 'none',
                    borderRadius: 20,
                    padding: '6px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 500
                  }}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: Photos */}
      <div className="card p-4 mb-4 shadow-sm border-0">
        <h6 className="fw-bold mb-4" style={{ color: 'var(--gc-navy)' }}>Photos</h6>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="mb-4">
            <div className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>Current images:</div>
            <div className="d-flex gap-2 flex-wrap">
              {existingImages.map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img 
                    src={getImageUrl(url)} 
                    alt="" 
                    style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} 
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload New Images */}
        <label className="form-label">Upload new images (up to 5)</label>
        <input type="file" className="form-control" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImages} />

        {images.length > 0 && (
          <div className="d-flex gap-2 flex-wrap mt-3">
            {images.map((file, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={URL.createObjectURL(file)} alt="" style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8 }} />
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="d-flex justify-content-end gap-2 mb-5">
        <button type="button" className="btn btn-light" onClick={() => navigate('/guide/experiences')}>
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