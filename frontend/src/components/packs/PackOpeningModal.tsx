/**
 * Pack Opening Modal Component - ULTRA PREMIUM EDITION (DEBUGGED & FIXED)
 *
 * FIFA Ultimate Team-style pack opening with smooth, bug-free animations:
 * 1. Anticipation (2.5s) - Glowing pack with intense build-up
 * 2. Reveal (2s) - Epic card reveal with light burst
 * 3. Celebration (3s) - Explosive particles, confetti, fireworks
 *
 * Designed to be ADDICTIVE and make users want to open MORE packs!
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

export const PackOpeningModal: React.FC<PackOpeningModalProps> = ({
  isOpen,
  tier,
  result,
  onClose,
}) => {
  const [phase, setPhase] = useState<'anticipation' | 'reveal' | 'celebration'>('anticipation');

  useEffect(() => {
    if (!isOpen || !result) return;

    // Reset state
    setPhase('anticipation');

    // Phase timing
    const timer1 = setTimeout(() => setPhase('reveal'), 2500);
    const timer2 = setTimeout(() => setPhase('celebration'), 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const config = PACK_CONFIG[tier as keyof typeof PACK_CONFIG] || PACK_CONFIG.bronze;
  const rarityColor = getRarityColor(result.reward.rarity);
  const isLegendary = result.reward.rarity === 'legendary';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{
          background: isLegendary
            ? 'radial-gradient(circle at center, #1A2942 0%, #0A1628 100%)'
            : 'linear-gradient(135deg, #0A1628 0%, #152238 100%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Radial burst effect - Only during reveal and celebration */}
        {phase !== 'anticipation' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
            {/* Multiple expanding rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`burst-${i}`}
                className="absolute rounded-full"
                style={{
                  border: `2px solid ${rarityColor}`,
                  boxShadow: `0 0 40px ${rarityColor}80`,
                }}
                initial={{ width: 0, height: 0, opacity: 0 }}
                animate={{
                  width: ['0px', '800px', '1200px'],
                  height: ['0px', '800px', '1200px'],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.3,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}

        {/* Epic particle system for celebration */}
        {phase === 'celebration' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Confetti */}
            {[...Array(isLegendary ? 60 : 30)].map((_, i) => (
              <motion.div
                key={`confetti-${i}`}
                className="absolute w-2 h-2"
                style={{
                  background: i % 3 === 0 ? rarityColor : i % 3 === 1 ? config.color : '#DA291C',
                  left: '50%',
                  top: '50%',
                  borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                }}
                initial={{ scale: 0, opacity: 0, x: 0, y: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1, 0.8],
                  opacity: [0, 1, 0],
                  y: [-20, -250 - Math.random() * 150],
                  x: [(Math.random() - 0.5) * 600],
                  rotate: [0, Math.random() * 720],
                }}
                transition={{
                  duration: 1.5 + Math.random() * 0.5,
                  delay: Math.random() * 0.3,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Sparkles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: '#FFFFFF',
                  left: `${30 + Math.random() * 40}%`,
                  top: `${30 + Math.random() * 40}%`,
                  boxShadow: `0 0 8px ${rarityColor}`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.2, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: Math.random() * 1,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 1.5,
                }}
              />
            ))}
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
              {/* Multiple glowing rings around pack - PREMIUM */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`ring-${i}`}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: `${320 + i * 80}px`,
                    height: `${320 + i * 80}px`,
                    border: `${3 - i}px solid ${config.color}`,
                    boxShadow: `0 0 ${60 + i * 20}px ${config.glowColor}`,
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2 + i * 0.1, 0.5 + i * 0.1, 0.2 + i * 0.1],
                    rotate: i % 2 === 0 ? [0, 360] : [360, 0],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              ))}

              {/* Pack card with intense glow */}
              <div
                className="w-80 h-[450px] rounded-3xl flex items-center justify-center relative overflow-hidden"
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

          {/* Phase 2 & 3: Reveal & Celebration - EPIC */}
          {(phase === 'reveal' || phase === 'celebration') && (
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Epic glow behind card */}
              <motion.div
                className="absolute w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${rarityColor}60 0%, transparent 70%)`,
                }}
                initial={{ scale: 0, opacity: 0 }}
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

              {/* Reward card with spin effect on reveal */}
              <motion.div
                className="w-80 h-[450px] rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${rarityColor}20 0%, #0A1628 100%)`,
                  border: `4px solid ${rarityColor}`,
                  boxShadow: `0 0 60px ${rarityColor}, 0 0 100px ${rarityColor}80, inset 0 0 30px ${rarityColor}40`,
                }}
                initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotateY: phase === 'reveal' ? [0, 360] : 360,
                }}
                transition={{
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] },
                  rotateY: { duration: 1.2, ease: 'easeOut' },
                }}
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

                {/* Rarity badge - PREMIUM */}
                <motion.div
                  className="inline-block px-6 py-3 rounded-full mb-6 font-black uppercase text-base tracking-widest relative overflow-hidden"
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

                {/* Reward name - BIG AND BOLD */}
                <h3
                  className="font-display text-4xl font-black mb-6 text-white uppercase tracking-wide text-center px-4"
                  style={{
                    textShadow: `0 0 20px ${rarityColor}, 0 0 40px ${rarityColor}80`,
                  }}
                >
                  {result.reward.name}
                </h3>

                {/* Reward description */}
                <p className="text-text-secondary text-lg leading-relaxed max-w-xs text-center px-4 mb-6">
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

              {/* Collect button - ULTRA PREMIUM */}
              {phase === 'celebration' && (
                <motion.button
                  className="mt-10 px-16 py-5 rounded-2xl font-display font-black text-xl uppercase tracking-wider relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #DA291C 0%, #A02115 100%)',
                    boxShadow: '0 10px 40px rgba(218, 41, 28, 0.5), 0 0 60px rgba(218, 41, 28, 0.3)',
                    border: '3px solid rgba(255, 255, 255, 0.2)',
                  }}
                  onClick={onClose}
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', bounce: 0.5 }}
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
  const color = colors[rarity] ?? colors.common;
  return color;
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
