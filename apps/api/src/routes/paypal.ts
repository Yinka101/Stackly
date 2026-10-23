/**
 * PayPal sandbox integration — Orders v2 API.
 *
 * We read the current PayPal REST docs at
 * https://developer.paypal.com/docs/api/orders/v2/
 *
 * Flow:
 *   1. POST /paypal/create-order  → returns { orderId, approveUrl }
 *   2. Parent redirected to approveUrl to approve in PayPal sandbox
 *   3. POST /paypal/capture-order → captures funds, awards Practice Dollars
 */
import { Hono } from 'hono';
import { db, profiles, paypalOrders } from '../db/index.js';
import { eq } from 'drizzle-orm';

const BASE = process.env.PAYPAL_BASE_URL ?? 'https://api-m.sandbox.paypal.com';
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET ?? '';

async function getAccessToken(): Promise<string> {
  const resp = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`PayPal token error: ${resp.status} ${text}`);
  }
  const data = (await resp.json()) as { access_token: string };
  return data.access_token;
}

const PACKAGES = [
  { usd: 1, practiceDollars: 100, label: '100 Practice Dollars' },
  { usd: 5, practiceDollars: 500, label: '500 Practice Dollars' },
  { usd: 10, practiceDollars: 1000, label: '1,000 Practice Dollars' },
];

const router = new Hono();

// POST /paypal/create-order
// Body: { profileId, packageIndex }  (0, 1, or 2)
router.post('/create-order', async (c) => {
  const body = await c.req.json<{ profileId?: string; packageIndex?: number }>();
  const { profileId, packageIndex = 0 } = body;

  if (!profileId) return c.json({ error: 'profileId required' }, 400);
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return c.json({ error: 'PayPal credentials not configured' }, 503);
  }

  const pkg = PACKAGES[packageIndex] ?? PACKAGES[0];
  const token = await getAccessToken();

  const orderResp = await fetch(`${BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'USD', value: pkg.usd.toFixed(2) },
          description: `Stackly: ${pkg.label} (educational)`,
        },
      ],
      application_context: {
        return_url: `${c.req.url.split('/paypal')[0]}/paypal/capture-return`,
        cancel_url: `${c.req.url.split('/paypal')[0]}/paypal/cancel`,
      },
    }),
  });

  if (!orderResp.ok) {
    const text = await orderResp.text();
    return c.json({ error: `PayPal order creation failed: ${text}` }, 502);
  }

  type LinkObj = { href: string; rel: string; method: string };
  const order = (await orderResp.json()) as { id: string; links: LinkObj[] };
  const approveUrl = order.links.find((l) => l.rel === 'approve')?.href ?? '';

  // Persist order record
  await db.insert(paypalOrders).values({
    id: order.id,
    profileId,
    amountUsd: pkg.usd,
    practiceDollarsAwarded: pkg.practiceDollars,
    status: 'created',
    createdAt: new Date(),
  });

  return c.json({ orderId: order.id, approveUrl, package: pkg });
});

// POST /paypal/capture-order
// Body: { orderId }
router.post('/capture-order', async (c) => {
  const body = await c.req.json<{ orderId?: string }>();
  const { orderId } = body;
  if (!orderId) return c.json({ error: 'orderId required' }, 400);

  const [order] = await db
    .select()
    .from(paypalOrders)
    .where(eq(paypalOrders.id, orderId));

  if (!order) return c.json({ error: 'order not found' }, 404);
  if (order.status === 'captured') return c.json({ error: 'already captured' }, 409);

  const token = await getAccessToken();
  const captureResp = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });

  if (!captureResp.ok) {
    const text = await captureResp.text();
    return c.json({ error: `PayPal capture failed: ${text}` }, 502);
  }

  // Award Practice Dollars
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, order.profileId));

  if (profile) {
    await db
      .update(profiles)
      .set({ practiceDollars: profile.practiceDollars + order.practiceDollarsAwarded })
      .where(eq(profiles.id, order.profileId));
  }

  await db
    .update(paypalOrders)
    .set({ status: 'captured' })
    .where(eq(paypalOrders.id, orderId));

  return c.json({
    ok: true,
    practiceDollarsAwarded: order.practiceDollarsAwarded,
    practiceDollars: (profile?.practiceDollars ?? 0) + order.practiceDollarsAwarded,
  });
});

export default router;
