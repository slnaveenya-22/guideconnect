import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, Users, Languages, Star,
  BadgeCheck, Calendar, MessageSquare,
} from 'lucide-react';
import { getExperienceById } from '../api/experiences';
import { useAuth } from '../context/AuthContext';
import CategoryBadge from '../components/CategoryBadge';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80';

export default function ExperienceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [exp, setExp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true);
    getExperienceById(id)
      .then(setExp)
      .catch((err) => setError(err.response?.data?.message || 'Experience not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container py-5 text-center text-muted-2">Loading…</div>;
  if (error || !exp) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted-2">{error || 'Experience not found'}</p>
        <Link to="/guides" className="btn btn-primary">Browse Guides</Link>
      </div>
    );
  }

  const images = exp.images?.length ? exp.images : [PLACEHOLDER];
  const price = Math.round(exp.price / 100);
  const hours = Math.floor(exp.durationMinutes / 60);
  const mins = exp.durationMinutes % 60;
  const duration = hours > 0 ? `${hours}h${mins ? ` ${mins}m` : ''}` : `${mins}m`;
  const languages = Array.isArray(exp.languages) ? exp.languages : [];

  const canBook = user?.role === 'TOURIST';
  const isGuest = !user;

  return (
    <div className="container py-4">
      <Link to="/guides" className="btn btn-ghost btn-sm mb-3">
        <ArrowLeft size={14} className="me-1" /> Back to Guides
      </Link>

      {/* Image gallery */}
      <div className="row g-2 mb-4">
        <div className="col-md-8">
          <div style={{ aspectRatio: '16/10', borderRadius: 14, overflow: 'hidden' }}>
            <img src={images[activeImg]} alt={exp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
        <div className="col-md-4">
          <div className="d-flex flex-row flex-md-column gap-2 h-100">
            {images.slice(0, 4).map((img, i) => (
              <div
                key={i}
                onClick={() => setActiveImg(i)}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: i === activeImg ? '2px solid var(--gc-primary)' : '1px solid var(--gc-border)',
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-8">
          <CategoryBadge category={exp.category} size="md" />
          <h2 style={{ fontWeight: 800, color: 'var(--gc-navy)', marginTop: '0.75rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            {exp.title}
          </h2>

          <div className="d-flex flex-wrap gap-3 text-muted-2 mb-4" style={{ fontSize: '0.9rem' }}>
            <span className="d-flex align-items-center gap-1"><MapPin size={14} /> {exp.city}</span>
            <span className="d-flex align-items-center gap-1"><Clock size={14} /> {duration}</span>
            <span className="d-flex align-items-center gap-1"><Users size={14} /> up to {exp.maxGroupSize} people</span>
            {languages.length > 0 && (
              <span className="d-flex align-items-center gap-1"><Languages size={14} /> {languages.join(', ')}</span>
            )}
          </div>

          <div className="card p-4 mb-3">
            <h5 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '0.75rem' }}>About this experience</h5>
            <p style={{ whiteSpace: 'pre-line', lineHeight: 1.7, margin: 0 }}>{exp.description}</p>
          </div>

          {exp.guide && (
            <div className="card p-4">
              <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '0.75rem' }}>Your guide</h6>
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--gc-primary), var(--gc-navy))',
                    color: '#fff', fontWeight: 800, fontSize: '1.1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {exp.guide.name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="d-flex align-items-center gap-2">
                    <Link to={`/guides/${exp.guide.id}`} style={{ fontWeight: 700, color: 'var(--gc-navy)' }}>
                      {exp.guide.name}
                    </Link>
                    {exp.guide.verificationStatus === 'APPROVED' && <BadgeCheck size={16} style={{ color: 'var(--gc-primary)' }} />}
                  </div>
                  <div className="text-muted-2" style={{ fontSize: '0.85rem' }}>
                    {exp.guide.city}
                    {exp.guide.avgRating > 0 && (
                      <>
                        {' · '}
                        <Star size={11} style={{ color: '#f59e0b', fill: '#f59e0b', verticalAlign: -1 }} /> {exp.guide.avgRating.toFixed(1)}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="col-md-4">
          <div className="card p-4 position-sticky" style={{ top: 80 }}>
            <div className="mb-3">
              <span className="text-muted-2" style={{ fontSize: '0.8rem' }}>Starting from</span>
              <div style={{ fontWeight: 800, fontSize: '2rem', color: 'var(--gc-navy)', lineHeight: 1 }}>
                ₹{price}
                <span className="text-muted-2" style={{ fontSize: '0.85rem', fontWeight: 400 }}>/person</span>
              </div>
            </div>

            {isGuest && (
              <Link to="/login" className="btn btn-primary w-100 mb-2">Sign in to Book</Link>
            )}
            {canBook && (
              <button className="btn btn-primary w-100 mb-2" disabled title="Available in Module 5">
                Book This Experience
              </button>
            )}
            {!canBook && !isGuest && (
              <button className="btn btn-outline-navy w-100 mb-2" disabled>
                Available to Tourists Only
              </button>
            )}

            <div className="text-center text-muted-2" style={{ fontSize: '0.75rem' }}>
              Final price discussed directly with your guide.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}