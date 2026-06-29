/**
 * FUT Card Images - Centralized imports
 * All participant FUT card images imported here for better bundling and deployment
 */

// Import all FUT cards (WebP — optimized from the source PNGs via
// scripts/optimize-assets.mjs)
import futCardClementP from './fut_card_clementp.webp';
import futCardPaulJ from './fut_card_paulj.webp';
import futCardVianneyD from './fut_card_vianneyd.webp';
import futCardPaulC from './fut_card_paulc.webp';
import futCardAdrienM from './fut_card_adrienm.webp';
import futCardAntoninM from './fut_card_antoninm.webp';
import futCardGuillaumeV from './fut_card_guillaumev.webp';
import futCardMartinL from './fut_card_martinl.webp';
import futCardPhilippeC from './fut_card_philippec.webp';
import futCardThomasS from './fut_card_thomass.webp';
import futCardHugoF from './fut_card_hugof.webp';
import futCardLancelotM from './fut_card_lancelotm.webp';
import futCardTheoC from './fut_card_theoc.webp';

// Import background images
import psgWallpaper from './psg_wallpaper.jpg';
import evgTeamBackground from './evg_team_background.png';
import favicon from './favicon.svg';

/**
 * FUT Cards mapping - normalized username to imported image
 */
export const futCards: Record<string, string> = {
  clementp: futCardClementP,
  paulj: futCardPaulJ,
  vianneyd: futCardVianneyD,
  paulc: futCardPaulC,
  adrienm: futCardAdrienM,
  antoninm: futCardAntoninM,
  guillaumev: futCardGuillaumeV,
  martinl: futCardMartinL,
  philippec: futCardPhilippeC,
  thomass: futCardThomasS,
  hugof: futCardHugoF,
  lancelotm: futCardLancelotM,
  theoc: futCardTheoC,
};

/**
 * Default fallback card (Paul C. - the groom)
 */
export const defaultFutCard = futCardPaulC;

/**
 * Background images
 */
export const backgrounds = {
  psgWallpaper,
  evgTeamBackground,
};

/**
 * Favicon
 */
export { favicon };
