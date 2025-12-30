/**
 * EVGTeamPage - Squad view of all participants
 *
 * Displays all 13 participants on a FIFA-style squad background:
 * - Paul C. (groom) in the center gold slot
 * - 12 other participants in surrounding black & gold slots
 * - Cards are clickable to view full-size static version
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLeaderboard } from '@services/leaderboardService';
import { getAvatarUrl, getDefaultAvatarUrl } from '@utils/avatarUtils';
import { ParticipantWithRank } from '@/types/participant';

export const EVGTeamPage: React.FC = () => {
  const [participants, setParticipants] = useState<ParticipantWithRank[]>([]);
  const [selectedCard, setSelectedCard] = useState<ParticipantWithRank | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setIsLoading(true);
        const data = await getLeaderboard();
        setParticipants(data);
      } catch (error) {
        console.error('Failed to fetch participants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Separate Paul (groom) from others
  const groom = participants.find(p => p.is_groom);
  const others = participants.filter(p => !p.is_groom);

  // Shuffle others for random positioning (same shuffle each render using ID as seed)
  const shuffledOthers = [...others].sort((a, b) => {
    // Use participant IDs to create a deterministic but "random-looking" order
    return (a.id * 7919) % 13 - (b.id * 7919) % 13;
  });

  // Card slot positions (in percentage relative to background)
  // Center slot for groom
  const centerSlot = { top: '25%', left: '42.5%' };

  // 12 surrounding slots positioned around the center in a formation
  const surroundingSlots = [
    // Top row (4 cards)
    { top: '15%', left: '9.75%' },
    { top: '16%', left: '24.5%' },
    { top: '16%', left: '65%' },
    { top: '14.5%', left: '80%' },

    // Middle row (4 cards)
    { top: '38%', left: '9.75%' },
    { top: '40%', left: '24.5%' },
    { top: '40%', left: '65%' },
    { top: '38%', left: '80%' },

    // Bottom row (4 cards)
    { top: '61%', left: '9.75%' },
    { top: '64%', left: '24.5%' },
    { top: '64%', left: '65%' },
    { top: '61%', left: '80%' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image with fade edges */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/evg_team_background.png)',
            filter: 'brightness(0.85)',
          }}
        />
        {/* Fade edges overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-transparent via-30% to-bg-primary" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/50 via-transparent via-30% to-bg-primary/50" />
      </div>

      {/* Overlay gradient for better card visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10" />

      {/* Desktop Layout - Absolute Positioning (lg+) */}
      <div className="hidden lg:block relative z-10 w-full h-screen">
        {/* Center Groom Card (Larger Gold) */}
        {groom && (
          <motion.button
            key={`groom-${groom.id}`}
            className="absolute cursor-pointer"
            style={{
              top: centerSlot.top,
              left: centerSlot.left,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={() => setSelectedCard(groom)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Card Image */}
            <img
              src={getAvatarUrl(groom.name)}
              alt={groom.name}
              className="w-48 h-64 object-contain drop-shadow-2xl"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(212, 175, 55, 0.8)) drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))',
              }}
              onError={(e) => {
                e.currentTarget.src = getDefaultAvatarUrl();
              }}
            />
            {/* Points Badge */}
            <div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-bold text-sm"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                color: '#0A1628',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.6)',
              }}
            >
              {groom.total_points} pts
            </div>
          </motion.button>
        )}

        {/* Surrounding Team Cards (Smaller Black & Gold) */}
        {shuffledOthers.map((participant, index) => {
          const slot = surroundingSlots[index];
          if (!slot) return null;

          return (
            <motion.button
              key={`participant-${participant.id}`}
              className="absolute cursor-pointer"
              style={{
                top: slot.top,
                left: slot.left,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => setSelectedCard(participant)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
            >
              {/* Card Image */}
              <img
                src={getAvatarUrl(participant.name)}
                alt={participant.name}
                className="w-32 h-44 object-contain drop-shadow-xl"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 10px rgba(212, 175, 55, 0.4))',
                }}
                onError={(e) => {
                  e.currentTarget.src = '/fut_card_default.png';
                }}
              />
              {/* Points Badge */}
              <div
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full font-bold text-xs"
                style={{
                  background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #D4AF37 100%)',
                  color: '#D4AF37',
                  border: '1px solid rgba(212, 175, 55, 0.5)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
                }}
              >
                {participant.total_points} pts
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Mobile/Tablet Layout - Grid (< lg) */}
      <div className="lg:hidden relative z-10 w-full min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Groom Card - Full width at top */}
          {groom && (
            <motion.div
              className="flex justify-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.button
                onClick={() => setSelectedCard(groom)}
                className="cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <img
                  src={getAvatarUrl(groom.name)}
                  alt={groom.name}
                  className="w-40 h-56 sm:w-48 sm:h-64 object-contain drop-shadow-2xl"
                  style={{
                    filter: 'drop-shadow(0 0 30px rgba(212, 175, 55, 0.8)) drop-shadow(0 0 15px rgba(255, 215, 0, 0.6))',
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/fut_card_default.png';
                  }}
                />
                <div
                  className="mt-2 px-4 py-1 rounded-full font-bold text-sm text-center mx-auto inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
                    color: '#0A1628',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.6)',
                  }}
                >
                  {groom.total_points} pts
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* Other Participants - Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {shuffledOthers.map((participant, index) => (
              <motion.button
                key={`participant-mobile-${participant.id}`}
                onClick={() => setSelectedCard(participant)}
                className="cursor-pointer flex flex-col items-center"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <img
                  src={getAvatarUrl(participant.name)}
                  alt={participant.name}
                  className="w-28 h-40 sm:w-32 sm:h-44 object-contain drop-shadow-xl"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 10px rgba(212, 175, 55, 0.4))',
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/fut_card_default.png';
                  }}
                />
                <div
                  className="mt-2 px-3 py-0.5 rounded-full font-bold text-xs text-center"
                  style={{
                    background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #D4AF37 100%)',
                    color: '#D4AF37',
                    border: '1px solid rgba(212, 175, 55, 0.5)',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  {participant.total_points} pts
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at center, #1A2942 0%, #0A1628 100%)',
              cursor: 'pointer',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSelectedCard(null)}
          >
            {/* Large Card Display */}
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={getAvatarUrl(selectedCard.name)}
                alt={selectedCard.name}
                className="w-96 h-[540px] object-contain"
                style={{
                  filter: selectedCard.is_groom
                    ? 'drop-shadow(0 0 80px rgba(212, 175, 55, 0.9)) drop-shadow(0 0 40px rgba(255, 215, 0, 0.6))'
                    : 'drop-shadow(0 0 60px rgba(212, 175, 55, 0.7)) drop-shadow(0 0 30px rgba(255, 215, 0, 0.5))',
                }}
                onError={(e) => {
                  e.currentTarget.src = '/fut_card_default.png';
                }}
              />
            </motion.div>

            {/* Golden background glow */}
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
                scale: [1, 1.2, 1],
                opacity: 0.9,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
