import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, MapPin, Clock } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// Helper: Convert "09:00" to minutes (540)
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Helper: Convert minutes (540) to "09:00"
function minutesToTime(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function Itinerary() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGuide = user?.role === 'GUIDE';

  const [itinerary, setItinerary] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ startTime: '09:00', title: '', description: '', locationName: '' });
  const [isAdding, setIsAdding] = useState(false);

  async function loadData() {
    setLoading(true);
    setError('');
    
    try {
      const bookingRes = await api.get(`/bookings/${bookingId}`);
      setBooking(bookingRes.data.data);

      try {
        const itineraryRes = await api.get(`/bookings/${bookingId}/itinerary`);
        setItinerary(itineraryRes.data.data);
      } catch (err) {
        setItinerary(null);
      }
    } catch (err) {
      setError('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [bookingId]);

  async function handleCreateItinerary() {
    setError('');
    try {
      const res = await api.post(`/bookings/${bookingId}/itinerary`, { title: 'Trip Plan' });
      setItinerary(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create itinerary');
    }
  }

  async function handleAddItem(e) {
    e.preventDefault();
    setIsAdding(true);
    setError('');

    try {
      await api.post(`/bookings/${bookingId}/itinerary/items`, newItem);
      setNewItem({ startTime: booking.startTime, title: '', description: '', locationName: '' });
      setShowAddForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add stop');
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDeleteItem(itemId) {
    if (!window.confirm('Remove this stop from the itinerary?')) return;
    try {
      await api.delete(`/bookings/${bookingId}/itinerary/items/${itemId}`);
      setItinerary((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.id !== itemId)
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item');
    }
  }

  if (loading) {
    return <DashboardLayout><div className="text-center py-5 text-muted-2">Loading itinerary...</div></DashboardLayout>;
  }

  const backLink = isGuide ? '/guide/bookings' : '/tourist/bookings';
  const items = itinerary?.items || [];

  const tourStartMins = booking ? timeToMinutes(booking.startTime) : 0;
  const tourEndMins = booking ? tourStartMins + (booking.durationMinutes || 120) : 0;
  const maxTourEndTime = minutesToTime(tourEndMins);

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
                {booking.experience?.title} with {isGuide ? booking.tourist?.name : booking.guideProfile?.user?.name}
              </div>
            )}
          </div>
        </div>
        
        {isGuide && itinerary && (
          <button className="btn btn-primary" onClick={() => {
            setShowAddForm(!showAddForm);
            if (!showAddForm) {
              setNewItem(prev => ({ ...prev, startTime: booking.startTime }));
            }
          }}>
            <Plus size={16} className="me-1" /> Add Stop
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        {/* Left Side: Timeline */}
        <div className="col-md-8">
          
          {!itinerary ? (
            <div className="card p-5 text-center text-muted-2">
              <MapPin size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <h5 style={{ fontWeight: 700 }}>No itinerary yet</h5>
              <p>
                {isGuide 
                  ? "You need to create the itinerary before adding stops." 
                  : "Your guide hasn't created a plan for this trip yet."}
              </p>
              {isGuide && (
                <button className="btn btn-primary mt-2 mx-auto" onClick={handleCreateItinerary}>
                  Create Itinerary Plan
                </button>
              )}
            </div>
          ) : items.length === 0 ? (
            <div className="card p-5 text-center text-muted-2">
              <MapPin size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <h5 style={{ fontWeight: 700 }}>Plan created</h5>
              <p>Start building your plan by adding the first stop.</p>
            </div>
          ) : (
            <div className="card p-4">
              {/* Removed the continuous left border from the parent container */}
              <div className="position-relative">
                {items.map((item, index) => (
                  <div key={item.id} className="position-relative mb-4">
                    
                    {/* Only render the line if it's NOT the last item */}
                    {index !== items.length - 1 && (
                      <div 
                        className="position-absolute"
                        style={{
                          left: 10, // Centered with the 14px dot and 3px border
                          top: 20, 
                          bottom: -20, // Extends exactly to the next dot
                          width: 2,
                          background: 'var(--gc-border)',
                          zIndex: 0
                        }}
                      />
                    )}

                    <div 
                      className="position-absolute" 
                      style={{
                        left: 4, top: 4, width: 14, height: 14, borderRadius: '50%',
                        background: 'var(--gc-primary)', border: '3px solid #fff', boxShadow: '0 0 0 2px rgba(37,99,235,0.2)',
                        zIndex: 1
                      }} 
                    />
                    
                    <div className="d-flex justify-content-between align-items-start" style={{ paddingLeft: 32 }}>
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="gc-badge gc-badge-blue" style={{ fontSize: '0.75rem' }}>
                            <Clock size={12} className="me-1" /> 
                            {item.startTime || item.time} 
                          </span>
                          <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', margin: 0 }}>
                            {item.title}
                          </h6>
                        </div>
                        
                        {(item.locationName || item.location) && (
                          <div className="text-muted-2 d-flex align-items-center gap-1 mb-1" style={{ fontSize: '0.85rem' }}>
                            <MapPin size={12} /> {item.locationName || item.location}
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

        {/* Right Side: Add Form & Details */}
        <div className="col-md-4">
          
          {isGuide && showAddForm && itinerary && (
            <div className="card p-4 mb-4" style={{ borderTop: '4px solid var(--gc-primary)' }}>
              <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
                Add a Stop
              </h6>
              <form onSubmit={handleAddItem}>
                
                <div className="mb-3">
                  <label className="form-label">Start Time</label>
                  <input 
                    type="time" 
                    className="form-control" 
                    min={booking.startTime} 
                    max={maxTourEndTime} 
                    value={newItem.startTime} 
                    onChange={(e) => setNewItem({...newItem, startTime: e.target.value})} 
                    required 
                  />
                  <small className="text-muted-2">Must be within your tour window ({booking.startTime} - {maxTourEndTime})</small>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Title (What is happening?)</label>
                  <input type="text" className="form-control" placeholder="e.g. Visit the Temple" value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Location (Optional)</label>
                  <input type="text" className="form-control" placeholder="e.g. Meenakshi Temple" value={newItem.locationName} onChange={(e) => setNewItem({...newItem, locationName: e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description (Optional)</label>
                  <textarea className="form-control" rows={2} placeholder="Brief details..." value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} />
                </div>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-outline-navy flex-grow-1" onClick={() => setShowAddForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary flex-grow-1" disabled={isAdding}>{isAdding ? 'Adding...' : 'Save Stop'}</button>
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
                  <div className="fw-bold">{new Date(booking.scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                </div>
                <div>
                  <div className="text-muted-2" style={{ fontSize: '0.8rem' }}>Tour Window</div>
                  <div className="fw-bold text-primary">
                    {booking.startTime} - {maxTourEndTime}
                    <span className="text-muted-2 ms-1" style={{ fontWeight: 400 }}>({booking.durationMinutes} mins)</span>
                  </div>
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