import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Search, ArrowRight, Star, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { getRecommendations } from '../../api/recommendations';

const INTERESTS = ['Food', 'History', 'Culture', 'Nature', 'Photography', 'Shopping'];
const LANGUAGES = ['English', 'Tamil', 'Hindi', 'Malayalam', 'Kannada'];

// List of cities for the live autocomplete
const TAMIL_NADU_CITIES = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 
  'Tirunelveli', 'Tiruppur', 'Vellore', 'Erode', 'Thoothukkudi', 
  'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur', 
  'Udhagamandalam (Ooty)', 'Hosur', 'Nagercoil', 'Kanchipuram', 
  'Kumarapalayam', 'Karaikkudi', 'Neyveli', 'Cuddalore', 'Kumbakonam', 
  'Tiruvannamalai', 'Pollachi', 'Rajapalayam', 'Gudiyatham', 'Pudukkottai', 
  'Vaniyambadi', 'Ambur', 'Nagapattinam', 'Kanyakumari', 'Kodaikanal'
];

export default function Recommendations() {
  const [form, setForm] = useState({
    city: '',
    date: '',
    language: '',
    interests: [],
    maxPrice: '',
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  // Autocomplete states
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Filter cities based on what the user is typing
  const filteredCities = TAMIL_NADU_CITIES.filter(c => 
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  function handleCitySelect(cityName) {
    setForm({ ...form, city: cityName });
    setCitySearch(cityName);
    setShowCityDropdown(false);
  }

  function toggleInterest(interest) {
    setForm((f) => {
      const exists = f.interests.includes(interest);
      return {
        ...f,
        interests: exists ? f.interests.filter(i => i !== interest) : [...f.interests, interest],
      };
    });
  }

  async function handleSearch(e) {
    e.preventDefault();
    
    // Ensure the user actually selected a valid city from the list
    if (!form.city || !TAMIL_NADU_CITIES.includes(form.city)) {
      setError('Please select a valid city from the dropdown.');
      return;
    }

    setError('');
    setLoading(true);
    setResults(null);

    try {
      const params = {
        city: form.city,
        limit: 10,
      };
      if (form.date) params.date = form.date;
      if (form.language) params.language = form.language;
      if (form.interests.length > 0) params.interests = form.interests.join(',');
      if (form.maxPrice) params.maxPrice = Number(form.maxPrice) * 100; // rupees to paise

      const data = await getRecommendations(params);
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendations.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout
      title="Smart Matching"
      subtitle="Find a guide perfectly tailored to your travel style"
    >
      <div className="row g-4">
        {/* Left Form */}
        <div className="col-md-4">
          <div className="card p-4 position-sticky" style={{ top: 100 }}>
            <div className="d-flex align-items-center gap-2 mb-4">
              <div className="gc-feature-icon" style={{ width: 32, height: 32 }}>
                <Sparkles size={16} />
              </div>
              <h6 style={{ fontWeight: 700, margin: 0, color: 'var(--gc-navy)' }}>Your Preferences</h6>
            </div>

            {error && <div className="alert alert-danger py-2" style={{ fontSize: '0.85rem' }}>{error}</div>}

            <form onSubmit={handleSearch}>
              
              {/* AUTOCOMPLETE DESTINATION FIELD */}
              <div className="mb-3 position-relative">
                <label className="form-label">Destination *</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Coimbatore"
                    style={{ paddingLeft: 38 }}
                    value={citySearch}
                    onChange={(e) => {
                      setCitySearch(e.target.value);
                      setShowCityDropdown(true);
                      // If they type, we clear the exact match until they select from dropdown
                      if (form.city && e.target.value !== form.city) {
                         setForm({ ...form, city: '' });
                      }
                    }}
                    onFocus={() => setShowCityDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)} // Delay to allow click
                    required
                  />
                </div>

                {/* Dropdown showing matching cities */}
                {showCityDropdown && citySearch && (
                  <div 
                    className="position-absolute w-100 bg-white shadow-lg rounded mt-1 overflow-hidden" 
                    style={{ zIndex: 1000, maxHeight: 200, overflowY: 'auto' }}
                  >
                    {filteredCities.length > 0 ? (
                      filteredCities.map(city => (
                        <div 
                          key={city} 
                          className="px-3 py-2 border-bottom" 
                          style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                          onMouseDown={() => handleCitySelect(city)} // use onMouseDown so it fires before onBlur
                        >
                          {city}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-muted" style={{ fontSize: '0.85rem' }}>No matching cities found</div>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Travel Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Preferred Language</label>
                <select
                  className="form-select"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                >
                  <option value="">Any language</option>
                  {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Max Budget (₹ / hour)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 1000"
                  value={form.maxPrice}
                  onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Your Interests</label>
                <div className="d-flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => {
                    const active = form.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className="btn btn-sm"
                        style={{
                          background: active ? 'var(--gc-primary)' : '#f1f5f9',
                          color: active ? '#fff' : 'var(--gc-text)',
                          border: 'none',
                          borderRadius: 20,
                          padding: '4px 12px',
                          fontSize: '0.8rem',
                        }}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                <Search size={16} className="me-1" />
                {loading ? 'Matching...' : 'Find My Match'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Results */}
        <div className="col-md-8">
          {!results && !loading && (
            <div className="card p-5 text-center text-muted-2 h-100 d-flex align-items-center justify-content-center" style={{ borderStyle: 'dashed', background: 'transparent' }}>
              <div>
                <Sparkles size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <h5 style={{ color: 'var(--gc-navy)', fontWeight: 700 }}>Ready to find your perfect guide?</h5>
                <p className="mb-0">Fill out your preferences and we'll rank guides based on your specific needs.</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-5 text-muted-2">
              <div className="spinner-border text-primary mb-3" role="status" />
              <p>Scanning our network of local experts...</p>
            </div>
          )}

          {results && results.length === 0 && (
            <div className="card p-5 text-center">
              <h5 style={{ fontWeight: 700 }}>No matches found</h5>
              <p className="text-muted-2">Try broadening your search criteria (e.g., increase budget or remove specific interests).</p>
            </div>
          )}

          {results && results.length > 0 && (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 style={{ fontWeight: 700, margin: 0, color: 'var(--gc-navy)' }}>
                  Top Matches for You
                </h5>
                <span className="gc-badge gc-badge-gray">{results.length} guides found</span>
              </div>

              <div className="d-flex flex-column gap-3">
                {results.map((guide, index) => (
                  <div key={guide.id} className="card p-3 card-hover d-flex flex-row gap-4 align-items-center">
                    <div style={{ width: 30, textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, color: index === 0 ? 'var(--gc-primary)' : '#cbd5e1' }}>
                      #{index + 1}
                    </div>

                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: `hsl(${guide.id * 60 % 360}, 60%, 60%)`, flexShrink: 0 }} />

                    <div style={{ flex: 1 }}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <Link to={`/guides/${guide.id}`} style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--gc-navy)' }}>
                              {guide.name}
                            </Link>
                            {guide.verificationStatus === 'APPROVED' && <CheckCircle2 size={16} style={{ color: 'var(--gc-primary)' }} />}
                          </div>
                          <div className="text-muted-2" style={{ fontSize: '0.85rem' }}>
                            <MapPin size={12} className="me-1" /> {guide.city}
                            {guide.avgRating > 0 && (
                              <span className="ms-3">
                                <Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b', verticalAlign: -1 }} /> {guide.avgRating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-end">
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gc-primary)', lineHeight: 1 }}>
                            {Math.round(guide.matchScore)}%
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--gc-muted)', fontWeight: 600 }}>MATCH</div>
                        </div>
                      </div>

                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {guide.reasons?.map((reason, i) => (
                          <span key={i} className="gc-badge gc-badge-green d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                            <CheckCircle2 size={10} /> {reason}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      <Link to={`/guides/${guide.id}`} className="btn btn-outline-navy btn-sm">
                        View <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}