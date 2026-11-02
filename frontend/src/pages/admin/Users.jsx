import { useEffect, useState } from 'react';
import { Search, Ban, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { getAllUsers, toggleUserStatus } from '../../api/admin';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [actioningId, setActioningId] = useState(null);

  function load() {
    setLoading(true);
    getAllUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleToggleStatus(user) {
    if (!window.confirm(`Are you sure you want to ${user.isActive ? 'suspend' : 'reactivate'} ${user.name}?`)) return;
    setActioningId(user.id);
    try {
      await toggleUserStatus(user.id, !user.isActive);
      load();
    } catch (err) {
      alert('Failed to update user');
    } finally {
      setActioningId(null);
    }
  }

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(query.toLowerCase()) || 
    u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <DashboardLayout title="User Management" subtitle="View and moderate platform accounts">
      <div className="card p-3 mb-4">
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gc-muted)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by name or email..." 
            style={{ paddingLeft: 38 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted-2">Loading users...</div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ fontSize: '0.85rem' }}>User</th>
                  <th style={{ fontSize: '0.85rem' }}>Role</th>
                  <th style={{ fontSize: '0.85rem' }}>Status</th>
                  <th style={{ textAlign: 'right', fontSize: '0.85rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--gc-navy)' }}>{u.name}</div>
                      <div className="text-muted-2" style={{ fontSize: '0.8rem' }}>{u.email}</div>
                    </td>
                    <td>
                      <span className={`gc-badge ${u.role === 'ADMIN' ? 'gc-badge-blue' : u.role === 'GUIDE' ? 'gc-badge-green' : 'gc-badge-gray'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.isActive ? (
                        <span className="text-success" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active</span>
                      ) : (
                        <span className="text-danger" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Suspended</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {u.role !== 'ADMIN' && (
                        <button 
                          className={`btn btn-sm ${u.isActive ? 'btn-ghost text-danger' : 'btn-outline-navy'}`}
                          onClick={() => handleToggleStatus(u)}
                          disabled={actioningId === u.id}
                        >
                          {u.isActive ? <><Ban size={14} className="me-1" /> Suspend</> : <><CheckCircle2 size={14} className="me-1" /> Activate</>}
                        </button>
                      )}
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