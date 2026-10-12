import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">
          Discover Locals. Explore Differently.
        </h1>
        <p className="lead text-muted mb-4">
          Connect with verified local guides who match your interests,
          language, and budget.
        </p>
        <Link to="/guides" className="btn btn-primary btn-lg">
          Find a Guide
        </Link>
      </div>

      <div className="row g-4 mt-4">
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">1. Search</h5>
              <p className="card-text text-muted">
                Filter by destination, language, interests, and dates.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">2. Connect</h5>
              <p className="card-text text-muted">
                Send a request to your preferred guide and chat after they accept.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">3. Explore</h5>
              <p className="card-text text-muted">
                Enjoy a personalized itinerary built around your trip.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}