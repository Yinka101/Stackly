import { Hono } from 'hono';
import { db } from '../db/index.js';
import { families, users, learners } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { hashSecret, createSession, deleteSession, sessionCookie, clearCookie, COOKIE_NAME } from '../utils/auth.js';
import { nanoid } from '../utils/nanoid.js';
import { sessionMiddleware, requireParent, requireAuth } from '../middleware/session.js';

const router = new Hono();
router.use('*', sessionMiddleware);

// ── POST /auth/register-parent ───────────────────────────────────────────────
// Body: { familyName, email, password, consentGiven }
router.post('/register-parent', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: 'Invalid JSON' }, 400);

  const { familyName, email, password, consentGiven } = body as Record<string, unknown>;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return c.json({ error: 'email and password required' }, 400);
  }
  if (!consentGiven) {
    return c.json({ error: 'Consent required' }, 400);
  }
  if (password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters' }, 400);
  }

  // Check uniqueness
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return c.json({ error: 'Email already registered' }, 409);

  const familyId = nanoid();
  const userId = nanoid();
  const now = new Date();

  await db.insert(families).values({
    id: familyId,
    name: String(familyName ?? `${email.split('@')[0]}'s Family`),
    createdAt: now,
  });

  await db.insert(users).values({
    id: userId,
    familyId,
    email,
    passwordHash: hashSecret(password),
    consentGiven: true,
    consentAt: now,
    createdAt: now,
  });

  const token = await createSession('parent', userId, familyId);
  return c.json(
    { ok: true, role: 'parent', familyId },
    200,
    { 'Set-Cookie': sessionCookie(token) },
  );
});

// ── POST /auth/login-parent ──────────────────────────────────────────────────
router.post('/login-parent', async (c) => {
  const { email, password } = await c.req.json().catch(() => ({})) as Record<string, string>;
  if (!email || !password) return c.json({ error: 'email and password required' }, 400);

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user || user.passwordHash !== hashSecret(password)) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const token = await createSession('parent', user.id, user.familyId);
  return c.json(
    { ok: true, role: 'parent', familyId: user.familyId },
    200,
    { 'Set-Cookie': sessionCookie(token) },
  );
});

// ── POST /auth/add-learner (parent only) ─────────────────────────────────────
// Body: { nickname, band, avatar, pin }
router.post('/add-learner', requireParent, async (c) => {
  const session = c.get('session')!;
  const { nickname, band, avatar, pin } = await c.req.json().catch(() => ({})) as Record<string, string>;

  if (!nickname || !band || !avatar || !pin) {
    return c.json({ error: 'nickname, band, avatar and pin required' }, 400);
  }
  if (!/^\d{4}$/.test(pin)) {
    return c.json({ error: 'PIN must be exactly 4 digits' }, 400);
  }
  if (!['sprouts', 'builders', 'investors'].includes(band)) {
    return c.json({ error: 'band must be sprouts, builders or investors' }, 400);
  }

  const learnerId = nanoid();
  await db.insert(learners).values({
    id: learnerId,
    familyId: session.familyId,
    nickname,
    band,
    avatar,
    pinHash: hashSecret(pin),
    practiceDollars: 1000,
    xp: 0,
    streakDays: 0,
    createdAt: new Date(),
  });

  return c.json({ ok: true, learnerId });
});

// ── GET /auth/learners (parent only) — list learners in family ───────────────
router.get('/learners', requireParent, async (c) => {
  const session = c.get('session')!;
  const rows = await db
    .select({
      id: learners.id,
      nickname: learners.nickname,
      band: learners.band,
      avatar: learners.avatar,
      xp: learners.xp,
      streakDays: learners.streakDays,
      practiceDollars: learners.practiceDollars,
    })
    .from(learners)
    .where(eq(learners.familyId, session.familyId));
  return c.json(rows);
});

// ── POST /auth/login-learner ─────────────────────────────────────────────────
// Body: { learnerId, pin }
router.post('/login-learner', async (c) => {
  const { learnerId, pin } = await c.req.json().catch(() => ({})) as Record<string, string>;
  if (!learnerId || !pin) return c.json({ error: 'learnerId and pin required' }, 400);

  const rows = await db.select().from(learners).where(eq(learners.id, learnerId)).limit(1);
  const learner = rows[0];
  if (!learner || learner.pinHash !== hashSecret(pin)) {
    return c.json({ error: 'Wrong PIN' }, 401);
  }

  const token = await createSession('learner', learner.id, learner.familyId);
  return c.json(
    { ok: true, role: 'learner', learnerId: learner.id, band: learner.band },
    200,
    { 'Set-Cookie': sessionCookie(token) },
  );
});

// ── GET /auth/me ─────────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (c) => {
  const session = c.get('session')!;
  const actor = c.get('actor');
  return c.json({ session: { role: session.role, familyId: session.familyId }, actor });
});

// ── POST /auth/logout ────────────────────────────────────────────────────────
router.post('/logout', async (c) => {
  const cookieHeader = c.req.header('cookie') ?? '';
  const token = cookieHeader.split(';').reduce<string | null>((acc, part) => {
    const [k, v] = part.trim().split('=');
    return k === COOKIE_NAME ? (v ?? null) : acc;
  }, null);
  if (token) await deleteSession(token);
  return c.json({ ok: true }, 200, { 'Set-Cookie': clearCookie() });
});

export default router;
