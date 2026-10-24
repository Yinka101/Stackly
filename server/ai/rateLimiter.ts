/**
 * In-memory token-bucket rate limiter per learnerId.
 * 20 requests per minute per learner.
 * No external dependency needed for a hackathon — swap for Redis in production.
 */

interface Bucket {
  tokens: number;
  lastRefill: number; // ms timestamp
}

const RATE = 20;         // max requests per window
const WINDOW_MS = 60_000; // 1 minute

const buckets = new Map<string, Bucket>();

export function checkRateLimit(learnerId: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  let bucket = buckets.get(learnerId);

  if (!bucket) {
    bucket = { tokens: RATE - 1, lastRefill: now };
    buckets.set(learnerId, bucket);
    return { allowed: true, retryAfterMs: 0 };
  }

  // Refill proportionally to elapsed time
  const elapsed = now - bucket.lastRefill;
  const refill = Math.floor((elapsed / WINDOW_MS) * RATE);
  if (refill > 0) {
    bucket.tokens = Math.min(RATE, bucket.tokens + refill);
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    const retryAfterMs = WINDOW_MS - elapsed;
    return { allowed: false, retryAfterMs: Math.max(0, retryAfterMs) };
  }

  bucket.tokens -= 1;
  return { allowed: true, retryAfterMs: 0 };
}

// Prune stale buckets every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS * 5;
  for (const [id, bucket] of buckets) {
    if (bucket.lastRefill < cutoff) buckets.delete(id);
  }
}, 5 * 60_000);
