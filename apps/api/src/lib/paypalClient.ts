/**
 * paypalClient.ts
 * ---------------
 * Thin wrapper around PayPal REST APIs (Orders v2 + webhook verify v1).
 * Auth: client_credentials OAuth 2.0, token cached in memory until 60s
 * before expiry. Secrets never logged.
 *
 * Base URLs (from PayPal docs):
 *   Sandbox : https://api-m.sandbox.paypal.com
 *   Live    : https://api-m.paypal.com
 */

const BASE_URL =
  process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

// ── Token cache ───────────────────────────────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiresAt = 0; // ms

/** Reset the token cache — test helper only */
export function _resetTokenCache() {
  cachedToken = null;
  tokenExpiresAt = 0;
}

export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) return cachedToken;

  const clientId     = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('[paypal] PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET not set');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    // Log status only — never log body (may contain hints about secret)
    throw new Error(`[paypal] token fetch failed: HTTP ${res.status}`);
  }

  const data = await res.json() as {
    access_token: string;
    expires_in: number;   // seconds
  };

  cachedToken     = data.access_token;
  // Cache until 60s before actual expiry
  tokenExpiresAt  = now + (data.expires_in - 60) * 1000;

  console.log('[paypal] access token refreshed, expires in', data.expires_in, 's');
  return cachedToken;
}

// ── Generic authenticated fetch ───────────────────────────────────────────────
async function ppFetch(
  path: string,
  options: RequestInit & { requestId?: string } = {},
): Promise<Response> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.requestId
      ? { 'PayPal-Request-Id': options.requestId }
      : {}),
    ...((options.headers ?? {}) as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  return res;
}

// ── Orders v2 ─────────────────────────────────────────────────────────────────

export interface OrderPurchaseUnit {
  amount: { currency_code: string; value: string };
  description?: string;
  custom_id?: string;  // we store kitId + learnerId here
}

export interface CreateOrderResult {
  id: string;
  status: string;
  links: { href: string; rel: string; method: string }[];
}

/**
 * POST /v2/checkout/orders
 * intent = CAPTURE (we capture immediately after buyer approval)
 */
export async function createOrder(
  units: OrderPurchaseUnit[],
  requestId: string,
): Promise<CreateOrderResult> {
  const res = await ppFetch('/v2/checkout/orders', {
    method: 'POST',
    requestId,
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: units,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[paypal] createOrder error status=%d', res.status);
    throw new Error(`[paypal] createOrder failed: ${res.status} ${err}`);
  }

  return res.json() as Promise<CreateOrderResult>;
}

export interface CaptureResult {
  id: string;
  status: string; // 'COMPLETED' | 'DECLINED' | 'FAILED' | ...
  purchase_units: {
    payments: {
      captures: {
        id: string;
        status: string;
        amount: { currency_code: string; value: string };
      }[];
    };
  }[];
}

/**
 * POST /v2/checkout/orders/{id}/capture
 */
export async function captureOrder(
  orderId: string,
  requestId: string,
): Promise<CaptureResult> {
  const res = await ppFetch(`/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    requestId,
    // capture with no body is valid per PayPal docs
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[paypal] captureOrder error orderId=%s status=%d', orderId, res.status);
    throw new Error(`[paypal] captureOrder failed: ${res.status} ${err}`);
  }

  return res.json() as Promise<CaptureResult>;
}

/**
 * GET /v2/checkout/orders/{id}
 */
export async function getOrder(orderId: string): Promise<{ id: string; status: string }> {
  const res = await ppFetch(`/v2/checkout/orders/${orderId}`);

  if (!res.ok) {
    throw new Error(`[paypal] getOrder failed: ${res.status}`);
  }

  return res.json() as Promise<{ id: string; status: string }>;
}

// ── Webhook signature verification ───────────────────────────────────────────

export interface WebhookVerifyPayload {
  auth_algo: string;
  cert_url: string;
  transmission_id: string;
  transmission_sig: string;
  transmission_time: string;
  webhook_id: string;
  webhook_event: unknown;
}

/**
 * POST /v1/notifications/verify-webhook-signature
 * Returns 'SUCCESS' | 'FAILURE'
 */
export async function verifyWebhookSignature(
  payload: WebhookVerifyPayload,
): Promise<'SUCCESS' | 'FAILURE'> {
  const res = await ppFetch('/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`[paypal] webhook verify failed: ${res.status}`);
  }

  const data = await res.json() as { verification_status: string };
  return data.verification_status === 'SUCCESS' ? 'SUCCESS' : 'FAILURE';
}

export { BASE_URL };
