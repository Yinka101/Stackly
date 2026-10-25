import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema.js';

const dbPath = process.env.DATABASE_URL ?? './stackly.db';
const sqlite = new Database(dbPath, { create: true });
// Enable WAL for better concurrent read performance
sqlite.exec('PRAGMA journal_mode = WAL;');

export const db = drizzle(sqlite, { schema });
export * from './schema.js';
// Re-export new agent tables (defined in schema.ts)
export { agentPlans, agentAuditLog, familySettings } from './schema.js';
