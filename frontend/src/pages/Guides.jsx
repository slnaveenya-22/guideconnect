import { Search } from 'lucide-react';

export default function Guides() {
  return (
    <div className="container py-5">
      <div className="d-flex align-items-center gap-2 mb-2">
        <Search size={20} style={{ color: 'var(--gc-primary)' }} />
        <h2 className="mb-0" style={{ fontWeight: 800, color: 'var(--gc-navy)' }}>
          Find Your Perfect Guide
        </h2>
      </div>
      <p className="text-muted-2 mb-5">
        Search and filter guides based on your interests, budget, language, and more.
      </p>

      <div className="card p-5 text-center text-muted-2">
        <p className="mb-0">Guide search will be available once Module 2 is complete.</p>
      </div>
    </div>
  );
}