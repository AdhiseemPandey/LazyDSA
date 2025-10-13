import { useMemo } from 'react';
import { ArrowLeft, TrendingUp, Target, Flame, BarChart3 } from 'lucide-react';
import { Question } from '../types';
import {
  calculateTopicStats,
  calculateDailyProgress,
  calculateStreak,
  calculateDifficultyStats,
} from '../utils/analytics';

interface AnalyticsProps {
  questions: Question[];
  onBack: () => void;
}

export default function Analytics({ questions, onBack }: AnalyticsProps) {
  const topicStats = useMemo(() => calculateTopicStats(questions), [questions]);
  const dailyProgress = useMemo(() => calculateDailyProgress(questions), [questions]);
  const streakData = useMemo(() => calculateStreak(questions), [questions]);
  const difficultyStats = useMemo(() => calculateDifficultyStats(questions), [questions]);

  const totalSolved = questions.filter((q) => q.solved).length;
  const totalQuestions = questions.length;
  const solvedPercentage = totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;

  const maxDailyCount = Math.max(...dailyProgress.map((d) => d.count), 1);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <BarChart3 size={28} className="text-blue-600" />
          Analytics Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Target size={20} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Total Progress</span>
            </div>
            <div className="text-3xl font-bold text-blue-900">
              {totalSolved}/{totalQuestions}
            </div>
            <div className="text-sm text-blue-600 mt-1">{solvedPercentage}% Complete</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={20} className="text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Current Streak</span>
            </div>
            <div className="text-3xl font-bold text-orange-900">{streakData.current}</div>
            <div className="text-sm text-orange-600 mt-1">days</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Longest Streak</span>
            </div>
            <div className="text-3xl font-bold text-purple-900">{streakData.longest}</div>
            <div className="text-sm text-purple-600 mt-1">days</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Target size={20} className="text-green-600" />
              <span className="text-sm font-medium text-green-700">This Month</span>
            </div>
            <div className="text-3xl font-bold text-green-900">
              {dailyProgress.slice(-30).reduce((sum, d) => sum + d.count, 0)}
            </div>
            <div className="text-sm text-green-600 mt-1">solved</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Last 30 Days Activity</h3>
        <div className="flex items-end gap-1 h-32">
          {dailyProgress.map((day, index) => {
            const height = day.count > 0 ? (day.count / maxDailyCount) * 100 : 4;
            const dayOfWeek = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
            const dayOfMonth = new Date(day.date).getDate();

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className={`w-full rounded-t transition-all ${
                    day.count > 0 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-200'
                  }`}
                  style={{ height: `${height}%` }}
                />
                <div className="text-xs text-gray-500 text-center">
                  {index % 5 === 0 && (
                    <>
                      <div className="font-medium">{dayOfMonth}</div>
                      <div className="text-[10px]">{dayOfWeek}</div>
                    </>
                  )}
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  {day.date}: {day.count} solved
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Difficulty Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(difficultyStats).map(([difficulty, stats]) => {
            const percentage = stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0;
            const colors = {
              easy: { bg: 'bg-green-100', bar: 'bg-green-500', text: 'text-green-700' },
              medium: { bg: 'bg-yellow-100', bar: 'bg-yellow-500', text: 'text-yellow-700' },
              hard: { bg: 'bg-red-100', bar: 'bg-red-500', text: 'text-red-700' },
            };
            const color = colors[difficulty as keyof typeof colors];

            return (
              <div key={difficulty} className={`${color.bg} rounded-lg p-4`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-semibold capitalize ${color.text}`}>{difficulty}</span>
                  <span className={`text-sm ${color.text}`}>
                    {stats.solved}/{stats.total}
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-2 mb-2">
                  <div className={`${color.bar} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
                </div>
                <div className={`text-sm ${color.text}`}>{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Topic-wise Progress</h3>
        <div className="space-y-4">
          {topicStats.map((stat) => {
            const percentage = stat.total > 0 ? Math.round((stat.solved / stat.total) * 100) : 0;

            return (
              <div key={stat.topic} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">{stat.topic}</span>
                  <span className="text-sm text-gray-600">
                    {stat.solved}/{stat.total} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Easy: {stat.easy}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Medium: {stat.medium}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Hard: {stat.hard}
                  </span>
                </div>
              </div>
            );
          })}
          {topicStats.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No questions added yet. Start tracking to see your progress!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
