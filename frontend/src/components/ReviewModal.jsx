import { useState } from 'react';
import { Star, X, AlertCircle } from 'lucide-react';
import { submitReview } from '../api/reviews';

export default function ReviewModal({ booking, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await submitReview(booking.id, { rating, comment });
      onSuccess(); // Tell parent to reload the list
      onClose();   // Close modal
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
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
              How was your trip?
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body p-4">
            <div className="text-center mb-4">
              <div className="text-muted-2 mb-2" style={{ fontSize: '0.9rem' }}>
                You booked <strong>{booking.experience?.title}</strong>
              </div>
              <div className="d-flex justify-content-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="btn btn-link p-0 border-0"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  >
                    <Star
                      size={36}
                      style={{
                        color: (hover || rating) >= star ? '#f59e0b' : '#e2e8f0',
                        fill: (hover || rating) >= star ? '#f59e0b' : 'transparent',
                        transition: 'all 0.1s',
                      }}
                    />
                  </button>
                ))}
              </div>
              <div style={{ fontWeight: 700, color: 'var(--gc-navy)', marginTop: '0.5rem' }}>
                {rating} out of 5
              </div>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2" style={{ fontSize: '0.85rem' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label">Write a review (Optional)</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="What did you enjoy most? Any tips for future travelers?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                />
                <small className="text-muted-2">{comment.length}/500</small>
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button type="button" className="btn btn-outline-navy" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}