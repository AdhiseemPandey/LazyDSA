import { Question } from '../types';

export interface TopicStats {
  topic: string;
  total: number;
  solved: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface DailyProgress {
  date: string;
  count: number;
}

export function calculateTopicStats(questions: Question[]): TopicStats[] {
  const topicMap = new Map<string, TopicStats>();

  questions.forEach((q) => {
    const existing = topicMap.get(q.topic) || {
      topic: q.topic,
      total: 0,
      solved: 0,
      easy: 0,
      medium: 0,
      hard: 0,
    };

    existing.total++;
    if (q.solved) existing.solved++;
    if (q.difficulty === 'easy') existing.easy++;
    if (q.difficulty === 'medium') existing.medium++;
    if (q.difficulty === 'hard') existing.hard++;

    topicMap.set(q.topic, existing);
  });

  return Array.from(topicMap.values()).sort((a, b) => b.total - a.total);
}

export function calculateDailyProgress(questions: Question[]): DailyProgress[] {
  const dateMap = new Map<string, number>();

  questions
    .filter((q) => q.solved && q.solved_at)
    .forEach((q) => {
      const date = new Date(q.solved_at!).toISOString().split('T')[0];
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

  const last30Days: DailyProgress[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    last30Days.push({
      date: dateStr,
      count: dateMap.get(dateStr) || 0,
    });
  }

  return last30Days;
}

export function calculateStreak(questions: Question[]): { current: number; longest: number } {
  const solvedDates = questions
    .filter((q) => q.solved && q.solved_at)
    .map((q) => new Date(q.solved_at!).toISOString().split('T')[0])
    .sort()
    .reverse();

  if (solvedDates.length === 0) return { current: 0, longest: 0 };

  const uniqueDates = Array.from(new Set(solvedDates));
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);
    const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);

    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak, tempStreak);

  return { current: currentStreak, longest: longestStreak };
}

export function calculateDifficultyStats(questions: Question[]) {
  const stats = {
    easy: { total: 0, solved: 0 },
    medium: { total: 0, solved: 0 },
    hard: { total: 0, solved: 0 },
  };

  questions.forEach((q) => {
    stats[q.difficulty].total++;
    if (q.solved) stats[q.difficulty].solved++;
  });

  return stats;
}
