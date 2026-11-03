import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Star, BadgeCheck, Briefcase, Clock, Languages,
  Calendar, ArrowLeft, Users
} from 'lucide-react';
import { getGuideById } from '../api/guides';
import { getGuideExperiences } from '../api/experiences';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';

const TABS = ['About', 'Experiences', 'Reviews'];

function initials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

const getImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=60';
  if (url.startsWith('http')) return url;
  return `http://localhost:5000/${url.replace(/\\/g, '/')}`;
};

export default function GuideProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('About');
  
  const [selectedExperience, setSelectedExperience] = useState(null);
  const experiencesRef = useRef(null);

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

  function scrollToExperiences() {
    setTab('Experiences');
    setTimeout(() => {
      experiencesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  return (
    <div className="container py-4" style={{ maxWidth: 1200 }}>
      <Link to="/guides" className="btn btn-ghost btn-sm mb-3">
        <ArrowLeft size={14} className="me-1" /> Back to Guides
      </Link>

      <div className="row g-4">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="col-lg-8">
          
          <div className="card p-4 mb-4">
            <div className="d-flex flex-column flex-md-row gap-4 align-items-md-center">
              <div
                style={{
                  width: 110, height: 110, borderRadius: '50%',
                  background: guide.avatarUrl ? `url(${getImageUrl(guide.avatarUrl)}) center/cover` : 'linear-gradient(135deg, var(--gc-primary), var(--gc-navy))',
                  color: '#fff', fontWeight: 800, fontSize: '2rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '4px solid #fff', boxShadow: '0 8px 24px rgba(15,44,74,0.15)',
                  flexShrink: 0
                }}
              >
                {!guide.avatarUrl && initials(guide.name)}
              </div>

              <div className="flex-grow-1">
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
                  padding: '0.75rem 1rem'
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div ref={experiencesRef}>
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
              <ExperiencesTab 
                guideId={guide.id} 
                canBook={canBook} 
                isGuest={isGuest} 
                onBookClick={(exp) => setSelectedExperience(exp)} 
              />
            )}

            {tab === 'Reviews' && (
              <ReviewsTab guideId={guide.id} />
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN (Sidebar) ================= */}
        <div className="col-lg-4">
          <div className="card p-4 position-sticky" style={{ top: 80 }}>
            
            <div className="mb-4">
              <div className="text-muted-2 mb-1" style={{ fontSize: '0.85rem' }}>Starting from</div>
              <div style={{ fontWeight: 800, fontSize: '2rem', color: 'var(--gc-navy)', lineHeight: 1 }}>
                ₹{guide.hourlyRate ? Math.round(guide.hourlyRate / 100) : 'N/A'}
                <span className="text-muted-2" style={{ fontSize: '0.9rem', fontWeight: 400 }}>/hr</span>
              </div>
            </div>

            {isGuest && (
              <Link to="/login" className="btn btn-primary w-100 mb-2" style={{ padding: '0.75rem' }}>
                Sign in to Book
              </Link>
            )}
            {canBook && (
              <button onClick={scrollToExperiences} className="btn btn-primary w-100 mb-2" style={{ padding: '0.75rem' }}>
                Select an Experience
              </button>
            )}
            {!canBook && !isGuest && (
              <button className="btn btn-outline-navy w-100 mb-2" disabled>
                Guides cannot book
              </button>
            )}

            <div className="text-center text-muted-2 mb-4" style={{ fontSize: '0.75rem' }}>
              Final price discussed directly with your guide.
            </div>

            <hr />

            <div className="mb-3">
              <h6 style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--gc-navy)' }}>Service Areas</h6>
              <div className="d-flex flex-wrap gap-1">
                {serviceAreas.length ? serviceAreas.map((a) => (
                  <span key={a} className="gc-badge gc-badge-gray">{a}</span>
                )) : <span className="text-muted-2" style={{ fontSize: '0.9rem' }}>Not specified</span>}
              </div>
            </div>

            <div className="mb-3">
              <h6 style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--gc-navy)' }}>Languages</h6>
              <div className="d-flex flex-wrap gap-1">
                {languages.length ? languages.map((l) => (
                  <span key={l} className="gc-badge gc-badge-gray">{l}</span>
                )) : <span className="text-muted-2" style={{ fontSize: '0.9rem' }}>Not specified</span>}
              </div>
            </div>

            <div>
              <h6 style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--gc-navy)' }}>Verification</h6>
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

      {/* Booking Modal */}
      {selectedExperience && (
        <BookingModal
          experience={selectedExperience}
          onClose={() => setSelectedExperience(null)}
          onSuccess={() => {
            alert('Booking request sent! Check your dashboard.');
          }}
        />
      )}
    </div>
  );
}

// ---------------- TAB COMPONENTS ---------------- //

