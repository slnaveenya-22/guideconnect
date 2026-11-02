import { useEffect, useState } from 'react';
import { ShieldCheck, XCircle, CheckCircle2, FileText } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { getPendingVerifications, reviewVerification } from '../../api/admin';

export default function AdminVerifications() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState(null);

  function load() {
    setLoading(true);
    getPendingVerifications()
      .then(setRequests)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleAction(id, action) {
    let reason = null;
    if (action === 'REJECTED') {
      reason = window.prompt('Reason for rejection (the guide will see this):');
      if (reason === null) return; // user cancelled
      if (!reason.trim()) return alert('A reason is required for rejection.');
    } else {
      if (!window.confirm('Approve this guide? They will receive the verified badge.')) return;
    }

    setActioningId(id);
    try {
      await reviewVerification(id, action, reason);
      load(); // reload list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process');
    } finally {
      setActioningId(null);
    }
  }

  return (
    <DashboardLayout title="Verification Requests" subtitle="Review guide documents and IDs">
      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading && <div className="text-center py-5 text-muted-2">Loading requests...</div>}

      {!loading && requests.length === 0 && (
        <div className="card p-5 text-center text-muted-2">
          <ShieldCheck size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h5 style={{ fontWeight: 700 }}>All caught up</h5>
          <p>No pending verification requests.</p>
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="d-flex flex-column gap-3">
          {requests.map((req) => (
            <div key={req.id} className="card p-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--gc-navy)' }}>
                      {req.guideProfile?.user?.name}
                    </span>
                    <span className="gc-badge gc-badge-gray">Guide</span>
                  </div>
                  <div className="text-muted-2" style={{ fontSize: '0.85rem' }}>
                    City: {req.guideProfile?.city} · Submitted: {new Date(req.submittedAt).toLocaleDateString()}
                  </div>
                  
                  <div className="mt-3 d-flex gap-2">
                    {req.govIdDocumentUrl && (
                      <a href={req.govIdDocumentUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-navy">
                        <FileText size={14} className="me-1" /> Gov ID
                      </a>
                    )}
                    {req.credentialsUrl && (
                      <a href={req.credentialsUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-navy">
                        <FileText size={14} className="me-1" /> Credentials
                      </a>
                    )}
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-danger" 
                    onClick={() => handleAction(req.id, 'REJECTED')}
                    disabled={actioningId === req.id}
                  >
                    <XCircle size={16} className="me-1" /> Reject
                  </button>
                  <button 
                    className="btn btn-success" 
                    onClick={() => handleAction(req.id, 'APPROVED')}
                    disabled={actioningId === req.id}
                  >
                    <CheckCircle2 size={16} className="me-1" /> Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}