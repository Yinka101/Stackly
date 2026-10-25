import { test, expect } from '@playwright/test';
import { loginParent } from './helpers';

test.describe('Paper trading flow', () => {
  test('Ivy (Investors) can place a buy trade', async ({ page }) => {
    await loginParent(page);
    await page.goto('/onboarding/learner-select');
    await page.getByRole('button', { name: /ivy/i }).click();
    for (const digit of '3333') {
      await page.getByRole('button', { name: digit }).click();
    }
    await expect(page).toHaveURL(/\/app\/home/, { timeout: 20_000 });

    // Go to Invest
    await page.getByRole('link', { name: /invest/i }).click();
    await expect(page).toHaveURL(/\/app\/invest/);

    // Click a ticker to open trade modal
    const tickerRow = page.getByRole('row').nth(1); // first data row in grid
    await tickerRow.getByRole('button', { name: /buy/i }).first().click();

    // Trade modal
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible({ timeout: 5_000 });

    // Set quantity to 1
    const qtyInput = modal.getByRole('spinbutton').or(modal.getByLabel(/quantity/i));
    await qtyInput.fill('1');

    // Confirm trade
    await modal.getByRole('button', { name: /confirm|buy/i }).click();

    // Success toast or updated portfolio
    await expect(
      page.getByRole('status').or(page.getByText(/trade complete|bought/i))
    ).toBeVisible({ timeout: 10_000 });
  });

  test('trade rejects quantity of 0', async ({ page }) => {
    await loginParent(page);
    await page.goto('/onboarding/learner-select');
    await page.getByRole('button', { name: /ivy/i }).click();
    for (const digit of '3333') {
      await page.getByRole('button', { name: digit }).click();
    }
    await expect(page).toHaveURL(/\/app\/home/, { timeout: 20_000 });

    // Hit invest API directly
    const token = await page.evaluate(() => localStorage.getItem('stackly_token'));
    const res = await page.request.post('/api/invest/trade', {
      data: { ticker: 'AAPL', side: 'buy', quantity: 0 },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(400);
  });
});
