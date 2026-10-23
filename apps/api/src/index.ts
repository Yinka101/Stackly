import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({ origin: '*' }));

app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }));

app.notFound((c) => c.json({ error: 'not found' }, 404));

const port = Number(process.env.PORT ?? 3001);
console.log(`[api] listening on :${port}`);
serve({ fetch: app.fetch, port });
