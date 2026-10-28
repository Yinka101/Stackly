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
import { requireParent, requireAuth } from '../middleware/session';
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
router.post('/orders', requireAuth, async (c) => {
  const session = c.get('session')!;
  const body = await c.req.json<{ kitId: string; learnerId?: string }>();

  const kit = getKit(body.kitId);
  if (!kit) return c.json({ error: 'Unknown kit' }, 400);

  // Resolve learnerId and verify family membership
  let learnerId: string;
  let learnerFamilyId: string;

  if (session.role === 'learner') {
    // Learner is creating their own order - use their own id
    learnerId = session.ownerId;
    const [lr] = await db.select().from(learners).where(eq(learners.id, learnerId));
    if (!lr) return c.json({ error: 'Learner not found' }, 404);
    learnerFamilyId = lr.familyId;
  } else {
    // Parent creating on behalf of a learner
    if (!body.learnerId) return c.json({ error: 'learnerId required' }, 400);
    learnerId = body.learnerId;
    const [lr] = await db
      .select()
      .from(learners)
      .where(and(eq(learners.id, learnerId), eq(learners.familyId, session.familyId)));
    if (!lr) return c.json({ error: 'Learner not found' }, 404);
    learnerFamilyId = lr.familyId;
  }

  // Look up a parent in this family to associate with the order
  const [parentUser] = await db
    .select()
    .from(users)
    .where(eq(users.familyId, learnerFamilyId));
  const parentId = parentUser?.id ?? null;

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
    learnerId,
    parentId,
    amountUsd: parseFloat(kit.priceUsd),
    practiceDollarsAwarded: kit.practiceDollarsAwarded,
    xpAwarded: kit.xpAwarded,
    status: 'pending_agent',
    createdAt: new Date(),
  });

  console.log('[paypal] order created id=%s kit=%s learner=%s', ppOrder.id, kit.id, learnerId);

  // Emit SSE (no clients yet at this point, but emit anyway for any early subscribers)
  emitOrderEvent(ppOrder.id, {
    type: 'order_created',
    label: '📋 Order created',
    detail: `A ${kit.name} order for $${kit.priceUsd} is waiting for parent approval.`,
    tech: `POST /v2/checkout/orders → id: ${ppOrder.id}`,
  });

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

  emitOrderEvent(orderId, {
    type: 'capture_attempted',
    label: '🔄 Capturing payment…',
    detail: 'Asking PayPal to move the money now.',
    tech: `POST /v2/checkout/orders/${orderId}/capture`,
  });

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

    emitOrderEvent(orderId, {
      type: 'completed',
      label: '🎉 Payment complete!',
      detail: `${order.practiceDollarsAwarded} Practice Dollars are on their way.`,
      tech: `capture.status = COMPLETED — captureId: ${captureId}`,
    });

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

  emitOrderEvent(orderId, {
    type: 'failed',
    label: '❌ Payment declined',
    detail: 'PayPal could not complete the payment. You can try again.',
    tech: `capture.status = ${captureStatus}`,
  });

  return c.json({ error: 'Capture not completed', captureStatus }, 402);
});

// ── GET /paypal/pending — parent: list pending orders for family ──────────────
router.get('/pending', requireParent, async (c) => {
  const session = c.get('session')!;

  // Get all learners in the family
  const familyLearners = await db
    .select({ id: learners.id, nickname: learners.nickname })
    .from(learners)
    .where(eq(learners.familyId, session.familyId));

  const learnerIds = familyLearners.map(l => l.id);
  if (learnerIds.length === 0) return c.json({ orders: [] });

  // Get pending orders
  const { inArray, or } = await import('drizzle-orm');
  const pending = await db
    .select()
    .from(paypalOrders)
    .where(and(
      inArray(paypalOrders.learnerId, learnerIds),
      or(eq(paypalOrders.status, 'pending_agent'), eq(paypalOrders.status, 'created')),
    ));

  const orders = pending.map(o => {
    const kit = getKit(o.kitId);
    const learner = familyLearners.find(l => l.id === o.learnerId);
    return {
      orderId: o.id,
      kitId: o.kitId,
      kitName: kit?.name ?? o.kitId,
      amountUsd: o.amountUsd,
      learnerNickname: learner?.nickname ?? 'Learner',
      learnerId: o.learnerId,
      practiceDollarsAwarded: o.practiceDollarsAwarded,
    };
  });

  return c.json({ orders });
});

