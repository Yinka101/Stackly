import { Hono } from 'hono';
import { db } from '../db/index.js';
import { families, users, learners, resetTokens } from '../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import { hashSecret, createSession, deleteSession, sessionCookie, clearCookie, COOKIE_NAME } from '../utils/auth.js';
import { nanoid } from '../utils/nanoid.js';
import { sessionMiddleware, requireParent, requireAuth } from '../middleware/session.js';
import { randomBytes } from 'node:crypto';

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
    { ok: true, role: 'parent', familyId, token },
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
    { ok: true, role: 'parent', familyId: user.familyId, token },
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
    { ok: true, role: 'learner', learnerId: learner.id, band: learner.band, token },
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
  // Accept token from Bearer header or cookie
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

// ── POST /auth/forgot-password ───────────────────────────────────────────────
// Body: { email }
// Always returns 200 to avoid email enumeration.
router.post('/forgot-password', async (c) => {
  const body = await c.req.json().catch(() => ({})) as { email?: string };
  const email = (body.email ?? '').trim().toLowerCase();

  if (!email) return c.json({ ok: true }); // silent

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return c.json({ ok: true }); // silent — don't reveal account existence

  // Generate a secure 32-byte token, expires in 1 hour
  const token = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 60 * 60 * 1000;
  await db.insert(resetTokens).values({
    id: token,
    userId: user.id,
    expiresAt: new Date(expiresAt),
    createdAt: new Date(),
  });

  // Send email via Resend
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const appUrl = process.env.APP_URL ?? 'https://stackly-web.onrender.com';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Stackly <noreply@stackly.app>',
        to: email,
        subject: 'Reset your Stackly password',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h1 style="font-size:24px;color:#1a1a1a">Reset your password</h1>
            <p style="color:#555">Someone (hopefully you) asked to reset the password for your Stackly account.</p>
            <a href="${resetUrl}"
               style="display:inline-block;margin:16px 0;padding:12px 24px;background:#2d7a4f;color:#fff;
                      border-radius:8px;text-decoration:none;font-weight:bold">
              Reset password
            </a>
            <p style="color:#999;font-size:13px">This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>
          </div>
        `,
      }),
    });
  }

  console.log('[auth] password reset token created for user=%s (email sent=%s)', user.id, !!resendKey);
  return c.json({ ok: true });
});

// ── POST /auth/reset-password ────────────────────────────────────────────────
// Body: { token, password }
router.post('/reset-password', async (c) => {
  const body = await c.req.json().catch(() => ({})) as { token?: string; password?: string };
  const { token, password } = body;

  if (!token || !password) return c.json({ error: 'token and password required' }, 400);
  if (password.length < 8) return c.json({ error: 'Password must be at least 8 characters' }, 400);

  // Find valid, unused, non-expired token
  const [row] = await db
    .select()
    .from(resetTokens)
    .where(and(
      eq(resetTokens.id, token),
      gt(resetTokens.expiresAt, new Date()),
    ))
    .limit(1);

  if (!row) return c.json({ error: 'This link has expired or already been used. Please request a new one.' }, 400);
  if (row.usedAt) return c.json({ error: 'This link has already been used. Please request a new one.' }, 400);

  // Update password
  const passwordHash = hashSecret(password);
  await db.update(users).set({ passwordHash }).where(eq(users.id, row.userId));

  // Mark token used
  await db.update(resetTokens).set({ usedAt: new Date() }).where(eq(resetTokens.id, token));

  console.log('[auth] password reset completed for user=%s', row.userId);
  return c.json({ ok: true });
});

export default router;
