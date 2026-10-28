/**
 * db/index.ts
 * -----------
 * Uses Turso (libsql) when TURSO_DATABASE_URL + TURSO_AUTH_TOKEN are set
 * (production on Render). Falls back to local bun:sqlite for sandbox dev.
 */
import * as schema from './schema.js';
export * from './schema.js';
export { agentPlans, agentAuditLog, familySettings } from './schema.js';

const tursoUrl   = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

let _db: ReturnType<typeof import('drizzle-orm/libsql').drizzle> |
         ReturnType<typeof import('drizzle-orm/bun-sqlite').drizzle>;

if (tursoUrl && tursoToken) {
  // ── Turso (production) ─────────────────────────────────────────────────────
  const { createClient } = await import('@libsql/client');
  const { drizzle }      = await import('drizzle-orm/libsql');
  const client = createClient({ url: tursoUrl, authToken: tursoToken });
  _db = drizzle(client, { schema });
  console.log('[db] Using Turso:', tursoUrl.replace(/\/\/.*@/, '//***@'));
} else {
  // ── Local bun:sqlite (sandbox / development) ───────────────────────────────
  const { Database } = await import('bun:sqlite');
  const { drizzle }  = await import('drizzle-orm/bun-sqlite');
  const dbPath = process.env.DATABASE_URL ?? './stackly.db';
  const sqlite = new Database(dbPath, { create: true });
  sqlite.exec('PRAGMA journal_mode = WAL;');
  _db = drizzle(sqlite, { schema });
  console.log('[db] Using local SQLite:', dbPath);
}

export const db = _db;
