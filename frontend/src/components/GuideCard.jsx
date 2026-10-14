import { Link } from 'react-router-dom';
import { MapPin, Star, BadgeCheck } from 'lucide-react';

function initials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function colorFromId(id = 0) {
  const hues = [210, 260, 320, 20, 150, 190];
  return `hsl(${hues[id % hues.length]}, 65%, 62%)`;
}

export default function GuideCard({ guide }) {
  const languages = Array.isArray(guide.languages) ? guide.languages : [];
  const expertise = Array.isArray(guide.expertise) ? guide.expertise : [];
  const isVerified = guide.verificationStatus === 'APPROVED';

  return (
    <div className="card h-100 card-hover" style={{ overflow: 'hidden' }}>
      <div className="p-3 d-flex flex-column" style={{ minHeight: 260 }}>
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-3">
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: guide.avatarUrl ? `url(${guide.avatarUrl}) center/cover` : colorFromId(guide.id),
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '3px solid #fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          >
            {!guide.avatarUrl && initials(guide.name)}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="d-flex align-items-center gap-2">
              <Link
                to={`/guides/${guide.id}`}
                className="text-truncate"
                style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gc-navy)' }}
              >
                {guide.name}
              </Link>
              {isVerified && (
                <BadgeCheck size={16} style={{ color: '#2563eb', flexShrink: 0 }} title="Verified" />
              )}
            </div>
            <div
              className="text-muted-2 d-flex align-items-center gap-1"
              style={{ fontSize: '0.82rem' }}
            >
              <MapPin size={12} /> {guide.city}
            </div>
          </div>
        </div>

        {/* Languages + expertise */}
        <div className="d-flex flex-wrap gap-1 mb-2">
          {languages.slice(0, 3).map((lang) => (
            <span key={lang} className="gc-badge gc-badge-gray" style={{ fontSize: '0.68rem' }}>
              {lang}
            </span>
          ))}
          {languages.length > 3 && (
            <span className="gc-badge gc-badge-gray" style={{ fontSize: '0.68rem' }}>
              +{languages.length - 3}
            </span>
          )}
        </div>

        <div className="d-flex flex-wrap gap-1 mb-2">
          {expertise.slice(0, 3).map((tag) => (
            <span key={tag} className="gc-badge gc-badge-blue" style={{ fontSize: '0.68rem' }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto d-flex align-items-center justify-content-between pt-2 border-top">
          <div className="d-flex align-items-center gap-1">
            <Star size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
              {guide.avgRating ? guide.avgRating.toFixed(1) : 'New'}
            </span>
            {guide.reviewCount > 0 && (
              <span className="text-muted-2" style={{ fontSize: '0.78rem' }}>
                ({guide.reviewCount})
              </span>
            )}
          </div>

          {guide.hourlyRate ? (
            <div style={{ fontWeight: 800, color: 'var(--gc-navy)', fontSize: '1rem' }}>
              ₹{Math.round(guide.hourlyRate / 100)}
              <span className="text-muted-2" style={{ fontWeight: 400, fontSize: '0.75rem' }}>
                /hr
              </span>
            </div>
          ) : (
            <span className="text-muted-2" style={{ fontSize: '0.85rem' }}>
              Rate on request
            </span>
          )}
        </div>

        <Link
          to={`/guides/${guide.id}`}
          className="btn btn-outline-navy btn-sm mt-3 w-100"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}