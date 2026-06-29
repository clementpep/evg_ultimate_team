/**
 * Pack & card-template artwork (AI-generated, transparent-contour WebP).
 *
 * Served from /public. These PNGs/WebPs are NOT perfect rectangles — they have
 * a transparent contour — so always render them with object-contain and use
 * drop-shadow (never box-shadow / bordered boxes) for their glow.
 */

import { PackTier } from '@/types/pack';

export interface PackArt {
  /** Foil pack image (shown before opening). */
  pack: string;
  /** Card template with an empty center (where a reward is written). */
  card: string;
  /** Accent glow colour for this tier. */
  glow: string;
  /** Solid accent colour (text, badges). */
  accent: string;
}

export const PACK_ART: Record<PackTier, PackArt> = {
  bronze: {
    pack: '/bronze_pack.webp',
    card: '/bronze_card.webp',
    glow: 'rgba(205,127,50,0.55)',
    accent: '#E08A3C',
  },
  silver: {
    pack: '/silver_pack.webp',
    card: '/silver_card.webp',
    glow: 'rgba(214,214,214,0.55)',
    accent: '#D8D8D8',
  },
  gold: {
    pack: '/gold_pack.webp',
    card: '/gold_card.webp',
    glow: 'rgba(212,175,55,0.6)',
    accent: '#F0C64B',
  },
  ultimate: {
    pack: '/ultimate_pack.webp',
    card: '/ultimate_card.webp',
    glow: 'rgba(212,175,55,0.65)',
    accent: '#F4D24B',
  },
};
