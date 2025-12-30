/**
 * Pack Opening Modal Component - ULTRA PREMIUM EDITION V2
 *
 * FIFA Ultimate Team-style pack opening with jaw-dropping animations:
 * 1. Anticipation (2.5s) - Glowing pack with intense build-up
 * 2. Entry (0.5s) - Card falls from above with dramatic rotation
 * 3. Spin (1.5s) - Card spins like a TOUPIE!
 * 4. Land (0.5s) - SHOCKWAVE impact with screen shake
 * 5. Celebration (2s) - Card settles with confetti and particles
 *
 * Inspired by PlayerCardReveal animation - MAXIMUM IMMERSION!
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackOpenResult, PACK_CONFIG } from '../../types/pack';
import { IoMdCheckmarkCircle } from 'react-icons/io';

interface PackOpeningModalProps {
  isOpen: boolean;
  tier: string;
  result: PackOpenResult | null;
  onClose: () => void;
}

type AnimationPhase = 'anticipation' | 'entry' | 'spin' | 'land' | 'celebration';

export const PackOpeningModal: React.FC<PackOpeningModalProps> = ({
  isOpen,
  tier,
  result,
  onClose,
}) => {
  const [phase, setPhase] = useState<AnimationPhase>('anticipation');

  useEffect(() => {
    if (!isOpen || !result) return;

    // Reset state
    setPhase('anticipation');

    // Phase timing - Optimized for smoothness
    const timer1 = setTimeout(() => setPhase('entry'), 2000);      // 0-2.0s: Pack anticipation
    const timer2 = setTimeout(() => setPhase('spin'), 2500);       // 2.0-2.5s: Card entry
    const timer3 = setTimeout(() => setPhase('land'), 4000);       // 2.5-4.0s: Card spin (TOUPIE!)
    const timer4 = setTimeout(() => setPhase('celebration'), 4100); // 4.0-4.1s: Instant anchor (0.1s)

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const config = PACK_CONFIG[tier as keyof typeof PACK_CONFIG] || PACK_CONFIG.bronze;
  const rarityColor = getRarityColor(result.reward.rarity);
  const isLegendary = result.reward.rarity === 'legendary';

  // Get card animation variants based on phase (inspired by PlayerCardReveal)
  const getCardVariants = () => {
    switch (phase) {
      case 'entry':
        return {
          initial: {
            y: -1000,
            rotateX: 0,  // No X rotation to avoid parasitic rotation
            rotateY: 540,  // Start already spinning to hide content from the start!
            scale: 0.8,
            opacity: 0,
          },
          animate: {
            y: 0,
            rotateX: 0,
            rotateY: 720,  // Continue spinning
            scale: 1,
            opacity: 1,
          },
          transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1] as any,
          },
        };

      case 'spin':
        return {
          animate: {
            rotateY: 3960,  // Continue from 720 (entry) + 3240 (9 rotations) = 3960 - TOUPIE!
            rotateX: [0, 8, -8, 6, -6, 4, -4, 2, -2, 0],  // Smoother wobble progression
            scale: [1, 1.03, 1.01, 1.02, 1.01, 1.015, 1.01, 1.005, 1.005, 1],  // Smoother scale
          },
          transition: {
            duration: 1.4,  // Slightly faster for more energy
            ease: 'linear',
          },
        };

      case 'land':
        return {
          animate: {
            // Card anchors instantly - no bounce, just a hard stop!
            rotateX: 0,
            scale: 1,  // No scale animation - instant anchor
            y: 0,  // No bounce - stays put
          },
          transition: {
            duration: 0.1,  // Ultra fast - just anchors
            ease: 'easeOut',  // Simple easing for instant stop
          },
        };

      case 'celebration':
        return {
          animate: {
            // Keep rotation stable (don't reset)
            rotateX: 0,
            // No y or scale animation - card stays perfectly still after landing
          },
          transition: {
            duration: 0.5,
            ease: [0.45, 0, 0.55, 1],
          },
        };

      default:
        return {
          animate: {},
          transition: { duration: 0 },
        };
    }
  };

  // Get shake animation for screen (only during land phase)
  const getShakeAnimation = () => {
    if (phase === 'land') {
      return {
        x: [0, -4, 3, -2, 1, 0],
        y: [0, -3, 2, -1, 0],
      };
    }
    return {};
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        style={{
          background: isLegendary
            ? 'radial-gradient(circle at center, #1A2942 0%, #0A1628 100%)'
            : 'linear-gradient(135deg, #0A1628 0%, #152238 100%)',
          perspective: 2000,
          perspectiveOrigin: '50% 50%',
          willChange: phase === 'land' ? 'transform' : 'auto',
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          ...getShakeAnimation(),
        }}
        exit={{ opacity: 0 }}
        transition={
          phase === 'land'
            ? {
                opacity: { duration: 0.3 },
                x: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1], ease: [0.34, 1.56, 0.64, 1] },
                y: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1], ease: [0.34, 1.56, 0.64, 1] },
              }
            : { duration: 0.3 }
        }
      >
        {/* Radial burst effect - SHOCKWAVE AFTER card lands */}
        {phase === 'celebration' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`burst-${i}`}
                className="absolute rounded-full"
                style={{
                  border: `3px solid ${rarityColor}`,
                  boxShadow: `0 0 50px ${rarityColor}CC, 0 0 25px ${rarityColor}80`,
                }}
                initial={{ width: 0, height: 0, opacity: 0 }}
                animate={{
                  width: ['0px', '800px', '1200px'],
                  height: ['0px', '800px', '1200px'],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.15,  // Faster succession for impact
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              />
            ))}
          </div>
        )}

        {/* Golden Confetti system - Fine golden confetti like PlayerCardReveal */}
        {phase === 'celebration' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(isLegendary ? 120 : 80)].map((_, i) => {
              const angle = (i / 100) * Math.PI * 2;
              const distance = 200 + Math.random() * 250;  // More dispersed
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance;

              // Golden color variations for depth (like PlayerCardReveal)
              const goldColors = ['#D4AF37', '#FFD700', '#F4C430', '#FFC107', '#FFDF00'];
              const goldColor = goldColors[Math.floor(Math.random() * goldColors.length)];

              // Random confetti shapes: rectangle or square - SMALLER
              const isSquare = i % 3 === 0;
              const width = isSquare ? '4px' : '6px';  // Smaller
              const height = isSquare ? '4px' : '3px';  // Smaller

              return (
                <motion.div
                  key={`confetti-${i}`}
                  className="absolute"
                  style={{
                    background: `linear-gradient(135deg, ${goldColor} 0%, ${goldColor}DD 100%)`,
                    width,
                    height,
                    left: '50%',
                    top: '50%',
                    boxShadow: `0 0 8px ${goldColor}AA`,
                    borderRadius: isSquare ? '1px' : '0.5px',
                    willChange: 'transform, opacity',
                  }}
                  initial={{ scale: 0, x: 0, y: 0, opacity: 0, rotateZ: 0 }}
                  animate={{
                    scale: [0, 1.5, 1, 0],
                    x: [0, x * 0.3, x * 0.7, x],  // More gradual dispersion
                    y: [0, y * 0.3, y * 0.7, y],  // More gradual dispersion
                    opacity: [0, 1, 0.9, 0],
                    rotateZ: Math.random() * 1440,  // More rotation
                  }}
                  transition={{
                    duration: 2.5,  // Longer duration for smoother effect
                    delay: Math.random() * 0.2,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                />
              );
            })}
          </div>
        )}

        <div className="relative z-10 text-center px-4">
          {/* Phase 1: Anticipation - INTENSE */}
          {phase === 'anticipation' && (
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: [0.8, 1.05, 1],
                y: [0, -10, 0],
              }}
              transition={{
                opacity: { duration: 0.3 },
                scale: {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                y: {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            >
              {/* Pack card with intense glow - Responsive sizing */}
              <div
                className="w-72 h-[400px] sm:w-80 sm:h-[450px] rounded-3xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${config.color} 0%, #000 100%)`,
                  boxShadow: `0 0 100px ${config.glowColor}, 0 0 200px ${config.glowColor}`,
                  border: `4px solid ${config.color}`,
                }}
              >
                {/* Animated shimmer */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(90deg, transparent 0%, ${config.color}80 50%, transparent 100%)`,
                  }}
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Pulsing energy */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle, ${config.color}60 0%, transparent 70%)`,
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                />

                {/* Text with glow */}
                <div className="relative z-10 text-center">
                  <motion.h2
                    className="font-display text-5xl font-black text-white uppercase tracking-wider mb-4"
                    style={{
                      textShadow: `0 0 20px ${config.color}`,
                    }}
                  >
                    OPENING
                  </motion.h2>
                  <div
                    className="text-3xl font-bold"
                    style={{ color: config.color, textShadow: `0 0 20px ${config.color}` }}
                  >
                    {config.name}
                  </div>
                </div>
              </div>

              {/* Hint text */}
              <motion.p
                className="mt-6 text-text-secondary text-sm uppercase tracking-widest"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Préparation de votre récompense...
              </motion.p>
            </motion.div>
          )}

          {/* Phases 2-5: Entry, Spin, Land, Celebration - FIFA ULTIMATE TEAM STYLE! */}
          {(phase === 'entry' || phase === 'spin' || phase === 'land' || phase === 'celebration') && (
            <motion.div className="flex flex-col items-center relative">
              {/* Epic glow behind card - z-index 0 - Responsive */}
              <motion.div
                className="absolute w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] rounded-full blur-3xl pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${rarityColor}60 0%, transparent 70%)`,
                  zIndex: 0,
                }}
                animate={{
                  scale: phase === 'celebration' ? [1, 1.3, 1.1] : 1,
                  opacity: phase === 'celebration' ? [0.6, 0.9, 0.7] : 0.6,
                }}
                transition={{
                  duration: 0.8,
                  repeat: phase === 'celebration' ? Infinity : 0,
                  repeatType: 'reverse',
                }}
              />

              {/* Reward card with ULTRA dynamic animations - z-index 20 for foreground - Responsive */}
              <motion.div
                className="w-72 h-[400px] sm:w-80 sm:h-[450px] rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${rarityColor}20 0%, #0A1628 100%)`,
                  border: `4px solid ${rarityColor}`,
                  boxShadow: `0 0 60px ${rarityColor}, 0 0 100px ${rarityColor}80, inset 0 0 30px ${rarityColor}40`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                  willChange: 'transform',
                  zIndex: 20,
                }}
                {...(getCardVariants() as any)}
              >
                {/* Holographic shine effect */}
                <motion.div
                  className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, transparent 0%, ${rarityColor}40 50%, transparent 100%)`,
                  }}
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />

                {/* Rarity badge - PREMIUM - Responsive */}
                <motion.div
                  className="inline-block px-4 py-2 sm:px-6 sm:py-3 rounded-full mb-4 sm:mb-6 font-black uppercase text-sm sm:text-base tracking-widest relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${rarityColor} 0%, ${adjustBrightness(rarityColor, 20)} 100%)`,
                    color: isLegendary || result.reward.rarity === 'epic' ? '#000' : '#fff',
                    boxShadow: `0 0 30px ${rarityColor}, 0 10px 30px ${rarityColor}80`,
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 30px ${rarityColor}, 0 10px 30px ${rarityColor}80`,
                      `0 0 50px ${rarityColor}, 0 10px 50px ${rarityColor}`,
                      `0 0 30px ${rarityColor}, 0 10px 30px ${rarityColor}80`,
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  {/* Shimmer overlay */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    }}
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                  <span className="relative z-10">{result.reward.rarity.toUpperCase()}</span>
                </motion.div>

                {/* Reward name - BIG AND BOLD - Responsive */}
                <h3
                  className="font-display text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4 md:mb-6 text-white uppercase tracking-wide text-center px-2 sm:px-4"
                  style={{
                    textShadow: `0 0 20px ${rarityColor}, 0 0 40px ${rarityColor}80`,
                  }}
                >
                  {result.reward.name}
                </h3>

                {/* Reward description - Responsive */}
                <p className="text-text-secondary text-sm sm:text-base md:text-lg leading-relaxed max-w-xs text-center px-2 sm:px-4 mb-4 sm:mb-6">
                  {result.reward.description}
                </p>

                {/* Reward type badge */}
                <div
                  className="px-4 py-2 rounded-lg text-sm uppercase tracking-wider font-bold"
                  style={{
                    background: `${rarityColor}20`,
                    color: rarityColor,
                    border: `2px solid ${rarityColor}40`,
                  }}
                >
                  {result.reward.type}
                </div>
              </motion.div>

              {/* Collect button - ULTRA PREMIUM - Responsive */}
              {phase === 'celebration' && (
                <motion.button
                  className="mt-6 sm:mt-8 md:mt-10 px-8 py-3 sm:px-12 sm:py-4 md:px-16 md:py-5 rounded-xl sm:rounded-2xl font-display font-black text-base sm:text-lg md:text-xl uppercase tracking-wider relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #DA291C 0%, #A02115 100%)',
                    boxShadow: '0 10px 40px rgba(218, 41, 28, 0.5), 0 0 60px rgba(218, 41, 28, 0.3)',
                    border: '3px solid rgba(255, 255, 255, 0.2)',
                  }}
                  onClick={onClose}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', bounce: 0.4 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 15px 50px rgba(218, 41, 28, 0.7), 0 0 80px rgba(218, 41, 28, 0.5)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Animated shimmer */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    }}
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                  <span className="relative z-10 text-white drop-shadow-lg flex items-center gap-2">
                    <IoMdCheckmarkCircle className="text-2xl" /> RÉCUPÉRER
                  </span>
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Helper functions
function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: '#718096',      // Gray
    rare: '#3B82F6',        // Blue
    epic: '#A855F7',        // Purple
    legendary: '#D4AF37',   // Gold
  };
  return (colors[rarity] || colors.common) as string;
}

function adjustBrightness(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));

  const hex = (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16);
  return '#' + hex.slice(1);
}
