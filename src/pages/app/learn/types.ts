export type LessonStatus = 'locked' | 'current' | 'done';

export interface PathLesson {
  id: string;
  order: number;
  title: string;
  emoji: string;
  durationMins: number;
  xpReward: number;
  status: LessonStatus;
}

export interface PathSummary {
  id: string;
  title: string;
  emoji: string;
  description: string;
  totalXp: number;
  earnedXp: number;
  lessons: PathLesson[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface TryIt {
  prompt: string;
  type: 'slider' | 'choice' | 'sort' | 'fill';
  options?: string[];
  correct?: number;
  min?: number; max?: number; step?: number;
  correctMin?: number; correctMax?: number;
  feedbackRight: string;
  feedbackWrong: string;
}

export interface LessonDetail {
  id: string;
  pathId: string;
  order: number;
  title: string;
  emoji: string;
  durationMins: number;
  xpReward: number;
  alreadyCompleted: boolean;
  band: string;
  story: string;
  tryIt: TryIt;
  quiz: QuizQuestion[];
}

export interface Badge { id: string; label: string; emoji: string; }
export interface CompleteResult { ok: boolean; xpEarned: number; newBadges: Badge[]; alreadyCompleted?: boolean; }
