import { useState } from 'react';
import { X, Calendar, Users, AlertCircle } from 'lucide-react';
import { createBooking } from '../api/bookings';

export default function BookingModal({ experience, onClose, onSuccess }) {
  const [date, setDate] = useState('');
  const [groupSize, setGroupSize] = useState(1);
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await createBooking({
        experienceId: experience.id,
        date,
        groupSize: Number(groupSize),
        message,
      });
      onSuccess(); // tell parent to refresh list or show toast
      onClose();   // close modal
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  }

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
                src={experience.images?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=100&q=60'} 
                alt="" 
                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} 
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>{experience.title}</div>
                <div className="text-muted-2" style={{ fontSize: '0.8rem' }}>{experience.city}</div>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2" style={{ fontSize: '0.85rem' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Select Date *</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
                  <input
                    type="date"
                    className="form-control"
                    style={{ paddingLeft: 38 }}
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <small className="text-muted-2">Must be a date you know the guide is available.</small>
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
                <small className="text-muted-2">Max allowed for this tour: {experience.maxGroupSize}.</small>
              </div>

              <div className="mb-4">
                <label className="form-label">Message to Guide (Optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Any special requests, food allergies, or things you want to see?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                />
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button type="button" className="btn btn-outline-navy" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}