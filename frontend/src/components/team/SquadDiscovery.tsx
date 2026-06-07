/**
 * SquadDiscovery - Paul's first-login "discover your team" pack experience.
 *
 * A single "Pack Équipe" opens and reveals the 12 other participants one by
 * one (tap to advance). Ends with a CTA to go compose the 5v5 lineup.
 *
 * Groom-only; gated by useSquadDiscovery (localStorage).
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '@services/leaderboardService';
import { getAvatarUrl, getDefaultAvatarUrl } from '@utils/avatarUtils';
import { ParticipantWithRank } from '@/types/participant';

interface SquadDiscoveryProps {
  currentUserId: number;
  onComplete: () => void;
}

type Phase = 'loading' | 'pack' | 'revealing' | 'done';

// Deterministic-but-shuffled order so the reveal feels random each squad
const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
};

export const SquadDiscovery: React.FC<SquadDiscoveryProps> = ({ currentUserId, onComplete }) => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('loading');
  const [players, setPlayers] = useState<ParticipantWithRank[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchOthers = async () => {
      try {
        const all = await getLeaderboard();
        const others = shuffle(all.filter((p) => p.id !== currentUserId));
        if (active) {
          setPlayers(others);
          setPhase('pack');
        }
      } catch (error) {
        console.error('Failed to load squad for discovery:', error);
        if (active) onComplete(); // fail open: don't trap the groom
      }
    };
    fetchOthers();
    return () => {
      active = false;
    };
  }, [currentUserId, onComplete]);

  const total = players.length;
  const current = players[index];

  const handleAdvance = () => {
    if (index + 1 < total) {
      setIndex((i) => i + 1);
    } else {
      setPhase('done');
    }
  };

  const handleGoCompose = () => {
    navigate('/team?edit');
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden px-4"
      style={{ background: 'radial-gradient(circle at center, #1A2942 0%, #0A1628 100%)' }}
    >
      {/* Loading */}
      {phase === 'loading' && <div className="loading-spinner" />}

      {/* Pack to open */}
      {phase === 'pack' && (
        <motion.button
          type="button"
          onClick={() => setPhase('revealing')}
          className="flex flex-col items-center focus:outline-none"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-64 h-80 sm:w-72 sm:h-96 rounded-3xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #000 100%)',
              border: '4px solid #D4AF37',
              boxShadow: '0 0 100px rgba(212,175,55,0.6), 0 0 200px rgba(212,175,55,0.3)',
            }}
            animate={{ scale: [1, 1.04, 1], y: [0, -8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="text-center px-4 relative z-10">
              <div className="font-display text-4xl sm:text-5xl font-black text-white uppercase tracking-wider">
                PACK
              </div>
              <div className="font-display text-2xl sm:text-3xl font-black text-fifa-gold uppercase tracking-widest mt-1">
                ÉQUIPE
              </div>
              <div className="mt-6 text-white/90 text-sm uppercase tracking-widest">
                Tape pour découvrir ton équipe
              </div>
            </div>
          </motion.div>
          <p className="mt-6 text-text-secondary text-sm uppercase tracking-widest">
            {total} coéquipiers à révéler
          </p>
        </motion.button>
      )}

      {/* Sequential reveal */}
      {phase === 'revealing' && current && (
        <button
          type="button"
          onClick={handleAdvance}
          className="absolute inset-0 flex flex-col items-center justify-center focus:outline-none"
        >
          <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white/10 text-white text-sm font-bold tracking-widest">
            {index + 1} / {total}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.6, rotateY: 180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
            >
              <motion.img
                src={getAvatarUrl(current.name)}
                alt={current.name}
                className="w-72 h-[400px] sm:w-80 sm:h-[450px] object-contain"
                style={{
                  filter:
                    'drop-shadow(0 0 60px rgba(212, 175, 55, 0.7)) drop-shadow(0 0 30px rgba(255, 215, 0, 0.5))',
                }}
                onError={(e) => {
                  e.currentTarget.src = getDefaultAvatarUrl();
                }}
              />
              <div className="mt-4 font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
                {current.name}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-text-secondary text-sm uppercase tracking-widest animate-pulse">
            {index + 1 < total ? 'Tape pour le suivant' : 'Tape pour terminer'}
          </div>
        </button>
      )}

      {/* Done */}
      {phase === 'done' && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-wider text-gradient-psg">
            Ton équipe est complète !
          </h2>
          <p className="text-text-secondary mt-3">
            À toi de jouer : répartis tout le monde sur le terrain pour le five.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={handleGoCompose}
              className="px-8 py-3 rounded-xl font-display font-black uppercase tracking-wider text-white"
              style={{ background: 'linear-gradient(135deg, #DA291C 0%, #A02115 100%)' }}
            >
              ⚽ Compose ton équipe
            </button>
            <button
              type="button"
              onClick={onComplete}
              className="px-8 py-3 rounded-xl font-display font-bold uppercase tracking-wider text-white border border-white/20"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              Plus tard
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
