/**
 * SquadDiscovery - Paul's first-login "discover your team" experience.
 *
 * An Ultimate "Pack Équipe" opens and reveals the 12 other participants one by
 * one (tap to advance), then a CTA to go compose the 5v5 lineup. Built on the
 * shared PackOpeningExperience so the visuals/animations match the rest of the
 * app and stay reliable on every device.
 *
 * Groom-only; gated by useSquadDiscovery (localStorage).
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '@services/leaderboardService';
import { getAvatarUrl } from '@utils/avatarUtils';
import { PackOpeningExperience, RevealItem } from '@components/packs/PackOpeningExperience';
import { ParticipantWithRank } from '@/types/participant';

interface SquadDiscoveryProps {
  currentUserId: number;
  onComplete: () => void;
}

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
  const [players, setPlayers] = useState<ParticipantWithRank[] | null>(null);

  useEffect(() => {
    let active = true;
    getLeaderboard()
      .then((all) => {
        if (active) setPlayers(shuffle(all.filter((p) => p.id !== currentUserId)));
      })
      .catch((error) => {
        console.error('Failed to load squad for discovery:', error);
        if (active) onComplete(); // fail open: don't trap the groom
      });
    return () => {
      active = false;
    };
  }, [currentUserId, onComplete]);

  if (!players) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: 'radial-gradient(circle at center, #16243f 0%, #0A1628 70%)' }}
      >
        <div className="loading-spinner" />
      </div>
    );
  }

  const items: RevealItem[] = players.map((p) => ({
    kind: 'player',
    name: p.name,
    cardSrc: getAvatarUrl(p.name),
  }));

  const handleGoCompose = () => {
    navigate('/team?edit');
    onComplete();
  };

  return (
    <PackOpeningExperience
      tier="ultimate"
      items={items}
      packTitle="Pack Équipe"
      packSubtitle={`${items.length} coéquipiers à révéler`}
      onComplete={onComplete}
      doneCta={(close) => (
        <div className="text-center">
          <h2 className="font-display text-3xl font-black uppercase tracking-wider text-gradient-psg sm:text-5xl">
            Ton équipe est complète !
          </h2>
          <p className="mt-3 text-text-secondary">
            À toi de jouer : répartis tout le monde sur le terrain pour le five.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleGoCompose}
              className="rounded-xl px-8 py-3 font-display font-black uppercase tracking-wider text-white"
              style={{ background: 'linear-gradient(135deg, #DA291C 0%, #A02115 100%)' }}
            >
              ⚽ Compose ton équipe
            </button>
            <button
              type="button"
              onClick={close}
              className="rounded-xl border border-white/20 px-8 py-3 font-display font-bold uppercase tracking-wider text-white"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              Plus tard
            </button>
          </div>
        </div>
      )}
    />
  );
};
