export interface Platform {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  user_id: string;
  platform_id: string;
  question_no: string;
  link: string;
  description: string;
  difficulty: Difficulty;
  topic: string;
  solved: boolean;
  solved_at?: string;
  created_at: string;
}

export interface Topic {
  id: string;
  user_id: string | null;
  name: string;
  is_default: boolean;
  created_at: string;
}
