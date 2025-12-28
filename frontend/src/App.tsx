import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from '@context/AuthContext';
import { LoginPage } from '@pages/LoginPage';
import { HomePage } from '@pages/HomePage';
import { LeaderboardPage } from '@pages/LeaderboardPage';
import { ChallengesPage } from '@pages/ChallengesPage';
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
      {/* Navigation */}
      <nav className="bg-psg-navy/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-heading text-gradient-psg">
              EVG ULTIMATE TEAM
            </Link>

            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link to="/leaderboard" className="text-gray-300 hover:text-white transition-colors">
                Leaderboard
              </Link>
              <Link to="/challenges" className="text-gray-300 hover:text-white transition-colors">
                Challenges
              </Link>
              {user?.is_admin && (
                <Link to="/admin" className="text-gray-300 hover:text-white transition-colors">
                  Admin
                </Link>
              )}
              <div className="flex items-center gap-2 pl-4 border-l border-gray-700">
                <span className="text-sm text-gray-400">{user?.username}</span>
                <Button
                  variant="secondary"
                  className="text-sm py-1 px-3"
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
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
