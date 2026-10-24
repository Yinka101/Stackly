import { Hono } from 'hono';
import { db } from '../db/index.js';
import { lessonProgress, learners } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { PATHS, getLessonById, ALL_LESSONS } from '../data/lessons/index.js';
import type { Band } from '../data/lessons/types.js';
import { requireLearner } from '../middleware/session.js';
import { nanoid } from '../utils/nanoid.js';

const router = new Hono();

// ── GET /lessons/paths ───────────────────────────────────────────────────────
// Returns all paths with metadata and per-learner progress
router.get('/paths', requireLearner, async (c) => {
  const { actor } = c.var as { actor: { id: string; band: Band } };

  const done = await db
    .select({ lessonId: lessonProgress.lessonId, xpEarned: lessonProgress.xpEarned })
    .from(lessonProgress)
    .where(eq(lessonProgress.learnerId, actor.id));

  const doneSet = new Set(done.map((d) => d.lessonId));

  const paths = PATHS.map((path) => {
    const lessons = path.lessons.map((lesson, idx) => {
      const isUnlocked = idx === 0 || doneSet.has(path.lessons[idx - 1].id);
      const isDone = doneSet.has(lesson.id);
      const isCurrent = !isDone && isUnlocked;
      return {
        id: lesson.id,
        order: lesson.order,
        title: lesson.title,
        emoji: lesson.emoji,
        durationMins: lesson.durationMins,
        xpReward: lesson.xpReward,
        status: isDone ? 'done' : isCurrent ? 'current' : 'locked',
      };
    });
    const totalXp = path.lessons.reduce((s, l) => s + l.xpReward, 0);
    const earnedXp = done
      .filter((d) => path.lessons.some((l) => l.id === d.lessonId))
      .reduce((s, d) => s + d.xpEarned, 0);
    return {
      id: path.id,
      title: path.title,
      emoji: path.emoji,
      description: path.description,
      totalXp,
      earnedXp,
      lessons,
    };
  });

  return c.json(paths);
});

// ── GET /lessons/:id ─────────────────────────────────────────────────────────
// Returns full lesson content for the learner's band
router.get('/:id', requireLearner, async (c) => {
  const { actor } = c.var as { actor: { id: string; band: Band } };
  const lesson = getLessonById(c.req.param('id'));
  if (!lesson) return c.json({ error: 'lesson not found' }, 404);

  const variant = lesson.variants[actor.band] ?? lesson.variants.builders;

  // Check if already completed
  const existing = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.learnerId, actor.id), eq(lessonProgress.lessonId, lesson.id)))
    .limit(1);

  return c.json({
    id: lesson.id,
    pathId: lesson.pathId,
    order: lesson.order,
    title: lesson.title,
    emoji: lesson.emoji,
    durationMins: lesson.durationMins,
    xpReward: lesson.xpReward,
    alreadyCompleted: existing.length > 0,
    ...variant,
  });
});

// ── POST /lessons/:id/complete ───────────────────────────────────────────────
router.post('/:id/complete', requireLearner, async (c) => {
  const { actor } = c.var as { actor: { id: string; band: Band } };
  const lessonId = c.req.param('id');
  const lesson = getLessonById(lessonId);
  if (!lesson) return c.json({ error: 'lesson not found' }, 404);

  // Idempotent — do not award XP twice
  const existing = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.learnerId, actor.id), eq(lessonProgress.lessonId, lessonId)))
    .limit(1);

  if (existing.length > 0) {
    return c.json({ ok: true, xpEarned: 0, alreadyCompleted: true });
  }

  await db.insert(lessonProgress).values({
    id: nanoid(),
    learnerId: actor.id,
    lessonId,
    completedAt: new Date(),
    xpEarned: lesson.xpReward,
  });

  // Update learner XP and streak
  const todayStr = new Date().toISOString().slice(0, 10);
  const learnerRow = await db
    .select()
    .from(learners)
    .where(eq(learners.id, actor.id))
    .limit(1);

  if (learnerRow.length) {
    const l = learnerRow[0];
    const lastDate = l.lastActiveDate ?? '';
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = lastDate === yesterday ? l.streakDays + 1
      : lastDate === todayStr ? l.streakDays
      : 1;

    await db
      .update(learners)
      .set({ xp: l.xp + lesson.xpReward, streakDays: newStreak, lastActiveDate: todayStr })
      .where(eq(learners.id, actor.id));
  }

  // Check for newly earned badges
  const allProgress = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(eq(lessonProgress.learnerId, actor.id));

  const completedCount = allProgress.length;
  const badges = computeBadges(completedCount, lessonId);

  return c.json({ ok: true, xpEarned: lesson.xpReward, newBadges: badges });
});

// ── Badge logic ──────────────────────────────────────────────────────────────
const PATH_COMPLETE_BADGES: Record<string, { id: string; label: string; emoji: string }> = {
  'pp-06': { id: 'paypal-graduate', label: 'PayPal Graduate', emoji: '🎓' },
  'inv-08': { id: 'investor-mindset', label: 'Investor Mindset', emoji: '🧠' },
};

const XP_BADGES: { threshold: number; id: string; label: string; emoji: string }[] = [
  { threshold: 1,   id: 'first-step',    label: 'First Step',    emoji: '👣' },
  { threshold: 5,   id: 'getting-going', label: 'Getting Going', emoji: '🏃' },
  { threshold: 7,   id: 'halfway',       label: 'Halfway',       emoji: '🌗' },
  { threshold: 14,  id: 'full-circle',   label: 'Full Circle',   emoji: '🌕' },
];

function computeBadges(completedCount: number, justCompletedId: string) {
  const badges: { id: string; label: string; emoji: string }[] = [];
  const countBadge = XP_BADGES.find((b) => b.threshold === completedCount);
  if (countBadge) badges.push(countBadge);
  const pathBadge = PATH_COMPLETE_BADGES[justCompletedId];
  if (pathBadge) badges.push(pathBadge);
  return badges;
}

export default router;
