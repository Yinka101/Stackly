import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Run DB migrations + seed before anything else
try {
  await import('./db/migrate.js');
  console.log('[server] DB migrated ok');
} catch (e) {
  console.error('[server] DB migration failed:', e);
  process.exit(1);
}

import authRouter from './routes/auth.js';
import profilesRouter from './routes/profiles.js';
import lessonsRouter from './routes/lessons.js';
import portfolioRouter from './routes/portfolio.js';
import paypalRouter from './routes/paypal.js';
import aiRouter from './routes/ai.js';
import investRouter from './routes/invest.js';
import agentRouter from './routes/agent.js';
import familyRouter from './routes/family.js';
import { sessionMiddleware } from './middleware/session.js';

const app = new Hono();

// CORS — in production allow same origin (no separate frontend host)
const rawOrigin = process.env.CORS_ORIGIN;
const allowedOrigins = rawOrigin ? rawOrigin.split(',').map(o => o.trim()) : null;

app.use('*', logger());
app.use('*', cors({
  origin: (origin) => {
    if (!allowedOrigins) return origin ?? '*';
    if (!origin) return allowedOrigins[0];
    return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Cookie', 'Authorization'],
  exposeHeaders: ['Set-Cookie'],
  credentials: true,
}));
app.use('*', sessionMiddleware);

// ── API routes ────────────────────────────────────────────────────────────────
app.get('/health', (c) => c.json({ ok: true, ts: Date.now(), env: process.env.NODE_ENV }));

app.route('/auth',      authRouter);
app.route('/profiles',  profilesRouter);
app.route('/lessons',   lessonsRouter);
app.route('/portfolio', portfolioRouter);
app.route('/paypal',    paypalRouter);
app.route('/ai',        aiRouter);
app.route('/invest',    investRouter);
app.route('/agent',     agentRouter);
app.route('/family',    familyRouter);

// ── Serve built frontend (dist/) — SPA fallback to index.html ────────────────
// In dev this block is skipped (dist/ doesn't exist); Vite dev server handles it.
const distPath = join(process.cwd(), 'dist');
if (existsSync(distPath)) {
  // Serve static assets (JS, CSS, images, config.json)
  app.use('/*', serveStatic({ root: './dist' }));

  // SPA fallback — any route not matched above returns index.html
  const indexHtml = readFileSync(join(distPath, 'index.html'), 'utf-8');
  app.get('/*', (c) => c.html(indexHtml));

  console.log('[server] Serving frontend from ./dist');
} else {
  console.log('[server] No ./dist found — frontend served by Vite dev server');
}

app.onError((err, c) => {
  console.error('[server] unhandled error:', err.message);
  return c.json({ error: 'internal server error' }, 500);
});

// Render sets PORT dynamically — never hardcode it in production
const port = Number(process.env.PORT ?? 3001);
console.log(`[server] Hono listening on :${port}`);
serve({ fetch: app.fetch, port, hostname: '0.0.0.0' });
