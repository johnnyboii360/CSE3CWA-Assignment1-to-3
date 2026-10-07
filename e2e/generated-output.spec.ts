import { test, expect } from '@playwright/test';
import fs from 'node:fs';

// User use case: generate an activity from the builder, then open and play the generated HTML
test.describe('User use case: generated output', () => {
  test('generates a Wordle HTML file that opens and can be played', async ({ page, context }) => {
    await page.goto('/wordle');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Generate HTML' }).click(),
    ]);
    expect(download.suggestedFilename()).toBe('phoneme-wordle.html');

    const filePath = await download.path();
    const html = fs.readFileSync(filePath, 'utf8');
    expect(html).toContain('Phoneme Wordle');

    const output = await context.newPage();
    await output.setContent(fs.readFileSync(filePath, 'utf8'));
    await expect(output.getByRole('heading', { name: 'Phoneme Wordle' })).toBeVisible();
    await expect(output.locator('#enter-btn')).toBeVisible();
    await expect(output.locator('#delete-btn')).toBeVisible();
  });

  test('generates a Word Search HTML file that opens with a grid', async ({ page, context }) => {
    await page.goto('/word-search');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /generate html/i }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.html$/);

    const filePath = await download.path();
    const output = await context.newPage();
    await output.setContent(fs.readFileSync(filePath, 'utf8'));
    await expect(output.locator('.cell').first()).toBeVisible();
    expect(await output.locator('.cell').count()).toBeGreaterThan(20);
  });

  test('successful generation appears on the dashboard counters', async ({ page, request }) => {
    const before = (await (await request.get('/api/metrics')).json()).generation.successful;
    await page.goto('/wordle');
    await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Generate HTML' }).click()]);
    await expect
      .poll(async () => (await (await request.get('/api/metrics')).json()).generation.successful, { timeout: 10000 })
      .toBeGreaterThan(before);
  });
});
