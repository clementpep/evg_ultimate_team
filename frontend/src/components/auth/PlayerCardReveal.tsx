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
  isGroom: boolean;
  onComplete: () => void;
}

type AnimationPhase = 'entry' | 'spin' | 'land' | 'settle' | 'zoom';

export const PlayerCardReveal: React.FC<PlayerCardRevealProps> = ({
  isOpen,
  username,
  avatarUrl,
  isGroom,
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
    const timer2 = setTimeout(() => setPhase('land'), 4000);      // 1.5-4s: Spin (2.5s now)
    const timer3 = setTimeout(() => setPhase('settle'), 4500);    // 4-4.5s: Land
    const timer4 = setTimeout(() => setPhase('zoom'), 5500);      // 4.5-5.5s: Settle
    const timer5 = setTimeout(() => {
      // 5.5-7.5s: Zoom
      // Animation will complete and call onComplete
    }, 7500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [isOpen, imageLoaded]);

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
            rotateY: [0, 360, 720, 1080],  // 3 full rotations for more dramatic effect
            rotateX: [0, 15, -15, 10, -10, 0],
            scale: [1, 1.08, 1.05, 1.08, 1.02, 1],
          },
          transition: {
            duration: 2.5,  // Slightly longer to accommodate more rotations
            times: [0, 0.25, 0.5, 0.75, 0.9, 1],
            ease: 'easeInOut',
          },
        };

      case 'land':
        return {
          animate: {
            scale: [1, 0.98, 1.02, 1],
          },
          transition: {
            duration: 0.5,
            ease: 'easeOut',
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
            ease: 'easeInOut',
          },
        };

      case 'zoom':
        return {
          animate: {
            scale: 0.12,
            borderRadius: '50%',
            x: window.innerWidth / 2 - 80, // Move to top-right (approximate)
            y: -(window.innerHeight / 2 - 60),
          },
          transition: {
            duration: 2,
            ease: [0.33, 1, 0.68, 1] as any, // Custom cubic-bezier easing
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

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(circle at center, #1A2942 0%, #0A1628 100%)',
        perspective: 2000,
        perspectiveOrigin: '50% 50%',
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
              x: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
              y: { duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
            }
          : { duration: 0.3 }
      }
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
                ease: 'easeOut',
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
                }}
                initial={{ scale: 0, x: 0, y: 0, opacity: 0, rotateZ: 0 }}
                animate={{
                  scale: [0, 1.2, 0.8, 0],
                  x: [0, x * 0.5, x],
                  y: [0, y * 0.5, y],
                  opacity: [0, 1, 0.8, 0],
                  rotateZ: Math.random() * 1080, // Full spins for confetti effect
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.3,
                  ease: 'easeOut',
                }}
              />
            );
          })}
        </div>
      )}

      {/* Main card */}
      <motion.div
        className="relative w-80 h-[450px] rounded-lg overflow-hidden shadow-2xl"
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          boxShadow:
            phase === 'settle' || phase === 'zoom'
              ? '0 0 80px rgba(212, 175, 55, 0.9), 0 0 40px rgba(255, 215, 0, 0.6)'
              : '0 0 60px rgba(212, 175, 55, 0.7), 0 0 30px rgba(255, 215, 0, 0.5)',
        }}
        {...(getCardVariants() as any)}
        onAnimationComplete={() => {
          if (phase === 'zoom') {
            onComplete();
          }
        }}
      >
        <img
          src={avatarUrl}
          alt={username}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/fut_card_default.png';
          }}
        />

        {/* Holographic shine effect during spin */}
        {phase === 'spin' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '200% 0%'],
            }}
            transition={{
              duration: 1.2,
              ease: 'linear',
              repeat: 1,
            }}
          />
        )}

        {/* Groom badge overlay if applicable */}
        {isGroom && (phase === 'settle' || phase === 'zoom') && (
          <motion.div
            className="absolute top-4 left-4 bg-fifa-gold/90 text-bg-primary px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span>👑</span>
            <span>The Groom</span>
          </motion.div>
        )}
      </motion.div>

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
          opacity: phase === 'zoom' ? 0 : 0.9,
        }}
        transition={{
          duration: phase === 'settle' ? 1 : phase === 'spin' ? 2.5 : 0.5,
          repeat: phase === 'spin' ? Infinity : 0,
        }}
      />
    </motion.div>
  );
};
