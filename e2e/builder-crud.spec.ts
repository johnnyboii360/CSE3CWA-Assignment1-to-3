import { test, expect } from '@playwright/test';

// Builder use case: create, read, update and delete an activity configuration
test.describe('Builder use case: activity CRUD', () => {
  test('creates, edits and deletes a Wordle word list', async ({ page }) => {
    const title = `E2E Wordle ${Date.now()}`;
    const renamed = `${title} (edited)`;
    const card = (name: string) => page.locator('article', { has: page.getByRole('heading', { name, exact: true }) });

    await page.goto('/activities');
    await expect(page.getByRole('heading', { name: 'Activity data manager' })).toBeVisible();

    // Create
    await page.getByLabel('Activity title').fill(title);
    await page.getByLabel('Hint').fill('End-to-end test hint');
    await page.getByLabel('Phoneme transcription for word 1').fill('/kat/');
    await page.getByLabel('English word for word 1').fill('cat');
    await page.getByLabel('Phoneme symbols for word 1').fill('k, a, t');
    await page.getByRole('button', { name: 'Save activity' }).click();

    // Read
    await expect(card(title)).toBeVisible();
    await expect(card(title)).toContainText('Wordle');
    await expect(card(title)).toContainText('/kat/');

    // Update
    await card(title).getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('button', { name: 'Update activity' })).toBeVisible();
    await page.getByLabel('Activity title').fill(renamed);
    await page.getByRole('button', { name: 'Update activity' }).click();
    await expect(card(renamed)).toBeVisible();
    await expect(page.getByRole('heading', { name: title, exact: true })).toHaveCount(0);

    // Delete
    page.on('dialog', (dialog) => dialog.accept());
    await card(renamed).getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByRole('heading', { name: renamed, exact: true })).toHaveCount(0);
  });

  test('stored activity is available through the API and dashboard counts', async ({ request }) => {
    const metrics = await (await request.get('/api/metrics')).json();
    const list = await (await request.get('/api/activity-sets')).json();
    const activities = Array.isArray(list) ? list : list.activities ?? list.activitySets ?? [];
    expect(metrics.activities.total).toBe(activities.length);
  });
});
