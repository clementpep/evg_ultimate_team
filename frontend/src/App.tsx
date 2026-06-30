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
import { SquadDiscovery } from '@components/team/SquadDiscovery';
import { getAvatarUrl } from '@utils/avatarUtils';
import { useFirstLogin } from '@hooks/useFirstLogin';
import { useSquadDiscovery } from '@hooks/useSquadDiscovery';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const isGroom = !!user?.is_groom;
  // Everyone opens an Ultimate pack revealing their own FUT card on first login.
  // The groom (Paul) then also opens the "Pack Équipe" to discover the squad.
  const { shouldShowReveal, markAsRevealed } = useFirstLogin(user?.id);
  const { shouldShowDiscovery, markDiscovered } = useSquadDiscovery(isGroom ? user?.id : undefined);
  const { shouldTriggerReveal, resetReveal } = useCardReveal();
  const [showReveal, setShowReveal] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);

  // Legacy: clear first-login flag via query parameter (superseded by
  // automatic DB-reset detection in Layout, but kept for manual testing).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('resetFirstLogin') === 'true' && user?.id) {
      const storageKey = `evg_has_seen_card_reveal_${user.id}`;
      localStorage.removeItem(storageKey);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user?.id]);

  // Own-card reveal on first login (everyone, including the groom).
  useEffect(() => {
    if (isAuthenticated && shouldShowReveal && !isLoading && user) {
      // Small delay to let auth settle
      setTimeout(() => setShowReveal(true), 300);
    }
  }, [isAuthenticated, shouldShowReveal, isLoading, user]);

  // Squad discovery for the groom — only once the own-card reveal is done, so
  // Paul opens his own pack first, then the team pack.
  useEffect(() => {
    if (isAuthenticated && shouldShowDiscovery && !isLoading && user && isGroom && !shouldShowReveal) {
      setTimeout(() => setShowDiscovery(true), 300);
    }
  }, [isAuthenticated, shouldShowDiscovery, isLoading, user, isGroom, shouldShowReveal]);

  // Trigger animation on demand ("Voir ma carte" from profile) — always the
  // user's own FUT card, including for the groom. Squad discovery stays reserved
  // for the groom's first login only.
  useEffect(() => {
    if (shouldTriggerReveal && isAuthenticated && user) {
      setShowReveal(true);
    }
  }, [shouldTriggerReveal, isAuthenticated, user]);

  const handleRevealComplete = () => {
    const wasFirstLogin = shouldShowReveal;
    if (shouldShowReveal) {
      markAsRevealed(); // Only mark as revealed if it was the first login
    }
    setShowReveal(false);
    resetReveal(); // Reset the manual trigger
    // After the own-card pack, the groom opens the team pack.
    if (wasFirstLogin && isGroom && shouldShowDiscovery) {
      setShowDiscovery(true);
    }
  };

  const handleDiscoveryComplete = () => {
    if (shouldShowDiscovery) {
      markDiscovered(); // Only persist on first login
    }
    setShowDiscovery(false);
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
      {/* Own-card reveal: first login (non-groom) or "Voir ma carte" replay (anyone) */}
      {showReveal && user && (
        <PlayerCardReveal
          isOpen={showReveal}
          username={user.username}
          avatarUrl={getAvatarUrl(user.username)}
          onComplete={handleRevealComplete}
        />
      )}
      {/* First-login squad discovery (groom only) */}
      {showDiscovery && user && isGroom && (
        <SquadDiscovery currentUserId={user.id} onComplete={handleDiscoveryComplete} />
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

  // Fetch participant data and rank. The admin (Clément) is a real participant
  // too, so we fetch his stats as well.
  // Also detects a DB reset (created_at changed) and forces re-login so every
  // user gets the first-login experience again.
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        const { getMyProfile } = await import('@services/participantService');
        const { getParticipantRank } = await import('@services/leaderboardService');
        const { clearAppState } = await import('@services/authService');

        const profile = await getMyProfile();
        setTotalPoints(profile.total_points);

        // DB-reset detection: if the participant was re-created (different
        // created_at), wipe all local flags and force a fresh login.
        const checkpoint = localStorage.getItem('evg_db_checkpoint');
        if (checkpoint && checkpoint !== profile.created_at) {
          clearAppState();
          localStorage.removeItem('auth_token');
          localStorage.removeItem('current_user');
          localStorage.setItem('evg_db_checkpoint', profile.created_at);
          window.location.href = '/login';
          return;
        }
        localStorage.setItem('evg_db_checkpoint', profile.created_at);

        const rankData = await getParticipantRank(user.id);
        setUserRank(rankData.rank);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
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
                  isAdmin={user?.is_admin || false}
                  totalPoints={totalPoints}
                  rank={userRank}
                  onLogout={logout}
                  onReplayAnimation={triggerReveal}
                />
              </div>
            </div>
          </div>

          {/* Navigation capsule */}
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
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        {children}
      </main>

      {/* Bottom Navigation - Mobile only */}
      <BottomNavigation />

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 text-sm">
        <p>EVG Ultimate Team — Paul C. · Marseille, 3-5 juillet 2026</p>
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
