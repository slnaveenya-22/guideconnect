import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Guides from './pages/Guides';
import NotFound from './pages/NotFound';
import ChatWindow from './pages/ChatWindow';
import Messages from './pages/Messages';
import Itinerary from './pages/Itinerary';

import TouristDashboard from './pages/tourist/Dashboard';
import GuideDashboard from './pages/guide/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

import GuideProfile from './pages/GuideProfile';
import GuideProfileManage from './pages/guide/Profile';
import GuideVerification from './pages/guide/Verification';
import GuideReviews from './pages/guide/Reviews';

import ExperienceDetail from './pages/ExperienceDetail';
import GuideExperiences from './pages/guide/Experiences';
import ExperienceNew from './pages/guide/ExperienceNew';
import ExperienceEdit from './pages/guide/ExperienceEdit';
import GuideAvailability from './pages/guide/Availability';

import Recommendations from './pages/tourist/Recommendations';
import TouristBookings from './pages/tourist/Bookings';
import TouristProfile from './pages/tourist/Profile';
import TouristReviews from './pages/tourist/Reviews';
import GuideBookings from './pages/guide/Bookings';

import AdminVerifications from './pages/admin/Verifications';
import AdminUsers from './pages/admin/Users';

function Layout() {
  const location = useLocation();
  const path = location.pathname;

  // Fullscreen pages — no navbar, no footer
  const isAuthPage = path === '/login' || path === '/register';

  // Sidebar zone — dashboards get their own layout
  const isManagePage =
    path.startsWith('/tourist/') ||
    path.startsWith('/guide/') ||
    path.startsWith('/admin/');

  // Everything else uses the top navbar + footer
  const showNavbar = !isAuthPage && !isManagePage;
  const showFooter = showNavbar;

  return (
    <div className="page-wrap">
      {showNavbar && <Navbar />}

      <main style={{ flex: 1 }}>
        <Routes>
          {/* ───── Browse zone (public + logged-in both see this layout) ───── */}
          <Route path="/" element={<Home />} />
          <Route path="/guides" element={<Guides />} />

          {/* ───── Auth (fullscreen) ───── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ───── Manage zone (sidebar) ───── */}
          <Route
            path="/tourist/dashboard"
            element={
              <ProtectedRoute roles={['TOURIST']}>
                <TouristDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/guide/dashboard"
            element={
              <ProtectedRoute roles={['GUIDE']}>
                <GuideDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* Public guide profile */}
          <Route path="/guides/:id" element={<GuideProfile />} />

          {/* Guide manage pages (inside sidebar zone) */}
          <Route
            path="/guide/profile"
            element={<ProtectedRoute roles={['GUIDE']}><GuideProfileManage /></ProtectedRoute>}
          />
          <Route
            path="/guide/verification"
            element={<ProtectedRoute roles={['GUIDE']}><GuideVerification /></ProtectedRoute>}
          />

          {/* Public experiences */}
          <Route 
            path="/experiences/:id" 
            element={<ExperienceDetail />} 
          />

          {/* Guide manage */}
          <Route 
            path="/guide/experiences" 
            element={<ProtectedRoute roles={['GUIDE']}><GuideExperiences /></ProtectedRoute>} 
          />
          <Route 
            path="/guide/experiences/new" 
            element={<ProtectedRoute roles={['GUIDE']}><ExperienceNew /></ProtectedRoute>} 
          />
          <Route 
            path="/guide/experiences/:id/edit" 
            element={<ProtectedRoute roles={['GUIDE']}><ExperienceEdit /></ProtectedRoute>} 
          />

          <Route
            path="/tourist/recommendations"
            element={<ProtectedRoute roles={['TOURIST']}><Recommendations /></ProtectedRoute>}
          />

          <Route
            path="/guide/availability"
            element={<ProtectedRoute roles={['GUIDE']}><GuideAvailability /></ProtectedRoute>}
          />

          <Route
            path="/tourist/bookings"
            element={<ProtectedRoute roles={['TOURIST']}><TouristBookings /></ProtectedRoute>}
          />

          <Route
            path="/guide/bookings"
            element={<ProtectedRoute roles={['GUIDE']}><GuideBookings /></ProtectedRoute>}
          />

          <Route 
            path="/tourist/messages/:bookingId" 
            element={<ProtectedRoute roles={['TOURIST']}><ChatWindow /></ProtectedRoute>} 
          />

          <Route 
            path="/guide/messages/:bookingId" 
            element={<ProtectedRoute roles={['GUIDE']}><ChatWindow /></ProtectedRoute>} 
          />

          <Route 
            path="/tourist/messages" 
            element={<ProtectedRoute roles={['TOURIST']}><Messages /></ProtectedRoute>} 
          />

          <Route 
            path="/guide/messages" 
            element={<ProtectedRoute roles={['GUIDE']}><Messages /></ProtectedRoute>} 
          />

          <Route 
            path="/tourist/itinerary/:bookingId" 
            element={<ProtectedRoute roles={['TOURIST']}><Itinerary /></ProtectedRoute>} 
          />

          <Route 
            path="/guide/itinerary/:bookingId" 
            element={<ProtectedRoute roles={['GUIDE']}><Itinerary /></ProtectedRoute>} 
          />

          <Route 
            path="/admin/verifications" 
            element={<ProtectedRoute roles={['ADMIN']}><AdminVerifications /></ProtectedRoute>} 
          />

          <Route 
            path="/admin/users" 
            element={<ProtectedRoute roles={['ADMIN']}><AdminUsers /></ProtectedRoute>} 
          />

          <Route 
            path="/tourist/profile" 
            element={<ProtectedRoute roles={['TOURIST']}><TouristProfile /></ProtectedRoute>} 
          />

          <Route 
            path="/tourist/reviews" 
            element={<ProtectedRoute roles={['TOURIST']}><TouristReviews /></ProtectedRoute>} 
          />

          <Route 
            path="/guide/reviews" 
            element={<ProtectedRoute roles={['GUIDE']}><GuideReviews /></ProtectedRoute>} 
          />

          {/* ───── 404 ───── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {showFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  );
}