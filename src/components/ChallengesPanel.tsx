import { useState, useEffect } from 'react';
import { Zap, Target, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Challenge {
  id: string;
  challenge_type: string;
  target: number;
  completed: number;
  reward_xp: number;
  completed_at: string | null;
}

interface ChallengesPanelProps {
  userId: string;
}

const CHALLENGE_DESCRIPTIONS = {
  hard_questions: { name: 'Hard Challenge', icon: '⚡', goal: 'Solve 3 hard questions' },
  any_solved: { name: 'Daily Goal', icon: '🎯', goal: 'Solve any 5 questions' },
  topic_focused: { name: 'Topic Master', icon: '🧠', goal: 'Solve 4 questions from same topic' },
};

export default function ChallengesPanel({ userId }: ChallengesPanelProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
    initializeWeeklyChallenges();
  }, [userId]);

  const initializeWeeklyChallenges = async () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const { data: existingChallenges } = await supabase
      .from('weekly_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStartStr);

    if (!existingChallenges || existingChallenges.length === 0) {
      await supabase.from('weekly_challenges').insert([
        {
          user_id: userId,
          week_start: weekStartStr,
          challenge_type: 'hard_questions',
          target: 3,
          reward_xp: 150,
        },
        {
          user_id: userId,
          week_start: weekStartStr,
          challenge_type: 'any_solved',
          target: 5,
          reward_xp: 100,
        },
      ]);
    }
  };

  const loadChallenges = async () => {
    setLoading(true);
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const { data } = await supabase
      .from('weekly_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start', weekStartStr);

    setChallenges(data || []);
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading challenges...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
        <Zap size={18} />
        This Week's Challenges
      </h3>

      {challenges.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
          <p className="text-sm text-gray-500">No active challenges</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map(challenge => {
            const desc = CHALLENGE_DESCRIPTIONS[challenge.challenge_type as keyof typeof CHALLENGE_DESCRIPTIONS];
            const progress = Math.round((challenge.completed / challenge.target) * 100);
            const isCompleted = challenge.completed >= challenge.target;

            return (
              <div
                key={challenge.id}
                className={`rounded-lg p-4 border-2 transition-all ${
                  isCompleted
                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-lg">{desc?.icon}</p>
                    <p className="font-bold text-gray-800 text-sm mt-1">{desc?.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{desc?.goal}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-yellow-600">+{challenge.reward_xp}</p>
                    <p className="text-xs text-gray-500">XP</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700">
                      {challenge.completed} / {challenge.target}
                    </span>
                    {isCompleted && (
                      <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
