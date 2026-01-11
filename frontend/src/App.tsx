import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from '@context/AuthContext';
import { ToastProvider } from '@context/ToastContext';
import { CardRevealProvider, useCardReveal } from '@context/CardRevealContext';
import { LoginPage } from '@pages/LoginPage';
import { HomePage } from '@pages/HomePage';
import { LeaderboardPage } from '@pages/LeaderboardPage';
import { ChallengesPage } from '@pages/ChallengesPage';
import { PacksPage } from '@pages/PacksPage';
import { AdminDashboard } from '@pages/AdminDashboard';
import { EVGTeamPage } from '@pages/EVGTeamPage';
import { ProfileDropdown } from '@components/layout/ProfileDropdown';
import { BottomNavigation } from '@components/layout/BottomNavigation';
import { PlayerCardReveal } from '@components/auth/PlayerCardReveal';
import { getAvatarUrl } from '@utils/avatarUtils';
import { useFirstLogin } from '@hooks/useFirstLogin';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { shouldShowReveal, markAsRevealed } = useFirstLogin(user?.id);
  const { shouldTriggerReveal, resetReveal } = useCardReveal();
  const [showReveal, setShowReveal] = useState(false);

  // Check for reset query parameter to clear first-login localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('resetFirstLogin') === 'true' && user?.id) {
      const storageKey = `evg_has_seen_card_reveal_${user.id}`;
      localStorage.removeItem(storageKey);
      console.log('✅ First login state reset successfully');
      // Remove the query parameter from URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user?.id]);

  // Trigger card reveal animation immediately after authentication (first login)
  useEffect(() => {
    if (isAuthenticated && shouldShowReveal && !isLoading && user && !user.is_admin) {
      // Small delay to let auth settle
      setTimeout(() => setShowReveal(true), 300);
    }
  }, [isAuthenticated, shouldShowReveal, isLoading, user]);

  // Trigger card reveal animation on demand (replay from profile)
  useEffect(() => {
    if (shouldTriggerReveal && isAuthenticated && user && !user.is_admin) {
      setShowReveal(true);
    }
  }, [shouldTriggerReveal, isAuthenticated, user]);

  const handleRevealComplete = () => {
    if (shouldShowReveal) {
      markAsRevealed(); // Only mark as revealed if it was the first login
    }
    setShowReveal(false);
    resetReveal(); // Reset the manual trigger
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {/* First-login card reveal animation (non-admins only) */}
      {showReveal && user && !user.is_admin && (
        <PlayerCardReveal
          isOpen={showReveal}
          username={user.username}
          avatarUrl={getAvatarUrl(user.username)}
          isReplay={shouldTriggerReveal}
          onComplete={handleRevealComplete}
        />
      )}
      {children}
    </>
  );
};

// Layout Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { triggerReveal } = useCardReveal();
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [userRank, setUserRank] = useState<number>(0);

  const NavItem: React.FC<{ to: string; children: React.ReactNode }> = ({
    to,
    children,
  }) => (
    <Link
      to={to}
      className="
        text-white/90 font-semibold
        text-xs sm:text-sm
        uppercase tracking-wide
        px-3 py-1.5
        rounded-full
        transition-all
        hover:bg-fifa-gold/20 hover:text-white
        focus:outline-none focus:ring-2 focus:ring-fifa-gold
      "
    >
      {children}
    </Link>
  );

  // Fetch participant data and rank for non-admin users
  useEffect(() => {
    if (!user || user.is_admin) return;

    const fetchUserData = async () => {
      try {
        // Import API functions dynamically to avoid circular dependencies
        const { getMyProfile } = await import('@services/participantService');
        const { getParticipantRank } = await import('@services/leaderboardService');

        // Fetch profile data
        const profile = await getMyProfile();
        setTotalPoints(profile.total_points);

        // Fetch rank
        const rankData = await getParticipantRank(user.id);
        setUserRank(rankData.rank);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Set defaults on error
        setTotalPoints(0);
        setUserRank(0);
      }
    };

    fetchUserData();
  }, [user]);

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
        <div className="container mx-auto relative">
          <div className="px-4 sm:px-8">
            {/* Top row : Logo + Profile */}
            <div className="flex items-center justify-between py-2 sm:py-3">
              <Link
                to="/"
                className="text-lg sm:text-3xl font-display font-black uppercase tracking-wider text-gradient-psg flex-shrink-0"
              >
                EVG ULTIMATE TEAM
              </Link>

              <div className="flex items-center gap-2 sm:gap-3 sm:pl-4 sm:ml-4 sm:border-l sm:border-white/10">
                <span className="hidden lg:inline text-sm text-white font-semibold">
                  {user?.username}
                </span>
                <ProfileDropdown
                  username={user?.username || ''}
                  avatarUrl={getAvatarUrl(user?.username || '')}
                  isGroom={user?.is_groom || false}
                  totalPoints={totalPoints}
                  rank={userRank}
                  onLogout={logout}
                  onReplayAnimation={triggerReveal}
                />
              </div>
            </div>
          </div>

          {/* Navigation capsule */}
          {!user?.is_admin && (
            <div
              className="
                hidden md:flex justify-center
                px-4 md:px-0
                md:absolute md:top-1/2 md:left-1/2
                md:-translate-x-1/2 md:-translate-y-1/2
              "
            >
              <div
                className="
                  flex flex-wrap items-center gap-1
                  bg-white/5 backdrop-blur
                  border border-white/10
                  rounded-full
                  px-2 py-1
                  shadow-lg
                "
              >
                <NavItem to="/">Accueil</NavItem>
                <NavItem to="/team">Team</NavItem>
                <NavItem to="/challenges">Défis</NavItem>
                <NavItem to="/packs">Packs</NavItem>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        {children}
      </main>

      {/* Bottom Navigation - Mobile only (non-admin) */}
      {!user?.is_admin && <BottomNavigation />}

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
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              {user?.is_admin ? <Navigate to="/admin" replace /> : <HomePage />}
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
        path="/team"
        element={
          <ProtectedRoute>
            <Layout>
              <EVGTeamPage />
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
        <CardRevealProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </CardRevealProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
