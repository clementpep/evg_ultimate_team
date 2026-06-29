/**
 * PackOpeningExperience - Shared FUT-style pack opening.
 *
 * Flow: PACK (tap to open) -> BURST (light flash) -> REVEAL (card turns to face
 * you). Powers every reveal in the app: a pack reward (tier card template with
 * the reward written in its empty centre), the player's own FUT card, and
 * Paul's sequential squad discovery.
 *
 * Design rules (the art has a TRANSPARENT contour, not a rectangle):
 *  - images are object-contain with a drop-shadow glow (never box-shadow/borders)
 *  - the reveal turns a single-sided card (no back face -> no leftover rectangle)
 *  - dismissal NEVER depends on animation timing (reliable on Android): once a
 *    card is shown, a tap anywhere advances, and a button is always available.
 */

import { useState, useEffect, useCallback, type ReactNode, type SyntheticEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackReward, PackTier } from '@/types/pack';
import { PACK_ART } from '@/assets/packArt';
import { getDefaultAvatarUrl } from '@utils/avatarUtils';

export type RevealItem =
  | { kind: 'reward'; reward: PackReward }
  | { kind: 'player'; name: string; cardSrc: string };

interface PackOpeningExperienceProps {
  tier: PackTier;
  items: RevealItem[];
  packTitle?: string;
  packSubtitle?: string;
  onComplete: () => void;
  /** Optional custom final screen (e.g. discovery "compose your team"). */
  doneCta?: (close: () => void) => ReactNode;
}

type Phase = 'loading' | 'pack' | 'burst' | 'reveal' | 'done';

const RARITY_LABEL: Record<PackReward['rarity'], string> = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
};

const preload = (src: string): Promise<void> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });

const BG = 'radial-gradient(circle at center, #16243f 0%, #0A1628 70%, #06101f 100%)';

