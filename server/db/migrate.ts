/**
 * migrate.ts — runs at startup.
 * Creates all tables, seeds demo family, and applies idempotent column fixes.
 * Works with both Turso (libsql) in production and bun:sqlite in dev.
 */
import { createHash } from 'node:crypto';

// ── Pick driver ───────────────────────────────────────────────────────────────
const tursoUrl   = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

type SimpleClient = {
  execute: (sql: string | { sql: string; args: unknown[] }) => Promise<{ rows: Record<string, unknown>[] }>;
  close?: () => void;
};

let client: SimpleClient;

if (tursoUrl && tursoToken) {
  const { createClient } = await import('@libsql/client');
  const c = createClient({ url: tursoUrl, authToken: tursoToken });
  client = {
    execute: async (q) => {
      if (typeof q === 'string') return c.execute(q) as Promise<{ rows: Record<string, unknown>[] }>;
      return c.execute(q) as Promise<{ rows: Record<string, unknown>[] }>;
    },
  };
  console.log('[migrate] Using Turso');
} else {
  const { Database } = await import('bun:sqlite');
  const dbPath = process.env.DATABASE_URL ?? './stackly.db';
  const sqlite = new Database(dbPath, { create: true });
  sqlite.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  client = {
    execute: async (q) => {
      if (typeof q === 'string') {
        sqlite.exec(q);
        return { rows: [] };
      }
      // bun:sqlite positional args
      const stmt = sqlite.prepare(q.sql);
      const rows = stmt.all(...(q.args as unknown[])) as Record<string, unknown>[];
      return { rows };
    },
    close: () => sqlite.close(),
  };
  console.log('[migrate] Using local SQLite:', dbPath);
}

// ── DDL ───────────────────────────────────────────────────────────────────────
// Split into individual statements — libsql does not support multi-statement exec
const DDL = [
  `CREATE TABLE IF NOT EXISTS families (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL REFERENCES families(id),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    consent_given INTEGER NOT NULL DEFAULT 0,
    consent_at INTEGER,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS learners (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL REFERENCES families(id),
    nickname TEXT NOT NULL,
    band TEXT NOT NULL,
    avatar TEXT NOT NULL,
    pin_hash TEXT NOT NULL,
    practice_dollars INTEGER NOT NULL DEFAULT 1000,
    xp INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 0,
    last_active_date TEXT,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    family_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS reset_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    expires_at INTEGER NOT NULL,
    used_at INTEGER,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS holdings (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL REFERENCES learners(id),
    ticker TEXT NOT NULL,
    shares REAL NOT NULL DEFAULT 0,
    avg_cost_cents INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL REFERENCES learners(id),
    ticker TEXT NOT NULL,
    side TEXT NOT NULL,
    shares REAL NOT NULL,
    price_cents INTEGER NOT NULL,
    reflection TEXT,
    replay_date TEXT,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS replay_sessions (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL REFERENCES learners(id),
    start_date TEXT NOT NULL,
    current_date TEXT NOT NULL,
    cash_cents INTEGER NOT NULL DEFAULT 100000,
    active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS paypal_orders (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL UNIQUE,
    kit_id TEXT NOT NULL,
    learner_id TEXT NOT NULL REFERENCES learners(id),
    parent_id TEXT NOT NULL REFERENCES users(id),
    amount_usd REAL NOT NULL,
    practice_dollars_awarded INTEGER NOT NULL,
    xp_awarded INTEGER NOT NULL DEFAULT 0,
    capture_id TEXT,
    status TEXT NOT NULL DEFAULT 'created',
    created_at INTEGER NOT NULL,
    completed_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS webhook_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    verified INTEGER NOT NULL DEFAULT 0,
    processed_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL REFERENCES learners(id),
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS lesson_progress (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL REFERENCES learners(id),
    lesson_id TEXT NOT NULL,
    completed_at INTEGER NOT NULL,
    xp_earned INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS agent_plans (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL REFERENCES learners(id),
    family_id TEXT NOT NULL,
    user_message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'thinking',
    kit_id TEXT,
    order_id TEXT,
    plan_steps TEXT NOT NULL DEFAULT '[]',
    reasoning TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS agent_audit_log (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL REFERENCES agent_plans(id),
    learner_id TEXT NOT NULL,
    tool TEXT NOT NULL,
    input TEXT NOT NULL DEFAULT '{}',
    output TEXT NOT NULL DEFAULT '{}',
    duration_ms INTEGER,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS family_settings (
    family_id TEXT PRIMARY KEY REFERENCES families(id),
    agent_enabled INTEGER NOT NULL DEFAULT 1,
    weekly_cap_cents INTEGER NOT NULL DEFAULT 1000,
    updated_at INTEGER NOT NULL
  )`,
];

