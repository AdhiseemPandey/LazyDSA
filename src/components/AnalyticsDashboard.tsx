import { useState, useEffect } from 'react';
import { TrendingUp, Target, Zap, Trophy, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Question } from '../types';

interface AnalyticsData {
  monthSolved: number;
  topicStats: { topic: string; solved: number; attempted: number }[];
  bestHour: number | null;
  difficultyBreakdown: { easy: number; medium: number; hard: number };
  totalSolved: number;
  streak: number;
  avgSolveTime: number;
}

interface AnalyticsDashboardProps {
  userId: string;
  questions: Question[];
}

export default function AnalyticsDashboard({ userId, questions }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    monthSolved: 0,
    topicStats: [],
    bestHour: null,
    difficultyBreakdown: { easy: 0, medium: 0, hard: 0 },
    totalSolved: 0,
    streak: 0,
    avgSolveTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [userId, questions]);

  const loadAnalytics = async () => {
    setLoading(true);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const solvedQuestions = questions.filter(q => q.solved);

    const monthSolved = solvedQuestions.filter(q =>
      new Date(q.solved_at || q.created_at) >= monthStart
    ).length;

    const difficultyBreakdown = {
      easy: solvedQuestions.filter(q => q.difficulty === 'easy').length,
      medium: solvedQuestions.filter(q => q.difficulty === 'medium').length,
      hard: solvedQuestions.filter(q => q.difficulty === 'hard').length,
    };

    const topicMap = new Map<string, { solved: number; attempted: number }>();
    questions.forEach(q => {
      const stats = topicMap.get(q.topic) || { solved: 0, attempted: 0 };
      stats.attempted++;
      if (q.solved) stats.solved++;
      topicMap.set(q.topic, stats);
    });

    const topicStats = Array.from(topicMap.entries()).map(([topic, stats]) => ({
      topic,
      solved: stats.solved,
      attempted: stats.attempted,
    }));

    const { data: focusSessions } = await supabase
      .from('focus_sessions')
      .select('hour_of_day, duration_seconds')
      .eq('user_id', userId)
      .eq('completed', true);

    let bestHour: number | null = null;
    let avgSolveTime = 0;
    if (focusSessions && focusSessions.length > 0) {
      const hourMap = new Map<number, number>();
      let totalTime = 0;
      focusSessions.forEach(session => {
        const hour = session.hour_of_day;
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
        totalTime += session.duration_seconds;
      });
      bestHour = Array.from(hourMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      avgSolveTime = Math.round(totalTime / focusSessions.length / 60);
    }

    const streak = calculateStreak(solvedQuestions);

    setAnalytics({
      monthSolved,
      topicStats: topicStats.sort((a, b) => b.solved - a.solved).slice(0, 5),
      bestHour,
      difficultyBreakdown,
      totalSolved: solvedQuestions.length,
      streak,
      avgSolveTime,
    });
    setLoading(false);
  };

  const calculateStreak = (solvedQuestions: Question[]): number => {
    if (solvedQuestions.length === 0) return 0;

    const dateMap = new Map<string, boolean>();
    solvedQuestions.forEach(q => {
      const date = new Date(q.solved_at || q.created_at).toDateString();
      dateMap.set(date, true);
    });

    let streak = 0;
    let currentDate = new Date();
    while (dateMap.has(currentDate.toDateString())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={18} className="text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">This Month</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{analytics.monthSolved}</p>
          <p className="text-xs text-blue-600 mt-1">Questions solved</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-purple-600" />
            <span className="text-xs font-semibold text-purple-700">Total Solved</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{analytics.totalSolved}</p>
          <p className="text-xs text-purple-600 mt-1">All time</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={18} className="text-orange-600" />
            <span className="text-xs font-semibold text-orange-700">Current Streak</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">{analytics.streak}</p>
          <p className="text-xs text-orange-600 mt-1">Days active</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-green-600" />
            <span className="text-xs font-semibold text-green-700">Avg Time</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{analytics.avgSolveTime}m</p>
          <p className="text-xs text-green-600 mt-1">Per question</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy size={18} />
            Difficulty Breakdown
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">Easy</span>
                <span className="text-xs font-bold text-green-600">{analytics.difficultyBreakdown.easy}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(analytics.difficultyBreakdown.easy / Math.max(analytics.totalSolved, 1)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">Medium</span>
                <span className="text-xs font-bold text-yellow-600">{analytics.difficultyBreakdown.medium}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${(analytics.difficultyBreakdown.medium / Math.max(analytics.totalSolved, 1)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">Hard</span>
                <span className="text-xs font-bold text-red-600">{analytics.difficultyBreakdown.hard}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(analytics.difficultyBreakdown.hard / Math.max(analytics.totalSolved, 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Topic Mastery</h3>
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {analytics.topicStats.length === 0 ? (
              <p className="text-xs text-gray-500">No topics tracked yet</p>
            ) : (
              analytics.topicStats.map(topic => {
                const mastery = Math.round((topic.solved / topic.attempted) * 100);
                return (
                  <div key={topic.topic}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700 truncate">{topic.topic}</span>
                      <span className="text-xs font-bold text-blue-600">{mastery}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${mastery}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {analytics.bestHour !== null && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-5 border border-indigo-200">
          <p className="text-sm font-semibold text-indigo-900">
            Your best focus time is around <span className="text-lg font-bold text-indigo-600">{analytics.bestHour}:00</span>
          </p>
          <p className="text-xs text-indigo-700 mt-2">You solve questions fastest during this hour. Consider scheduling hard problems then!</p>
        </div>
      )}
    </div>
  );
}
