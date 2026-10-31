import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import CitizenHome from './pages/CitizenHome';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// ProtectedRoute guard component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Route wrapper if admin is already logged in and visits /admin/login
const PublicAdminRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
        {/* React Hot Toast notification container */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#1e293b',
              fontFamily: '"Noto Sans Devanagari", sans-serif',
              borderRadius: '16px',
              padding: '12px 18px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: '#15803D',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#dc2626',
                secondary: '#ffffff',
              },
            },
          }}
        />

        <Routes>
          {/* Citizen Public Portal Home */}
          <Route path="/" element={<CitizenHome />} />

          {/* Admin Login Route */}
          <Route
            path="/admin/login"
            element={
              <PublicAdminRoute>
                <AdminLogin />
              </PublicAdminRoute>
            }
          />

          {/* Admin Forgot Password Route */}
          <Route
            path="/admin/forgot-password"
            element={
              <PublicAdminRoute>
                <ForgotPassword />
              </PublicAdminRoute>
            }
          />

          {/* Admin Reset Password Route with Token */}
          <Route
            path="/admin/reset-password/:token"
            element={
              <PublicAdminRoute>
                <ResetPassword />
              </PublicAdminRoute>
            }
          />

          {/* Admin Protected Dashboard Route */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route redirects to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </LanguageProvider>
  );
}

export default App;
