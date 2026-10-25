import { test, expect } from '@playwright/test';
import { loginParent } from './helpers';

test.describe('Learner lesson flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginParent(page);
    // Navigate to learner select
    await page.goto('/onboarding/learner-select');
  });

  test('Ben (Builders) can start and complete a lesson', async ({ page }) => {
    // Select Ben
    await page.getByRole('button', { name: /ben/i }).click();
    // Enter PIN
    for (const digit of '2222') {
      await page.getByRole('button', { name: digit }).click();
    }
    await expect(page).toHaveURL(/\/app\/home/, { timeout: 20_000 });

    // Go to Learn
    await page.getByRole('link', { name: /learn/i }).click();
    await expect(page).toHaveURL(/\/app\/learn/);

    // Click first available lesson
    const firstLesson = page.getByRole('link', { name: /lesson|start/i }).first();
    await firstLesson.click();

    // Lesson reader should be visible
    await expect(page.getByRole('main')).toContainText(/.{10,}/, { timeout: 10_000 });

    // Complete lesson (click through all pages / submit quiz if present)
    const nextBtn = page.getByRole('button', { name: /next|continue/i });
    let maxClicks = 10;
    while (await nextBtn.isVisible() && maxClicks-- > 0) {
      await nextBtn.click();
      await page.waitForTimeout(300);
    }

    // Should see XP or celebration
    const celebration = page.getByRole('dialog', { name: /complete|well done|congrats/i });
    const xpText = page.getByText(/\+\d+ xp/i);
    await expect(celebration.or(xpText)).toBeVisible({ timeout: 10_000 });
  });
});
