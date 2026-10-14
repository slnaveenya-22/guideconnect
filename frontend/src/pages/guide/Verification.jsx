import { useEffect, useState } from 'react';
import {
  Upload, ShieldCheck, Clock, CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { submitVerification, getMyVerification } from '../../api/guides';

export default function GuideVerification() {
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [govFile, setGovFile] = useState(null);
  const [credFile, setCredFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function loadStatus() {
    setLoading(true);
    getMyVerification()
      .then(setVerification)
      .catch((err) => {
        // 404 = not submitted yet, that's fine
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message || 'Failed to load verification');
        }
        setVerification({ status: 'NOT_SUBMITTED' });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadStatus(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!govFile) {
      setError('Please upload your government ID');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('govIdDocument', govFile);
      if (credFile) formData.append('credentialsDocument', credFile);
      if (notes) formData.append('notes', notes);

      await submitVerification(formData);
      setSuccess('Verification submitted! Admin will review it shortly.');
      loadStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  }

  const status = verification?.status || 'NOT_SUBMITTED';

  return (
    <DashboardLayout
      title="Guide Verification"
      subtitle="Submit your documents for review and get the verified badge"
    >
      {/* Status card */}
      <div className="card p-4 mb-4">
        <div className="d-flex align-items-center gap-3">
          {status === 'APPROVED' && <CheckCircle2 size={40} style={{ color: '#10b981' }} />}
          {status === 'PENDING' && <Clock size={40} style={{ color: '#f59e0b' }} />}
          {status === 'REJECTED' && <XCircle size={40} style={{ color: '#dc2626' }} />}
          {status === 'NOT_SUBMITTED' && <ShieldCheck size={40} style={{ color: 'var(--gc-muted)' }} />}

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gc-muted)', fontWeight: 600 }}>
              CURRENT STATUS
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--gc-navy)' }}>
              {status === 'APPROVED' && 'Verified'}
              {status === 'PENDING' && 'Under Review'}
              {status === 'REJECTED' && 'Rejected'}
              {status === 'NOT_SUBMITTED' && 'Not Submitted'}
            </div>

            {verification?.submittedAt && (
              <div className="text-muted-2" style={{ fontSize: '0.85rem' }}>
                Submitted {new Date(verification.submittedAt).toLocaleDateString()}
              </div>
            )}

            {verification?.rejectionReason && (
              <div className="mt-2 p-2" style={{ background: '#fef2f2', borderRadius: 8, fontSize: '0.9rem' }}>
                <strong>Reason:</strong> {verification.rejectionReason}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form — only if not pending/approved */}
      {(status === 'NOT_SUBMITTED' || status === 'REJECTED') && (
        <form onSubmit={handleSubmit}>
          <div className="card p-4 mb-3">
            <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
              Upload Documents
            </h6>

            {error && <div className="alert alert-danger d-flex align-items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>}
            {success && <div className="alert alert-success d-flex align-items-center gap-2">
              <CheckCircle2 size={16} /> {success}
            </div>}

            <div className="mb-3">
              <label className="form-label">Government ID *</label>
              <input
                type="file"
                className="form-control"
                accept="image/jpeg,image/png,application/pdf"
                onChange={(e) => setGovFile(e.target.files[0])}
                required
              />
              <small className="text-muted-2">
                Aadhaar, PAN, passport, or driving license. Max 5 MB.
              </small>
            </div>

            <div className="mb-3">
              <label className="form-label">Tourism credentials (optional)</label>
              <input
                type="file"
                className="form-control"
                accept="image/jpeg,image/png,application/pdf"
                onChange={(e) => setCredFile(e.target.files[0])}
              />
              <small className="text-muted-2">
                Guide license, certificates, or proof of experience.
              </small>
            </div>

            <div className="mb-3">
              <label className="form-label">Additional notes (optional)</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Anything you'd like the admin to know..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
              />
            </div>

            <div className="p-3 mb-3" style={{ background: '#f0f6ff', borderRadius: 10, fontSize: '0.85rem' }}>
              <strong>Privacy note:</strong> Your documents are only viewed by our verification team.
              They are never displayed publicly or shared with tourists.
            </div>

            <button className="btn btn-primary" disabled={submitting}>
              <Upload size={16} className="me-1" />
              {submitting ? 'Submitting…' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      )}

      {/* Pending notice */}
      {status === 'PENDING' && (
        <div className="card p-4 text-center text-muted-2">
          <Clock size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <p className="mb-1" style={{ fontWeight: 600, color: 'var(--gc-navy)' }}>
            Your documents are being reviewed
          </p>
          <p className="mb-0">We'll notify you when the review is complete. This usually takes 1–3 days.</p>
        </div>
      )}
    </DashboardLayout>
  );
}