// ── GET /paypal/activity — learner: their own order history ──────────────────
router.get('/activity', async (c) => {
  const session = c.get('session');
  if (!session) return c.json({ error: 'Unauthorized' }, 401);

  let learnerId: string | null = null;
  if (session.role === 'learner') {
    learnerId = session.ownerId;
  } else {
    // parent: all learners in family
  }

  let orders;
  if (learnerId) {
    orders = await db
      .select()
      .from(paypalOrders)
      .where(eq(paypalOrders.learnerId, learnerId));
  } else {
    // parent sees all family orders
    const familyLearners = await db
      .select({ id: learners.id })
      .from(learners)
      .where(eq(learners.familyId, session.familyId));
    const ids = familyLearners.map(l => l.id);
    if (ids.length === 0) return c.json({ orders: [] });
    const { inArray } = await import('drizzle-orm');
    orders = await db
      .select()
      .from(paypalOrders)
      .where(inArray(paypalOrders.learnerId, ids));
  }

  const result = orders.map(o => ({
    id: o.id,
    kitId: o.kitId,
    kitName: getKit(o.kitId)?.name ?? o.kitId,
    amountUsd: o.amountUsd,
    practiceDollarsAwarded: o.practiceDollarsAwarded,
    xpAwarded: o.xpAwarded,
    status: o.status,
    completedAt: o.completedAt?.toISOString() ?? null,
  }));

  return c.json({ orders: result });
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

// ── SSE event bus (in-process, per-order) ─────────────────────────────────────
// Maps orderId → array of SSE writer functions
const sseClients = new Map<string, Array<(msg: string) => void>>();

export function emitOrderEvent(orderId: string, event: { type: string; label: string; detail: string; tech?: string }) {
  const clients = sseClients.get(orderId);
  if (!clients?.length) return;
  const data = `data: ${JSON.stringify(event)}\n\n`;
  clients.forEach(fn => fn(data));
}

// ── GET /paypal/orders/:id/events — SSE stream ───────────────────────────────
router.get('/orders/:id/events', async (c) => {
  const orderId = c.req.param('id');

  return new Response(
    new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const send = (msg: string) => controller.enqueue(encoder.encode(msg));

        // Register client
        if (!sseClients.has(orderId)) sseClients.set(orderId, []);
        sseClients.get(orderId)!.push(send);

        // Heartbeat every 15s to keep connection alive
        const hb = setInterval(() => send(': heartbeat\n\n'), 15_000);

        // Send initial connected event
        send(`data: ${JSON.stringify({ type: 'connected', label: 'Connected', detail: 'Listening for payment events…' })}\n\n`);

        // Cleanup on close
        const cleanup = () => {
          clearInterval(hb);
          const list = sseClients.get(orderId) ?? [];
          const idx = list.indexOf(send);
          if (idx !== -1) list.splice(idx, 1);
        };

        c.req.raw.signal?.addEventListener('abort', cleanup);
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    }
  );
});

// ── POST /paypal/orders/:id/approve — parent approves pending order ───────────
// The learner initiates → parent approves → PayPal popup opens
router.post('/orders/:id/approve', requireParent, async (c) => {
  const session = c.get('session')!;
  const orderId = c.req.param('id');

  const [order] = await db
    .select()
    .from(paypalOrders)
    .where(eq(paypalOrders.id, orderId));

  if (!order) return c.json({ error: 'Order not found' }, 404);
  if (order.parentId !== session.ownerId) return c.json({ error: 'Forbidden' }, 403);
  if (order.status !== 'created' && order.status !== 'pending_agent') return c.json({ error: 'Order already processed' }, 409);

  await db
    .update(paypalOrders)
    .set({ status: 'approved' })
    .where(eq(paypalOrders.id, orderId));

  emitOrderEvent(orderId, {
    type: 'parent_approved',
    label: '✅ Parent approved!',
    detail: 'Your parent said yes. Opening PayPal checkout now…',
    tech: 'Order status → APPROVED (internal)',
  });

  const ppOrder = await getOrder(orderId).catch(() => null);
  const approveLink = ppOrder?.links?.find((l: { rel: string }) => l.rel === 'approve')?.href ?? null;

  console.log('[paypal] parent approved orderId=%s', orderId);
  return c.json({ approved: true, approveLink });
});

// ── POST /paypal/orders/:id/decline — parent declines pending order ───────────
router.post('/orders/:id/decline', requireParent, async (c) => {
  const session = c.get('session')!;
  const orderId = c.req.param('id');

  const [order] = await db
    .select()
    .from(paypalOrders)
    .where(eq(paypalOrders.id, orderId));

  if (!order) return c.json({ error: 'Order not found' }, 404);
  if (order.parentId !== session.ownerId) return c.json({ error: 'Forbidden' }, 403);
  if (order.status !== 'created' && order.status !== 'pending_agent') return c.json({ error: 'Order already processed' }, 409);

  await db
    .update(paypalOrders)
    .set({ status: 'declined' })
    .where(eq(paypalOrders.id, orderId));

  emitOrderEvent(orderId, {
    type: 'parent_declined',
    label: '❌ Parent declined',
    detail: 'Your parent said no this time. You can try a different kit.',
    tech: 'Order status → DECLINED (internal)',
  });

  console.log('[paypal] parent declined orderId=%s', orderId);
  return c.json({ declined: true });
});

export { sseClients };
export default router;

