/**
 * PlayerCardReveal - first-login (and "Voir ma carte" replay) reveal.
 *
 * Everyone opens an Ultimate pack that reveals their own FUT card, via the
 * shared PackOpeningExperience (reliable dismissal on every device, incl.
 * Android — no animation-phase-gated close).
 */

import { PackOpeningExperience } from '@components/packs/PackOpeningExperience';

interface PlayerCardRevealProps {
  isOpen: boolean;
  username: string;
  avatarUrl: string;
  onComplete: () => void;
}

export const PlayerCardReveal: React.FC<PlayerCardRevealProps> = ({
  isOpen,
  username,
  avatarUrl,
  onComplete,
}) => {
  if (!isOpen) return null;

  return (
    <PackOpeningExperience
      tier="ultimate"
      items={[{ kind: 'player', name: username, cardSrc: avatarUrl }]}
      packTitle="Ta carte"
      onComplete={onComplete}
    />
  );
};
