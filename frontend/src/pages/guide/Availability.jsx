import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Plus, Trash2, Clock, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { getExperienceAvailability, addAvailabilitySlot, deleteAvailabilitySlot } from '../../api/availability';
import api from '../../api/axios';

export default function GuideAvailability() {
  const { id } = useParams(); // experienceId
  const navigate = useNavigate();
  
  const [experience, setExperience] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [isAdding, setIsAdding] = useState(false);

  function loadData() {
    setLoading(true);
    Promise.all([
      api.get(`/experiences/${id}`).then(res => res.data.data),
      getExperienceAvailability(id)
    ])
      .then(([expData, slotsData]) => {
        setExperience(expData);
        setSlots(slotsData);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load schedule'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, [id]);

  async function handleAdd(e) {
    e.preventDefault();
    setIsAdding(true);
    try {
      await addAvailabilitySlot({ experienceId: id, date, startTime, endTime });
      setDate('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add slot');
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDelete(slotId) {
    if (!window.confirm('Remove this slot?')) return;
    try {
      await deleteAvailabilitySlot(slotId);
      setSlots(slots.filter(s => s.id !== slotId));
    } catch (err) {
      alert('Failed to delete');
    }
  }

  if (loading) return <DashboardLayout title="Loading..."><div className="text-center py-5 text-muted-2">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout
      title={`Availability: ${experience?.title}`}
      subtitle="Set the dates and times you are open for this specific experience"
    >
      <button className="btn btn-ghost btn-sm px-0 mb-3" onClick={() => navigate('/guide/experiences')}>
        <ArrowLeft size={16} className="me-1" /> Back to Experiences
      </button>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card p-4">
            <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>Add a New Slot</h6>
            <form onSubmit={handleAdd}>
              <div className="mb-3">
                <label className="form-label">Date *</label>
                <input type="date" className="form-control" value={date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label">Start Time *</label>
                  <input type="time" className="form-control" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                </div>
                <div className="col-6">
                  <label className="form-label">End Time *</label>
                  <input type="time" className="form-control" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={isAdding}>
                <Plus size={16} className="me-1" /> {isAdding ? 'Adding...' : 'Add Slot'}
              </button>
            </form>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card p-4 h-100">
            <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>Upcoming Slots for this Experience</h6>
            {slots.length === 0 ? (
              <div className="text-center text-muted-2 py-5 border rounded" style={{ borderStyle: 'dashed !important' }}>
                <Calendar size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p className="mb-0">No availability slots added yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((slot) => (
                      <tr key={slot.id}>
                        <td style={{ fontWeight: 600 }}>{new Date(slot.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                        <td><Clock size={14} className="me-1 text-muted-2" />{slot.startTime} – {slot.endTime}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => handleDelete(slot.id)} className="btn btn-sm btn-ghost text-danger"><Trash2 size={16} /></button>
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