import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
      <div style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--gc-navy)', letterSpacing: '-0.04em', lineHeight: 1 }}>
        404
      </div>
      <p className="lead text-muted-2 mb-4">This page doesn't exist (yet).</p>
      <Link to="/" className="btn btn-primary">
        <Compass size={16} className="me-1" /> Back to Home
      </Link>
    </div>
  );
}