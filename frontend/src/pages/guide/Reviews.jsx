import { useEffect, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios';

export default function GuideReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/guide/reviews')
      .then((res) => setReviews(res.data.data || []))
      .catch((err) => {
         console.error("Failed to load reviews", err);
         setReviews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Reviews" subtitle="What travelers are saying about you">
      {loading && <div className="text-center py-5 text-muted-2">Loading reviews...</div>}
      
      {!loading && reviews.length === 0 && (
        <div className="card p-5 text-center text-muted-2">
          <MessageSquare size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h5 style={{ fontWeight: 700 }}>No reviews yet</h5>
          <p>Once tourists complete your tours and leave feedback, it will appear here.</p>
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <div className="row g-3">
          {reviews.map((rev) => (
            <div key={rev.id} className="col-md-6">
              <div className="card p-4 h-100">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--gc-navy)' }}>
                      {rev.booking?.experience?.title || 'Experience'}
                    </div>
                    <div className="text-muted-2" style={{ fontSize: '0.85rem' }}>
                      By: {rev.tourist?.name || 'Anonymous Tourist'}
                    </div>
                  </div>
                  <div className="text-warning">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} size={14} fill={rev.rating >= star ? '#f59e0b' : 'transparent'} style={{ color: rev.rating >= star ? '#f59e0b' : '#cbd5e1' }} />
                    ))}
                  </div>
                </div>
                {rev.comment && (
                  <p className="text-muted-2 mb-0" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                    "{rev.comment}"
                  </p>
                )}
                <div className="text-muted-2 mt-3" style={{ fontSize: '0.75rem' }}>
                  {new Date(rev.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}