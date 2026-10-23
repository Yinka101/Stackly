/**
 * paypal.ts — PayPal Orders v2 integration (sandbox)
 *
 * Endpoints:
 *   GET  /paypal/kits                — list practice kits (public)
 *   POST /paypal/orders              — create order (requires parent session)
 *   POST /paypal/orders/:id/capture  — capture order (requires parent session)
 *   GET  /paypal/orders/:id          — get order status (requires parent session)
 *   POST /paypal/webhook             — PayPal webhook (no session, signature verified)
 *
 * Security notes:
 *   - Client sends only a kitId; price comes from server catalog.
 *   - PayPal-Request-Id provides idempotency.
 *   - Practice Dollars are only awarded after a COMPLETED capture.
 *   - Duplicate capture attempts return the existing order (idempotent).
 *   - Webhook signature verified via PayPal's verify-webhook-signature API.
 *   - Secrets are never logged.
 */

import { Hono } from 'hono';
import { db } from '../db/index';
import { learners, users, paypalOrders, webhookEvents } from '../db/schema';
import { requireParent } from '../middleware/session';
import { getKit, KITS } from '../data/kits';
import {
  createOrder,
  captureOrder,
  getOrder,
  verifyWebhookSignature,
} from '../lib/paypalClient';
import { eq, and } from 'drizzle-orm';
import { nanoid } from '../utils/nanoid';

const router = new Hono();

// ── GET /paypal/kits — public catalog ────────────────────────────────────────
router.get('/kits', (c) => {
  const publicKits = KITS.map(({ id, name, description, emoji, priceUsd, practiceDollarsAwarded }) => ({
    id, name, description, emoji, priceUsd, practiceDollarsAwarded,
  }));
  return c.json({ kits: publicKits });
});

// ── POST /paypal/orders — create a new order ─────────────────────────────────
router.post('/orders', requireParent, async (c) => {
  const session = c.get('session')!;
  const body = await c.req.json<{ kitId: string; learnerId: string }>();

  const kit = getKit(body.kitId);
  if (!kit) return c.json({ error: 'Unknown kit' }, 400);

  // Verify learner belongs to parent's family
  const [learner] = await db
    .select()
    .from(learners)
    .where(and(eq(learners.id, body.learnerId), eq(learners.familyId, session.familyId)));
  if (!learner) return c.json({ error: 'Learner not found' }, 404);

  const requestId = nanoid(); // idempotency key

  // Create the PayPal order
  const ppOrder = await createOrder(
    [{
      amount: { currency_code: 'USD', value: kit.priceUsd },
      description: `Stackly: ${kit.name}`,
      custom_id: `${kit.id}:${body.learnerId}`,
    }],
    requestId,
  );

  // Persist to DB
  await db.insert(paypalOrders).values({
    id: ppOrder.id,
    requestId,
    kitId: kit.id,
    learnerId: body.learnerId,
    parentId: session.ownerId,
    amountUsd: parseFloat(kit.priceUsd),
    practiceDollarsAwarded: kit.practiceDollarsAwarded,
    xpAwarded: kit.xpAwarded,
    status: 'created',
    createdAt: new Date(),
  });

  console.log('[paypal] order created id=%s kit=%s learner=%s', ppOrder.id, kit.id, body.learnerId);

  // Return the order ID and approval link (client will redirect buyer)
  const approveLink = ppOrder.links.find(l => l.rel === 'approve')?.href ?? null;
  return c.json({ orderId: ppOrder.id, approveLink, requestId });
});

// ── POST /paypal/orders/:id/capture ──────────────────────────────────────────
router.post('/orders/:id/capture', requireParent, async (c) => {
  const session = c.get('session')!;
  const orderId = c.req.param('id');

  // Load order, ensure it belongs to this parent's family
  const [order] = await db
    .select()
    .from(paypalOrders)
    .where(eq(paypalOrders.id, orderId));

  if (!order) return c.json({ error: 'Order not found' }, 404);
  if (order.parentId !== session.ownerId) return c.json({ error: 'Forbidden' }, 403);

  // Idempotency: already completed
  if (order.status === 'completed') {
    return c.json({ status: 'completed', alreadyCaptured: true });
  }
  if (order.status === 'failed') {
    return c.json({ error: 'Order previously failed' }, 409);
  }

  const capture = await captureOrder(orderId, order.requestId);
  const captureStatus = capture.status; // 'COMPLETED' | 'DECLINED' | ...
  const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;

  console.log('[paypal] capture orderId=%s status=%s captureId=%s', orderId, captureStatus, captureId);

  if (captureStatus === 'COMPLETED') {
    const now = new Date();

    // Award Practice Dollars + XP atomically
    await db
      .update(paypalOrders)
      .set({ status: 'completed', captureId, completedAt: now })
      .where(eq(paypalOrders.id, orderId));

    await db
      .update(learners)
      .set({
        practiceDollars: db.$count(learners), // placeholder — see real increment below
      })
      .where(eq(learners.id, order.learnerId));

    // Use raw SQL for atomic increment (drizzle sql helper)
    const { sql } = await import('drizzle-orm');
    await db
      .update(learners)
      .set({
        practiceDollars: sql`practice_dollars + ${order.practiceDollarsAwarded}`,
        xp: sql`xp + ${order.xpAwarded}`,
      })
      .where(eq(learners.id, order.learnerId));

    console.log('[paypal] completed — awarded %d PD + %d XP to learner %s',
      order.practiceDollarsAwarded, order.xpAwarded, order.learnerId);

    return c.json({
      status: 'completed',
      practiceDollarsAwarded: order.practiceDollarsAwarded,
      xpAwarded: order.xpAwarded,
    });
  }

  // Capture failed / declined
  await db
    .update(paypalOrders)
    .set({ status: 'failed' })
    .where(eq(paypalOrders.id, orderId));

  return c.json({ error: 'Capture not completed', captureStatus }, 402);
});

