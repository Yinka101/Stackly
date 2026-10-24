/**
 * paypal.test.ts — PayPal client + kit catalog tests with mocked fetch.
 *
 * Strategy: vi.stubGlobal sets fetch before the module is imported.
 * _resetTokenCache() is called in beforeEach so every test triggers
 * a fresh token fetch and the mock call sequence is predictable.
 *
 * Covers:
 *  ✓ getAccessToken success
 *  ✓ getAccessToken HTTP failure (no secret in message)
 *  ✓ getAccessToken missing credentials
 *  ✓ createOrder success
 *  ✓ createOrder PayPal API error
 *  ✓ captureOrder COMPLETED
 *  ✓ captureOrder DECLINED
 *  ✓ captureOrder HTTP error
 *  ✓ getOrder success
 *  ✓ verifyWebhookSignature SUCCESS
 *  ✓ verifyWebhookSignature FAILURE
 *  ✓ createOrder idempotency (same requestId → same id)
 *  ✓ kit catalog: getKit, unknown kit, price format, PD+XP, unique ids
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── Stub fetch BEFORE any import ──────────────────────────────────────────────
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// ── Env setup ─────────────────────────────────────────────────────────────────
process.env.PAYPAL_CLIENT_ID     = 'TEST_CLIENT_ID';
process.env.PAYPAL_CLIENT_SECRET = 'TEST_CLIENT_SECRET';
process.env.PAYPAL_ENV           = 'sandbox';

// ── Import AFTER env + stub ───────────────────────────────────────────────────
import {
  getAccessToken,
  createOrder,
  captureOrder,
  getOrder,
  verifyWebhookSignature,
  _resetTokenCache,
} from '../lib/paypalClient';
import { getKit, KITS } from '../data/kits';

// ── Response factories ────────────────────────────────────────────────────────
const ok   = (body: unknown) => ({ ok: true,  status: 200, json: () => Promise.resolve(body), text: () => Promise.resolve('') });
const fail = (status: number, body = 'ERR') => ({ ok: false, status, json: () => Promise.resolve({}), text: () => Promise.resolve(body) });

const tokenBody = () => ok({ access_token: 'TOK', token_type: 'Bearer', app_id: 'APP', expires_in: 31668, nonce: 'n' });

const orderBody = (id = 'ORD-1', status = 'CREATED') => ok({
  id, status,
  links: [{ href: `https://sandbox.paypal.com/checkoutnow?token=${id}`, rel: 'approve', method: 'GET' }],
});

const captureBody = (status = 'COMPLETED', capId = 'CAP-1') => ok({
  id: 'ORD-1', status,
  purchase_units: [{ payments: { captures: [{ id: capId, status, amount: { currency_code: 'USD', value: '3.00' } }] } }],
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('paypalClient', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    _resetTokenCache(); // force fresh token fetch in every test
  });

  // ── Token ─────────────────────────────────────────────────────────────────
  it('getAccessToken — fetches token successfully', async () => {
    mockFetch.mockResolvedValueOnce(tokenBody());
    const token = await getAccessToken();
    expect(token).toBe('TOK');
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(String(mockFetch.mock.calls[0][0])).toContain('/v1/oauth2/token');
  });

  it('getAccessToken — throws on HTTP 401, error message does not contain secret', async () => {
    mockFetch.mockResolvedValueOnce(fail(401));
    let caught: Error | undefined;
    try { await getAccessToken(); } catch (e) { caught = e as Error; }
    expect(caught).toBeDefined();
    expect(caught!.message).toContain('HTTP 401');
    // Secret must never appear in the thrown message
    expect(caught!.message).not.toContain(process.env.PAYPAL_CLIENT_SECRET!);
    expect(caught!.message).not.toContain(process.env.PAYPAL_CLIENT_ID!);
  });

  it('getAccessToken — throws when PAYPAL_CLIENT_ID missing', async () => {
    const saved = process.env.PAYPAL_CLIENT_ID;
    delete process.env.PAYPAL_CLIENT_ID;
    await expect(getAccessToken()).rejects.toThrow('PAYPAL_CLIENT_ID');
    process.env.PAYPAL_CLIENT_ID = saved;
  });

  // ── createOrder ───────────────────────────────────────────────────────────
  it('createOrder — success returns id + approve link', async () => {
    mockFetch
      .mockResolvedValueOnce(tokenBody())
      .mockResolvedValueOnce(orderBody('ORD-111'));

    const r = await createOrder([{ amount: { currency_code: 'USD', value: '3.00' } }], 'REQ-1');
    expect(r.id).toBe('ORD-111');
    expect(r.status).toBe('CREATED');
    expect(r.links.some(l => l.rel === 'approve')).toBe(true);
  });

  it('createOrder — throws on PayPal 422 error', async () => {
    mockFetch
      .mockResolvedValueOnce(tokenBody())
      .mockResolvedValueOnce(fail(422, 'UNPROCESSABLE_ENTITY'));

    await expect(
      createOrder([{ amount: { currency_code: 'USD', value: '0.00' } }], 'REQ-2'),
    ).rejects.toThrow('createOrder failed: 422');
  });

  // ── captureOrder ──────────────────────────────────────────────────────────
  it('captureOrder — COMPLETED returns capture id', async () => {
    mockFetch
      .mockResolvedValueOnce(tokenBody())
      .mockResolvedValueOnce(captureBody('COMPLETED', 'CAP-789'));

    const r = await captureOrder('ORD-1', 'REQ-3');
    expect(r.status).toBe('COMPLETED');
    expect(r.purchase_units[0].payments.captures[0].id).toBe('CAP-789');
  });

  it('captureOrder — DECLINED status preserved', async () => {
    mockFetch
      .mockResolvedValueOnce(tokenBody())
      .mockResolvedValueOnce(captureBody('DECLINED', 'CAP-000'));

    const r = await captureOrder('ORD-1', 'REQ-4');
    expect(r.status).toBe('DECLINED');
  });

  it('captureOrder — throws on HTTP 500', async () => {
    mockFetch
      .mockResolvedValueOnce(tokenBody())
      .mockResolvedValueOnce(fail(500));

    await expect(captureOrder('ORD-BAD', 'REQ-5')).rejects.toThrow('captureOrder failed: 500');
  });

  // ── getOrder ──────────────────────────────────────────────────────────────
  it('getOrder — returns id and status', async () => {
    mockFetch
      .mockResolvedValueOnce(tokenBody())
      .mockResolvedValueOnce(ok({ id: 'ORD-1', status: 'APPROVED' }));

    const r = await getOrder('ORD-1');
    expect(r.id).toBe('ORD-1');
    expect(r.status).toBe('APPROVED');
  });

  // ── verifyWebhookSignature ────────────────────────────────────────────────
  it('verifyWebhookSignature — returns SUCCESS', async () => {
    mockFetch
      .mockResolvedValueOnce(tokenBody())
      .mockResolvedValueOnce(ok({ verification_status: 'SUCCESS' }));

    const r = await verifyWebhookSignature({
      auth_algo: 'SHA256withRSA', cert_url: 'https://cert', transmission_id: 'TX1',
      transmission_sig: 'sig', transmission_time: '2026-10-23T10:00:00Z',
      webhook_id: 'WH-1', webhook_event: {},
    });
    expect(r).toBe('SUCCESS');
  });

  it('verifyWebhookSignature — returns FAILURE for bad sig', async () => {
    mockFetch
      .mockResolvedValueOnce(tokenBody())
      .mockResolvedValueOnce(ok({ verification_status: 'FAILURE' }));

    const r = await verifyWebhookSignature({
      auth_algo: 'SHA256withRSA', cert_url: 'https://cert', transmission_id: 'TX2',
      transmission_sig: 'badsig', transmission_time: '2026-10-23T10:00:00Z',
      webhook_id: 'WH-1', webhook_event: {},
    });
    expect(r).toBe('FAILURE');
  });

  // ── Idempotency ───────────────────────────────────────────────────────────
  it('createOrder idempotency — PayPal returns same order for same requestId', async () => {
    // First call: token + order. Second call: no token needed (cached), order only.
    mockFetch
      .mockResolvedValueOnce(tokenBody())           // token fetch (first call)
      .mockResolvedValue(orderBody('ORD-DUP'));     // both order requests → same id

    const r1 = await createOrder([{ amount: { currency_code: 'USD', value: '3.00' } }], 'IDEM-1');
    const r2 = await createOrder([{ amount: { currency_code: 'USD', value: '3.00' } }], 'IDEM-1');

    expect(r1.id).toBe('ORD-DUP');
    expect(r2.id).toBe('ORD-DUP');
  });
});

// ── Kit catalog ───────────────────────────────────────────────────────────────
describe('kit catalog', () => {
  it('getKit returns lemonade-stand at $3.00 / 500 PD', () => {
    const kit = getKit('lemonade-stand');
    expect(kit).toBeDefined();
    expect(kit!.priceUsd).toBe('3.00');
    expect(kit!.practiceDollarsAwarded).toBe(500);
  });

  it('getKit returns undefined for unknown id', () => {
    expect(getKit('fake-kit-xyz')).toBeUndefined();
  });

  it('all kits have N.NN price format', () => {
    for (const k of KITS) {
      expect(k.priceUsd).toMatch(/^\d+\.\d{2}$/);
      expect(parseFloat(k.priceUsd)).toBeGreaterThan(0);
    }
  });

  it('all kits award positive PD and XP', () => {
    for (const k of KITS) {
      expect(k.practiceDollarsAwarded).toBeGreaterThan(0);
      expect(k.xpAwarded).toBeGreaterThan(0);
    }
  });

  it('kit ids are unique', () => {
    const ids = KITS.map(k => k.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