function ExperiencesTab({ guideId, canBook, isGuest, onBookClick }) {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGuideExperiences(guideId)
      .then((data) => {
        // Ensure it's always an array
        setExperiences(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load experiences:", err.response?.data || err.message);
        setExperiences([]);
      })
      .finally(() => setLoading(false));
  }, [guideId]);

  if (loading) return <div className="card p-5 text-center text-muted-2">Loading experiences…</div>;

  if (!experiences.length) {
    return (
      <div className="card p-5 text-center text-muted-2">
        <Briefcase size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
        <p className="mb-0">This guide hasn't listed any experiences yet.</p>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {experiences.map((exp) => (
        <div key={exp.id} className="col-md-12">
          <div className="card p-3 d-flex flex-column flex-md-row gap-3 align-items-md-center">
            <img 
              src={getImageUrl(exp.images?.[0])} 
              alt={exp.title} 
              style={{ width: 100, height: 100, borderRadius: 12, objectFit: 'cover' }}
            />
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-1">
                <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', margin: 0 }}>{exp.title}</h6>
                <span className="gc-badge gc-badge-blue" style={{ fontSize: '0.65rem' }}>{exp.category}</span>
              </div>
              <div className="text-muted-2 d-flex gap-3 mb-2" style={{ fontSize: '0.85rem' }}>
                <span><Clock size={12} className="me-1" />{exp.durationMinutes} mins</span>
                <span><Users size={12} className="me-1" />Up to {exp.maxGroupSize}</span>
              </div>
              <div style={{ fontWeight: 800, color: 'var(--gc-primary)' }}>
                ₹{Math.round(exp.price / 100)} <span className="text-muted-2" style={{ fontWeight: 400, fontSize: '0.8rem' }}>/person</span>
              </div>
            </div>
            <div>
              {canBook && (
                <button onClick={() => onBookClick(exp)} className="btn btn-primary">
                  Book This Tour
                </button>
              )}
              {isGuest && (
                <Link to="/login" className="btn btn-outline-navy">Sign in to Book</Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewsTab({ guideId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../api/reviews').then(({ getGuideReviews }) => {
      getGuideReviews(guideId)
        .then(setData)
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, [guideId]);

  if (loading) return <div className="card p-5 text-center text-muted-2">Loading reviews…</div>;

  const reviews = data?.reviews || [];

  if (reviews.length === 0) {
    return (
      <div className="card p-5 text-center text-muted-2">
        <Star size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
        <p className="mb-0">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
        <div className="text-center">
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--gc-navy)', lineHeight: 1 }}>
            {data.avgRating.toFixed(1)}
          </div>
          <div className="text-warning my-1">
            {[1,2,3,4,5].map(star => (
              <Star key={star} size={16} fill={data.avgRating >= star ? '#f59e0b' : '#e2e8f0'} style={{ color: data.avgRating >= star ? '#f59e0b' : '#e2e8f0' }} />
            ))}
          </div>
          <div className="text-muted-2" style={{ fontSize: '0.85rem' }}>{data.reviewCount} reviews</div>
        </div>
      </div>

      <div className="d-flex flex-column gap-4">
        {reviews.map((rev) => (
          <div key={rev.id}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <div style={{ fontWeight: 700, color: 'var(--gc-navy)' }}>{rev.tourist?.name || 'Anonymous'}</div>
              <div className="text-muted-2" style={{ fontSize: '0.8rem' }}>
                {new Date(rev.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="text-warning mb-2">
              {[1,2,3,4,5].map(star => (
                <Star key={star} size={12} fill={rev.rating >= star ? '#f59e0b' : 'transparent'} style={{ color: rev.rating >= star ? '#f59e0b' : '#cbd5e1' }} />
              ))}
            </div>
            {rev.comment && (
              <p className="text-muted-2 mb-0" style={{ fontSize: '0.9rem' }}>"{rev.comment}"</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AvailabilityTab({ guideId }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We assume you have an endpoint that gets general guide availability
    // If Naveenya only built it per experience, we will gracefully handle the error
    getGuideAvailability(guideId)
      .then((data) => setSlots(data || []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [guideId]);

  if (loading) return <div className="card p-5 text-center text-muted-2">Loading availability...</div>;

  if (slots.length === 0) {
    return (
      <div className="card p-5 text-center text-muted-2">
        <Calendar size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
        <h5 style={{ fontWeight: 700 }}>No upcoming availability</h5>
        <p className="mb-0">This guide hasn't set any open dates yet. Check back later.</p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h5 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
        Upcoming Available Dates
      </h5>
      <div className="d-flex flex-column gap-3">
        {slots.map((slot) => (
          <div key={slot.id} className="d-flex align-items-center justify-content-between p-3 border rounded">
            <div className="d-flex align-items-center gap-3">
              <div style={{ background: 'var(--gc-bg)', padding: 10, borderRadius: 8 }}>
                <Calendar size={20} style={{ color: 'var(--gc-primary)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--gc-navy)' }}>
                  {new Date(slot.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
                <div className="text-muted-2" style={{ fontSize: '0.85rem' }}>
                  {slot.startTime} – {slot.endTime}
                </div>
              </div>
            </div>
            
            {/* If you have a specific experience linked to this slot, you could show a button here */}
            <span className="gc-badge gc-badge-green">Available</span>
          </div>
        ))}
      </div>
    </div>
  );
}