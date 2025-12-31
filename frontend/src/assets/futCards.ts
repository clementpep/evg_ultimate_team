/**
 * FUT Card Images - Centralized imports
 * All participant FUT card images imported here for better bundling and deployment
 */

// Import all FUT cards
import futCardClementP from './fut_card_clementp.png';
import futCardPaulJ from './fut_card_paulj.png';
import futCardVianneyD from './fut_card_vianneyd.png';
import futCardPaulC from './fut_card_paulc.png';
import futCardAdrienM from './fut_card_adrienm.png';
import futCardAntoninM from './fut_card_antoninm.png';
import futCardGuillaumeV from './fut_card_guillaumev.png';
import futCardMartinL from './fut_card_martinl.png';
import futCardPhilippeC from './fut_card_philippec.png';
import futCardThomasS from './fut_card_thomass.png';
import futCardHugoF from './fut_card_hugof.png';
import futCardLancelotM from './fut_card_lancelotm.png';
import futCardTheoC from './fut_card_theoc.png';

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
