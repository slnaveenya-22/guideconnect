import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, Users, Languages, Star,
  BadgeCheck, X, ZoomIn
} from 'lucide-react';
import { getExperienceById } from '../api/experiences';
import { useAuth } from '../context/AuthContext';
import CategoryBadge from '../components/CategoryBadge';
import BookingModal from '../components/BookingModal';

const getImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
  if (url.startsWith('http')) return url;
  return `http://localhost:5000/${url.replace(/\\/g, '/')}`;
};

export default function ExperienceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [exp, setExp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  
  // State for image lightbox
  const [zoomImage, setZoomImage] = useState(null);

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

  const images = exp.images?.length ? exp.images : ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'];
  const price = Math.round(exp.price / 100);
  const hours = Math.floor(exp.durationMinutes / 60);
  const mins = exp.durationMinutes % 60;
  const duration = hours > 0 ? `${hours}h${mins ? ` ${mins}m` : ''}` : `${mins}m`;
  const languages = Array.isArray(exp.languages) ? exp.languages : [];

  const canBook = user?.role === 'TOURIST';
  const isGuest = !user;

  return (
    <div className="container py-4" style={{ maxWidth: 1000 }}>
      <Link to="/guides" className="btn btn-ghost btn-sm mb-3">
        <ArrowLeft size={14} className="me-1" /> Back to Guides
      </Link>

      <div className="row g-4">
        
        {/* Left Column: Details */}
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

        {/* Right Column: Booking Sidebar */}
        <div className="col-md-4">
          <div className="position-sticky" style={{ top: 80 }}>
            
            {/* Booking Card */}
            <div className="card p-4 mb-4">
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
                <button className="btn btn-primary w-100 mb-2" onClick={() => setShowBookingModal(true)}>
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

            {/* Gallery Card (Underneath Booking) */}
            <div className="card p-4">
              <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>Gallery</h6>
              <div className="d-flex flex-wrap gap-2">
                {images.map((img, i) => (
                  <div 
                    key={i} 
                    onClick={() => setZoomImage(getImageUrl(img))}
                    style={{ 
                      display: 'block', width: '100px', height: '80px', 
                      borderRadius: 8, overflow: 'hidden', cursor: 'zoom-in',
                      position: 'relative'
                    }}
                  >
                    <img 
                      src={getImageUrl(img)} 
                      alt={`Gallery ${i + 1}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s' }} 
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    {/* Zoom Icon Overlay on hover */}
                    <div className="d-flex align-items-center justify-content-center" style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                    onMouseOut={(e) => e.currentTarget.style.opacity = 0}
                    >
                      <ZoomIn size={20} color="#fff" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          experience={exp}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => setRequestSent(true)}
        />
      )}

      {requestSent && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div className="alert alert-success shadow">
            Booking request sent! Check your dashboard.
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {zoomImage && (
        <div 
          className="position-fixed d-flex align-items-center justify-content-center" 
          style={{ inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, cursor: 'zoom-out' }}
          onClick={() => setZoomImage(null)}
        >
          <button 
            className="btn btn-ghost position-absolute" 
            style={{ top: 20, right: 20, color: '#fff' }}
            onClick={() => setZoomImage(null)}
          >
            <X size={32} />
          </button>
          <img 
            src={zoomImage} 
            alt="Zoomed view" 
            style={{ 
              maxWidth: '90%', 
              maxHeight: '90vh', 
              objectFit: 'contain', 
              borderRadius: 8,
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }} 
          />
        </div>
      )}
    </div>
  );
}