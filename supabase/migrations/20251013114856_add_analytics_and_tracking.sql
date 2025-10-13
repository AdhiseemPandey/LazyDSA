/*
  # Add Analytics and Progress Tracking

  ## Overview
  Adds fields and tables to support progress tracking, streaks, and analytics features.

  ## Changes to Existing Tables
  
  ### `questions` table modifications
  - Add `solved_at` (timestamptz, nullable) - Timestamp when question was marked as solved
  - This allows tracking when questions were solved for progress charts

  ## New Tables
  
  ### `user_stats`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users(id)
  - `current_streak` (integer, default 0) - Current daily solving streak
  - `longest_streak` (integer, default 0) - Longest streak achieved
  - `last_activity_date` (date, nullable) - Last date user solved a question
  - `total_solved` (integer, default 0) - Total questions solved
  - `updated_at` (timestamptz) - Last update timestamp
  
  ## Security
  - Enable RLS on new tables
  - Users can only view and update their own stats

  ## Notes
  - Existing questions will have NULL for solved_at initially
  - Stats will be calculated from existing data on first load
*/

-- Add solved_at column to questions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'solved_at'
  ) THEN
    ALTER TABLE questions ADD COLUMN solved_at timestamptz;
  END IF;
END $$;

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date,
  total_solved integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Create index on user_id for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Enable Row Level Security
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- User stats policies
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update user stats when question is marked as solved
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when solved status changes from false to true
  IF NEW.solved = true AND (OLD.solved = false OR OLD.solved IS NULL) THEN
    -- Set solved_at if not already set
    IF NEW.solved_at IS NULL THEN
      NEW.solved_at = now();
    END IF;
    
    -- Insert or update user stats
    INSERT INTO user_stats (user_id, total_solved, last_activity_date, updated_at)
    VALUES (
      NEW.user_id,
      1,
      CURRENT_DATE,
      now()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      total_solved = user_stats.total_solved + 1,
      last_activity_date = CURRENT_DATE,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic stats update
DROP TRIGGER IF EXISTS trigger_update_user_stats ON questions;
CREATE TRIGGER trigger_update_user_stats
  BEFORE UPDATE OF solved ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();