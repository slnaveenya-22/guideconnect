import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, Briefcase } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import CategoryBadge from '../../components/CategoryBadge';
import { getMyExperiences, deleteExperience, updateExperience } from '../../api/experiences';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=60';

export default function GuideExperiences() {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    getMyExperiences()
      .then(setExperiences)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggleActive(exp) {
    const fd = new FormData();
    fd.append('isActive', String(!exp.isActive));
    try {
      await updateExperience(exp.id, fd);
      setExperiences((list) =>
        list.map((e) => (e.id === exp.id ? { ...e, isActive: !e.isActive } : e))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  }

  async function handleDelete(exp) {
    if (!window.confirm(`Archive "${exp.title}"? It will no longer appear publicly.`)) return;
    try {
      await deleteExperience(exp.id);
      setExperiences((list) => list.filter((e) => e.id !== exp.id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  }

  return (
    <DashboardLayout
      title="My Experiences"
      subtitle="List the services you offer to travelers"
    >
      <div className="d-flex justify-content-end mb-3">
        <Link to="/guide/experiences/new" className="btn btn-primary">
          <Plus size={16} className="me-1" /> Add Experience
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading && <div className="card p-5 text-center text-muted-2">Loading…</div>}

      {!loading && experiences.length === 0 && (
        <div className="card p-5 text-center text-muted-2">
          <Briefcase size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
          <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)' }}>No experiences yet</h6>
          <p className="mb-3">Add your first experience so travelers can find and book you.</p>
          <Link to="/guide/experiences/new" className="btn btn-primary mx-auto">
            <Plus size={16} className="me-1" /> Create your first experience
          </Link>
        </div>
      )}

      {!loading && experiences.length > 0 && (
        <div className="card">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ fontWeight: 600, fontSize: '0.85rem' }}>Experience</th>
                  <th style={{ fontWeight: 600, fontSize: '0.85rem' }}>Category</th>
                  <th style={{ fontWeight: 600, fontSize: '0.85rem' }}>Price</th>
                  <th style={{ fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                  <th style={{ fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {experiences.map((exp) => (
                  <tr key={exp.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={exp.images?.[0] || PLACEHOLDER}
                          alt=""
                          style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--gc-navy)', fontSize: '0.92rem' }}>
                            {exp.title}
                          </div>
                          <div className="text-muted-2" style={{ fontSize: '0.78rem' }}>
                            {exp.city} · {exp.durationMinutes} min
                          </div>
                        </div>
                      </div>
                    </td>
                    <td><CategoryBadge category={exp.category} /></td>
                    <td style={{ fontWeight: 700, color: 'var(--gc-navy)' }}>
                      ₹{Math.round(exp.price / 100)}
                    </td>
                    <td>
                      {exp.isActive ? (
                        <span className="gc-badge gc-badge-green">Active</span>
                      ) : (
                        <span className="gc-badge gc-badge-gray">Inactive</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-sm btn-ghost me-1"
                        title={exp.isActive ? 'Deactivate' : 'Activate'}
                        onClick={() => toggleActive(exp)}
                      >
                        {exp.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        className="btn btn-sm btn-ghost me-1"
                        onClick={() => navigate(`/guide/experiences/${exp.id}/edit`)}
                        title="Edit"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleDelete(exp)}
                        title="Archive"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}