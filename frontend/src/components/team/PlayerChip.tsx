/**
 * PlayerChip - Compact FUT card used on the 5v5 pitch and roster.
 *
 * Renders a participant's FUT card image with name + points badge.
 * Supports a selected state (for tap-to-place editing) and click handler.
 */

import { motion } from 'framer-motion';
import { getAvatarUrl, getDefaultAvatarUrl } from '@utils/avatarUtils';
import { ParticipantSummary } from '@/types/participant';

type ChipSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<ChipSize, string> = {
  sm: 'w-16 h-24 sm:w-20 sm:h-28',
  md: 'w-20 h-28 sm:w-24 sm:h-32',
  lg: 'w-28 h-40 sm:w-32 sm:h-44',
};

interface PlayerChipProps {
  participant: ParticipantSummary;
  size?: ChipSize;
  selected?: boolean;
  showPoints?: boolean;
  onClick?: (participant: ParticipantSummary) => void;
}

export const PlayerChip: React.FC<PlayerChipProps> = ({
  participant,
  size = 'md',
  selected = false,
  showPoints = true,
  onClick,
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick ? () => onClick(participant) : undefined}
      className="relative flex flex-col items-center focus:outline-none"
      whileHover={onClick ? { scale: 1.06 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      animate={selected ? { scale: 1.08 } : { scale: 1 }}
    >
      <img
        src={getAvatarUrl(participant.name)}
        alt={participant.name}
        className={`${SIZE_CLASSES[size]} object-contain drop-shadow-xl`}
        style={{
          filter: selected
            ? 'drop-shadow(0 0 14px rgba(0, 255, 65, 0.9)) drop-shadow(0 0 6px rgba(0, 255, 65, 0.7))'
            : participant.is_groom
            ? 'drop-shadow(0 0 14px rgba(212, 175, 55, 0.85)) drop-shadow(0 0 6px rgba(255, 215, 0, 0.6))'
            : 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 6px rgba(212, 175, 55, 0.35))',
        }}
        onError={(e) => {
          e.currentTarget.src = getDefaultAvatarUrl();
        }}
      />
      {showPoints && (
        <div
          className="mt-1 px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-xs whitespace-nowrap"
          style={{
            background: participant.is_groom
              ? 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)'
              : 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #D4AF37 100%)',
            color: participant.is_groom ? '#0A1628' : '#D4AF37',
            border: participant.is_groom ? 'none' : '1px solid rgba(212, 175, 55, 0.5)',
          }}
        >
          {participant.total_points} pts
        </div>
      )}
    </motion.button>
  );
};
