import { useEffect, useState } from 'react';
import { Calendar, Plus, Trash2, Clock } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { getMyAvailability, addAvailabilitySlot, deleteAvailabilitySlot } from '../../api/availability';

export default function GuideAvailability() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [isAdding, setIsAdding] = useState(false);

  function loadSlots() {
    setLoading(true);
    getMyAvailability()
      .then(setSlots)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load slots'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadSlots(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    setIsAdding(true);
    try {
      await addAvailabilitySlot({ date, startTime, endTime });
      setDate(''); // reset date only
      loadSlots();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add slot');
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this availability slot?')) return;
    try {
      await deleteAvailabilitySlot(id);
      setSlots((s) => s.filter((slot) => slot.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  }

  return (
    <DashboardLayout
      title="My Availability"
      subtitle="Set the dates and times you are open for tours"
    >
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        {/* Left: Add Slot Form */}
        <div className="col-md-4">
          <div className="card p-4">
            <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
              Add a New Slot
            </h6>
            <form onSubmit={handleAdd}>
              <div className="mb-3">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  min={new Date().toISOString().split('T')[0]} // no past dates
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label">Start Time *</label>
                  <input
                    type="time"
                    className="form-control"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">End Time *</label>
                  <input
                    type="time"
                    className="form-control"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={isAdding}>
                <Plus size={16} className="me-1" />
                {isAdding ? 'Adding...' : 'Add Slot'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: List of Slots */}
        <div className="col-md-8">
          <div className="card p-4 h-100">
            <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
              Upcoming Slots
            </h6>

            {loading && <div className="text-muted-2 text-center py-4">Loading...</div>}

            {!loading && slots.length === 0 && (
              <div className="text-center text-muted-2 py-5 border rounded" style={{ borderStyle: 'dashed !important' }}>
                <Calendar size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p className="mb-0">No availability slots added yet.</p>
                <p style={{ fontSize: '0.85rem' }}>Add a slot on the left so tourists can book you.</p>
              </div>
            )}

            {!loading && slots.length > 0 && (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th style={{ fontSize: '0.85rem' }}>Date</th>
                      <th style={{ fontSize: '0.85rem' }}>Time</th>
                      <th style={{ fontSize: '0.85rem' }}>Status</th>
                      <th style={{ textAlign: 'right', fontSize: '0.85rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((slot) => (
                      <tr key={slot.id}>
                        <td style={{ fontWeight: 600 }}>
                          {new Date(slot.date).toLocaleDateString('en-IN', {
                            weekday: 'short', month: 'short', day: 'numeric'
                          })}
                        </td>
                        <td>
                          <Clock size={14} className="me-1 text-muted-2" />
                          {slot.startTime} – {slot.endTime}
                        </td>
                        <td>
                          {slot.isBooked ? (
                            <span className="gc-badge gc-badge-amber">Booked</span>
                          ) : (
                            <span className="gc-badge gc-badge-green">Available</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleDelete(slot.id)}
                            className="btn btn-sm btn-ghost text-danger"
                            disabled={slot.isBooked}
                            title={slot.isBooked ? "Cannot delete booked slot" : "Remove slot"}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}