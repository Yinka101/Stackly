import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright smoke tests for the Stackly judge demo.
 *
 * Run against a live Render deploy:
 *   STACKLY_URL=https://stackly-web.onrender.com bun run test:e2e
 *
 * Run against local dev:
 *   bun run test:e2e           (uses http://localhost:5173 by default)
 */

const BASE_URL = process.env.STACKLY_URL ?? 'http://localhost:5173';
const API_URL  = process.env.STACKLY_API_URL ?? 'http://localhost:3001';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,          // generous for cold-start Render API
  expect:  { timeout: 15_000 },
  retries: process.env.CI ? 2 : 1,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: BASE_URL,
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Slow down slightly so animations complete before assertions
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile',   use: { ...devices['Pixel 5'] } },
  ],

  globalSetup: './e2e/global-setup.ts',
});

export { BASE_URL, API_URL };
