import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from '@context/AuthContext';
import { ToastProvider } from '@context/ToastContext';
import { LoginPage } from '@pages/LoginPage';
import { HomePage } from '@pages/HomePage';
import { LeaderboardPage } from '@pages/LeaderboardPage';
import { ChallengesPage } from '@pages/ChallengesPage';
import { PacksPage } from '@pages/PacksPage';
import { AdminDashboard } from '@pages/AdminDashboard';
import { Button } from '@components/common/Button';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Layout Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Navigation - Following DESIGN_SYSTEM.md specs - Mobile First */}
      <nav
        className="sticky top-0 z-50 border-b shadow-md backdrop-blur-sm"
        style={{
          background: '#0A1628',
          minHeight: '60px',
          borderColor: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <div className="container mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-3 sm:h-20">
            <Link to="/" className="text-xl sm:text-3xl font-display font-black uppercase tracking-wider mb-2 sm:mb-0" style={{
              color: '#FFFFFF',
              textShadow: '0 0 15px rgba(218, 41, 28, 0.4), 0 0 30px rgba(0, 31, 91, 0.2)',
            }}>
              EVG ULTIMATE TEAM
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
              <Link
                to="/"
                className="text-text-secondary font-semibold text-xs sm:text-sm uppercase tracking-wide px-2 sm:px-4 py-2 transition-all hover:text-white hover:bg-psg-red/10"
              >
                Home
              </Link>
              <Link
                to="/leaderboard"
                className="text-text-secondary font-semibold text-xs sm:text-sm uppercase tracking-wide px-2 sm:px-4 py-2 transition-all hover:text-white hover:bg-psg-red/10"
              >
                Leaderboard
              </Link>
              <Link
                to="/challenges"
                className="text-text-secondary font-semibold text-xs sm:text-sm uppercase tracking-wide px-2 sm:px-4 py-2 transition-all hover:text-white hover:bg-psg-red/10"
              >
                Challenges
              </Link>
              <Link
                to="/packs"
                className="text-text-secondary font-semibold text-xs sm:text-sm uppercase tracking-wide px-2 sm:px-4 py-2 transition-all hover:text-white hover:bg-psg-red/10"
              >
                Packs
              </Link>
              {user?.is_admin && (
                <Link
                  to="/admin"
                  className="text-text-secondary font-semibold text-xs sm:text-sm uppercase tracking-wide px-2 sm:px-4 py-2 transition-all hover:text-white hover:bg-psg-red/10"
                >
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-1 sm:gap-2 pl-2 sm:pl-4 ml-2 sm:ml-4 border-l border-white/10">
                <span className="hidden sm:inline text-xs sm:text-sm text-white font-semibold">{user?.username}</span>
                <Button
                  variant="primary"
                  className="text-xs !py-1.5 !px-3 sm:!px-4 !font-bold"
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>EVG Ultimate Team - Paul's Bachelor Party June 4-6, 2026</p>
        <p className="mt-1">🏆⚽🎮</p>
      </footer>
    </div>
  );
};

// Main App Component
const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <HomePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Layout>
              <LeaderboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/challenges"
        element={
          <ProtectedRoute>
            <Layout>
              <ChallengesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/packs"
        element={
          <ProtectedRoute>
            <Layout>
              <PacksPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