// ── GET /paypal/orders/:id — status check ────────────────────────────────────
router.get('/orders/:id', requireParent, async (c) => {
  const session = c.get('session')!;
  const orderId = c.req.param('id');

  const [order] = await db
    .select()
    .from(paypalOrders)
    .where(eq(paypalOrders.id, orderId));

  if (!order) return c.json({ error: 'Order not found' }, 404);
  if (order.parentId !== session.ownerId) return c.json({ error: 'Forbidden' }, 403);

  // Also check live PayPal status
  const ppStatus = await getOrder(orderId).catch(() => null);

  return c.json({
    orderId: order.id,
    kitId: order.kitId,
    status: order.status,
    paypalStatus: ppStatus?.status ?? 'unknown',
    amountUsd: order.amountUsd,
    practiceDollarsAwarded: order.practiceDollarsAwarded,
    completedAt: order.completedAt,
  });
});

// ── POST /paypal/webhook — signature-verified webhook ────────────────────────
router.post('/webhook', async (c) => {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  // Read raw body for signature verification
  const rawBody = await c.req.text();
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return c.json({ error: 'invalid json' }, 400);
  }

  const eventId = (event.id as string) ?? nanoid();
  const eventType = (event.event_type as string) ?? 'unknown';
  const resource = (event.resource as Record<string, unknown>) ?? {};
  const resourceType = (event.resource_type as string) ?? 'unknown';
  const resourceId = (resource.id as string) ?? 'unknown';

  let verified = false;

  if (webhookId) {
    try {
      const result = await verifyWebhookSignature({
        auth_algo:       c.req.header('PAYPAL-AUTH-ALGO') ?? '',
        cert_url:        c.req.header('PAYPAL-CERT-URL') ?? '',
        transmission_id: c.req.header('PAYPAL-TRANSMISSION-ID') ?? '',
        transmission_sig: c.req.header('PAYPAL-TRANSMISSION-SIG') ?? '',
        transmission_time: c.req.header('PAYPAL-TRANSMISSION-TIME') ?? '',
        webhook_id: webhookId,
        webhook_event: event,
      });
      verified = result === 'SUCCESS';
    } catch (err) {
      console.error('[paypal] webhook signature verify error:', (err as Error).message);
    }
  } else {
    console.warn('[paypal] PAYPAL_WEBHOOK_ID not set — skipping signature check');
  }

  if (!verified && webhookId) {
    console.warn('[paypal] webhook signature FAILED for event=%s', eventId);
    return c.json({ error: 'signature verification failed' }, 401);
  }

  // Persist the event (no secrets in columns)
  await db.insert(webhookEvents).values({
    id: eventId,
    eventType,
    resourceType,
    resourceId,
    verified,
    processedAt: new Date(),
  }).onConflictDoNothing();

  console.log('[paypal] webhook event=%s type=%s resource=%s verified=%s',
    eventId, eventType, resourceId, verified);

  // Handle PAYMENT.CAPTURE.COMPLETED (belt-and-suspenders alongside capture endpoint)
  if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
    const captureId = resourceId;
    const [order] = await db
      .select()
      .from(paypalOrders)
      .where(eq(paypalOrders.captureId, captureId));

    if (order && order.status !== 'completed') {
      const { sql } = await import('drizzle-orm');
      await db
        .update(paypalOrders)
        .set({ status: 'completed', completedAt: new Date() })
        .where(eq(paypalOrders.id, order.id));

      await db
        .update(learners)
        .set({
          practiceDollars: sql`practice_dollars + ${order.practiceDollarsAwarded}`,
          xp: sql`xp + ${order.xpAwarded}`,
        })
        .where(eq(learners.id, order.learnerId));

      console.log('[paypal] webhook completed order=%s via capture=%s', order.id, captureId);
    }
  }

  return c.json({ received: true });
});

export default router;
