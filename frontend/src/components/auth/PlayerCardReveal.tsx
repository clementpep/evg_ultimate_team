/**
 * PlayerCardReveal Component - First-login card reveal animation
 *
 * ULTRA PREMIUM 5-phase animation sequence (7 seconds total):
 * 1. Entry (1.5s) - Card falls from above with rotation
 * 2. Spin (2s) - Dramatic 360° rotation with 3D wobble effect
 * 3. Land (0.5s) - Subtle screen shake on landing
 * 4. Settle (1s) - Card settles with gentle hover
 * 5. Zoom (2s) - Smooth transition to profile icon position
 *
 * NO SKIP BUTTON - Mandatory viewing for maximum immersion!
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PlayerCardRevealProps {
  isOpen: boolean;
  username: string;
  avatarUrl: string;
  isReplay?: boolean;
  onComplete: () => void;
}

type AnimationPhase = 'entry' | 'spin' | 'land' | 'settle';

export const PlayerCardReveal: React.FC<PlayerCardRevealProps> = ({
  isOpen,
  username,
  avatarUrl,
  isReplay = false,
  onComplete,
}) => {
  const [phase, setPhase] = useState<AnimationPhase>('entry');
  const [imageLoaded, setImageLoaded] = useState(false);

  // Preload image before showing animation
  useEffect(() => {
    if (!isOpen || !avatarUrl) return;

    const img = new Image();
    img.src = avatarUrl;
    img.onload = () => setImageLoaded(true);
    img.onerror = () => {
      console.error('Failed to load avatar image');
      // Still show animation with fallback
      setImageLoaded(true);
    };
  }, [isOpen, avatarUrl]);

  // Phase timing management
  useEffect(() => {
    if (!isOpen || !imageLoaded) return;

    // Reset to entry phase
    setPhase('entry');

    // Phase transitions (cumulative timing)
    const timer1 = setTimeout(() => setPhase('spin'), 1500);      // 0-1.5s: Entry
    const timer2 = setTimeout(() => setPhase('land'), 2700);      // 1.5-2.7s: Spin (1.2s TOUPIE!)
    const timer3 = setTimeout(() => setPhase('settle'), 3200);    // 2.7-3.2s: Land
    // Card stays visible after settle phase - user must click to continue

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen, imageLoaded, isReplay]);

  if (!isOpen) return null;

  // Show loading spinner while image loads
  if (!imageLoaded) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg-primary">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Get card animation variants based on phase
  const getCardVariants = () => {
    switch (phase) {
      case 'entry':
        return {
          initial: {
            y: -1000,
            rotateX: -180,
            rotateY: 0,
            scale: 0.8,
            opacity: 0,
          },
          animate: {
            y: 0,
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            opacity: 1,
          },
          transition: {
            duration: 1.5,
            ease: [0.33, 1, 0.68, 1] as any, // Custom cubic-bezier easing
          },
        };

      case 'spin':
        return {
          animate: {
            rotateY: [0, 360, 720, 1080, 1440, 1800, 2160, 2520, 2880, 3240],  // 9 full rotations - TOUPIE EFFECT!
            rotateX: [0, 15, -15, 12, -12, 10, -10, 8, -8, 5, -5, 0],
            scale: [1, 1.05, 1.03, 1.06, 1.02, 1.04, 1.02, 1.03, 1.01, 1.02, 1],
          },
          transition: {
            duration: 1.2,  // ULTRA FAST spinning
            times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
            ease: [0.2, 0, 0.2, 1],  // Fast linear-ish easing for toupie effect
          },
        };

      case 'land':
        return {
          animate: {
            scale: [1, 0.98, 1.02, 1],
          },
          transition: {
            duration: 0.5,
            ease: [0.34, 1.56, 0.64, 1],  // Bouncy ease for landing
          },
        };

      case 'settle':
        return {
          animate: {
            y: [0, -8, 0],
            scale: [1, 1.01, 1],
          },
          transition: {
            duration: 1,
            ease: [0.45, 0, 0.55, 1],  // Smooth in-out
          },
        };

      default:
        return {
          animate: {},
          transition: { duration: 0 },
        };
    }
  };

  // Get shake container animation (only during land phase)
  const getShakeAnimation = () => {
    if (phase === 'land') {
      return {
        x: [0, -4, 3, -2, 1, 0],
        y: [0, -3, 2, -1, 0],
      };
    }
    return {};
  };

  // Handle click to close after animation settles
  const handleClick = () => {
    if (phase === 'settle') {
      onComplete();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(circle at center, #1A2942 0%, #0A1628 100%)',
        perspective: 2000,
        perspectiveOrigin: '50% 50%',
        willChange: phase === 'land' ? 'transform' : 'auto',
        cursor: phase === 'settle' ? 'pointer' : 'default',
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
              x: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1], ease: [0.34, 1.56, 0.64, 1] },
              y: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1], ease: [0.34, 1.56, 0.64, 1] },
            }
          : { duration: 0.3 }
      }
      onClick={handleClick}
    >
      {/* Golden radial burst effect - During spin and celebration */}
      {(phase === 'spin' || phase === 'land' || phase === 'settle') && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`burst-${i}`}
              className="absolute rounded-full"
              style={{
                border: '3px solid #D4AF37',
                boxShadow: '0 0 50px rgba(212, 175, 55, 0.7), 0 0 25px rgba(255, 215, 0, 0.5)',
                willChange: 'width, height, opacity',
              }}
              initial={{ width: 0, height: 0, opacity: 0 }}
              animate={{
                width: ['0px', '800px', '1200px'],
                height: ['0px', '800px', '1200px'],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            />
          ))}
        </div>
      )}

      {/* Golden Confetti system - Burst during spin phase */}
      {phase === 'spin' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(100)].map((_, i) => {
            const angle = (i / 100) * Math.PI * 2;
            const distance = 150 + Math.random() * 120;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            // Golden color variations for depth
            const goldColors = ['#D4AF37', '#FFD700', '#F4C430', '#FFC107', '#FFDF00'];
            const goldColor = goldColors[Math.floor(Math.random() * goldColors.length)];

            // Random confetti shapes: rectangle or square
            const isSquare = i % 3 === 0;
            const width = isSquare ? '8px' : '12px';
            const height = isSquare ? '8px' : '6px';

            return (
              <motion.div
                key={`confetti-${i}`}
                className="absolute"
                style={{
                  background: `linear-gradient(135deg, ${goldColor} 0%, ${goldColor}CC 100%)`,
                  width,
                  height,
                  left: '50%',
                  top: '50%',
                  boxShadow: `0 0 15px ${goldColor}AA, 0 0 8px ${goldColor}`,
                  borderRadius: isSquare ? '2px' : '1px',
                  willChange: 'transform, opacity',
                }}
                initial={{ scale: 0, x: 0, y: 0, opacity: 0, rotateZ: 0 }}
                animate={{
                  scale: [0, 1.2, 0.8, 0],
                  x: [0, x * 0.5, x],
                  y: [0, y * 0.5, y],
                  opacity: [0, 1, 0.8, 0],
                  rotateZ: Math.random() * 1080,
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94],  // Smoother confetti fall
                }}
              />
            );
          })}
        </div>
      )}

      {/* Main card - Direct PNG with 3D transforms (no container wrapper) */}
      <motion.img
        src={avatarUrl}
        alt={username}
        className="w-80 h-[450px] object-contain pointer-events-none"
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          willChange: 'transform',
          filter:
            phase === 'settle'
              ? 'drop-shadow(0 0 80px rgba(212, 175, 55, 0.9)) drop-shadow(0 0 40px rgba(255, 215, 0, 0.6))'
              : 'drop-shadow(0 0 60px rgba(212, 175, 55, 0.7)) drop-shadow(0 0 30px rgba(255, 215, 0, 0.5))',
        }}
        {...(getCardVariants() as any)}
        onError={(e) => {
          e.currentTarget.src = '/fut_card_default.png';
        }}
      />

      {/* Golden background glow effect */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(212,175,55,0.4) 0%, rgba(255,215,0,0.2) 40%, transparent 70%)',
          filter: 'blur(70px)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: phase === 'settle' ? [1, 1.3, 1] : phase === 'spin' ? [1, 1.1, 1] : 1,
          opacity: 0.9,
        }}
        transition={{
          duration: phase === 'settle' ? 1 : phase === 'spin' ? 1.2 : 0.5,
          repeat: phase === 'spin' ? Infinity : 0,
        }}
      />
    </motion.div>
  );
};
