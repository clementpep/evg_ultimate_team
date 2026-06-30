/**
 * PackCard - one pack tier on the Packs page.
 *
 * Shows the real foil-pack artwork (transparent contour -> object-contain +
 * drop-shadow glow, never a rectangular background) with the count, cost and
 * open/buy actions.
 */

import { motion } from 'framer-motion';
import { PACK_CONFIG, PackTier } from '../../types/pack';
import { PACK_ART } from '@/assets/packArt';

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
  const art = PACK_ART[tier];
  const canPurchase = userCredits >= config.cost;

  return (
    <div
      className="relative flex flex-col items-center overflow-hidden rounded-2xl border p-5 sm:p-6"
      style={{
        background: 'linear-gradient(160deg, rgba(26,41,66,0.85) 0%, rgba(10,22,40,0.95) 100%)',
        borderColor: canOpen ? art.accent : 'rgba(255,255,255,0.08)',
        boxShadow: canOpen ? `0 0 28px ${art.glow}` : 'none',
      }}
    >
      {/* Count badge */}
      {count > 0 && (
        <div
          className="absolute right-3 top-3 z-10 flex h-9 min-w-9 items-center justify-center rounded-full px-2 font-numbers text-base font-black text-bg-primary shadow-lg"
          style={{ background: art.accent }}
        >
          {count}
        </div>
      )}

      {/* Pack artwork — glow is a separate radial-gradient div so mobile
           browsers never show a rectangular compositing-layer boundary. */}
      <motion.div
        className="relative"
        animate={canOpen ? { y: [0, -8, 0] } : {}}
        transition={canOpen ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : {}}
      >
        {canOpen && (
          <div
            className="absolute -inset-[15%] pointer-events-none"
            style={{ background: `radial-gradient(ellipse at center, ${art.glow} 0%, transparent 70%)` }}
          />
        )}
        <img
          src={art.pack}
          alt={config.name}
          loading="lazy"
          className="relative h-44 w-auto object-contain sm:h-52"
          style={{
            filter: canOpen ? 'none' : 'grayscale(0.5) brightness(0.7)',
            opacity: count > 0 || canPurchase ? 1 : 0.55,
          }}
        />
      </motion.div>

      <h3
        className="mt-4 font-display text-lg font-black uppercase tracking-wider sm:text-xl"
        style={{ color: art.accent }}
      >
        {config.name}
      </h3>
      <div className="mt-0.5 text-xs uppercase tracking-wide text-text-secondary">
        {count === 0 ? 'Aucun pack' : count === 1 ? '1 pack disponible' : `${count} packs disponibles`}
      </div>

      {/* Action */}
      <div className="mt-4 w-full">
        {canOpen ? (
          <button
            type="button"
            onClick={onOpen}
            className="w-full rounded-xl py-3 font-display text-base font-black uppercase tracking-wider text-bg-primary transition-transform active:scale-95"
            style={{ background: `linear-gradient(135deg, ${art.accent} 0%, ${config.color} 100%)`, boxShadow: `0 6px 20px ${art.glow}` }}
          >
            Ouvrir
          </button>
        ) : (
          <button
            type="button"
            onClick={onPurchase}
            disabled={!canPurchase}
            className="w-full rounded-xl border py-3 font-display text-sm font-bold uppercase tracking-wide transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: canPurchase ? `${art.accent}1f` : 'rgba(255,255,255,0.04)',
              borderColor: canPurchase ? `${art.accent}66` : 'rgba(255,255,255,0.1)',
              color: canPurchase ? art.accent : '#718096',
            }}
          >
            Acheter · {config.cost} crédits
          </button>
        )}
        {!canOpen && (
          <div className={`mt-2 text-center text-xs ${canPurchase ? 'text-fifa-green' : 'text-red-400'}`}>
            {canPurchase ? `${userCredits} crédits disponibles` : `Crédits insuffisants (${userCredits}/${config.cost})`}
          </div>
        )}
      </div>
    </div>
  );
};
