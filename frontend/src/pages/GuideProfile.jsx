import { useParams, Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function GuideProfile() {
  const { id } = useParams();
  return (
    <div className="container py-5 text-center">
      <h2 style={{ fontWeight: 800, color: 'var(--gc-navy)' }}>
        Guide Profile #{id}
      </h2>
      <p className="text-muted-2">
        Full profile will be available once Module 2 backend is live.
      </p>
      <Link to="/guides" className="btn btn-primary">Back to Guides</Link>
    </div>
  );
}