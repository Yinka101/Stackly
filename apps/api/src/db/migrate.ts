/**
 * Run once at startup — creates all tables then seeds a demo family
 * if none exist yet. Uses raw SQL via bun:sqlite.
 */
import { Database } from 'bun:sqlite';
import { randomBytes, createHash } from 'node:crypto';

const dbPath = process.env.DATABASE_URL ?? './stackly.db';
const sqlite = new Database(dbPath, { create: true });
sqlite.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

// ── DDL ──────────────────────────────────────────────────────────────────────
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS families (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL REFERENCES families(id),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    consent_given INTEGER NOT NULL DEFAULT 0,
    consent_at INTEGER,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS learners (
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
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    family_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS holdings (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL REFERENCES learners(id),
    ticker TEXT NOT NULL,
    shares REAL NOT NULL DEFAULT 0,
    avg_cost_cents INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS trades (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL REFERENCES learners(id),
    ticker TEXT NOT NULL,
    side TEXT NOT NULL,
    shares REAL NOT NULL,
    price_cents INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS paypal_orders (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL REFERENCES learners(id),
    parent_id TEXT NOT NULL REFERENCES users(id),
    amount_usd REAL NOT NULL,
    practice_dollars_awarded INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'created',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL REFERENCES learners(id),
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS lesson_progress (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL REFERENCES learners(id),
    lesson_id TEXT NOT NULL,
    completed_at INTEGER NOT NULL,
    xp_earned INTEGER NOT NULL DEFAULT 0
  );
`);

// ── Seed demo family ─────────────────────────────────────────────────────────
const existing = sqlite.query('SELECT COUNT(*) as n FROM families').get() as { n: number };

if (existing.n === 0) {
  const nano = () => randomBytes(10).toString('hex');
  // Simple deterministic hash — good enough for demo PINs (not production)
  const hashPin = (pin: string) =>
    createHash('sha256').update(`stackly:${pin}`).digest('hex');

  const familyId = nano();
  const parentId = nano();
  const now = Date.now();

  // Parent password: sha256 of "demo1234" (prototype — not production bcrypt)
  const pwHash = createHash('sha256').update('stackly:demo1234').digest('hex');

  sqlite.run(
    'INSERT INTO families (id, name, created_at) VALUES (?, ?, ?)',
    [familyId, 'Demo Family', now],
  );

  sqlite.run(
    `INSERT INTO users (id, family_id, email, password_hash, consent_given, consent_at, created_at)
     VALUES (?, ?, ?, ?, 1, ?, ?)`,
    [parentId, familyId, 'parent@demo.stackly', pwHash, now, now],
  );

  const seedLearners = [
    { nickname: 'Sprout Sam', band: 'sprouts',   avatar: 'seedling', pin: '1111', xp: 120, streak: 3, pd: 950 },
    { nickname: 'Builder Ben', band: 'builders',  avatar: 'rocket',   pin: '2222', xp: 340, streak: 7, pd: 1250 },
    { nickname: 'Investor Ivy', band: 'investors', avatar: 'chart',    pin: '3333', xp: 780, streak: 14, pd: 2100 },
  ];

  for (const l of seedLearners) {
    sqlite.run(
      `INSERT INTO learners
         (id, family_id, nickname, band, avatar, pin_hash,
          practice_dollars, xp, streak_days, last_active_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nano(), familyId, l.nickname, l.band, l.avatar,
        hashPin(l.pin), l.pd, l.xp, l.streak,
        new Date().toISOString().slice(0, 10), now,
      ],
    );
  }

  console.log('[db] Demo family seeded — parent@demo.stackly / demo1234');
  console.log('[db]   Sprout Sam PIN 1111 | Builder Ben PIN 2222 | Investor Ivy PIN 3333');
}

console.log('[db] Tables ready at', dbPath);
sqlite.close();
