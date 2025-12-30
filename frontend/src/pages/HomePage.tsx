import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { Card } from '@components/common/Card';
import { Loader } from '@components/common/Loader';
import { getMyProfile } from '@services/participantService';
import { getTop3, getDailyLeader } from '@services/leaderboardService';
import { packService } from '@services/packService';
import { Participant, ParticipantWithRank } from '@/types/index';
import { PackOpening } from '@/types/pack';
import { formatRank } from '@utils/formatters';
import { GiCrown, GiTrophyCup } from 'react-icons/gi';
import { FaGift, FaStar } from 'react-icons/fa';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Participant | null>(null);
  const [podium, setPodium] = useState<ParticipantWithRank[]>([]);
  const [dailyLeader, setDailyLeader] = useState<ParticipantWithRank | null>(null);
  const [packHistory, setPackHistory] = useState<PackOpening[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getPackTierStyle = (tier: string) => {
    const styles: Record<string, string> = {
      bronze: 'bg-[#CD7F32]/20 text-[#CD7F32] border border-[#CD7F32]/40',
      silver: 'bg-[#C0C0C0]/20 text-[#C0C0C0] border border-[#C0C0C0]/40',
      gold: 'bg-fifa-gold/20 text-fifa-gold border border-fifa-gold/40',
      ultimate: 'bg-psg-red/20 text-psg-red border border-psg-red/40',
    };
    return styles[tier.toLowerCase()] || styles.bronze;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, podiumData, dailyData, historyData] = await Promise.all([
          getMyProfile(),
          getTop3(),
          getDailyLeader(),
          packService.getHistory(),
        ]);
        setProfile(profileData);
        setPodium(podiumData);
        setDailyLeader(dailyData);
        setPackHistory(historyData);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-5xl font-heading mb-2 text-gradient-psg">
          Welcome, {user?.username}!
        </h1>
        {user?.is_groom && (
          <p className="text-fifa-gold text-xl flex items-center justify-center gap-2">
            <GiCrown className="text-2xl" /> The Groom <GiCrown className="text-2xl" />
          </p>
        )}
      </div>

      {profile && (
        <div
          className="rounded-lg p-8 border backdrop-blur-sm"
          style={{
            background: 'rgba(26, 41, 66, 0.6)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="text-center">
            <p className="text-6xl font-numbers font-black text-gradient-gold mb-2">
              {profile.total_points}
            </p>
            <p className="text-text-secondary font-semibold uppercase tracking-wide text-sm">Total Points</p>
            <p className="text-xs text-text-tertiary mt-2">1 point = 1 crédit pour acheter des packs</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-2xl font-heading mb-4 flex items-center gap-2">
            <GiTrophyCup className="text-fifa-gold" /> Podium
          </h2>
          <div className="space-y-3">
            {podium.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`badge badge-rank-${p.rank}`}>
                    {formatRank(p.rank)}
                  </span>
                  <span>{p.name}</span>
                </div>
                <span className="font-mono text-fifa-gold">{p.total_points} pts</span>
              </div>
            ))}
          </div>
          <Link
            to="/leaderboard"
            className="text-psg-red hover:text-white font-semibold mt-4 block text-center transition-colors uppercase tracking-wide"
          >
            View Full Leaderboard →
          </Link>
        </Card>

        {dailyLeader && (
          <Card>
            <h2 className="text-2xl font-heading mb-4 flex items-center gap-2">
              <FaStar className="text-fifa-gold" /> Today's Leader
            </h2>
            <div className="text-center">
              <p className="text-3xl font-heading text-fifa-green mb-2">{dailyLeader.name}</p>
              <p className="text-gray-400">
                {dailyLeader.points_today} points today
              </p>
              <p className="text-sm text-gray-500 mt-2">Chooses tomorrow's aperitif!</p>
            </div>
          </Card>
        )}
      </div>

      {/* Mes Avantages Section */}
      {packHistory.length > 0 && (
        <Card>
          <h2 className="text-2xl font-heading mb-4 flex items-center gap-2">
            <FaGift className="text-psg-red" /> Mes Avantages Obtenus
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {packHistory.map((opening) => (
              <div
                key={opening.id}
                className="flex items-center justify-between p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
                style={{ background: 'rgba(0, 0, 0, 0.2)' }}
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{opening.reward_name}</h3>
                  {opening.reward_description && (
                    <p className="text-sm text-text-tertiary mt-1">{opening.reward_description}</p>
                  )}
                  <p className="text-xs text-text-tertiary mt-1">
                    Obtenu le {new Date(opening.opened_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <span className={`text-xs px-2 py-1 rounded font-semibold uppercase ${getPackTierStyle(opening.pack_tier)}`}>
                    {opening.pack_tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/packs"
            className="text-psg-red hover:text-white font-semibold mt-4 block text-center transition-colors uppercase tracking-wide"
          >
            Ouvrir plus de packs →
          </Link>
        </Card>
      )}
    </div>
  );
};
