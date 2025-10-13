/*
  # Multi-User Question Tracking Platform

  ## Overview
  Creates a comprehensive system for multiple users to track coding practice questions
  across platforms with authentication, topics, difficulty levels, and solved status.

  ## New Tables
  
  ### `platforms`
  - `id` (uuid, primary key) - Unique identifier for each platform
  - `user_id` (uuid, foreign key) - References auth.users(id) - owner of the platform
  - `name` (text, not null) - Platform name (e.g., "LeetCode", "Codeforces")
  - `created_at` (timestamptz) - Timestamp when platform was added
  
  ### `questions`
  - `id` (uuid, primary key) - Unique identifier for each question
  - `user_id` (uuid, foreign key) - References auth.users(id) - owner of the question
  - `platform_id` (uuid, foreign key) - References the platform this question belongs to
  - `question_no` (text, not null) - Question number or identifier
  - `link` (text, not null) - Direct URL to the question
  - `description` (text, not null) - Brief description of the problem
  - `difficulty` (text, not null) - Difficulty level: 'easy', 'medium', or 'hard'
  - `topic` (text, not null) - Topic/category (array, string, dp, etc.)
  - `solved` (boolean, default false) - Whether the question has been solved
  - `created_at` (timestamptz) - Timestamp when question was added

  ### `topics`
  - `id` (uuid, primary key) - Unique identifier for each topic
  - `user_id` (uuid, foreign key, nullable) - NULL for default topics, user_id for custom
  - `name` (text, not null) - Topic name (e.g., "Array", "Dynamic Programming")
  - `is_default` (boolean, default false) - Whether this is a default topic
  - `created_at` (timestamptz) - Timestamp when topic was created

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Users can only view and manage their own data
  - Authenticated users required for all operations
  - Default topics visible to all users

  ## Indexes
  - Index on user_id for all tables for efficient user data queries
  - Index on platform_id for efficient question lookups
*/

-- Create platforms table
CREATE TABLE IF NOT EXISTS platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_id uuid NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  question_no text NOT NULL,
  link text NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topic text NOT NULL,
  solved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_platforms_user_id ON platforms(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_platform_id ON questions(platform_id);
CREATE INDEX IF NOT EXISTS idx_topics_user_id ON topics(user_id);

-- Enable Row Level Security
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Platforms policies
CREATE POLICY "Users can view own platforms"
  ON platforms FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own platforms"
  ON platforms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own platforms"
  ON platforms FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own platforms"
  ON platforms FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Questions policies
CREATE POLICY "Users can view own questions"
  ON questions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own questions"
  ON questions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Topics policies
CREATE POLICY "Users can view default and own topics"
  ON topics FOR SELECT
  TO authenticated
  USING (is_default = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own topics"
  ON topics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can update own topics"
  ON topics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_default = false)
  WITH CHECK (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can delete own topics"
  ON topics FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND is_default = false);

-- Insert default topics
INSERT INTO topics (name, is_default) VALUES
  ('Array', true),
  ('String', true),
  ('Hash Table', true),
  ('Dynamic Programming', true),
  ('Math', true),
  ('Sorting', true),
  ('Greedy', true),
  ('Depth-First Search', true),
  ('Binary Search', true),
  ('Database', true),
  ('Breadth-First Search', true),
  ('Tree', true),
  ('Matrix', true),
  ('Two Pointers', true),
  ('Binary Tree', true),
  ('Bit Manipulation', true),
  ('Stack', true),
  ('Heap', true),
  ('Graph', true),
  ('Simulation', true)
ON CONFLICT DO NOTHING;