import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Check, X, Clock, MapPin } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { getMyBookings, acceptBooking, rejectBooking } from '../../api/bookings';

export default function GuideBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  function load() {
    setLoading(true);
    getMyBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleAction(id, action) {
    if (action === 'reject' && !window.confirm('Decline this request?')) return;
    setActioning(id);
    try {
      if (action === 'accept') await acceptBooking(id);
      else await rejectBooking(id);
      load(); // refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking');
    } finally {
      setActioning(null);
    }
  }

  const pending = bookings.filter(b => b.status === 'PENDING');
  const accepted = bookings.filter(b => b.status === 'ACCEPTED');

  return (
    <DashboardLayout title="Booking Requests" subtitle="Manage incoming tour requests">
      {loading && <div className="text-center py-5 text-muted-2">Loading...</div>}

      {!loading && bookings.length === 0 && (
        <div className="card p-5 text-center text-muted-2">
          <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h5 style={{ fontWeight: 700 }}>No requests yet</h5>
          <p>Once tourists book your experiences, they will appear here.</p>
        </div>
      )}

      {!loading && pending.length > 0 && (
        <>
          <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>Pending Requests ({pending.length})</h6>
          <div className="d-flex flex-column gap-3 mb-5">
            {pending.map(b => (
              <div key={b.id} className="card p-3 border-primary" style={{ borderLeftWidth: 4 }}>
                <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <User size={16} className="text-primary" />
                      <span style={{ fontWeight: 700 }}>{b.tourist?.name}</span>
                      <span className="text-muted-2">wants to book</span>
                      <span style={{ fontWeight: 700 }}>{b.experience?.title}</span>
                    </div>
                    <div className="text-muted-2 d-flex flex-wrap gap-3" style={{ fontSize: '0.85rem' }}>
                      <span><Calendar size={13} className="me-1"/>{new Date(b.date).toLocaleDateString()}</span>
                      <span>Guests: {b.groupSize}</span>
                    </div>
                    {b.message && (
                      <div className="mt-2 p-2 bg-light rounded text-muted-2" style={{ fontSize: '0.85rem' }}>
                        "{b.message}"
                      </div>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button 
                      className="btn btn-outline-danger btn-sm flex-grow-1" 
                      onClick={() => handleAction(b.id, 'reject')}
                      disabled={actioning === b.id}
                    >
                      <X size={14} className="me-1" /> Decline
                    </button>
                    <button 
                      className="btn btn-success btn-sm flex-grow-1" 
                      onClick={() => handleAction(b.id, 'accept')}
                      disabled={actioning === b.id}
                    >
                      <Check size={14} className="me-1" /> Accept
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && accepted.length > 0 && (
        <>
          <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>Upcoming Confirmed Tours</h6>
          <div className="d-flex flex-column gap-3">
            {accepted.map(b => (
              <div key={b.id} className="card p-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="gc-badge gc-badge-green">Confirmed</span>
                      <span style={{ fontWeight: 700 }}>{b.experience?.title}</span>
                    </div>
                    <div className="text-muted-2" style={{ fontSize: '0.85rem' }}>
                      Tourist: {b.tourist?.name} · {new Date(b.date).toLocaleDateString()} · {b.groupSize} guests
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-2 mt-md-0">
                    <Link to={`/guide/itinerary/${b.id}`} className="btn btn-sm btn-outline-navy">
                        <MapPin size={14} className="me-1" /> Build Itinerary
                    </Link>
                    <Link to={`/guide/messages/${b.id}`} className="btn btn-sm btn-primary">
                        Message Tourist
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}