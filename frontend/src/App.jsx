import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';

// Direct synchronous imports for main routes:
// Eliminates lazy-chunk download delays and connection-reset freezes on navigation
import CitizenHome from './pages/CitizenHome';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Resilient fallback loader with timeout failsafe
const RouteLoader = () => {
  const [showRefresh, setShowRefresh] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowRefresh(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-4 font-devanagari">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-700 rounded-full animate-spin"></div>
      <p className="mt-3 text-sm font-semibold text-slate-600">लोड हो रहा है...</p>
      {showRefresh && (
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500 mb-2">नेटवर्क लोड होने में समय लग रहा है...</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors"
          >
            पुनः लोड करें (Reload)
          </button>
        </div>
      )}
    </div>
  );
};

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
    <ErrorBoundary>
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

            <Suspense fallback={<RouteLoader />}>
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
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
