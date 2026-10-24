export type Band = 'sprouts' | 'builders' | 'investors';
export type Topic = 'paypal' | 'investing';

export interface QuizQuestion {
  question: string;
  options: string[];       // exactly 3
  answer: number;          // 0-based index of correct option
  explanation: string;     // shown after answering — explains why
}

export interface TryIt {
  prompt: string;          // instruction shown to learner
  type: 'slider' | 'choice' | 'sort' | 'fill';
  // For 'choice': options + correct index
  options?: string[];
  correct?: number;
  // For 'slider': min, max, step, correctRange
  min?: number;
  max?: number;
  step?: number;
  correctMin?: number;
  correctMax?: number;
  feedbackRight: string;
  feedbackWrong: string;
}

export interface LessonVariant {
  band: Band;
  story: string;           // 2–4 min read, grade-appropriate paragraphs separated by \n\n
  tryIt: TryIt;
  quiz: QuizQuestion[];    // exactly 3
}

export interface Lesson {
  id: string;              // e.g. 'pp-01'
  pathId: string;          // 'paypal-basics' | 'investing-basics'
  order: number;           // 1-based position in path
  title: string;
  emoji: string;
  durationMins: number;
  xpReward: number;
  variants: Record<Band, LessonVariant>;
}

export interface LearningPath {
  id: string;
  title: string;
  emoji: string;
  description: string;
  lessons: Lesson[];
}
