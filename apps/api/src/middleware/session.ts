import type { Context, Next } from 'hono';
import { getSession, COOKIE_NAME } from '../utils/auth.js';
import { db } from '../db/index.js';
import { users, learners } from '../db/schema.js';
import { eq } from 'drizzle-orm';

/** Reads Bearer token (Authorization header) or session cookie, validates, attaches session + actor */
export async function sessionMiddleware(c: Context, next: Next) {
  // Prefer Authorization: Bearer <token> (works across all proxy/preview environments)
  const authHeader = c.req.header('authorization') ?? '';
  let token: string | null = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  // Fall back to cookie for server-rendered or curl-style requests
  if (!token) {
    const cookieHeader = c.req.header('cookie') ?? '';
    token = parseCookie(cookieHeader, COOKIE_NAME);
  }

  if (!token) {
    c.set('session', null);
    c.set('actor', null);
    return next();
  }

  const session = await getSession(token);
  if (!session) {
    c.set('session', null);
    c.set('actor', null);
    return next();
  }

  c.set('session', session);

  if (session.role === 'parent') {
    const rows = await db.select().from(users).where(eq(users.id, session.ownerId)).limit(1);
    c.set('actor', rows[0] ?? null);
  } else {
    const rows = await db.select().from(learners).where(eq(learners.id, session.ownerId)).limit(1);
    c.set('actor', rows[0] ?? null);
  }

  return next();
}

/** Guard — requires any authenticated session */
export async function requireAuth(c: Context, next: Next) {
  if (!c.get('session')) return c.json({ error: 'Unauthorised' }, 401);
  return next();
}

/** Guard — requires parent role */
export async function requireParent(c: Context, next: Next) {
  const session = c.get('session');
  if (!session || session.role !== 'parent') return c.json({ error: 'Parents only' }, 403);
  return next();
}

/** Guard — requires learner role */
export async function requireLearner(c: Context, next: Next) {
  const session = c.get('session');
  if (!session || session.role !== 'learner') return c.json({ error: 'Learners only' }, 403);
  return next();
}

function parseCookie(header: string, name: string): string | null {
  for (const part of header.split(';')) {
    const [k, v] = part.trim().split('=');
    if (k === name) return v ?? null;
  }
  return null;
}
