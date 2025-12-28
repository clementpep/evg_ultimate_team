import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { Card } from '@components/common/Card';
import { Loader } from '@components/common/Loader';
import { getMyProfile } from '@services/participantService';
import { getTop3, getDailyLeader } from '@services/leaderboardService';
import { Participant, ParticipantWithRank } from '@types/index';
import { formatRank } from '@utils/formatters';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Participant | null>(null);
  const [podium, setPodium] = useState<ParticipantWithRank[]>([]);
  const [dailyLeader, setDailyLeader] = useState<ParticipantWithRank | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, podiumData, dailyData] = await Promise.all([
          getMyProfile(),
          getTop3(),
          getDailyLeader(),
        ]);
        setProfile(profileData);
        setPodium(podiumData);
        setDailyLeader(dailyData);
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
          <p className="text-fifa-gold text-xl">👑 The Groom 👑</p>
        )}
      </div>

      {profile && (
        <Card>
          <div className="text-center">
            <p className="text-6xl font-heading text-gradient-gold mb-2">
              {profile.total_points}
            </p>
            <p className="text-gray-400">Total Points</p>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-2xl font-heading mb-4">🏆 Podium</h2>
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
          <Link to="/leaderboard" className="text-psg-blue hover:text-psg-red mt-4 block text-center">
            View Full Leaderboard →
          </Link>
        </Card>

        {dailyLeader && (
          <Card>
            <h2 className="text-2xl font-heading mb-4">⭐ Today's Leader</h2>
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

      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/challenges">
          <Card className="text-center hover:border-psg-blue">
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="text-xl font-heading">Challenges</h3>
          </Card>
        </Link>
        <Link to="/leaderboard">
          <Card className="text-center hover:border-fifa-gold">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-xl font-heading">Leaderboard</h3>
          </Card>
        </Link>
        {user?.is_admin && (
          <Link to="/admin">
            <Card className="text-center hover:border-psg-red">
              <div className="text-4xl mb-2">⚙️</div>
              <h3 className="text-xl font-heading">Admin</h3>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
};
