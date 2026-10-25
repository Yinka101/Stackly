import { type Page, expect } from '@playwright/test';
import { API_URL } from '../playwright.config';

export const DEMO_EMAIL    = 'demo@stackly.app';
export const DEMO_PASSWORD = 'demo1234';
export const PINS = { sam: '1111', ben: '2222', ivy: '3333' } as const;

/** Reset demo data via the API before a test suite. */
export async function resetDemo() {
  const res = await fetch(`${API_URL}/auth/demo-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirm: 'reset-demo' }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.warn('[helpers] demo-reset failed:', text, '(continuing anyway)');
  }
}

/** Log in as the demo parent and return the token. */
export async function loginParent(page: Page): Promise<string> {
  await page.goto('/login-parent');
  await page.getByLabel(/email/i).fill(DEMO_EMAIL);
  await page.getByLabel(/password/i).fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  // Wait for redirect to /app/family
  await expect(page).toHaveURL(/\/app\/family/, { timeout: 30_000 });
  const token = await page.evaluate(() => localStorage.getItem('stackly_token'));
  if (!token) throw new Error('No token after login');
  return token;
}

/** Log in as a learner (must be on learner-select or PIN login page). */
export async function loginLearner(page: Page, nickname: string, pin: string) {
  // Click the learner card
  await page.getByRole('button', { name: new RegExp(nickname, 'i') }).click();
  // Enter PIN
  for (const digit of pin) {
    await page.getByRole('button', { name: digit }).click();
  }
  await expect(page).toHaveURL(/\/app\/home/, { timeout: 20_000 });
}

/** Wait for a toast or status message containing text. */
export async function waitForMessage(page: Page, text: string | RegExp) {
  await expect(page.getByRole('status').or(page.getByRole('alert'))).toContainText(text, { timeout: 15_000 });
}
