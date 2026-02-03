/*
  # Add Analytics, Gamification, and Productivity Features

  ## Overview
  Comprehensive system for tracking achievements, analytics, challenges, and reminders.

  ## New Tables

  ### `user_achievements`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `achievement_type` (text) - 'streak_10', 'solved_50', 'topic_master', 'fast_solver'
  - `earned_at` (timestamptz)
  - `metadata` (jsonb) - Additional data (topic_name, streak_count, etc)

  ### `user_xp`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key, unique)
  - `total_xp` (integer) - Total points earned
  - `level` (integer) - Current level
  - `easy_solved` (integer) - Count of easy questions solved
  - `medium_solved` (integer) - Count of medium questions solved
  - `hard_solved` (integer) - Count of hard questions solved
  - `updated_at` (timestamptz)

  ### `weekly_challenges`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `week_start` (date)
  - `challenge_type` (text) - 'hard_questions', 'any_solved', 'topic_focused'
  - `target` (integer) - Goal count
  - `completed` (integer) - Current progress
  - `reward_xp` (integer)
  - `completed_at` (timestamptz)

  ### `reminders`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `reminder_type` (text) - 'daily', 'weekly', 'monthly', 'achievement'
  - `title` (text)
  - `message` (text)
  - `scheduled_for` (timestamptz)
  - `shown_at` (timestamptz) - When shown to user
  - `dismissed_at` (timestamptz)

  ### `focus_sessions`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `question_id` (uuid, foreign key)
  - `duration_seconds` (integer) - Time spent solving
  - `completed` (boolean) - Was question solved
  - `session_date` (date)
  - `hour_of_day` (integer) - 0-23
  - `created_at` (timestamptz)

  ### `topic_stats`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `topic` (text)
  - `total_solved` (integer)
  - `total_attempted` (integer)
  - `mastery_percentage` (numeric) - (solved/attempted)*100
  - `last_solved_at` (timestamptz)
  - `created_at` (timestamptz)
  - UNIQUE(user_id, topic)
*/

CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  earned_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(user_id, achievement_type)
);

CREATE TABLE IF NOT EXISTS user_xp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp integer DEFAULT 0,
  level integer DEFAULT 1,
  easy_solved integer DEFAULT 0,
  medium_solved integer DEFAULT 0,
  hard_solved integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weekly_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  challenge_type text NOT NULL,
  target integer NOT NULL,
  completed integer DEFAULT 0,
  reward_xp integer DEFAULT 100,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start, challenge_type)
);

CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  shown_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  duration_seconds integer DEFAULT 0,
  completed boolean DEFAULT false,
  session_date date DEFAULT CURRENT_DATE,
  hour_of_day integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS topic_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  total_solved integer DEFAULT 0,
  total_attempted integer DEFAULT 0,
  mastery_percentage numeric DEFAULT 0,
  last_solved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, topic)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_user_id ON weekly_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_week ON weekly_challenges(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON reminders(user_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_date ON focus_sessions(user_id, session_date);
CREATE INDEX IF NOT EXISTS idx_topic_stats_user_id ON topic_stats(user_id);

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own xp"
  ON user_xp FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own challenges"
  ON weekly_challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own challenges"
  ON weekly_challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
  ON weekly_challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own focus sessions"
  ON focus_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own focus sessions"
  ON focus_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own topic stats"
  ON topic_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own topic stats"
  ON topic_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topic stats"
  ON topic_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);