export const PackOpeningExperience: React.FC<PackOpeningExperienceProps> = ({
  tier,
  items,
  packTitle,
  packSubtitle,
  onComplete,
  doneCta,
}) => {
  const art = PACK_ART[tier];
  const [phase, setPhase] = useState<Phase>('loading');
  const [index, setIndex] = useState(0);

  // Preload pack + every reveal image before we start.
  useEffect(() => {
    let active = true;
    const srcs = [art.pack, ...items.map((it) => (it.kind === 'player' ? it.cardSrc : art.card))];
    Promise.all(srcs.map(preload)).then(() => {
      if (active) setPhase('pack');
    });
    return () => {
      active = false;
    };
  }, [art.pack, art.card, items]);

  const openPack = () => {
    if (phase !== 'pack') return;
    setPhase('burst');
    setTimeout(() => setPhase('reveal'), 700);
  };

  const advance = useCallback(() => {
    if (phase !== 'reveal') return;
    if (index + 1 < items.length) {
      setIndex((i) => i + 1);
    } else if (doneCta) {
      setPhase('done');
    } else {
      onComplete();
    }
  }, [phase, index, items.length, doneCta, onComplete]);

  const current = items[index];
  const isLast = index + 1 >= items.length;
  const multi = items.length > 1;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden px-4 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
      style={{ background: BG, WebkitTapHighlightColor: 'transparent' }}
      onClick={phase === 'reveal' ? advance : undefined}
      role={phase === 'reveal' ? 'button' : undefined}
    >
      {phase === 'loading' && <div className="loading-spinner" />}

      {/* ---------- PACK ---------- */}
      {phase === 'pack' && (
        <motion.button
          type="button"
          onClick={openPack}
          className="flex flex-col items-center focus:outline-none"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <motion.img
            src={art.pack}
            alt="Pack"
            className="h-[min(62vh,30rem)] w-auto object-contain"
            style={{ filter: `drop-shadow(0 0 60px ${art.glow}) drop-shadow(0 0 28px ${art.glow})` }}
            animate={{ y: [0, -12, 0], rotate: [-1.2, 1.2, -1.2] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {packTitle && (
            <div className="mt-5 font-display text-2xl font-black uppercase tracking-widest text-white sm:text-3xl">
              {packTitle}
            </div>
          )}
          <motion.div
            className="mt-2 text-sm uppercase tracking-[0.25em] text-white/70"
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            Tape pour ouvrir
          </motion.div>
          {packSubtitle && (
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/45">{packSubtitle}</p>
          )}
        </motion.button>
      )}

      {/* ---------- BURST ---------- */}
      {phase === 'burst' && (
        <div className="relative flex items-center justify-center">
          <motion.div
            className="absolute rounded-full"
            style={{ background: `radial-gradient(circle, ${art.glow} 0%, transparent 70%)` }}
            initial={{ width: 40, height: 40, opacity: 0.2 }}
            animate={{ width: 900, height: 900, opacity: [0.2, 0.95, 0] }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
          <motion.img
            src={art.pack}
            alt="Pack"
            className="h-[min(62vh,30rem)] w-auto object-contain"
            style={{ filter: `drop-shadow(0 0 70px ${art.glow})` }}
            initial={{ scale: 1, opacity: 1, rotate: 0 }}
            animate={{ scale: [1, 1.12, 1.4], opacity: [1, 1, 0], rotate: [0, -3, 4] }}
            transition={{ duration: 0.7, ease: 'easeIn' }}
          />
        </div>
      )}

      {/* ---------- REVEAL ---------- */}
      {phase === 'reveal' && current && (
        <div className="relative flex w-full flex-col items-center" style={{ perspective: 1500 }}>
          {multi && (
            <div className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1 text-sm font-bold tracking-widest text-white sm:-top-4">
              {index + 1} / {items.length}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              className="flex flex-col items-center"
              initial={{ rotateY: -105, scale: 0.55, opacity: 0 }}
              animate={{ rotateY: 0, scale: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.16 } }}
              transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {current.kind === 'reward' ? (
                <RewardCard reward={current.reward} art={art} />
              ) : (
                <PlayerRevealCard name={current.name} src={current.cardSrc} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Always-available control (reliable on every device) */}
          <div className="mt-7 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                advance();
              }}
              className="rounded-xl px-10 py-3 font-display font-black uppercase tracking-wider text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #DA291C 0%, #A02115 100%)' }}
            >
              {multi ? (isLast ? 'Terminer' : 'Suivant') : 'Continuer'}
            </button>
            <span className="text-xs uppercase tracking-[0.18em] text-white/45">Tape pour continuer</span>
          </div>
        </div>
      )}

      {/* ---------- DONE (custom) ---------- */}
      {phase === 'done' && doneCta && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full">
          {doneCta(onComplete)}
        </motion.div>
      )}
    </div>
  );
};

/** Reward written into a tier card template's empty centre. */
const RewardCard: React.FC<{ reward: PackReward; art: typeof PACK_ART[PackTier] }> = ({ reward, art }) => (
  <div
    className="relative aspect-[2/3] w-[min(72vw,19rem)] sm:w-80"
    style={{ filter: `drop-shadow(0 0 45px ${art.glow}) drop-shadow(0 0 18px ${art.glow})` }}
  >
    <img src={art.card} alt="" className="h-full w-full object-contain" />
    <div className="absolute inset-0 flex flex-col items-center justify-center px-[15%] pb-[15%] pt-[20%] text-center">
      <span
        className="mb-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em]"
        style={{ background: `${art.accent}22`, color: art.accent, border: `1px solid ${art.accent}66` }}
      >
        {RARITY_LABEL[reward.rarity]}
      </span>
      <h3
        className="font-display text-xl font-black uppercase leading-tight tracking-wide text-white sm:text-2xl"
        style={{ textShadow: `0 0 18px ${art.glow}` }}
      >
        {reward.name}
      </h3>
      <p className="mt-3 max-h-32 overflow-y-auto text-xs leading-relaxed text-white/75 sm:text-sm">
        {reward.description}
      </p>
    </div>
  </div>
);

/** A participant's own FUT card image (already a full card). */
const PlayerRevealCard: React.FC<{ name: string; src: string }> = ({ name, src }) => (
  <>
    <img
      src={src}
      alt={name}
      className="h-[min(58vh,26rem)] w-auto object-contain"
      style={{ filter: 'drop-shadow(0 0 55px rgba(212,175,55,0.7)) drop-shadow(0 0 26px rgba(255,215,0,0.5))' }}
      onError={(e: SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = getDefaultAvatarUrl();
      }}
    />
    <div className="mt-4 font-display text-2xl font-black uppercase tracking-wide text-white sm:text-3xl">
      {name}
    </div>
  </>
);
