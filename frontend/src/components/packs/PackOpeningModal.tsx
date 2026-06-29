/**
 * PackOpeningModal - opens a pack reward via the shared PackOpeningExperience.
 *
 * Thin wrapper kept so PacksPage keeps its isOpen/tier/result/onClose contract.
 * The reward is written into the tier's card template during the reveal.
 */

import { PackOpenResult, PackTier } from '../../types/pack';
import { PackOpeningExperience } from './PackOpeningExperience';

interface PackOpeningModalProps {
  isOpen: boolean;
  tier: string;
  result: PackOpenResult | null;
  onClose: () => void;
}

export const PackOpeningModal: React.FC<PackOpeningModalProps> = ({ isOpen, tier, result, onClose }) => {
  if (!isOpen || !result) return null;

  return (
    <PackOpeningExperience
      tier={tier as PackTier}
      items={[{ kind: 'reward', reward: result.reward }]}
      onComplete={onClose}
    />
  );
};
