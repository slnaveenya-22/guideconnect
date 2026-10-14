import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { searchGuides } from '../api/guides';
import GuideCard from '../components/GuideCard';

const CATEGORIES = ['FOOD', 'HERITAGE', 'SHOPPING', 'CULTURE', 'SIGHTSEEING', 'NATURE'];
const LANGUAGES = ['English', 'Tamil', 'Hindi', 'Malayalam', 'Kannada', 'French', 'German'];

export default function Guides() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [city, setCity] = useState(searchParams.get('city') || '');
  const [language, setLanguage] = useState(searchParams.get('language') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verifiedOnly') === 'true');
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [showFilters, setShowFilters] = useState(false);

  const [guides, setGuides] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch on every change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const params = { page, limit: 12, sort };
    if (city) params.city = city;
    if (language) params.language = language;
    if (category) params.category = category;
    if (verifiedOnly) params.verifiedOnly = true;

    searchGuides(params)
      .then((res) => {
        if (cancelled) return;
        setGuides(res.data || []);
        setPagination(res.pagination || null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || 'Failed to load guides');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [city, language, category, verifiedOnly, sort, page]);

  // Sync URL
  useEffect(() => {
    const params = {};
    if (city) params.city = city;
    if (language) params.language = language;
    if (category) params.category = category;
    if (verifiedOnly) params.verifiedOnly = 'true';
    if (sort) params.sort = sort;
    if (page > 1) params.page = String(page);
    setSearchParams(params, { replace: true });
  }, [city, language, category, verifiedOnly, sort, page]);

  function resetFilters() {
    setCity('');
    setLanguage('');
    setCategory('');
    setVerifiedOnly(false);
    setSort('rating');
    setPage(1);
  }

  const hasFilters = city || language || category || verifiedOnly;

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-4">
        <h2 style={{ fontWeight: 800, color: 'var(--gc-navy)', letterSpacing: '-0.02em' }}>
          Find Your Perfect Guide
        </h2>
        <p className="text-muted-2 mb-0">
          Search and filter guides based on your interests, budget, language, and more.
        </p>
      </div>

      {/* Filter bar */}
      <div className="card p-3 mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-md-3">
            <label className="form-label">Destination</label>
            <input
              className="form-control"
              placeholder="e.g. Coimbatore"
              value={city}
              onChange={(e) => { setCity(e.target.value); setPage(1); }}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Language</label>
            <select
              className="form-select"
              value={language}
              onChange={(e) => { setLanguage(e.target.value); setPage(1); }}
            >
              <option value="">Any</option>
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            >
              <option value="">All</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Sort by</label>
            <select
              className="form-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="rating">Top Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          <div className="col-md-3 d-flex align-items-center gap-2">
            <div className="form-check mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                id="verifiedOnly"
                checked={verifiedOnly}
                onChange={(e) => { setVerifiedOnly(e.target.checked); setPage(1); }}
              />
              <label className="form-check-label" htmlFor="verifiedOnly" style={{ fontSize: '0.9rem' }}>
                Verified only
              </label>
            </div>
            {hasFilters && (
              <button className="btn btn-ghost btn-sm ms-auto" onClick={resetFilters}>
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="text-muted-2" style={{ fontSize: '0.9rem' }}>
          {pagination ? `${pagination.total} guide${pagination.total === 1 ? '' : 's'} found` : ' '}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading && (
        <div className="text-center py-5 text-muted-2">Loading guides…</div>
      )}

      {!loading && !error && guides.length === 0 && (
        <div className="card p-5 text-center text-muted-2">
          <Search size={32} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p className="mb-0">No guides found matching your filters.</p>
          <button className="btn btn-ghost btn-sm mt-2 mx-auto" onClick={resetFilters}>
            Clear filters
          </button>
        </div>
      )}

      {!loading && guides.length > 0 && (
        <>
          <div className="row g-3">
            {guides.map((g) => (
              <div key={g.id} className="col-md-6 col-lg-4">
                <GuideCard guide={g} />
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
              <button
                className="btn btn-outline-navy btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="text-muted-2" style={{ fontSize: '0.9rem' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-outline-navy btn-sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}