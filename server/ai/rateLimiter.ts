/**
 * In-memory token-bucket rate limiter.
 * Keyed by `${learnerId}:${bucket}` so chat, quiz, and agent have independent limits.
 */

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const WINDOW_MS = 60_000; // 1 minute

// Per-bucket caps
const CAPS: Record<string, number> = {
  chat:  60, // chat stream — generous, each message = 1 token
  quiz:  20,
  review: 10,
  agent: 15, // agent run — each run may call OpenAI multiple times server-side
  default: 60,
};

const store = new Map<string, Bucket>();

export function checkRateLimit(
  learnerId: string,
  bucket: string = 'default',
): { allowed: boolean; retryAfterMs: number } {
  const rate = CAPS[bucket] ?? CAPS.default;
  const key  = `${learnerId}:${bucket}`;
  const now  = Date.now();

  let b = store.get(key);
  if (!b) {
    b = { tokens: rate - 1, lastRefill: now };
    store.set(key, b);
    return { allowed: true, retryAfterMs: 0 };
  }

  // Proportional refill
  const elapsed = now - b.lastRefill;
  const refill  = Math.floor((elapsed / WINDOW_MS) * rate);
  if (refill > 0) {
    b.tokens    = Math.min(rate, b.tokens + refill);
    b.lastRefill = now;
  }

  if (b.tokens <= 0) {
    return { allowed: false, retryAfterMs: Math.max(0, WINDOW_MS - elapsed) };
  }

  b.tokens -= 1;
  return { allowed: true, retryAfterMs: 0 };
}

// Prune stale buckets every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS * 5;
  for (const [id, b] of store) {
    if (b.lastRefill < cutoff) store.delete(id);
  }
}, 5 * 60_000);
