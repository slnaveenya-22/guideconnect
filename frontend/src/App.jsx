import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Guides from './pages/Guides';
import GuideProfile from './pages/GuideProfile';
import ExperienceDetail from './pages/ExperienceDetail';
import NotFound from './pages/NotFound';

// Tourist Pages
import TouristDashboard from './pages/tourist/Dashboard';
import Recommendations from './pages/tourist/Recommendations';
import TouristBookings from './pages/tourist/Bookings';
import TouristReviews from './pages/tourist/Reviews';
import TouristProfile from './pages/tourist/Profile';

// Guide Pages
import GuideDashboard from './pages/guide/Dashboard';
import GuideProfileManage from './pages/guide/Profile';
import GuideVerification from './pages/guide/Verification';
import GuideExperiences from './pages/guide/Experiences';
import ExperienceNew from './pages/guide/ExperienceNew';
import ExperienceEdit from './pages/guide/ExperienceEdit';
import GuideAvailability from './pages/guide/Availability';
import GuideBookings from './pages/guide/Bookings';
import GuideReviews from './pages/guide/Reviews';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminVerifications from './pages/admin/Verifications';
import AdminUsers from './pages/admin/Users';

// Shared Chat & Itinerary Pages
import Messages from './pages/Messages';
import ChatWindow from './pages/ChatWindow';
import Itinerary from './pages/Itinerary';

function Layout() {
  const location = useLocation();
  const path = location.pathname;
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth(); // Need to import useAuth

  const isAuthPage = path === '/login' || path === '/register';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  // If there is a logged-in user, show the Sidebar drawer. Otherwise, hide it.
  const showSidebar = !!user;

  // For EVERYTHING ELSE, we show the Sidebar + Top Navbar
  return (
    <div style={{ minHeight: '100vh', background: 'var(--gc-bg)', position: 'relative' }}>
      {/* Only render Sidebar if user is logged in */}
      {showSidebar && <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(false)} />}

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Only pass the toggle function if there's a user (to hide the hamburger) */}
        <Navbar toggleSidebar={showSidebar ? () => setIsSidebarOpen(!isSidebarOpen) : null} />
        
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/guides/:id" element={<GuideProfile />} />
            <Route path="/experiences/:id" element={<ExperienceDetail />} />

            {/* Tourist Routes */}
            <Route path="/tourist/dashboard" element={<ProtectedRoute roles={['TOURIST']}><TouristDashboard /></ProtectedRoute>} />
            <Route path="/tourist/recommendations" element={<ProtectedRoute roles={['TOURIST']}><Recommendations /></ProtectedRoute>} />
            <Route path="/tourist/bookings" element={<ProtectedRoute roles={['TOURIST']}><TouristBookings /></ProtectedRoute>} />
            <Route path="/tourist/messages" element={<ProtectedRoute roles={['TOURIST']}><Messages /></ProtectedRoute>} />
            <Route path="/tourist/messages/:bookingId" element={<ProtectedRoute roles={['TOURIST']}><ChatWindow /></ProtectedRoute>} />
            <Route path="/tourist/itinerary/:bookingId" element={<ProtectedRoute roles={['TOURIST']}><Itinerary /></ProtectedRoute>} />
            <Route path="/tourist/reviews" element={<ProtectedRoute roles={['TOURIST']}><TouristReviews /></ProtectedRoute>} />
            <Route path="/tourist/profile" element={<ProtectedRoute roles={['TOURIST']}><TouristProfile /></ProtectedRoute>} />

            {/* Guide Routes */}
            <Route path="/guide/dashboard" element={<ProtectedRoute roles={['GUIDE']}><GuideDashboard /></ProtectedRoute>} />
            <Route path="/guide/profile" element={<ProtectedRoute roles={['GUIDE']}><GuideProfileManage /></ProtectedRoute>} />
            <Route path="/guide/verification" element={<ProtectedRoute roles={['GUIDE']}><GuideVerification /></ProtectedRoute>} />
            <Route path="/guide/experiences" element={<ProtectedRoute roles={['GUIDE']}><GuideExperiences /></ProtectedRoute>} />
            <Route path="/guide/experiences/new" element={<ProtectedRoute roles={['GUIDE']}><ExperienceNew /></ProtectedRoute>} />
            <Route path="/guide/experiences/:id/edit" element={<ProtectedRoute roles={['GUIDE']}><ExperienceEdit /></ProtectedRoute>} />
            <Route path="/guide/availability/:id" element={<ProtectedRoute roles={['GUIDE']}><GuideAvailability /></ProtectedRoute>} />
            <Route path="/guide/bookings" element={<ProtectedRoute roles={['GUIDE']}><GuideBookings /></ProtectedRoute>} />
            <Route path="/guide/messages" element={<ProtectedRoute roles={['GUIDE']}><Messages /></ProtectedRoute>} />
            <Route path="/guide/messages/:bookingId" element={<ProtectedRoute roles={['GUIDE']}><ChatWindow /></ProtectedRoute>} />
            <Route path="/guide/itinerary/:bookingId" element={<ProtectedRoute roles={['GUIDE']}><Itinerary /></ProtectedRoute>} />
            <Route path="/guide/reviews" element={<ProtectedRoute roles={['GUIDE']}><GuideReviews /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/verifications" element={<ProtectedRoute roles={['ADMIN']}><AdminVerifications /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
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