/**
 * ProfileDropdown Component - User profile avatar with dropdown menu
 *
 * Displays user avatar in navigation bar. Clicking opens a dropdown with:
 * - User info (name, groom badge if applicable)
 * - Stats (total points, current rank)
 * - Logout button
 *
 * Uses layoutId for shared element transition with PlayerCardReveal
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GiCrown } from 'react-icons/gi';
import { IoLogOut, IoSparkles } from 'react-icons/io5';
import { useClickOutside } from '@hooks/useClickOutside';
import { getDefaultAvatarUrl } from '@utils/avatarUtils';

interface ProfileDropdownProps {
  username: string;
  avatarUrl: string;
  isGroom: boolean;
  totalPoints: number;
  rank: number;
  onLogout: () => void;
  onReplayAnimation: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  username,
  avatarUrl,
  isGroom,
  totalPoints,
  rank,
  onLogout,
  onReplayAnimation,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useClickOutside(dropdownRef, () => setIsOpen(false));

  // Close dropdown with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
    return undefined;
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button - Responsive Mobile-First */}
      <motion.button
        layoutId="player-card-avatar"
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-12 h-12 sm:w-11 sm:h-11 md:w-12 md:h-12
          min-w-[48px] min-h-[48px]
          rounded-full overflow-hidden
          border-2 sm:border-[3px] border-fifa-gold
          shadow-glow-gold hover:shadow-glow-gold
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-fifa-gold focus:ring-offset-2 focus:ring-offset-bg-primary
          bg-bg-card p-0.5
        "
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Open profile menu"
        aria-expanded={isOpen}
      >
        <div className="w-full h-full rounded-full overflow-hidden relative">
          <img
            src={avatarUrl}
            alt={username}
            className="w-full h-full object-cover"
            style={{
              objectPosition: 'center 10%',
              transform: 'scale(1.8)',
            }}
            onError={(e) => {
              e.currentTarget.src = getDefaultAvatarUrl();
            }}
          />
        </div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 sm:w-72 rounded-lg shadow-xl overflow-hidden z-50"
            style={{
              background: '#1A2942',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Header avec infos utilisateur */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full border-2 border-fifa-gold overflow-hidden bg-bg-card p-0.5 flex-shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <img
                      src={avatarUrl}
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: 'center 10%',
                        transform: 'scale(1.8)',
                      }}
                      alt={username}
                      onError={(e) => {
                        e.currentTarget.src = getDefaultAvatarUrl();
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{username}</p>
                  {isGroom && (
                    <p className="text-xs text-fifa-gold flex items-center gap-1">
                      <GiCrown className="text-fifa-gold" />
                      The Groom
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats : Points & Rang */}
            <div className="p-3 border-b border-white/10 bg-bg-primary/30">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-xs text-text-secondary uppercase tracking-wide">
                    Points
                  </p>
                  <p className="text-lg font-bold text-fifa-gold font-numbers">
                    {totalPoints.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary uppercase tracking-wide">
                    Rang
                  </p>
                  <p className="text-lg font-bold text-fifa-gold font-numbers">
                    #{rank > 0 ? rank : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton Voir ma carte */}
            <button
              onClick={() => {
                setIsOpen(false);
                onReplayAnimation();
              }}
              className="w-full text-left px-4 py-3 text-white hover:bg-fifa-gold/20 transition-colors flex items-center gap-2 focus:outline-none focus:bg-fifa-gold/20 border-b border-white/10"
            >
              <IoSparkles className="text-fifa-gold" />
              <span className="font-semibold">Voir ma carte</span>
            </button>

            {/* Bouton Déconnexion */}
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full text-left px-4 py-3 text-white hover:bg-psg-red/20 transition-colors flex items-center gap-2 focus:outline-none focus:bg-psg-red/20"
            >
              <IoLogOut className="text-psg-red" />
              <span className="font-semibold">Déconnexion</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
