/*
  # Add Notes, Bookmarks, and Sharing Features

  ## Overview
  Adds support for question notes, bookmarks, sharing, and collaborative features.

  ## New Tables

  ### `question_notes`
  - `id` (uuid, primary key)
  - `question_id` (uuid, foreign key)
  - `user_id` (uuid, foreign key)
  - `note_text` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `question_bookmarks`
  - `id` (uuid, primary key)
  - `question_id` (uuid, foreign key)
  - `user_id` (uuid, foreign key)
  - `created_at` (timestamptz)

  ### `shared_progress`
  - `id` (uuid, primary key)
  - `owner_id` (uuid, foreign key) - User sharing
  - `shared_with_email` (text) - Email of person to share with
  - `access_level` (text) - 'view' or 'edit'
  - `created_at` (timestamptz)

  ### `question_imports`
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `platform_id` (uuid, foreign key)
  - `original_url` (text) - Original link
  - `imported_from` (text) - Source (leetcode, codeforces, etc)
  - `created_at` (timestamptz)
*/

-- Create question_notes table
CREATE TABLE IF NOT EXISTS question_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_text text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- Create question_bookmarks table
CREATE TABLE IF NOT EXISTS question_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- Create shared_progress table
CREATE TABLE IF NOT EXISTS shared_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email text NOT NULL,
  access_level text DEFAULT 'view' CHECK (access_level IN ('view', 'edit')),
  created_at timestamptz DEFAULT now()
);

-- Create question_imports table
CREATE TABLE IF NOT EXISTS question_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_id uuid NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  original_url text NOT NULL,
  imported_from text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_question_notes_question_id ON question_notes(question_id);
CREATE INDEX IF NOT EXISTS idx_question_notes_user_id ON question_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_question_bookmarks_question_id ON question_bookmarks(question_id);
CREATE INDEX IF NOT EXISTS idx_question_bookmarks_user_id ON question_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_progress_owner_id ON shared_progress(owner_id);
CREATE INDEX IF NOT EXISTS idx_shared_progress_email ON shared_progress(shared_with_email);
CREATE INDEX IF NOT EXISTS idx_question_imports_user_id ON question_imports(user_id);

-- Enable RLS
ALTER TABLE question_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_imports ENABLE ROW LEVEL SECURITY;

-- Question notes policies
CREATE POLICY "Users can view own notes"
  ON question_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes"
  ON question_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON question_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON question_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Question bookmarks policies
CREATE POLICY "Users can view own bookmarks"
  ON question_bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks"
  ON question_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON question_bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Shared progress policies
CREATE POLICY "Users can view own shares"
  ON shared_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own shares"
  ON shared_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own shares"
  ON shared_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Question imports policies
CREATE POLICY "Users can view own imports"
  ON question_imports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own imports"
  ON question_imports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);