import { paypalBasics } from './paypal-basics.js';
import { investingBasicsA } from './investing-basics-a.js';
import { investingBasicsB } from './investing-basics-b.js';
import type { LearningPath, Lesson } from './types.js';

// Merge the two investing-basics slices into one path
const investingBasics: LearningPath = {
  ...investingBasicsA,
  lessons: [...investingBasicsA.lessons, ...investingBasicsB.lessons],
};

export const PATHS: LearningPath[] = [paypalBasics, investingBasics];

export const ALL_LESSONS: Lesson[] = PATHS.flatMap((p) => p.lessons);

export function getLessonById(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}

export function getPathById(id: string): LearningPath | undefined {
  return PATHS.find((p) => p.id === id);
}

export type { LearningPath, Lesson };
export type { Band, LessonVariant, QuizQuestion, TryIt } from './types.js';
