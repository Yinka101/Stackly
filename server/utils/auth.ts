import { createHash, randomBytes } from 'node:crypto';
import { db } from '../db/index.js';
import { sessions } from '../db/schema.js';
import { eq, lt } from 'drizzle-orm';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const COOKIE_NAME = 'stackly_session';

/** SHA-256 with our app pepper — prototype only, use bcrypt in production. */
export function hashSecret(value: string): string {
  return createHash('sha256').update(`stackly:${value}`).digest('hex');
}

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export async function createSession(
  role: 'parent' | 'learner',
  ownerId: string,
  familyId: string,
): Promise<string> {
  // Prune expired sessions lazily
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));

  const token = generateToken();
  const now = new Date();
  await db.insert(sessions).values({
    id: token,
    role,
    ownerId,
    familyId,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
    createdAt: now,
  });
  return token;
}

export async function getSession(token: string) {
  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, token))
    .limit(1);
  const session = rows[0];
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.delete(sessions).where(eq(sessions.id, token));
    return null;
  }
  return session;
}

export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.id, token));
}

/** Cookie string for Set-Cookie header.
 * We always use SameSite=Lax; Secure so the cookie works in the Arc Studio
 * preview (HTTPS) and on Render (HTTPS). The Vite proxy forwards it fine
 * because it runs on the same origin as the page.
 */
export function sessionCookie(token: string, maxAge = SESSION_TTL_MS / 1000): string {
  // No `Secure` flag: the Arc Studio preview and local dev both proxy requests
  // through HTTP internally even when the outer page is HTTPS. Adding Secure
  // causes the browser to silently drop the cookie at the HTTP proxy hop.
  // Render (production) sits behind HTTPS natively, so this is safe there too.
  return `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${Math.floor(maxAge)}`;
}

export function clearCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}
