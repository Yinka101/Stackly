import { test, expect } from '@playwright/test';
import { loginParent, DEMO_EMAIL, DEMO_PASSWORD } from './helpers';

test.describe('Parent auth', () => {
  test('demo login succeeds and lands on /app/family', async ({ page }) => {
    await loginParent(page);
    await expect(page.getByRole('heading', { name: /family/i })).toBeVisible();
  });

  test('wrong password shows error, not spinner', async ({ page }) => {
    await page.goto('/login-parent');
    await page.getByLabel(/email/i).fill(DEMO_EMAIL);
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Should show an error, not be stuck on "Signing in…"
    await expect(page.getByRole('alert').or(page.getByText(/invalid/i))).toBeVisible({ timeout: 15_000 });
    // Button should no longer say "Signing in…"
    await expect(page.getByRole('button', { name: /signing in/i })).not.toBeVisible();
  });

  test('logout returns to landing', async ({ page }) => {
    await loginParent(page);
    // Find sign-out button
    const signOutBtn = page.getByRole('button', { name: /sign out|log out/i });
    await signOutBtn.click();
    await expect(page).toHaveURL('/', { timeout: 10_000 });
  });

  test('rate limit: 10 bad logins in a row returns 429', async ({ page }) => {
    // Hit the endpoint directly — faster than filling the form 10 times
    let lastStatus = 0;
    for (let i = 0; i < 12; i++) {
      const res = await page.request.post('/api/auth/login-parent', {
        data: { email: 'x@x.com', password: 'badpassword' },
      });
      lastStatus = res.status();
      if (lastStatus === 429) break;
    }
    expect(lastStatus).toBe(429);
  });
});
