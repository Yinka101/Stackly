import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Run DB migrations + seed before anything else
import './db/migrate.js';

import authRouter from './routes/auth.js';
import profilesRouter from './routes/profiles.js';
import lessonsRouter from './routes/lessons.js';
import portfolioRouter from './routes/portfolio.js';
import paypalRouter from './routes/paypal.js';
import aiRouter from './routes/ai.js';
import { sessionMiddleware } from './middleware/session.js';

const app = new Hono();

const allowedOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

app.use('*', logger());
app.use('*', cors({
  origin: allowedOrigin,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  credentials: true,
}));
app.use('*', sessionMiddleware);

app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }));

app.route('/auth', authRouter);
app.route('/profiles', profilesRouter);
app.route('/lessons', lessonsRouter);
app.route('/portfolio', portfolioRouter);
app.route('/paypal', paypalRouter);
app.route('/ai', aiRouter);

app.notFound((c) => c.json({ error: 'not found' }, 404));

const port = Number(process.env.PORT ?? 3001);
console.log(`[server] Hono listening on :${port}`);
serve({ fetch: app.fetch, port });
