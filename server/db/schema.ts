import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ── Families ────────────────────────────────────────────────────────────────
export const families = sqliteTable('families', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

// ── Parent accounts ─────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  familyId: text('family_id').notNull().references(() => families.id),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  consentGiven: integer('consent_given', { mode: 'boolean' }).notNull().default(false),
  consentAt: integer('consent_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

// ── Learner accounts (kids — no email) ──────────────────────────────────────
export const learners = sqliteTable('learners', {
  id: text('id').primaryKey(),
  familyId: text('family_id').notNull().references(() => families.id),
  nickname: text('nickname').notNull(),
  band: text('band').notNull(),          // 'sprouts' | 'builders' | 'investors'
  avatar: text('avatar').notNull(),      // key, e.g. 'owl'
  pinHash: text('pin_hash').notNull(),   // bcrypt of 4-digit PIN
  practiceDollars: integer('practice_dollars').notNull().default(1000),
  xp: integer('xp').notNull().default(0),
  streakDays: integer('streak_days').notNull().default(0),
  lastActiveDate: text('last_active_date'),  // YYYY-MM-DD
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

// ── HTTP-only session tokens ─────────────────────────────────────────────────
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),           // random 32-byte hex token
  role: text('role').notNull(),          // 'parent' | 'learner'
  ownerId: text('owner_id').notNull(),   // users.id or learners.id
  familyId: text('family_id').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

// ── Paper-trade portfolio ────────────────────────────────────────────────────
export const holdings = sqliteTable('holdings', {
  id: text('id').primaryKey(),
  learnerId: text('learner_id').notNull().references(() => learners.id),
  ticker: text('ticker').notNull(),
  shares: real('shares').notNull().default(0),
  avgCostCents: integer('avg_cost_cents').notNull().default(0),
});

// ── Trade log ────────────────────────────────────────────────────────────────
export const trades = sqliteTable('trades', {
  id: text('id').primaryKey(),
  learnerId: text('learner_id').notNull().references(() => learners.id),
  ticker: text('ticker').notNull(),
  side: text('side').notNull(),          // 'buy' | 'sell'
  shares: real('shares').notNull(),
  priceCents: integer('price_cents').notNull(),
  reflection: text('reflection'),        // required "why am I buying this?"
  replayDate: text('replay_date'),       // YYYY-MM-DD if in replay mode
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

// ── Replay sessions ───────────────────────────────────────────────────────────
export const replaySessions = sqliteTable('replay_sessions', {
  id: text('id').primaryKey(),
  learnerId: text('learner_id').notNull().references(() => learners.id),
  startDate: text('start_date').notNull(),   // YYYY-MM-DD — replay start
  currentDate: text('current_date').notNull(), // YYYY-MM-DD — current replay date
  cashCents: integer('cash_cents').notNull().default(100000), // $1,000 start
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

// ── PayPal sandbox top-up orders ─────────────────────────────────────────────
export const paypalOrders = sqliteTable('paypal_orders', {
  id: text('id').primaryKey(),                    // PayPal order ID
  requestId: text('request_id').notNull().unique(), // PayPal-Request-Id (idempotency)
  kitId: text('kit_id').notNull(),
  learnerId: text('learner_id').notNull().references(() => learners.id),
  parentId: text('parent_id').notNull().references(() => users.id),
  amountUsd: real('amount_usd').notNull(),
  practiceDollarsAwarded: integer('practice_dollars_awarded').notNull(),
  xpAwarded: integer('xp_awarded').notNull().default(0),
  captureId: text('capture_id'),                  // PayPal capture ID, set on COMPLETED
  status: text('status').notNull().default('created'), // 'created'|'approved'|'completed'|'failed'
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
});

// ── PayPal webhook events (raw, for audit) ───────────────────────────────────
export const webhookEvents = sqliteTable('webhook_events', {
  id: text('id').primaryKey(),          // PayPal event id
  eventType: text('event_type').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id').notNull(),
  verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
  processedAt: integer('processed_at', { mode: 'timestamp_ms' }).notNull(),
});

// ── AI chat history ──────────────────────────────────────────────────────────
export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  learnerId: text('learner_id').notNull().references(() => learners.id),
  role: text('role').notNull(),          // 'user' | 'assistant'
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});

// ── Lesson progress ───────────────────────────────────────────────────────────
export const lessonProgress = sqliteTable('lesson_progress', {
  id: text('id').primaryKey(),
  learnerId: text('learner_id').notNull().references(() => learners.id),
  lessonId: text('lesson_id').notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp_ms' }).notNull(),
  xpEarned: integer('xp_earned').notNull().default(0),
});
