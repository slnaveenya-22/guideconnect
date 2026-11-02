import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, MapPin, Clock, Calendar } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { getItinerary, addItineraryItem, deleteItineraryItem } from '../api/itinerary';
import api from '../api/axios';

export default function Itinerary() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGuide = user?.role === 'GUIDE';

  const [itinerary, setItinerary] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add item form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    time: '09:00',
    title: '',
    description: '',
    location: '',
  });
  const [isAdding, setIsAdding] = useState(false);

  function loadData() {
    setLoading(true);
    // Load both itinerary and booking details in parallel
    Promise.all([
      getItinerary(bookingId).catch(() => null), // Itinerary might not exist yet
      api.get(`/bookings/${bookingId}`).then(res => res.data.data).catch(() => null)
    ])
      .then(([itineraryData, bookingData]) => {
        setItinerary(itineraryData);
        setBooking(bookingData);
      })
      .catch(() => setError('Failed to load trip details'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, [bookingId]);

  async function handleAddItem(e) {
    e.preventDefault();
    setIsAdding(true);
    setError('');

    try {
      await addItineraryItem(bookingId, newItem);
      setNewItem({ time: '09:00', title: '', description: '', location: '' });
      setShowAddForm(false);
      loadData(); // reload
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item');
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDeleteItem(itemId) {
    if (!window.confirm('Remove this stop from the itinerary?')) return;
    try {
      await deleteItineraryItem(bookingId, itemId);
      setItinerary((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.id !== itemId)
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item');
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Itinerary">
        <div className="text-center py-5 text-muted-2">Loading itinerary...</div>
      </DashboardLayout>
    );
  }

  const backLink = isGuide ? '/guide/bookings' : '/tourist/bookings';
  const items = itinerary?.items || [];

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-ghost btn-sm px-2" onClick={() => navigate(backLink)}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h4 style={{ fontWeight: 800, color: 'var(--gc-navy)', margin: 0 }}>
              Trip Itinerary
            </h4>
            {booking && (
              <div className="text-muted-2" style={{ fontSize: '0.9rem' }}>
                {booking.experience?.title} with {isGuide ? booking.tourist?.name : booking.guide?.name}
              </div>
            )}
          </div>
        </div>
        
        {isGuide && (
          <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus size={16} className="me-1" /> Add Stop
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        <div className="col-md-8">
          {/* Timeline */}
          {items.length === 0 ? (
            <div className="card p-5 text-center text-muted-2">
              <MapPin size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <h5 style={{ fontWeight: 700 }}>No itinerary yet</h5>
              <p>
                {isGuide 
                  ? "Start building your plan by adding the first stop."
                  : "Your guide hasn't created a plan for this trip yet."}
              </p>
            </div>
          ) : (
            <div className="card p-4">
              <div className="position-relative" style={{ borderLeft: '2px solid var(--gc-border)', marginLeft: 10, paddingLeft: 24 }}>
                {items.map((item, index) => (
                  <div key={item.id} className="position-relative mb-4">
                    {/* Timeline dot */}
                    <div 
                      className="position-absolute" 
                      style={{
                        left: -31, top: 4, width: 14, height: 14, borderRadius: '50%',
                        background: 'var(--gc-primary)', border: '3px solid #fff', boxShadow: '0 0 0 2px rgba(37,99,235,0.2)'
                      }} 
                    />
                    
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="gc-badge gc-badge-blue" style={{ fontSize: '0.75rem' }}>
                            {item.time}
                          </span>
                          <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', margin: 0 }}>
                            {item.title}
                          </h6>
                        </div>
                        
                        {item.location && (
                          <div className="text-muted-2 d-flex align-items-center gap-1 mb-1" style={{ fontSize: '0.85rem' }}>
                            <MapPin size={12} /> {item.location}
                          </div>
                        )}
                        
                        {item.description && (
                          <p className="text-muted-2 mb-0" style={{ fontSize: '0.9rem' }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                      
                      {isGuide && (
                        <button 
                          className="btn btn-sm btn-ghost text-danger ms-3"
                          onClick={() => handleDeleteItem(item.id)}
                          title="Remove stop"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar / Add Form */}
        <div className="col-md-4">
          {isGuide && showAddForm && (
            <div className="card p-4 mb-4" style={{ borderTop: '4px solid var(--gc-primary)' }}>
              <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
                Add a Stop
              </h6>
              <form onSubmit={handleAddItem}>
                <div className="mb-3">
                  <label className="form-label">Time</label>
                  <input type="time" className="form-control" value={newItem.time} onChange={(e) => setNewItem({...newItem, time: e.target.value})} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input type="text" className="form-control" placeholder="e.g. Visit the Temple" value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Location (Optional)</label>
                  <input type="text" className="form-control" placeholder="e.g. Meenakshi Temple" value={newItem.location} onChange={(e) => setNewItem({...newItem, location: e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description (Optional)</label>
                  <textarea className="form-control" rows={2} placeholder="Brief details..." value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} />
                </div>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-outline-navy flex-grow-1" onClick={() => setShowAddForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary flex-grow-1" disabled={isAdding}>{isAdding ? 'Adding...' : 'Save'}</button>
                </div>
              </form>
            </div>
          )}

          {booking && (
            <div className="card p-4">
              <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
                Trip Details
              </h6>
              <div className="d-flex flex-column gap-3" style={{ fontSize: '0.9rem' }}>
                <div>
                  <div className="text-muted-2" style={{ fontSize: '0.8rem' }}>Tour Date</div>
                  <div className="fw-bold">{new Date(booking.date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-muted-2" style={{ fontSize: '0.8rem' }}>Guests</div>
                  <div className="fw-bold">{booking.groupSize} people</div>
                </div>
                <div>
                  <div className="text-muted-2" style={{ fontSize: '0.8rem' }}>Status</div>
                  <span className="gc-badge gc-badge-green">{booking.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}