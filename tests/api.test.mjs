import test from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

test('/health returns 200 OK', async () => {
  const response = await fetch(`${BASE}/health`);
  assert.equal(response.status, 200);
});

test('/api/metrics returns dashboard metrics', async () => {
  const response = await fetch(`${BASE}/api/metrics`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.health.status, 'ok');
  for (const key of ['activities', 'usage', 'generation', 'wordLists', 'alerts']) assert.ok(key in data, `missing ${key}`);
  assert.equal(data.generation.total, data.generation.successful + data.generation.failed);
});

test('/api/events stores a valid event and rejects an invalid one', async () => {
  const headers = { 'Content-Type': 'application/json' };
  const ok = await fetch(`${BASE}/api/events`, { method: 'POST', headers, body: JSON.stringify({ eventType: 'GENERATION_SUCCESS', activityType: 'WORDLE', path: '/wordle' }) });
  assert.equal(ok.status, 201);
  const bad = await fetch(`${BASE}/api/events`, { method: 'POST', headers, body: JSON.stringify({ eventType: 'NOPE' }) });
  assert.ok(bad.status >= 400 && bad.status < 500);
});

test('/api/report returns a CSV download', async () => {
  const response = await fetch(`${BASE}/api/report`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /text\/csv/);
});

test('/dashboard page renders', async () => {
  const response = await fetch(`${BASE}/dashboard`);
  assert.equal(response.status, 200);
});
