import { supabase } from '../lib/supabase';

export const createDailyReminder = async (userId: string) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  await supabase.from('reminders').insert({
    user_id: userId,
    reminder_type: 'daily',
    title: 'Daily Reminder',
    message: 'Time to solve some questions! Keep up your streak.',
    scheduled_for: tomorrow.toISOString(),
  });
};

export const createWeeklyReminder = async (userId: string) => {
  const nextMonday = new Date();
  nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
  nextMonday.setHours(10, 0, 0, 0);

  await supabase.from('reminders').insert({
    user_id: userId,
    reminder_type: 'weekly',
    title: 'Weekly Challenge',
    message: 'New weekly challenges are available! Can you complete them all?',
    scheduled_for: nextMonday.toISOString(),
  });
};

export const createMonthlyReminder = async (userId: string) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const firstDayNextMonth = new Date(today.getFullYear(), currentMonth + 1, 1);
  firstDayNextMonth.setHours(9, 0, 0, 0);

  const { data: monthStats } = await supabase
    .from('questions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .gte('created_at', new Date(today.getFullYear(), currentMonth, 1).toISOString())
    .lt('created_at', firstDayNextMonth.toISOString());

  const count = monthStats?.length || 0;

  await supabase.from('reminders').insert({
    user_id: userId,
    reminder_type: 'monthly',
    title: 'Monthly Summary',
    message: `You solved ${count} questions this month! Great progress.`,
    scheduled_for: firstDayNextMonth.toISOString(),
  });
};

export const createAchievementReminder = async (
  userId: string,
  achievementType: string,
  message: string
) => {
  await supabase.from('reminders').insert({
    user_id: userId,
    reminder_type: 'achievement',
    title: 'Achievement Unlocked!',
    message,
    scheduled_for: new Date().toISOString(),
  });
};

export const checkAndCreateReminders = async (userId: string) => {
  const now = new Date();
  const today = now.toDateString();
  const thisWeek = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
  const thisMonth = `${now.getFullYear()}-${now.getMonth()}`;

  const remindersKey = `lazyDSA_reminders_${userId}`;
  const storedReminders = localStorage.getItem(remindersKey);
  const reminders = storedReminders ? JSON.parse(storedReminders) : {};

  if (!reminders.daily || reminders.daily !== today) {
    await createDailyReminder(userId);
    reminders.daily = today;
  }

  if (!reminders.weekly || reminders.weekly !== thisWeek) {
    await createWeeklyReminder(userId);
    reminders.weekly = thisWeek;
  }

  if (!reminders.monthly || reminders.monthly !== thisMonth) {
    await createMonthlyReminder(userId);
    reminders.monthly = thisMonth;
  }

  localStorage.setItem(remindersKey, JSON.stringify(reminders));
};

export const updateChallengeProgress = async (
  userId: string,
  difficulty: string
) => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekStartStr = weekStart.toISOString().split('T')[0];

  if (difficulty === 'hard') {
    await supabase
      .from('weekly_challenges')
      .update({ completed: supabase.rpc('increment', { x: 1 }) })
      .eq('user_id', userId)
      .eq('week_start', weekStartStr)
      .eq('challenge_type', 'hard_questions');
  }

  await supabase
    .from('weekly_challenges')
    .update({ completed: supabase.rpc('increment', { x: 1 }) })
    .eq('user_id', userId)
    .eq('week_start', weekStartStr)
    .eq('challenge_type', 'any_solved');
};

export const updateXP = async (userId: string, difficulty: string) => {
  const xpAmount = {
    easy: 10,
    medium: 25,
    hard: 50,
  }[difficulty] || 10;

  const { data: existing } = await supabase
    .from('user_xp')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    const newTotal = existing.total_xp + xpAmount;
    const newLevel = Math.floor(newTotal / 500) + 1;

    const updateData: any = {
      total_xp: newTotal,
      level: newLevel,
      updated_at: new Date().toISOString(),
    };

    if (difficulty === 'easy') updateData.easy_solved = existing.easy_solved + 1;
    if (difficulty === 'medium') updateData.medium_solved = existing.medium_solved + 1;
    if (difficulty === 'hard') updateData.hard_solved = existing.hard_solved + 1;

    await supabase.from('user_xp').update(updateData).eq('user_id', userId);
  } else {
    const data: any = {
      user_id: userId,
      total_xp: xpAmount,
      level: 1,
    };
    if (difficulty === 'easy') data.easy_solved = 1;
    if (difficulty === 'medium') data.medium_solved = 1;
    if (difficulty === 'hard') data.hard_solved = 1;

    await supabase.from('user_xp').insert(data);
  }
};
