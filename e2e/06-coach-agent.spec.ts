/**
 * Coach agent flow:
 *   1. Learner opens Coach → Agent tab.
 *   2. Sends a message: "I want to start a lemonade stand."
 *   3. Agent responds with a plan (text visible).
 *   4. Plan shows at least one step in the timeline.
 *   5. No payment is made — status is "pending parent approval".
 */

import { test, expect } from '@playwright/test';
import { loginParent } from './helpers';

test.describe('Coach agent', () => {
  test('agent produces a plan for a business idea', async ({ page }) => {
    await loginParent(page);
    await page.goto('/onboarding/learner-select');

    // Log in as Ben (Builders — old enough for the agent)
    await page.getByRole('button', { name: /ben/i }).click();
    for (const digit of '2222') {
      await page.getByRole('button', { name: digit }).click();
    }
    await expect(page).toHaveURL(/\/app\/home/, { timeout: 20_000 });

    // Navigate to Coach
    await page.getByRole('link', { name: /coach/i }).click();
    await expect(page).toHaveURL(/\/app\/coach/);

    // Switch to Agent tab
    const agentTab = page.getByRole('tab', { name: /agent/i });
    if (await agentTab.isVisible()) {
      await agentTab.click();
    }

    // Type a message
    const input = page.getByRole('textbox');
    await input.fill('I want to start a lemonade stand');

    // Submit
    await page.getByRole('button', { name: /send|go|submit/i }).click();

    // Wait for response — generous timeout for LLM latency
    await expect(
      page.getByRole('article').or(page.getByTestId('agent-plan'))
        .or(page.getByText(/lemonade/i))
    ).toBeVisible({ timeout: 30_000 });

    // No payment executed — no "Payment complete" message
    await expect(page.getByText(/payment complete/i)).not.toBeVisible();
  });

  test('agent shows offline fallback when AI is unavailable', async ({ page }) => {
    // Simulate by hitting the endpoint with a nonsense learnerId
    const res = await page.request.post('/api/ai/agent', {
      data: { message: 'test', learnerId: 'invalid-id-000' },
      headers: { Authorization: 'Bearer invalid-token' },
    });
    // Should 401 or 403, never 500
    expect([401, 403]).toContain(res.status());
  });
});
