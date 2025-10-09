export interface Platform {
  id: string;
  name: string;
  createdAt: Date;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  platformId: string;
  questionNo: string;
  link: string;
  description: string;
  difficulty: Difficulty;
  solved: boolean;
  createdAt: Date;
}
