/**
 * BottomNavigation Component - Mobile navigation bar
 *
 * Fixed bottom navigation for mobile devices (< md breakpoint - 768px)
 * Features:
 * - 4 navigation items: Home, Team, Challenges, Packs
 * - Icons from react-icons/io5
 * - Active state indicator with gold highlight
 * - PSG/FIFA themed styling
 * - Accessible with proper ARIA labels
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoHome, IoPeople, IoTrophy, IoGift } from 'react-icons/io5';
import clsx from 'clsx';

interface NavItemConfig {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  ariaLabel: string;
}

export const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems: NavItemConfig[] = [
    {
      to: '/',
      icon: IoHome,
      label: 'Accueil',
      ariaLabel: "Aller à l'accueil",
    },
    {
      to: '/team',
      icon: IoPeople,
      label: 'Team',
      ariaLabel: "Voir l'équipe",
    },
    {
      to: '/challenges',
      icon: IoTrophy,
      label: 'Défis',
      ariaLabel: 'Voir les défis',
    },
    {
      to: '/packs',
      icon: IoGift,
      label: 'Packs',
      ariaLabel: 'Voir les packs',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{
        background: 'rgba(10, 22, 40, 0.95)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      role="navigation"
      aria-label="Navigation principale mobile"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ to, icon: Icon, label, ariaLabel }) => {
          const active = isActive(to);

          return (
            <Link
              key={to}
              to={to}
              className={clsx(
                'relative flex flex-col items-center justify-center',
                'min-w-[60px] h-full px-3 py-1',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-fifa-gold focus:ring-inset',
                'rounded-lg',
                active ? 'text-fifa-gold' : 'text-white/70'
              )}
              aria-label={ariaLabel}
              aria-current={active ? 'page' : undefined}
            >
              {/* Icon */}
              <Icon
                className={clsx(
                  'text-2xl mb-1 transition-all duration-200',
                  active && 'drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]'
                )}
              />

              {/* Label */}
              <span
                className={clsx(
                  'text-[10px] font-semibold uppercase tracking-wide transition-all duration-200',
                  active && 'text-fifa-gold'
                )}
              >
                {label}
              </span>

              {/* Active indicator */}
              {active && (
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-t-full"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                    boxShadow: '0 -2px 10px rgba(212, 175, 55, 0.6)',
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Safe area for iPhone notch */}
      <div className="h-[env(safe-area-inset-bottom)]" style={{ background: 'inherit' }} />
    </nav>
  );
};
