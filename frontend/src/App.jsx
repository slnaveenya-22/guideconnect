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

import TouristDashboard from './pages/tourist/Dashboard';
import GuideDashboard from './pages/guide/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

import GuideProfile from './pages/GuideProfile';
import GuideProfileManage from './pages/guide/Profile';
import GuideVerification from './pages/guide/Verification';

import ExperienceDetail from './pages/ExperienceDetail';
import GuideExperiences from './pages/guide/Experiences';
import ExperienceNew from './pages/guide/ExperienceNew';
import ExperienceEdit from './pages/guide/ExperienceEdit';

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