/**
 * rateLimit.ts — Simple in-memory sliding-window rate limiter.
 *
 * Usage:
 *   import { rateLimit } from '../middleware/rateLimit.js';
 *   router.post('/login-parent', rateLimit({ max: 10, windowMs: 60_000 }), ...);
 */

import type { Context, Next } from 'hono';

interface Options {
  /** Max requests per window. */
  max: number;
  /** Window size in milliseconds. */
  windowMs: number;
  /** Key extractor — defaults to IP. */
  keyFn?: (c: Context) => string;
  /** Message returned on 429. */
  message?: string;
}

interface Window {
  count:    number;
  resetAt:  number;
}

const stores = new Map<string, Map<string, Window>>();

/** One store per (max, windowMs) pair so different limits don't share state. */
function getStore(id: string) {
  if (!stores.has(id)) stores.set(id, new Map());
  return stores.get(id)!;
}

// Clean up expired entries periodically so memory doesn't grow unboundedly.
setInterval(() => {
  const now = Date.now();
  for (const store of stores.values()) {
    for (const [k, w] of store) {
      if (now >= w.resetAt) store.delete(k);
    }
  }
}, 60_000);

export function rateLimit(opts: Options) {
  const { max, windowMs, keyFn, message = 'Too many requests — please wait and try again.' } = opts;
  const storeId = `${max}:${windowMs}`;
  const store = getStore(storeId);

  return (c: Context, next: Next) => {
    const key = keyFn
      ? keyFn(c)
      : (c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? 'unknown');

    const now = Date.now();
    const existing = store.get(key);

    if (!existing || now >= existing.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (existing.count >= max) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
      c.header('Retry-After', String(retryAfter));
      c.header('X-RateLimit-Limit', String(max));
      c.header('X-RateLimit-Remaining', '0');
      return c.json({ error: message, retryAfter }, 429);
    }

    existing.count += 1;
    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(max - existing.count));
    return next();
  };
}

/** Pre-built limiters for common cases. */
export const authLimit     = rateLimit({ max: 10,  windowMs: 60_000,  message: 'Too many sign-in attempts. Wait 1 minute.' });
export const apiLimit      = rateLimit({ max: 120, windowMs: 60_000 });
export const aiLimit       = rateLimit({ max: 20,  windowMs: 60_000,  message: 'AI rate limit reached. Wait 1 minute.' });
export const webhookLimit  = rateLimit({ max: 100, windowMs: 10_000 });
