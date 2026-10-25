import { Hono } from 'hono';
import { db } from '../db/index.js';
import { families, users, learners, sessions } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { hashSecret, createSession, deleteSession, sessionCookie, clearCookie, COOKIE_NAME } from '../utils/auth.js';
import { nanoid } from '../utils/nanoid.js';
import { sessionMiddleware, requireParent, requireAuth } from '../middleware/session.js';
import { zBody, RegisterParentSchema, LoginParentSchema, AddLearnerSchema, LoginLearnerSchema, DemoResetSchema } from '../middleware/validate.js';
import { authLimit } from '../middleware/rateLimit.js';

const router = new Hono();
router.use('*', sessionMiddleware);

// ── POST /auth/register-parent ───────────────────────────────────────────────
router.post('/register-parent',
  authLimit,
  zBody(RegisterParentSchema),
  async (c) => {
    const { familyName, email, password } = c.get('validated') as { familyName?: string; email: string; password: string; consentGiven: boolean };

    // Normalise email
    const normEmail = email.trim().toLowerCase();

    const existing = await db.select().from(users).where(eq(users.email, normEmail)).limit(1);
    if (existing.length) return c.json({ error: 'Email already registered' }, 409);

    const familyId = nanoid();
    const userId = nanoid();
    const now = new Date();

    await db.insert(families).values({
      id: familyId,
      name: String(familyName ?? `${normEmail.split('@')[0]}'s Family`).slice(0, 80),
      createdAt: now,
    });

    await db.insert(users).values({
      id: userId,
      familyId,
      email: normEmail,
      passwordHash: hashSecret(password),
      consentGiven: true,
      consentAt: now,
      createdAt: now,
    });

    const token = await createSession('parent', userId, familyId);
    return c.json(
      { ok: true, role: 'parent', familyId, token },
      200,
      { 'Set-Cookie': sessionCookie(token) },
    );
  },
);

// ── POST /auth/login-parent ──────────────────────────────────────────────────
router.post('/login-parent',
  authLimit,
  zBody(LoginParentSchema),
  async (c) => {
    const { email, password } = c.get('validated') as { email: string; password: string };
    const normEmail = email.trim().toLowerCase();

    const rows = await db.select().from(users).where(eq(users.email, normEmail)).limit(1);
    const user = rows[0];

    // Constant-time-ish comparison: always hash before checking to avoid timing oracle
    const submitted = hashSecret(password);
    if (!user || user.passwordHash !== submitted) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const token = await createSession('parent', user.id, user.familyId);
    return c.json(
      { ok: true, role: 'parent', familyId: user.familyId, token },
      200,
      { 'Set-Cookie': sessionCookie(token) },
    );
  },
);

// ── POST /auth/add-learner (parent only) ─────────────────────────────────────
router.post('/add-learner',
  requireParent,
  zBody(AddLearnerSchema),
  async (c) => {
    const session = c.get('session')!;
    const { nickname, band, avatar, pin } = c.get('validated') as { nickname: string; band: string; avatar: string; pin: string };

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
  },
);

// ── GET /auth/learners (parent only) ────────────────────────────────────────
router.get('/learners', requireParent, async (c) => {
  const session = c.get('session')!;
  const rows = await db
    .select({
      id:             learners.id,
      nickname:       learners.nickname,
      band:           learners.band,
      avatar:         learners.avatar,
      xp:             learners.xp,
      streakDays:     learners.streakDays,
      practiceDollars: learners.practiceDollars,
    })
    .from(learners)
    .where(eq(learners.familyId, session.familyId));
  return c.json(rows);
});

