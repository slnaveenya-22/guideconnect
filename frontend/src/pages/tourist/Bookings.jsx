import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Star, CheckCircle2, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import ReviewModal from '../../components/ReviewModal';
import { getMyBookings, cancelBooking } from '../../api/bookings';

// Helper to fix broken image URLs from local storage
const getImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=100&q=60';
  if (url.startsWith('http')) return url;
  return `http://localhost:5000/${url.replace(/\\/g, '/')}`;
};

export default function TouristBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState(null);

  function load() {
    setLoading(true);
    getMyBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleCancel(id) {
    if (!window.confirm('Cancel this booking request?')) return;
    try {
      await cancelBooking(id);
      load(); // refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  }

  function StatusBadge({ status }) {
    if (status === 'PENDING') return <span className="gc-badge gc-badge-amber"><Clock size={12} className="me-1"/> Pending</span>;
    if (status === 'ACCEPTED') return <span className="gc-badge gc-badge-green"><CheckCircle2 size={12} className="me-1"/> Confirmed</span>;
    if (status === 'REJECTED') return <span className="gc-badge gc-badge-red"><XCircle size={12} className="me-1"/> Declined</span>;
    if (status === 'CANCELLED') return <span className="gc-badge gc-badge-gray">Cancelled</span>;
    if (status === 'COMPLETED') return <span className="gc-badge gc-badge-blue">Completed</span>;
    return <span className="gc-badge gc-badge-gray">{status}</span>;
  }

  return (
    <DashboardLayout title="My Bookings" subtitle="Track your upcoming and past experiences">
      {loading && <div className="text-center py-5 text-muted-2">Loading bookings...</div>}

      {!loading && bookings.length === 0 && (
        <div className="card p-5 text-center text-muted-2">
          <Calendar size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h5 style={{ fontWeight: 700 }}>No bookings yet</h5>
          <p>Find a guide and book your first experience!</p>
          <Link to="/guides" className="btn btn-primary mx-auto mt-2">Explore Guides</Link>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="d-flex flex-column gap-3">
          {bookings.map((b) => (
            <div key={b.id} className="card p-3">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                
                <div className="d-flex gap-3 align-items-center">
                  <img 
                    src={getImageUrl(b.experience?.images?.[0])} 
                    alt="" 
                    style={{ width: 70, height: 70, borderRadius: 12, objectFit: 'cover' }} 
                  />
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h6 style={{ fontWeight: 700, margin: 0 }}>{b.experience?.title}</h6>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="text-muted-2 d-flex flex-wrap gap-3" style={{ fontSize: '0.85rem' }}>
                      <span><MapPin size={13} className="me-1"/>{b.experience?.city}</span>
                      <span><Calendar size={13} className="me-1"/>{new Date(b.scheduledDate || b.date).toLocaleDateString()}</span>
                      <span>Guide: {b.guideProfile?.user?.name || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  
                  {b.status === 'PENDING' && (
                    <button className="btn btn-sm btn-ghost text-danger" onClick={() => handleCancel(b.id)}>
                      Cancel
                    </button>
                  )}

                  {b.status === 'ACCEPTED' && (
                    <div className="d-flex gap-2">
                      <Link to={`/tourist/itinerary/${b.id}`} className="btn btn-sm btn-outline-navy">
                        <Calendar size={14} className="me-1" /> Itinerary
                      </Link>
                      <Link to={`/tourist/messages/${b.id}`} className="btn btn-sm btn-primary">
                        Message
                      </Link>
                    </div>
                  )}

                  {/* 👇 Only show if COMPLETED AND no review exists 👇 */}
                  {b.status === 'COMPLETED' && !b.review && (
                    <button 
                      onClick={() => setReviewBooking(b)} 
                      className="btn btn-sm btn-outline-navy"
                    >
                      <Star size={14} className="me-1" /> Leave Review
                    </button>
                  )}

                  {/* 👇 Show a static badge if review is already left 👇 */}
                  {b.status === 'COMPLETED' && b.review && (
                    <span className="gc-badge gc-badge-green d-flex align-items-center gap-1">
                      <CheckCircle2 size={12} /> Reviewed
                    </span>
                  )}

                </div>
                
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => {
            load(); 
          }}
        />
      )}
    </DashboardLayout>
  );
}