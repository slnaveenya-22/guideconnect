import { useState, useEffect } from 'react';
import { X, Calendar, Users, Clock, AlertCircle } from 'lucide-react';
import { createBooking } from '../api/bookings';
import { getPublicExperienceAvailability } from '../api/availability';

// Helper: Convert "09:00" to 540 minutes
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Helper: Convert 540 minutes back to "09:00"
function minutesToTime(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

// Helper: Fix broken image URLs from local storage
const getImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=100&q=60';
  if (url.startsWith('http')) return url;
  return `http://localhost:5000/${url.replace(/\\/g, '/')}`;
};

export default function BookingModal({ experience, onClose, onSuccess }) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [groupSize, setGroupSize] = useState(1);
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingAvail, setLoadingAvail] = useState(true);

  // Fetch the guide's availability for this specific experience
  useEffect(() => {
    getPublicExperienceAvailability(experience.id)
      .then((slots) => {
        setAvailableSlots(slots || []);
      })
      .catch(() => {})
      .finally(() => setLoadingAvail(false));
  }, [experience]);

  const availableDates = availableSlots.map(slot => 
    new Date(slot.date).toISOString().split('T')[0]
  );

  // Find the matching slot for the selected date
  const selectedSlot = availableSlots.find(slot => 
    new Date(slot.date).toISOString().split('T')[0] === date
  );

  // Generate valid start times based on guide's window and experience duration
  const getValidStartTimes = () => {
    if (!selectedSlot) return [];
    
    const availableStart = timeToMinutes(selectedSlot.startTime);
    const availableEnd = timeToMinutes(selectedSlot.endTime);
    const duration = experience.durationMinutes || 60; 
    
    const validTimes = [];
    // Step through in 30-minute increments
    for (let time = availableStart; time + duration <= availableEnd; time += 30) {
      validTimes.push(minutesToTime(time));
    }
    return validTimes;
  };

  const validTimes = getValidStartTimes();

  // Reset start time if date changes
  useEffect(() => {
    setStartTime('');
  }, [date]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!date || !startTime) {
      setError('Please select both a date and a start time.');
      return;
    }

    setLoading(true);

    try {
      await createBooking({
        experienceId: experience.id,
        scheduledDate: date, 
        startTime: startTime,
        groupSize: Number(groupSize),
        message,
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  }

  // Find the earliest available date for the min attribute
  const earliestDate = availableDates.length > 0 
    ? availableDates.sort()[0] 
    : new Date().toISOString().split('T')[0];

  return (
    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
          
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title" style={{ fontWeight: 800, color: 'var(--gc-navy)' }}>
              Request this Experience
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body p-4">
            <div className="d-flex gap-3 mb-4 align-items-center bg-light p-3 rounded">
              <img 
                src={getImageUrl(experience.images?.[0])} 
                alt="" 
                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} 
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>{experience.title}</div>
                <div className="text-muted-2" style={{ fontSize: '0.8rem' }}>{experience.city} · {experience.durationMinutes} mins</div>
              </div>
            </div>

            {loadingAvail ? (
              <div className="text-center py-4 text-muted-2">Checking guide availability...</div>
            ) : availableSlots.length === 0 ? (
               <div className="alert alert-warning text-center">
                 This guide hasn't set any availability for this experience yet.
               </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2" style={{ fontSize: '0.85rem' }}>
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label">Select Date *</label>
                    <div style={{ position: 'relative' }}>
                      <Calendar size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
                      <input
                        type="date"
                        className="form-control"
                        style={{ paddingLeft: 38 }}
                        min={earliestDate}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="col-6">
                    <label className="form-label">Start Time *</label>
                    <div style={{ position: 'relative' }}>
                      <Clock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
                      <select
                        className="form-select"
                        style={{ paddingLeft: 38 }}
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        disabled={!date}
                        required
                      >
                        <option value="">{date ? 'Select time' : 'Pick date first'}</option>
                        {validTimes.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3 text-muted-2" style={{ fontSize: '0.8rem' }}>
                  Available dates: {availableDates.map(d => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })).join(', ')}
                </div>

                <div className="mb-3">
                  <label className="form-label">Number of Guests *</label>
                  <div style={{ position: 'relative' }}>
                    <Users size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
                    <input
                      type="number"
                      className="form-control"
                      style={{ paddingLeft: 38 }}
                      min={1}
                      max={experience.maxGroupSize || 10}
                      value={groupSize}
                      onChange={(e) => setGroupSize(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Message to Guide (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Any special requests..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={500}
                  />
                </div>

                <div className="d-flex gap-2 justify-content-end">
                  <button type="button" className="btn btn-outline-navy" onClick={onClose}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading || !startTime}
                  >
                    {loading ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}