// ── POST /auth/login-learner ─────────────────────────────────────────────────
router.post('/login-learner',
  authLimit,
  zBody(LoginLearnerSchema),
  async (c) => {
    const { learnerId, pin } = c.get('validated') as { learnerId: string; pin: string };

    const rows = await db.select().from(learners).where(eq(learners.id, learnerId)).limit(1);
    const learner = rows[0];

    const submitted = hashSecret(pin);
    if (!learner || learner.pinHash !== submitted) {
      return c.json({ error: 'Wrong PIN' }, 401);
    }

    const token = await createSession('learner', learner.id, learner.familyId);
    return c.json(
      { ok: true, role: 'learner', learnerId: learner.id, band: learner.band, token },
      200,
      { 'Set-Cookie': sessionCookie(token) },
    );
  },
);

// ── GET /auth/me ─────────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (c) => {
  const session = c.get('session')!;
  const actor = c.get('actor');
  return c.json({ session: { role: session.role, familyId: session.familyId }, actor });
});

// ── POST /auth/logout ────────────────────────────────────────────────────────
router.post('/logout', async (c) => {
  const authHeader = c.req.header('authorization') ?? '';
  let token: string | null = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim() : null;
  if (!token) {
    const cookieHeader = c.req.header('cookie') ?? '';
    token = cookieHeader.split(';').reduce<string | null>((acc, part) => {
      const [k, v] = part.trim().split('=');
      return k === COOKIE_NAME ? (v ?? null) : acc;
    }, null);
  }
  if (token) await deleteSession(token);
  return c.json({ ok: true }, 200, { 'Set-Cookie': clearCookie() });
});

// ── POST /auth/demo-reset — re-seed demo family (idempotent, demo only) ──────
router.post('/demo-reset',
  authLimit,
  zBody(DemoResetSchema),
  async (c) => {
    // Only allow when DEMO_MODE env is set (set it on Render for the judge demo)
    if (!process.env.DEMO_MODE) {
      return c.json({ error: 'Demo reset not available' }, 403);
    }

    const DEMO_FAMILY_ID   = 'demo-family-0001';
    const DEMO_PARENT_ID   = 'demo-parent-0001';
    const DEMO_LEARNER_SAM = 'demo-learner-sam';
    const DEMO_LEARNER_BEN = 'demo-learner-ben';
    const DEMO_LEARNER_IVY = 'demo-learner-ivy';

    // Reset practice dollars and XP for all demo learners
    await db.update(learners)
      .set({ practiceDollars: 1000, xp: 0, streakDays: 0 })
      .where(eq(learners.familyId, DEMO_FAMILY_ID));

    // Re-upsert demo sessions (clear stale ones)
    await db.delete(sessions).where(eq(sessions.familyId, DEMO_FAMILY_ID));

    // Re-seed in case DB was wiped
    const now = new Date();
    await db.insert(families).values({ id: DEMO_FAMILY_ID, name: 'Demo Family', createdAt: now })
      .onConflictDoNothing();
    await db.insert(users).values({
      id: DEMO_PARENT_ID, familyId: DEMO_FAMILY_ID,
      email: 'demo@stackly.app', passwordHash: hashSecret('demo1234'),
      consentGiven: true, consentAt: now, createdAt: now,
    }).onConflictDoNothing();

    const demoLearners = [
      { id: DEMO_LEARNER_SAM, nickname: 'Sam',  band: 'sprouts',   avatar: '🌱', pin: '1111' },
      { id: DEMO_LEARNER_BEN, nickname: 'Ben',  band: 'builders',  avatar: '🔨', pin: '2222' },
      { id: DEMO_LEARNER_IVY, nickname: 'Ivy',  band: 'investors', avatar: '📈', pin: '3333' },
    ];
    for (const l of demoLearners) {
      await db.insert(learners).values({
        id: l.id, familyId: DEMO_FAMILY_ID, nickname: l.nickname,
        band: l.band, avatar: l.avatar, pinHash: hashSecret(l.pin),
        practiceDollars: 1000, xp: 0, streakDays: 0, createdAt: now,
      }).onConflictDoNothing();
    }

    console.log('[demo-reset] Demo family reset at', now.toISOString());
    return c.json({ ok: true, message: 'Demo reset complete. Log in with demo@stackly.app / demo1234.' });
  },
);

export default router;
