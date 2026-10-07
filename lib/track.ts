export type TrackPayload = {
  eventType: 'PAGE_VIEW' | 'GENERATION_SUCCESS' | 'GENERATION_FAILURE';
  activityType?: 'WORDLE' | 'WORD_SEARCH';
  path?: string;
  durationMs?: number;
  message?: string;
};

export function trackEvent(payload: TrackPayload) {
  if (typeof window === 'undefined') return;

  const body = JSON.stringify(payload);

  try {
    if (navigator.sendBeacon?.('/api/events', new Blob([body], { type: 'application/json' }))) return;
  } catch {
    // fall through to fetch
  }

  fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => undefined);
}
