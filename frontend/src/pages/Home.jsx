import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Search, ShieldCheck, Sparkles, MessageSquare, Headphones,
  MapPin, Calendar, Tag, Star, ArrowRight, Users, Globe2,
  BadgeCheck, Heart, TrendingUp, CalendarCheck, Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const destinations = [
  { name: 'Coimbatore', country: 'India', img: 'https://www.holidify.com/images/bgImages/COIMBATORE.jpg' },
  { name: 'Chennai',    country: 'India', img: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Chennai_train_station.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original' },
  { name: 'Ooty',       country: 'India', img: 'https://www.welbeck.in/assets/img/blogs/1774844617.png' },
  { name: 'Madurai',    country: 'India', img: 'https://i.natgeofe.com/n/b9e9b8d1-fa08-4b90-96bb-310cace03847/meenakshi-amman-temple-india.jpg?w=2560&h=1708' },
  { name: 'Goa',        country: 'India', img: 'https://tripauras.co.in/uploads/50d09fb73b19a3445d21fd7f92924ac8.webp' },
];

const features = [
  {
    icon: Globe2,
    title: 'Feel Like a Local',
    desc: 'Explore with someone who actually lives there. Skip the tourist traps and see the real city.',
  },
  {
    icon: Sparkles,
    title: 'More You, Less Checklist',
    desc: 'Your guide tailors the experience to your interests, pace, and budget — not a fixed script.',
  },
  {
    icon: Heart,
    title: 'Travel That Feels Good',
    desc: 'Support local experts. Every booking puts money directly into the community you visit.',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [destination, setDestination] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set('city', destination);
    if (category) params.set('category', category);
    if (date) params.set('date', date);
    navigate(`/guides?${params.toString()}`);
  }

  // Role-aware CTA content
  const cta = (() => {
    if (!user) {
      return {
        title: 'Become a Local Guide',
        subtitle: 'Share your city with travelers. Earn on your own schedule.',
        buttonText: 'Get Started',
        buttonLink: '/register',
      };
    }
    if (user.role === 'TOURIST') {
      return {
        title: 'Ready for your next adventure?',
        subtitle: 'Discover more guides and plan your next unforgettable trip.',
        buttonText: 'Explore Guides',
        buttonLink: '/guides',
      };
    }
    if (user.role === 'GUIDE') {
      return {
        title: 'Grow your guide business',
        subtitle: 'Complete your profile and add experiences to start receiving requests.',
        buttonText: 'Go to Dashboard',
        buttonLink: '/guide/dashboard',
      };
    }
    return null; // ADMIN — hide
  })();

  return (
    <>
      {/* ───── HERO (unchanged) ───── */}
      <section className="gc-hero">
        <div className="container gc-hero-content">
          <h1>Explore More<br />With Local Experts</h1>
          <p>
            Connect with trusted local guides and discover authentic experiences
            — local food, culture, and hidden gems.
          </p>

          <form className="gc-search" onSubmit={handleSearch}>
            <div className="gc-search-field">
              <span className="gc-search-field-icon"><MapPin size={18} /></span>
              <div className="gc-search-field-body">
                <label className="gc-search-field-label">Where do you want to go?</label>
                <input
                  type="text"
                  placeholder="e.g. Coimbatore, Ooty"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>

            <div className="gc-search-field">
              <span className="gc-search-field-icon"><Tag size={18} /></span>
              <div className="gc-search-field-body">
                <label className="gc-search-field-label">Select category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">All categories</option>
                  <option value="FOOD">Food</option>
                  <option value="HERITAGE">Heritage</option>
                  <option value="SHOPPING">Shopping</option>
                  <option value="CULTURE">Culture</option>
                  <option value="SIGHTSEEING">Sightseeing</option>
                  <option value="NATURE">Nature</option>
                </select>
              </div>
            </div>

            <div className="gc-search-field">
              <span className="gc-search-field-icon"><Calendar size={18} /></span>
              <div className="gc-search-field-body">
                <label className="gc-search-field-label">Travel date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              <Search size={18} /> Search
            </button>
          </form>

          <div className="gc-trust-strip">
            <div className="gc-trust-item">
              <div className="gc-trust-icon"><ShieldCheck size={18} /></div>
              <div className="gc-trust-text">
                <span className="gc-trust-title">Verified Guides</span>
                <span className="gc-trust-sub">Trusted and reviewed</span>
              </div>
            </div>
            <div className="gc-trust-item">
              <div className="gc-trust-icon"><Sparkles size={18} /></div>
              <div className="gc-trust-text">
                <span className="gc-trust-title">Personalized Experiences</span>
                <span className="gc-trust-sub">Tailored to your interests</span>
              </div>
            </div>
            <div className="gc-trust-item">
              <div className="gc-trust-icon"><MessageSquare size={18} /></div>
              <div className="gc-trust-text">
                <span className="gc-trust-title">Secure Communication</span>
                <span className="gc-trust-sub">Chat before you book</span>
              </div>
            </div>
            <div className="gc-trust-item">
              <div className="gc-trust-icon"><Headphones size={18} /></div>
              <div className="gc-trust-text">
                <span className="gc-trust-title">24/7 Support</span>
                <span className="gc-trust-sub">We're here to help</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── POPULAR DESTINATIONS ───── */}
      <section className="gc-section">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-3">
            <div>
              <div className="gc-section-title">Popular Destinations</div>
              <div className="gc-section-sub mb-0">Explore handpicked places loved by travelers</div>
            </div>
            <Link to="/guides" className="btn btn-ghost btn-sm">
              View all <ArrowRight size={14} className="ms-1" />
            </Link>
          </div>

          <div className="row g-3">
            {destinations.map((d) => (
              <div key={d.name} className="col-6 col-md-4" style={{ flex: '0 0 20%', maxWidth: '20%' }}>
                <Link to={`/guides?city=${d.name}`} className="gc-dest-card d-block">
                  <img src={d.img} alt={d.name} />
                  <div className="gc-dest-label">
                    <h6>{d.name}</h6>
                    <span>{d.country}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── WHY CHOOSE US ───── */}
      <section className="gc-section">
        <div className="container">
          <div
            className="gc-why-wrap"
            style={{
              background: 'linear-gradient(135deg, #fdf5f7 0%, #f5f0ff 100%)',
              borderRadius: 24,
              padding: '4rem 2rem',
            }}
          >
            <div className="text-center mb-5">
              <h2 className="gc-why-heading">Real People. Real Stories. Really Good Travel.</h2>
            </div>

            <div className="row g-4 justify-content-center">
              {features.map((f) => (
                <div key={f.title} className="col-md-4 text-center">
                  <div className="gc-why-icon">
                    <f.icon size={26} />
                  </div>
                  <h6 className="gc-why-title">{f.title}</h6>
                  <p className="gc-why-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ───── WHY CHOOSE US ───── */}
      <section className="gc-section gc-why-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="gc-why-heading">
              Why Travelers Choose <span style={{ color: 'var(--gc-primary)' }}>GuideConnect</span>
            </h2>
            <p className="gc-why-subheading">
              Real people, real stories, really good travel.
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            {features.map((f) => (
              <div key={f.title} className="col-md-4">
                <div className="gc-why-card">
                  <div className="gc-why-icon">
                    <f.icon size={26} />
                  </div>
                  <h6 className="gc-why-title">{f.title}</h6>
                  <p className="gc-why-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── STATS ───── */}
      <section className="gc-section bg-soft">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-6 col-md-3">
              <div className="gc-home-stat-value">500+</div>
              <div className="gc-home-stat-label">Local Guides</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="gc-home-stat-value">50+</div>
              <div className="gc-home-stat-label">Cities Covered</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="gc-home-stat-value">4.8<span style={{ fontSize: '1.2rem' }}>★</span></div>
              <div className="gc-home-stat-label">Average Rating</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="gc-home-stat-value">10k+</div>
              <div className="gc-home-stat-label">Happy Travelers</div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── ROLE-AWARE CTA ───── */}
      {cta && (
        <section className="gc-section">
          <div className="container">
            <div
              className="text-center p-5"
              style={{
                background: 'linear-gradient(135deg, var(--gc-navy), #1e4976)',
                borderRadius: '20px',
                color: '#fff',
              }}
            >
              <h2 style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>{cta.title}</h2>
              <p className="mb-4" style={{ opacity: 0.85, maxWidth: 480, margin: '0 auto' }}>
                {cta.subtitle}
              </p>
              <Link to={cta.buttonLink} className="btn btn-primary btn-lg">
                {cta.buttonText}
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}