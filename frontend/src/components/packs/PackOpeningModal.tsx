/**
 * Pack Opening Modal Component
 *
 * FIFA Ultimate Team-style pack opening animation with 3 phases:
 * 1. Anticipation (2s) - Pulsing pack with build-up
 * 2. Reveal (1.5s) - 3D card flip showing reward
 * 3. Celebration (2s) - Particle effects and reward display
 *
 * Following DESIGN_SYSTEM.md specifications for pack opening
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackOpenResult, PACK_CONFIG } from '../../types/pack';

interface PackOpeningModalProps {
  isOpen: boolean;
  tier: string;
  result: PackOpenResult | null;
  onClose: () => void;
}

export const PackOpeningModal: React.FC<PackOpeningModalProps> = ({
  isOpen,
  tier,
  result,
  onClose,
}) => {
  const [phase, setPhase] = useState<'anticipation' | 'reveal' | 'celebration'>('anticipation');
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (!isOpen || !result) return;

    // Reset state
    setPhase('anticipation');
    setIsFlipped(false);

    // Phase 1: Anticipation (2s)
    const timer1 = setTimeout(() => {
      setPhase('reveal');
      setIsFlipped(true);
    }, 2000);

    // Phase 2: Reveal (1.5s after flip starts)
    const timer2 = setTimeout(() => {
      setPhase('celebration');
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen, result]);

  const handleCollect = () => {
    onClose();
  };

  if (!isOpen || !result) return null;

  const config = PACK_CONFIG[tier as keyof typeof PACK_CONFIG];
  const rarityColor = getRarityColor(result.reward.rarity);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #0A1628 0%, #152238 100%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Particle effects for celebration phase */}
        {phase === 'celebration' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(result.reward.rarity === 'legendary' ? 50 : 20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: rarityColor,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  y: [0, -100, -200],
                  x: [0, (Math.random() - 0.5) * 200],
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 text-center">
          {/* Phase 1: Anticipation */}
          {phase === 'anticipation' && (
            <motion.div
              className="flex flex-col items-center"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, -2, 2, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Pack card */}
              <div
                className="w-80 h-96 rounded-3xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${config.color} 0%, #000 100%)`,
                  boxShadow: `0 0 60px ${config.glowColor}`,
                  border: `3px solid ${config.color}`,
                }}
              >
                {/* Pulsing glow */}
                <div
                  className="absolute inset-0 opacity-40 animate-pulse"
                  style={{
                    background: `radial-gradient(circle, ${config.color} 0%, transparent 70%)`,
                  }}
                />

                {/* Text */}
                <h2 className="font-display text-4xl font-bold text-white uppercase tracking-wider relative z-10">
                  Opening<br />{config.name}...
                </h2>
              </div>
            </motion.div>
          )}

          {/* Phase 2 & 3: Reveal & Celebration */}
          {(phase === 'reveal' || phase === 'celebration') && (
            <div className="flex flex-col items-center">
              {/* Reward card with flip */}
              <motion.div
                className="w-80 h-96 rounded-3xl p-8 flex flex-col items-center justify-center relative"
                style={{
                  background: 'linear-gradient(135deg, #1A2942 0%, #0A1628 100%)',
                  border: `3px solid ${rarityColor}`,
                  boxShadow: `0 0 40px ${rarityColor}80`,
                }}
                initial={{ rotateY: 0 }}
                animate={{
                  rotateY: isFlipped ? 180 : 0,
                  scale: phase === 'celebration' ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  rotateY: { duration: 1, ease: 'easeInOut' },
                  scale: { duration: 0.5, delay: 0.2 },
                }}
              >
                <div
                  style={{
                    transform: 'rotateY(180deg)',
                  }}
                >
                  {/* Rarity badge */}
                  <div
                    className="inline-block px-4 py-2 rounded-full mb-4 font-bold uppercase text-sm tracking-wider"
                    style={{
                      background: rarityColor,
                      color: result.reward.rarity === 'legendary' || result.reward.rarity === 'epic'
                        ? '#000'
                        : '#fff',
                      boxShadow: `0 0 20px ${rarityColor}`,
                    }}
                  >
                    {result.reward.rarity}
                  </div>

                  {/* Reward name */}
                  <h3 className="font-display text-3xl font-bold mb-4 text-white uppercase tracking-wide">
                    {result.reward.name}
                  </h3>

                  {/* Reward description */}
                  <p className="text-text-secondary text-base leading-relaxed max-w-xs">
                    {result.reward.description}
                  </p>

                  {/* Reward type */}
                  <div className="mt-6 text-text-tertiary text-sm uppercase tracking-wider">
                    Type: {result.reward.type}
                  </div>
                </div>
              </motion.div>

              {/* Collect button - appears in celebration phase */}
              {phase === 'celebration' && (
                <motion.button
                  className="btn-primary mt-8 text-lg px-12 py-4"
                  onClick={handleCollect}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  RÉCUPÉRER LA RÉCOMPENSE
                </motion.button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Helper function to get rarity color
function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: '#718096',
    rare: '#3B82F6',
    epic: '#A855F7',
    legendary: '#D4AF37',
  };
  return colors[rarity] || colors.common;
}
