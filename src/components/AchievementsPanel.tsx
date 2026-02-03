import { useState, useEffect } from 'react';
import { Trophy, Star, Flame, Brain, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Achievement {
  id: string;
  achievement_type: string;
  earned_at: string;
  metadata: any;
}

interface XPData {
  total_xp: number;
  level: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
}

interface AchievementsPanelProps {
  userId: string;
}

const ACHIEVEMENT_CONFIG = {
  streak_10: { icon: '🔥', name: '10 Day Streak', description: 'Solve questions for 10 consecutive days' },
  streak_30: { icon: '⭐', name: '30 Day Streak', description: 'Solve questions for 30 consecutive days' },
  solved_50: { icon: '🎯', name: '50 Solved', description: 'Solve 50 questions total' },
  solved_100: { icon: '🏆', name: '100 Solved', description: 'Solve 100 questions total' },
  topic_master: { icon: '🧠', name: 'Topic Master', description: 'Achieve 90%+ mastery in any topic' },
  hard_solver: { icon: '⚡', name: 'Hard Solver', description: 'Solve 20 hard questions' },
  speed_demon: { icon: '🚀', name: 'Speed Demon', description: 'Average solve time under 15 minutes' },
};

export default function AchievementsPanel({ userId }: AchievementsPanelProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [xpData, setXpData] = useState<XPData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    setLoading(true);

    const { data: achievementsData } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    const { data: xpDataResult } = await supabase
      .from('user_xp')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    setAchievements(achievementsData || []);
    setXpData(xpDataResult);
    setLoading(false);
  };

  const xpToNextLevel = (level: number) => level * 500;
  const currentXPForLevel = xpData ? xpData.total_xp - (xpData.level - 1) * 500 : 0;

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading achievements...</div>;
  }

  return (
    <div className="space-y-6">
      {xpData && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-yellow-700 uppercase">Level {xpData.level}</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{xpData.total_xp} XP</p>
            </div>
            <Trophy size={40} className="text-yellow-600" />
          </div>

          <div className="space-y-2">
            <div className="w-full bg-yellow-200 rounded-full h-3">
              <div
                className="bg-yellow-500 h-3 rounded-full transition-all"
                style={{ width: `${(currentXPForLevel / xpToNextLevel(xpData.level + 1)) * 100}%` }}
              />
            </div>
            <p className="text-xs text-yellow-700">
              {currentXPForLevel} / {xpToNextLevel(xpData.level + 1)} XP to Level {xpData.level + 1}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
            <div className="text-center">
              <p className="font-bold text-green-600">{xpData.easy_solved}</p>
              <p className="text-gray-700">Easy</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-yellow-600">{xpData.medium_solved}</p>
              <p className="text-gray-700">Medium</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-red-600">{xpData.hard_solved}</p>
              <p className="text-gray-700">Hard</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Star size={18} />
          Achievements ({achievements.length})
        </h3>

        {achievements.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
            <p className="text-sm text-gray-500 mb-2">No achievements yet</p>
            <p className="text-xs text-gray-400">Keep solving problems to unlock achievements!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map(achievement => {
              const config = ACHIEVEMENT_CONFIG[achievement.achievement_type as keyof typeof ACHIEVEMENT_CONFIG];
              return (
                <div
                  key={achievement.id}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200 text-center hover:shadow-lg transition-shadow"
                >
                  <p className="text-3xl mb-2">{config?.icon || '🏆'}</p>
                  <p className="text-xs font-bold text-gray-800">{config?.name || achievement.achievement_type}</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{config?.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(achievement.earned_at).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
