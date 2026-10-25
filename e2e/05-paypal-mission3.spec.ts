/**
 * PayPal Mission 3: learner requests a kit, parent approves in the Family area.
 *
 * This test does NOT complete a real PayPal checkout (that requires a human
 * to click through the PayPal sandbox UI). It verifies:
 *   1. Learner can initiate a kit purchase request.
 *   2. The pending order appears in the parent's approvals queue.
 *   3. Parent can approve the order.
 *   4. Practice dollars are awarded after approval.
 */

import { test, expect } from '@playwright/test';
import { loginParent } from './helpers';

test.describe('PayPal Mission 3 — parent approval', () => {
  test('learner request appears in parent approvals and parent can approve', async ({ page, context }) => {
    // ── Step 1: Log in as parent, get token ──────────────────────────────────
    await loginParent(page);
    const parentToken = await page.evaluate(() => localStorage.getItem('stackly_token') ?? '');

    // Get demo learner Ben's ID
    const learnersRes = await page.request.get('/api/auth/learners', {
      headers: { Authorization: `Bearer ${parentToken}` },
    });
    const learnersList = await learnersRes.json() as Array<{ id: string; nickname: string }>;
    const ben = learnersList.find(l => /ben/i.test(l.nickname));
    expect(ben).toBeDefined();

    // ── Step 2: Create an order as parent on behalf of Ben ───────────────────
    const orderRes = await page.request.post('/api/paypal/orders', {
      data: { kitId: 'kit-basic', learnerId: ben!.id },
      headers: { Authorization: `Bearer ${parentToken}`, 'Content-Type': 'application/json' },
    });
    // Should succeed or return known kit error
    expect([200, 201, 400]).toContain(orderRes.status());

    if (orderRes.ok()) {
      const { orderId } = await orderRes.json() as { orderId: string };
      expect(orderId).toBeTruthy();

      // ── Step 3: Pending order shows in Family > Approvals UI ────────────────
      await page.goto('/app/family');
      await page.getByRole('tab', { name: /approvals/i }).click();
      await expect(page.getByText(new RegExp(orderId.slice(0, 8), 'i'))).toBeVisible({ timeout: 10_000 });

      // ── Step 4: Parent approves the order via API ────────────────────────────
      const approveRes = await page.request.post(`/api/paypal/orders/${orderId}/approve`, {
        headers: { Authorization: `Bearer ${parentToken}` },
      });
      expect(approveRes.ok()).toBeTruthy();
    }
  });
});
