import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

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
import { sessionMiddleware } from './middleware/session.js';

const app = new Hono();

// Accept any origin in dev; restrict in production via CORS_ORIGIN env var
const rawOrigin = process.env.CORS_ORIGIN;
const allowedOrigins = rawOrigin
  ? rawOrigin.split(',').map(o => o.trim())
  : null; // null = allow all (dev mode)

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

app.get('/health', (c) => c.json({ ok: true, ts: Date.now(), env: process.env.NODE_ENV }));

app.route('/auth', authRouter);
app.route('/profiles', profilesRouter);
app.route('/lessons', lessonsRouter);
app.route('/portfolio', portfolioRouter);
app.route('/paypal', paypalRouter);
app.route('/ai', aiRouter);
app.route('/invest', investRouter);

app.notFound((c) => c.json({ error: 'not found' }, 404));
app.onError((err, c) => {
  console.error('[server] unhandled error:', err.message);
  return c.json({ error: 'internal server error' }, 500);
});

const port = Number(process.env.PORT ?? 3001);
console.log(`[server] Hono listening on :${port}`);
serve({ fetch: app.fetch, port });
