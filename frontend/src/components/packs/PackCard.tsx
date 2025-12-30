/**
 * Pack Card Component
 *
 * Displays an individual pack with FIFA/PSG styling following DESIGN_SYSTEM.md
 */

import { motion } from 'framer-motion';
import { PACK_CONFIG, PackTier } from '../../types/pack';
import { IoMdCheckmarkCircle } from 'react-icons/io';

interface PackCardProps {
  tier: PackTier;
  count: number;
  canOpen: boolean;
  userCredits: number;
  onOpen: () => void;
  onPurchase: () => void;
}

export const PackCard: React.FC<PackCardProps> = ({ tier, count, canOpen, userCredits, onOpen, onPurchase }) => {
  const config = PACK_CONFIG[tier];
  const canPurchase = userCredits >= config.cost;

  return (
    <motion.div
      className="relative"
      whileHover={canOpen ? { scale: 1.05 } : {}}
      whileTap={canOpen ? { scale: 0.98 } : {}}
    >
      <div
        className="pack-card relative overflow-hidden rounded-2xl p-4 sm:p-6 md:p-8 border-2 transition-all"
        style={{
          background: 'linear-gradient(135deg, #1A2942 0%, #0A1628 100%)',
          borderColor: config.color,
          boxShadow: canOpen
            ? `0 0 25px ${config.glowColor}`
            : '0 0 10px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Animated glow background - only when can open */}
        {canOpen && (
          <div
            className="absolute inset-0 opacity-30 animate-pulse"
            style={{
              background: `radial-gradient(circle at center, ${config.color} 0%, transparent 70%)`,
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Pack Name */}
          <h3
            className="font-display text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 uppercase tracking-wider"
            style={{ color: config.color }}
          >
            {config.name}
          </h3>

          {/* Pack Count */}
          <div className="mb-3 sm:mb-4">
            <div
              className="font-numbers text-4xl sm:text-5xl md:text-6xl font-black"
              style={{ color: canOpen ? config.color : '#4A5568' }}
            >
              {count}
            </div>
            <div className="text-text-secondary text-xs sm:text-sm uppercase tracking-wide mt-1">
              {count === 0 ? 'Aucun pack' : count === 1 ? 'Pack disponible' : 'Packs disponibles'}
            </div>
          </div>

          {/* Cost/Action */}
          <div className="text-text-tertiary text-xs sm:text-sm mb-3 sm:mb-4">
            <span className="font-semibold">{config.cost} crédits</span>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            {canOpen ? (
              <button className="btn-primary w-full" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
                OUVRIR
              </button>
            ) : canPurchase ? (
              <>
                <button
                  className="w-full py-3 px-4 rounded-lg font-bold uppercase tracking-wide transition-all duration-300 relative overflow-hidden group"
                  style={{
                    background: `linear-gradient(135deg, ${config.color}dd 0%, ${config.color} 50%, ${config.color}dd 100%)`,
                    color: '#fff',
                    border: `2px solid ${config.color}`,
                    boxShadow: `0 4px 15px ${config.glowColor}40, 0 0 20px ${config.glowColor}30`,
                  }}
                  onClick={(e) => { e.stopPropagation(); onPurchase(); }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <span>ACHETER</span>
                    <span className="text-sm">({config.cost} crédits)</span>
                  </span>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}ee 50%, ${config.color} 100%)`,
                    }}
                  />
                </button>
                <div className="text-xs text-fifa-green flex items-center justify-center gap-1 font-semibold">
                  <IoMdCheckmarkCircle className="text-sm" /> {userCredits} crédits disponibles
                </div>
              </>
            ) : (
              <>
                <button
                  className="w-full py-3 px-4 rounded-lg font-bold uppercase tracking-wide cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)',
                    color: '#718096',
                    border: '2px solid #4A5568',
                  }}
                  disabled
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>ACHETER</span>
                    <span className="text-sm">({config.cost} crédits)</span>
                  </span>
                </button>
                <div className="text-xs text-red-400 flex items-center justify-center gap-1">
                  Crédits insuffisants ({userCredits}/{config.cost})
                </div>
              </>
            )}
          </div>
        </div>

        {/* Shimmer effect on hover for available packs */}
        {canOpen && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite',
            }}
          />
        )}
      </div>
    </motion.div>
  );
};
