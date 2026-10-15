import { Link } from 'react-router-dom';
import { Clock, MapPin, Users, Star } from 'lucide-react';
import CategoryBadge from './CategoryBadge';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';

export default function ExperienceCard({ exp, showGuide = false }) {
  const image = exp.images?.[0] || PLACEHOLDER;
  const price = exp.price ? Math.round(exp.price / 100) : 0;
  const hours = Math.floor(exp.durationMinutes / 60);
  const mins = exp.durationMinutes % 60;
  const duration = hours > 0
    ? `${hours}h${mins ? ` ${mins}m` : ''}`
    : `${mins}m`;

  return (
    <Link to={`/experiences/${exp.id}`} className="text-decoration-none">
      <div className="card h-100 card-hover" style={{ overflow: 'hidden' }}>
        <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
          <img
            src={image}
            alt={exp.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <CategoryBadge category={exp.category} />
          </div>
        </div>

        <div className="p-3">
          <div className="text-muted-2 d-flex align-items-center gap-1 mb-1" style={{ fontSize: '0.78rem' }}>
            <MapPin size={12} /> {exp.city}
          </div>
          <h6 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gc-navy)', lineHeight: 1.35 }}>
            {exp.title}
          </h6>

          {showGuide && exp.guide && (
            <div className="text-muted-2" style={{ fontSize: '0.82rem', marginBottom: 6 }}>
              by {exp.guide.name}
              {exp.guide.avgRating > 0 && (
                <span className="ms-2">
                  <Star size={11} style={{ color: '#f59e0b', fill: '#f59e0b', verticalAlign: -1 }} />{' '}
                  {exp.guide.avgRating.toFixed(1)}
                </span>
              )}
            </div>
          )}

          <div className="d-flex align-items-center gap-3 text-muted-2 mb-2" style={{ fontSize: '0.78rem' }}>
            <span className="d-flex align-items-center gap-1">
              <Clock size={12} /> {duration}
            </span>
            <span className="d-flex align-items-center gap-1">
              <Users size={12} /> up to {exp.maxGroupSize}
            </span>
          </div>

          <div className="pt-2 border-top d-flex justify-content-between align-items-baseline">
            <span className="text-muted-2" style={{ fontSize: '0.75rem' }}>from</span>
            <span style={{ fontWeight: 800, color: 'var(--gc-navy)', fontSize: '1.05rem' }}>
              ₹{price}
              <span className="text-muted-2" style={{ fontWeight: 400, fontSize: '0.75rem' }}>/person</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}