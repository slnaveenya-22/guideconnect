import { useEffect, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../api/axios'; // Adjust import if needed

export default function TouristReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users/me/reviews')
      .then((res) => setReviews(res.data.data || []))
      .catch((err) => {
         console.error("Failed to load reviews", err);
         setReviews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Reviews" subtitle="Feedback you've left for guides">
      {loading && <div className="text-center py-5 text-muted-2">Loading reviews...</div>}
      
      {!loading && reviews.length === 0 && (
        <div className="card p-5 text-center text-muted-2">
          <MessageSquare size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <h5 style={{ fontWeight: 700 }}>No reviews yet</h5>
          <p>After you complete a tour, you can leave a review for your guide.</p>
          <Link to="/tourist/bookings" className="btn btn-primary mx-auto mt-2">Go to My Bookings</Link>
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
                      Guide: {rev.booking?.guide?.name}
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