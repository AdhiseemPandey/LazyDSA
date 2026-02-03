/*
  # Add Daily Goals and Time Tracking

  ## Overview
  Adds tables to support daily goal setting, completion tracking, and time spent on questions.

  ## New Tables

  ### `daily_goals`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - References auth.users(id)
  - `goal_date` (date) - Date for the goal
  - `target_questions` (integer) - Number of questions to solve
  - `completed_questions` (integer, default 0) - Questions solved today
  - `is_completed` (boolean, default false) - Whether goal is met
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `question_sessions`
  - `id` (uuid, primary key)
  - `question_id` (uuid, foreign key) - References questions(id)
  - `user_id` (uuid, foreign key) - References auth.users(id)
  - `time_spent_seconds` (integer, default 0) - Time spent on this attempt
  - `started_at` (timestamptz)
  - `ended_at` (timestamptz, nullable)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
*/

-- Create daily_goals table
CREATE TABLE IF NOT EXISTS daily_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_date date NOT NULL,
  target_questions integer NOT NULL DEFAULT 5,
  completed_questions integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, goal_date)
);

-- Create question_sessions table for time tracking
CREATE TABLE IF NOT EXISTS question_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  time_spent_seconds integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_id ON daily_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_goals_date ON daily_goals(goal_date);
CREATE INDEX IF NOT EXISTS idx_question_sessions_user_id ON question_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_question_sessions_question_id ON question_sessions(question_id);

-- Enable RLS
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sessions ENABLE ROW LEVEL SECURITY;

-- Daily goals policies
CREATE POLICY "Users can view own daily goals"
  ON daily_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily goals"
  ON daily_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily goals"
  ON daily_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily goals"
  ON daily_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Question sessions policies
CREATE POLICY "Users can view own question sessions"
  ON question_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own question sessions"
  ON question_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own question sessions"
  ON question_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own question sessions"
  ON question_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);