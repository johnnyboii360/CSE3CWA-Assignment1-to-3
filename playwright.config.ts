import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: process.env.BASE_URL ?? 'http://localhost:3000' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/health',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