for (const sql of DDL) {
  await client.execute(sql);
}

// ── Idempotent column additions ───────────────────────────────────────────────
const addCol = async (sql: string) => {
  try { await client.execute(sql); } catch { /* column already exists */ }
};
await addCol(`ALTER TABLE family_settings ADD COLUMN reading_level_override TEXT`);
await addCol(`ALTER TABLE trades ADD COLUMN reflection TEXT`);
await addCol(`ALTER TABLE trades ADD COLUMN replay_date TEXT`);

// ── Schema migration: profile_id -> learner_id (old DBs only) ────────────────
const renameCols: Array<{ table: string; from: string; to: string }> = [
  { table: 'holdings',        from: 'profile_id', to: 'learner_id' },
  { table: 'trades',          from: 'profile_id', to: 'learner_id' },
  { table: 'replay_sessions', from: 'profile_id', to: 'learner_id' },
  { table: 'lesson_progress', from: 'profile_id', to: 'learner_id' },
  { table: 'chat_messages',   from: 'profile_id', to: 'learner_id' },
];
for (const { table, from, to } of renameCols) {
  const { rows } = await client.execute(`PRAGMA table_info(${table})`);
  const hasOld = rows.some((r) => r['name'] === from);
  const hasNew = rows.some((r) => r['name'] === to);
  if (hasOld && !hasNew) {
    await addCol(`ALTER TABLE ${table} ADD COLUMN ${to} TEXT NOT NULL DEFAULT ''`);
    await client.execute(`UPDATE ${table} SET ${to} = ${from} WHERE ${to} = '' OR ${to} IS NULL`);
    console.log(`[db] Migrated ${table}.${from} -> ${to}`);
  }
}

// ── Seed demo family (idempotent) ─────────────────────────────────────────────
{
  const hash = (v: string) => createHash('sha256').update(`stackly:${v}`).digest('hex');
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);

  const FAMILY_ID = 'demo-family-0001';
  const PARENT_ID = 'demo-parent-0001';
  const SAM_ID    = 'demo-learner-sam';
  const BEN_ID    = 'demo-learner-ben';
  const IVY_ID    = 'demo-learner-ivy';

  await client.execute({ sql: 'INSERT OR IGNORE INTO families (id, name, created_at) VALUES (?, ?, ?)', args: [FAMILY_ID, 'Demo Family', now] });
  await client.execute({ sql: `INSERT OR IGNORE INTO users (id, family_id, email, password_hash, consent_given, consent_at, created_at) VALUES (?, ?, ?, ?, 1, ?, ?)`, args: [PARENT_ID, FAMILY_ID, 'demo@stackly.app', hash('demo1234'), now, now] });

  const seedLearners = [
    { id: SAM_ID, nickname: 'Sprout Sam',   band: 'sprouts',   avatar: 'seedling', pin: '1111', xp: 120, streak: 3,  pd: 950  },
    { id: BEN_ID, nickname: 'Builder Ben',  band: 'builders',  avatar: 'rocket',   pin: '2222', xp: 340, streak: 7,  pd: 1250 },
    { id: IVY_ID, nickname: 'Investor Ivy', band: 'investors', avatar: 'chart',    pin: '3333', xp: 780, streak: 14, pd: 2100 },
  ];
  for (const l of seedLearners) {
    await client.execute({ sql: `INSERT OR IGNORE INTO learners (id, family_id, nickname, band, avatar, pin_hash, practice_dollars, xp, streak_days, last_active_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, args: [l.id, FAMILY_ID, l.nickname, l.band, l.avatar, hash(l.pin), l.pd, l.xp, l.streak, today, now] });
  }
  // Fix old email if present
  await client.execute({ sql: `UPDATE users SET email = 'demo@stackly.app' WHERE id = ? AND email = 'parent@demo.stackly'`, args: [PARENT_ID] });

  console.log('[db] Demo family ready — demo@stackly.app / demo1234');
  console.log('[db]   Sprout Sam PIN 1111 | Builder Ben PIN 2222 | Investor Ivy PIN 3333');
}

console.log('[db] Tables ready');
client.close?.();
