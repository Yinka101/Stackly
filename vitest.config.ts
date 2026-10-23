import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['server/__tests__/**/*.test.ts'],
    environment: 'node',
    globals: false,
    isolate: true,        // fresh module cache per test file
    reporters: ['verbose'],
  },
});
