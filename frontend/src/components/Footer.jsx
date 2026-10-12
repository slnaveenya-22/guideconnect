import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="gc-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2 mb-3" style={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem' }}>
              <span className="gc-logo-mark"><Compass size={18} /></span>
              GuideConnect
            </div>
            <p style={{ fontSize: '0.9rem', maxWidth: 320 }}>
              Discover locals. Explore differently. Verified guides, personalized experiences, and unforgettable trips.
            </p>
          </div>

          <div className="col-md-2">
            <h6>Explore</h6>
            <Link to="/guides">Find Guides</Link>
            <Link to="/guides">Experiences</Link>
            <Link to="/">Destinations</Link>
          </div>

          <div className="col-md-2">
            <h6>Company</h6>
            <Link to="/">About</Link>
            <Link to="/">Careers</Link>
            <Link to="/">Contact</Link>
          </div>

          <div className="col-md-2">
            <h6>Legal</h6>
            <Link to="/">Terms</Link>
            <Link to="/">Privacy</Link>
            <Link to="/">Safety</Link>
          </div>

          <div className="col-md-2">
            <h6>For Guides</h6>
            <Link to="/register">Become a Guide</Link>
            <Link to="/">Guide Resources</Link>
          </div>
        </div>

        <div className="gc-footer-bottom">
          © {new Date().getFullYear()} GuideConnect. Built for personalized travel experiences.
        </div>
      </div>
    </footer>
  );
}