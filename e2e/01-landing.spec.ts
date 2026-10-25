import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads and shows hero headline', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/stackly/i);
    // Hero section has a primary heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('"Start free" button navigates to onboarding', async ({ page }) => {
    await page.goto('/');
    // There may be multiple — click the first one
    await page.getByRole('link', { name: /start free/i }).first().click();
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test('refreshing /onboarding does not 404', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.getByRole('heading')).toBeVisible();
    await expect(page).not.toHaveURL('/');
  });

  test('all primary CTA buttons have 44px touch targets', async ({ page }) => {
    await page.goto('/');
    const ctaButtons = page.getByRole('link', { name: /start free/i });
    const count = await ctaButtons.count();
    for (let i = 0; i < count; i++) {
      const box = await ctaButtons.nth(i).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  });
});
