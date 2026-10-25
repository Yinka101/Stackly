/**
 * global-setup.ts — Warms the API before tests run.
 * On Render free tier, the first request can take 30–60 seconds.
 * We poll /health until it responds, then proceed.
 */

import { API_URL } from '../playwright.config';

export default async function globalSetup() {
  const MAX_WAIT_MS = 90_000;
  const POLL_MS = 3_000;
  const start = Date.now();

  console.log(`[setup] Warming API at ${API_URL}/health ...`);
  while (Date.now() - start < MAX_WAIT_MS) {
    try {
      const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(5_000) });
      if (res.ok) {
        console.log('[setup] API ready.');
        return;
      }
    } catch {
      // not ready yet
    }
    await new Promise(r => setTimeout(r, POLL_MS));
    process.stdout.write('.');
  }
  throw new Error(`[setup] API did not respond within ${MAX_WAIT_MS / 1000}s — aborting tests.`);
}
