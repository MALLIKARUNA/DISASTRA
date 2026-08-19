// ─────────────────────────────────────────────────────────────────────────────
// routes/AppRouter.jsx — Application routing for Phase 2
// Includes auth pages, protected role dashboards, and role-based redirects
// ─────────────────────────────────────────────────────────────────────────────

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Public pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';

// Route guards
import ProtectedRoute from '../components/ProtectedRoute';
import RoleRoute from '../components/RoleRoute';

// Role dashboards
import CitizenDashboard from '../pages/CitizenDashboard';
import ReportPage from '../pages/ReportPage';
import MyReportsPage from '../pages/MyReportsPage';
import ResponderDashboard from '../pages/ResponderDashboard';
import DispatcherDashboard from '../pages/DispatcherDashboard';
import AdminDashboard from '../pages/AdminDashboard';

// Role → home dashboard mapping
const roleHome = {
  CITIZEN: '/citizen',
  RESPONDER: '/responder',
  DISPATCHER: '/dispatcher',
  ADMIN: '/admin',
};

// Redirect authenticated users away from auth pages to their role dashboard
function AuthRedirect({ children }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to={roleHome[role] || '/'} replace />;
  }

  return children;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ─────────────────────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />

        {/* ── Auth pages (redirect if already logged in) ─────────────────── */}
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <LoginPage />
            </AuthRedirect>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRedirect>
              <RegisterPage />
            </AuthRedirect>
          }
        />

        {/* ── Role dashboards (protected + role-restricted) ──────────────── */}
        <Route
          path="/citizen"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['CITIZEN']}>
                <CitizenDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/report"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['CITIZEN']}>
                <ReportPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen/reports"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['CITIZEN']}>
                <MyReportsPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/responder"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['RESPONDER']}>
                <ResponderDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dispatcher"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['DISPATCHER']}>
                <DispatcherDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ── 404 ─────────────────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;