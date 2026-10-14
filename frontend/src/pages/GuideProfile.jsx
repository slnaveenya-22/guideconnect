import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Star, BadgeCheck, Briefcase, Clock, Languages,
  Calendar, MessageSquare, ArrowLeft,
} from 'lucide-react';
import { getGuideById } from '../api/guides';
import { useAuth } from '../context/AuthContext';

const TABS = ['About', 'Experiences', 'Reviews', 'Availability'];

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function GuideProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('About');

  useEffect(() => {
    setLoading(true);
    getGuideById(id)
      .then(setGuide)
      .catch((err) => setError(err.response?.data?.message || 'Guide not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container py-5 text-center text-muted-2">Loading profile…</div>;
  if (error || !guide) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted-2">{error || 'Guide not found'}</p>
        <Link to="/guides" className="btn btn-primary">Browse Guides</Link>
      </div>
    );
  }

  const isVerified = guide.verificationStatus === 'APPROVED';
  const languages = Array.isArray(guide.languages) ? guide.languages : [];
  const expertise = Array.isArray(guide.expertise) ? guide.expertise : [];
  const serviceAreas = Array.isArray(guide.serviceAreas) ? guide.serviceAreas : [];

  const canBook = user?.role === 'TOURIST';
  const isGuest = !user;

  return (
    <div className="container py-4">
      <Link to="/guides" className="btn btn-ghost btn-sm mb-3">
        <ArrowLeft size={14} className="me-1" /> Back to Guides
      </Link>

      {/* Header card */}
      <div className="card p-4 mb-4">
        <div className="row g-4 align-items-center">
          <div className="col-md-auto">
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: '50%',
                background: guide.avatarUrl ? `url(${guide.avatarUrl}) center/cover` : 'linear-gradient(135deg, var(--gc-primary), var(--gc-navy))',
                color: '#fff',
                fontWeight: 800,
                fontSize: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '4px solid #fff',
                boxShadow: '0 8px 24px rgba(15,44,74,0.15)',
              }}
            >
              {!guide.avatarUrl && initials(guide.name)}
            </div>
          </div>

          <div className="col-md">
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <h3 style={{ fontWeight: 800, color: 'var(--gc-navy)', margin: 0 }}>
                {guide.name}
              </h3>
              {isVerified && (
                <span className="gc-badge gc-badge-blue d-flex align-items-center gap-1">
                  <BadgeCheck size={12} /> Verified Guide
                </span>
              )}
            </div>
            <div className="text-muted-2 d-flex flex-wrap gap-3 mb-2" style={{ fontSize: '0.9rem' }}>
              <span className="d-flex align-items-center gap-1">
                <MapPin size={13} /> {guide.city}, {guide.country}
              </span>
              {languages.length > 0 && (
                <span className="d-flex align-items-center gap-1">
                  <Languages size={13} /> {languages.join(', ')}
                </span>
              )}
              {guide.yearsOfExperience > 0 && (
                <span className="d-flex align-items-center gap-1">
                  <Briefcase size={13} /> {guide.yearsOfExperience} years experience
                </span>
              )}
            </div>

            <div className="d-flex align-items-center gap-2">
              <Star size={16} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
              <span style={{ fontWeight: 700 }}>
                {guide.avgRating ? guide.avgRating.toFixed(1) : 'New'}
              </span>
              {guide.reviewCount > 0 && (
                <span className="text-muted-2">({guide.reviewCount} reviews)</span>
              )}
            </div>
          </div>

          <div className="col-md-auto">
            {guide.hourlyRate && (
              <div className="mb-2 text-md-end">
                <div className="text-muted-2" style={{ fontSize: '0.8rem' }}>Starting from</div>
                <div style={{ fontWeight: 800, fontSize: '1.6rem', color: 'var(--gc-navy)', lineHeight: 1 }}>
                  ₹{Math.round(guide.hourlyRate / 100)}
                  <span className="text-muted-2" style={{ fontSize: '0.85rem', fontWeight: 400 }}>/hr</span>
                </div>
              </div>
            )}

            {isGuest && (
              <Link to="/login" className="btn btn-primary w-100">Sign in to Book</Link>
            )}
            {canBook && (
              <button className="btn btn-primary w-100" disabled title="Coming in Module 5">
                Book Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 border-bottom">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`btn btn-ghost btn-sm ${tab === t ? 'active' : ''}`}
            style={{
              borderBottom: tab === t ? '2px solid var(--gc-primary)' : '2px solid transparent',
              borderRadius: 0,
              color: tab === t ? 'var(--gc-primary)' : 'var(--gc-muted)',
              fontWeight: tab === t ? 700 : 500,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="row g-4">
        <div className="col-md-8">
          {tab === 'About' && (
            <div className="card p-4">
              <h5 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
                About {guide.name.split(' ')[0]}
              </h5>
              <p style={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}>{guide.bio}</p>

              {expertise.length > 0 && (
                <>
                  <h6 style={{ fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                    Expertise
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {expertise.map((e) => (
                      <span key={e} className="gc-badge gc-badge-blue">{e}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'Experiences' && (
            <div className="card p-5 text-center text-muted-2">
              <Briefcase size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p className="mb-0">Experiences will be available in Module 3.</p>
            </div>
          )}

          {tab === 'Reviews' && (
            <div className="card p-5 text-center text-muted-2">
              <Star size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p className="mb-0">Reviews will be available in Module 8.</p>
            </div>
          )}

          {tab === 'Availability' && (
            <div className="card p-5 text-center text-muted-2">
              <Calendar size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p className="mb-0">Availability calendar will be available in Module 5.</p>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="col-md-4">
          <div className="card p-3 mb-3">
            <h6 style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--gc-navy)' }}>
              Service Areas
            </h6>
            <div className="d-flex flex-wrap gap-1">
              {serviceAreas.length ? serviceAreas.map((a) => (
                <span key={a} className="gc-badge gc-badge-gray">{a}</span>
              )) : <span className="text-muted-2" style={{ fontSize: '0.9rem' }}>Not specified</span>}
            </div>
          </div>

          <div className="card p-3 mb-3">
            <h6 style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--gc-navy)' }}>
              Languages
            </h6>
            <div className="d-flex flex-wrap gap-1">
              {languages.length ? languages.map((l) => (
                <span key={l} className="gc-badge gc-badge-gray">{l}</span>
              )) : <span className="text-muted-2" style={{ fontSize: '0.9rem' }}>Not specified</span>}
            </div>
          </div>

          <div className="card p-3">
            <h6 style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--gc-navy)' }}>
              Verification
            </h6>
            <div className="d-flex align-items-center gap-2">
              {isVerified ? (
                <>
                  <BadgeCheck size={18} style={{ color: 'var(--gc-primary)' }} />
                  <span style={{ fontWeight: 600, color: 'var(--gc-primary)' }}>Verified</span>
                </>
              ) : (
                <span className="gc-badge gc-badge-amber">Not verified</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}