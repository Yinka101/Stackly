/**
 * validate.ts — Zod schemas and a thin Hono middleware factory.
 *
 * Usage:
 *   import { zBody } from '../middleware/validate.js';
 *   router.post('/register-parent', zBody(RegisterParentSchema), async (c) => { ... });
 */

import type { Context, Next } from 'hono';
import { z, ZodError } from 'zod';

// ── Generic body validator ────────────────────────────────────────────────────
export function zBody<T>(schema: z.ZodType<T>) {
  return async (c: Context, next: Next) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Request body must be valid JSON' }, 400);
    }
    const result = schema.safeParse(body);
    if (!result.success) {
      const first = (result.error as ZodError).errors[0];
      return c.json({
        error: `${first.path.join('.') || 'body'}: ${first.message}`,
      }, 400);
    }
    c.set('validated', result.data as T);
    return next();
  };
}

// ── Schemas ───────────────────────────────────────────────────────────────────

export const RegisterParentSchema = z.object({
  familyName: z.string().max(80).optional(),
  email:      z.string().email('Invalid email address'),
  password:   z.string().min(8, 'Password must be at least 8 characters').max(128),
  consentGiven: z.boolean().refine(v => v === true, 'Consent is required'),
});

export const LoginParentSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1).max(128),
});

export const AddLearnerSchema = z.object({
  nickname: z.string().min(1).max(30).regex(/^[\w\s\-'.]+$/, 'Nickname contains invalid characters'),
  band:     z.enum(['sprouts', 'builders', 'investors']),
  avatar:   z.string().min(1).max(10),   // single emoji or short code
  pin:      z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
});

export const LoginLearnerSchema = z.object({
  learnerId: z.string().min(1).max(64),
  pin:       z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
});

export const CreateOrderSchema = z.object({
  kitId:     z.string().min(1).max(64),
  learnerId: z.string().min(1).max(64),
});

export const AgentRunSchema = z.object({
  message:   z.string().min(1, 'Message required').max(500, 'Message too long'),
  learnerId: z.string().min(1).max(64),
});

export const FamilySettingsSchema = z.object({
  agentEnabled:         z.boolean().optional(),
  weeklyCapCents:       z.number().int().min(0).max(10_000).optional(),
  readingLevelOverride: z.enum(['sprouts', 'builders', 'investors', 'auto']).optional(),
});

export const TradeSchema = z.object({
  ticker:   z.string().min(1).max(8).toUpperCase(),
  side:     z.enum(['buy', 'sell']),
  quantity: z.number().int().min(1).max(10_000),
});

export const ApproveRequestSchema = z.object({
  action: z.enum(['approve', 'decline']),
  reason: z.string().max(200).optional(),
});

export const DemoResetSchema = z.object({
  confirm: z.literal('reset-demo'),
});

// Allow typed access inside route handlers
declare module 'hono' {
  interface ContextVariableMap {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validated: any;
  }
}
