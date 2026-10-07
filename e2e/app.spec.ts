import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('shows health, overview metrics, alerts and word list summary', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Operations dashboard' })).toBeVisible();
    await expect(page.getByRole('status')).toContainText('System healthy');
    for (const heading of ['Alerts', 'Overview', 'Word list summary', 'Operational status', 'Generation outcomes', 'Page usage']) {
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    }
    await expect(page.getByText('Successful generations')).toBeVisible();
    await expect(page.getByText('Failed generations')).toBeVisible();
    await expect(page.getByText('Avg. time on page')).toBeVisible();
    await expect(page.getByText('Most-used activity')).toBeVisible();
  });

  test('is reachable from the navigation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Dashboard' }).first().click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('/health returns 200 OK', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.status()).toBe(200);
  });
});

test.describe('Usage tracking', () => {
  test('generating a Wordle activity records a generation event', async ({ page, request }) => {
    const before = (await (await request.get('/api/metrics')).json()).generation.total;
    await page.goto('/wordle');
    const button = page.getByRole('button', { name: /generate/i }).first();
    await expect(button).toBeVisible();
    await button.click();
    await expect.poll(async () => (await (await request.get('/api/metrics')).json()).generation.total, { timeout: 10000 }).toBeGreaterThan(before);
  });
});
