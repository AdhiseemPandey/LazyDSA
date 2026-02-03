import { TrendingDown, AlertCircle } from 'lucide-react';
import { Question } from '../types';

interface WeaknessAnalyzerProps {
  questions: Question[];
}

export default function WeaknessAnalyzer({ questions }: WeaknessAnalyzerProps) {
  const calculateTopicStats = () => {
    const stats = new Map<string, { attempted: number; solved: number }>();

    questions.forEach(q => {
      const current = stats.get(q.topic) || { attempted: 0, solved: 0 };
      current.attempted++;
      if (q.solved) current.solved++;
      stats.set(q.topic, current);
    });

    return Array.from(stats.entries())
      .map(([topic, { attempted, solved }]) => ({
        topic,
        attempted,
        solved,
        accuracy: attempted > 0 ? Math.round((solved / attempted) * 100) : 0,
      }))
      .filter(s => s.attempted >= 2)
      .sort((a, b) => a.accuracy - b.accuracy);
  };

  const calculateDifficultyStats = () => {
    const difficulties = ['easy', 'medium', 'hard'] as const;
    return difficulties.map(difficulty => {
      const filtered = questions.filter(q => q.difficulty === difficulty);
      const solved = filtered.filter(q => q.solved).length;
      return {
        difficulty,
        attempted: filtered.length,
        solved,
        accuracy: filtered.length > 0 ? Math.round((solved / filtered.length) * 100) : 0,
      };
    });
  };

  const topicStats = calculateTopicStats();
  const difficultyStats = calculateDifficultyStats();

  const weakTopics = topicStats.slice(0, 3);
  const weakDifficulty = difficultyStats.filter(d => d.accuracy < 70 && d.attempted >= 1);

  if (topicStats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8 text-gray-500">
          <p>Solve more questions to see weakness analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingDown size={24} className="text-orange-500" />
        <h2 className="text-xl font-bold text-gray-800">Areas to Improve</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            Struggling Topics
          </h3>
          <div className="space-y-3">
            {weakTopics.length > 0 ? (
              weakTopics.map((topic, i) => (
                <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800 text-sm">{topic.topic}</span>
                    <span className="text-2xl font-bold text-red-600">{topic.accuracy}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${topic.accuracy}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {topic.solved} of {topic.attempted} solved
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">Great job! No struggling topics.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" />
            Difficulty Breakdown
          </h3>
          <div className="space-y-3">
            {difficultyStats.map((d, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border ${
                  d.accuracy >= 80
                    ? 'bg-green-50 border-green-200'
                    : d.accuracy >= 60
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800 text-sm capitalize">{d.difficulty}</span>
                  <span
                    className={`text-2xl font-bold ${
                      d.accuracy >= 80
                        ? 'text-green-600'
                        : d.accuracy >= 60
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {d.accuracy}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      d.accuracy >= 80
                        ? 'bg-green-500'
                        : d.accuracy >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${d.accuracy}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {d.solved} of {d.attempted} solved
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {weakDifficulty.length > 0 && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Focus Area:</span> You're struggling with{' '}
            {weakDifficulty.map(d => d.difficulty).join(' and ')} problems. Try practicing more in these difficulty levels.
          </p>
        </div>
      )}
    </div>
  );
}
