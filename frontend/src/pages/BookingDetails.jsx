import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Users, MapPin, CheckCircle2, MessageSquare } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function BookingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const isGuide = user?.role === 'GUIDE';
  const backLink = isGuide ? '/guide/bookings' : '/tourist/bookings';

  useEffect(() => {
    // Fetch the specific booking
    api.get(`/bookings/${id}`)
      .then((res) => setBooking(res.data.data))
      .catch(() => navigate(backLink))
      .finally(() => setLoading(false));
  }, [id, navigate, backLink]);

  if (loading) return <DashboardLayout><div className="text-center py-5 text-muted-2">Loading...</div></DashboardLayout>;
  if (!booking) return null;

  const otherParty = isGuide ? booking.tourist : booking.guideProfile?.user;

  return (
    <DashboardLayout title="Booking Details" subtitle={`Reference #${booking.id}`}>
      <button onClick={() => navigate(backLink)} className="btn btn-ghost btn-sm px-0 mb-4">
        <ArrowLeft size={16} className="me-1" /> Back to Bookings
      </button>

      <div className="row g-4">
        <div className="col-md-8">
          <div className="card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h4 style={{ fontWeight: 800, color: 'var(--gc-navy)' }}>{booking.experience?.title}</h4>
                <div className="text-muted-2">{booking.experience?.category} · {booking.experience?.city}</div>
              </div>
              <span className="gc-badge gc-badge-green">{booking.status}</span>
            </div>

            <div className="row g-4">
              <div className="col-sm-6">
                <div className="text-muted-2 mb-1" style={{ fontSize: '0.85rem' }}>Date & Time</div>
                <div className="d-flex align-items-center gap-2" style={{ fontWeight: 600 }}>
                  <Calendar size={16} className="text-primary" /> 
                  {new Date(booking.scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="d-flex align-items-center gap-2 mt-1" style={{ fontWeight: 600 }}>
                  <Clock size={16} className="text-primary" /> {booking.startTime} ({booking.durationMinutes} mins)
                </div>
              </div>

              <div className="col-sm-6">
                <div className="text-muted-2 mb-1" style={{ fontSize: '0.85rem' }}>Guests</div>
                <div className="d-flex align-items-center gap-2" style={{ fontWeight: 600 }}>
                  <Users size={16} className="text-primary" /> {booking.groupSize} people
                </div>
              </div>
            </div>

            {booking.message && (
              <div className="mt-4 p-3 bg-light rounded">
                <div className="text-muted-2 mb-1" style={{ fontSize: '0.85rem' }}>Special Requests:</div>
                <div style={{ fontSize: '0.95rem' }}>"{booking.message}"</div>
              </div>
            )}
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-4">
            <h6 style={{ fontWeight: 700, color: 'var(--gc-navy)', marginBottom: '1rem' }}>
              {isGuide ? 'Tourist Details' : 'Guide Details'}
            </h6>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gc-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
                {otherParty?.name?.charAt(0) || '?'}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{otherParty?.name}</div>
                <div className="text-muted-2" style={{ fontSize: '0.85rem' }}>{otherParty?.email}</div>
              </div>
            </div>

            <hr />

            {booking.status === 'ACCEPTED' && (
              <div className="d-flex flex-column gap-2">
                <Link to={`/${isGuide ? 'guide' : 'tourist'}/messages/${booking.id}`} className="btn btn-primary w-100">
                  <MessageSquare size={16} className="me-1" /> Message
                </Link>
                <Link to={`/${isGuide ? 'guide' : 'tourist'}/itinerary/${booking.id}`} className="btn btn-outline-navy w-100">
                  View Itinerary
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}