'use client';

import { useCallback, useEffect, useState } from 'react';

type Metrics = {
  generatedAt: string;
  alerts: { level: 'critical' | 'warning' | 'info'; message: string }[];
  wordLists: {
    distinctPhonemes: number;
    topPhonemes: { symbol: string; count: number }[];
    wordsPerList: { title: string; activityType: 'WORDLE' | 'WORD_SEARCH'; wordCount: number }[];
    hints: { withHint: number; withoutHint: number };
    outputSettings: { setting: string; count: number }[];
  };
  health: { status: string; database: string; dbLatencyMs?: number };
  activities: {
    total: number;
    wordle: number;
    wordSearch: number;
    totalWords: number;
    averageWordsPerActivity: number;
    byDifficulty: { difficulty: string; count: number }[];
    recent: { id: string; title: string; activityType: 'WORDLE' | 'WORD_SEARCH'; difficulty: string; wordCount: number; createdAt: string }[];
  };
  usage: {
    pageViews: number;
    averageTimeOnPageSeconds: number;
    mostUsedActivityType: 'WORDLE' | 'WORD_SEARCH' | null;
    eventsLast24h: number;
    pages: { path: string; label: string; views: number; averageSeconds: number }[];
  };
  generation: {
    total: number;
    successful: number;
    failed: number;
    successRate: number | null;
    byType: Record<'WORDLE' | 'WORD_SEARCH', { success: number; failure: number }>;
    recent: { id: string; eventType: string; activityType: 'WORDLE' | 'WORD_SEARCH' | null; message: string; createdAt: string }[];
  };
};

const typeLabel = (type: string | null) => (type === 'WORDLE' ? 'Wordle' : type === 'WORD_SEARCH' ? 'Word Search' : 'No data yet');
const formatDuration = (seconds: number) => (seconds >= 60 ? `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s` : `${seconds}s`);
const formatTime = (value: string) => new Date(value).toLocaleString();

function StatCard({ label, value, detail, tone = 'sky' }: { label: string; value: string | number; detail?: string; tone?: 'sky' | 'amber' | 'emerald' | 'red' | 'slate' }) {
  const tones = {
    sky: 'text-sky-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
    red: 'text-red-600',
    slate: 'text-slate-600 dark:text-slate-300',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${tones[tone]}`}>{value}</p>
      {detail && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{detail}</p>}
    </div>
  );
}

function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-slate-600 dark:text-slate-400">{value} ({percent}%)</span>
      </div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" role="presentation">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState('');

  const loadMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/metrics', { cache: 'no-store' });
      if (!response.ok) throw new Error('Metrics unavailable');
      setMetrics(await response.json());
      setError('');
    } catch {
      setError('Unable to load dashboard metrics. The database may be unavailable.');
    }
  }, []);

  useEffect(() => {
    // initial load and periodic refresh of the metrics snapshot
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMetrics();
    const timer = window.setInterval(loadMetrics, 15000);
    return () => window.clearInterval(timer);
  }, [loadMetrics]);

  const healthy = metrics?.health.status === 'ok';

  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Assessment 3</p>
            <h1 className="mt-1 text-3xl font-semibold">Operations dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Database-backed summaries of stored word lists, activity configurations, usage, and generation outcomes for the Wordle and Word Search builder.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              role="status"
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                healthy ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${healthy ? 'bg-emerald-500' : 'bg-red-500'}`} aria-hidden="true" />
              {metrics ? (healthy ? 'System healthy' : 'System unhealthy') : error ? 'System unhealthy' : 'Checking…'}
            </span>
            <div className="flex gap-3 text-sm">
              <button type="button" onClick={loadMetrics} className="text-sky-700 underline transition hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300">Refresh</button>
              <a href="/health" target="_blank" rel="noreferrer" className="text-sky-700 underline transition hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300">/health</a>
              <a href="/api/metrics" target="_blank" rel="noreferrer" className="text-sky-700 underline transition hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300">Metrics API</a>
              <a href="http://localhost:16686" target="_blank" rel="noreferrer" className="text-sky-700 underline transition hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300">Jaeger</a>
              <a href="http://localhost:9090" target="_blank" rel="noreferrer" className="text-sky-700 underline transition hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300">Prometheus</a>
              <a href="http://localhost:9411" target="_blank" rel="noreferrer" className="text-sky-700 underline transition hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300">Zipkin</a>
              <a href="/api/report" download className="text-sky-700 underline transition hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300">Download CSV report</a>
            </div>
          </div>
        </div>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-300">{error}</p>}
      </section>

      {!metrics && !error && <p className="text-sm text-slate-500">Loading metrics…</p>}

      {metrics && (
        <>
          <section aria-labelledby="alerts-heading" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 id="alerts-heading" className="text-2xl font-semibold">Alerts</h2>
            {metrics.alerts.length === 0 ? (
              <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">No active alerts. All monitored thresholds are within limits.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {metrics.alerts.map((alert) => (
                  <li
                    key={alert.message}
                    role={alert.level === 'critical' ? 'alert' : undefined}
                    className={`rounded-xl p-3 ${
                      alert.level === 'critical'
                        ? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : alert.level === 'warning'
                          ? 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                          : 'bg-sky-50 text-sky-900 dark:bg-sky-950 dark:text-sky-200'
                    }`}
                  >
                    <strong className="uppercase">{alert.level}:</strong> {alert.message}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section aria-labelledby="overview-heading" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 id="overview-heading" className="text-2xl font-semibold">Overview</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Wordle activities" value={metrics.activities.wordle} tone="sky" detail="Stored in database" />
              <StatCard label="Word Search activities" value={metrics.activities.wordSearch} tone="amber" detail="Stored in database" />
              <StatCard label="Avg. time on page" value={formatDuration(metrics.usage.averageTimeOnPageSeconds)} tone="emerald" detail={`${metrics.usage.pageViews} page views`} />
              <StatCard label="Most-used activity" value={typeLabel(metrics.usage.mostUsedActivityType)} tone="slate" detail="By generation attempts" />
              <StatCard label="Successful generations" value={metrics.generation.successful} tone="emerald" />
              <StatCard label="Failed generations" value={metrics.generation.failed} tone={metrics.generation.failed > 0 ? 'red' : 'slate'} />
              <StatCard label="Success rate" value={metrics.generation.successRate === null ? 'N/A' : `${metrics.generation.successRate}%`} tone="sky" detail={`${metrics.generation.total} total attempts`} />
              <StatCard label="Stored words" value={metrics.activities.totalWords} tone="slate" detail={`${metrics.activities.averageWordsPerActivity} per activity`} />
            </div>
          </section>

          <section aria-labelledby="wordlists-heading" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 id="wordlists-heading" className="text-2xl font-semibold">Word list summary</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{metrics.wordLists.distinctPhonemes} distinct phoneme symbols across {metrics.activities.totalWords} stored words.</p>
            <div className="mt-4 grid gap-6 lg:grid-cols-3">
              <div>
                <p className="text-sm font-semibold">Most common phoneme symbols</p>
                <div className="mt-3 space-y-3">
                  {metrics.wordLists.topPhonemes.map((item) => (
                    <Bar key={item.symbol} label={item.symbol} value={item.count} total={metrics.wordLists.topPhonemes[0]?.count ?? 1} color="bg-sky-500" />
                  ))}
                  {metrics.wordLists.topPhonemes.length === 0 && <p className="text-sm text-slate-500">No phoneme data stored.</p>}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold">Words per list</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {metrics.wordLists.wordsPerList.map((list) => (
                    <li key={list.title + list.activityType} className="flex justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                      <span className="font-medium">{list.title}</span>
                      <span className="text-slate-600 dark:text-slate-400">{typeLabel(list.activityType)} · {list.wordCount}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold">Hints and output settings</p>
                <div className="mt-3 space-y-3">
                  <Bar label="Activities with a hint" value={metrics.wordLists.hints.withHint} total={metrics.activities.total} color="bg-emerald-500" />
                  <Bar label="Activities without a hint" value={metrics.wordLists.hints.withoutHint} total={metrics.activities.total} color="bg-slate-400" />
                </div>
                <ul className="mt-4 space-y-1 text-sm">
                  {metrics.wordLists.outputSettings.map((item) => (
                    <li key={item.setting} className="flex justify-between gap-3"><span>{item.setting}</span><span className="text-slate-600 dark:text-slate-400">{item.count}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-2xl font-semibold">Operational status</h2>
              <dl className="mt-4 divide-y divide-slate-200 text-sm dark:divide-slate-700">
                <div className="flex justify-between py-2"><dt>API status</dt><dd className="font-medium">{metrics.health.status.toUpperCase()}</dd></div>
                <div className="flex justify-between py-2"><dt>Database</dt><dd className="font-medium">{metrics.health.database}</dd></div>
                <div className="flex justify-between py-2"><dt>Database latency</dt><dd className="font-medium">{metrics.health.dbLatencyMs} ms</dd></div>
                <div className="flex justify-between py-2"><dt>Events in last 24 hours</dt><dd className="font-medium">{metrics.usage.eventsLast24h}</dd></div>
                <div className="flex justify-between py-2"><dt>Last updated</dt><dd className="font-medium">{formatTime(metrics.generatedAt)}</dd></div>
              </dl>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-2xl font-semibold">Generation outcomes</h2>
              <div className="mt-4 space-y-4">
                <Bar label="Successful" value={metrics.generation.successful} total={metrics.generation.total} color="bg-emerald-500" />
                <Bar label="Failed" value={metrics.generation.failed} total={metrics.generation.total} color="bg-red-500" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                {(['WORDLE', 'WORD_SEARCH'] as const).map((type) => (
                  <div key={type} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                    <p className="font-semibold">{typeLabel(type)}</p>
                    <p className="text-slate-600 dark:text-slate-400">{metrics.generation.byType[type].success} succeeded · {metrics.generation.byType[type].failure} failed</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-2xl font-semibold">Activity configurations</h2>
              <div className="mt-4 space-y-4">
                <Bar label="Wordle" value={metrics.activities.wordle} total={metrics.activities.total} color="bg-sky-500" />
                <Bar label="Word Search" value={metrics.activities.wordSearch} total={metrics.activities.total} color="bg-amber-500" />
              </div>
              <p className="mt-5 text-sm font-semibold">By difficulty</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {metrics.activities.byDifficulty.map((item) => (
                  <span key={item.difficulty} className="rounded-full bg-slate-100 px-3 py-1 text-sm capitalize dark:bg-slate-800">{item.difficulty}: {item.count}</span>
                ))}
              </div>
              <p className="mt-5 text-sm font-semibold">Recently created</p>
              <ul className="mt-2 space-y-2 text-sm">
                {metrics.activities.recent.map((activity) => (
                  <li key={activity.id} className="flex justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                    <span className="font-medium">{activity.title}</span>
                    <span className="text-slate-600 dark:text-slate-400">{typeLabel(activity.activityType)} · {activity.wordCount} words</span>
                  </li>
                ))}
                {metrics.activities.recent.length === 0 && <li className="text-slate-500">No activities stored yet.</li>}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-2xl font-semibold">Page usage</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Views and average time on each page</caption>
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th scope="col" className="py-2 pr-3">Page</th>
                      <th scope="col" className="py-2 pr-3">Views</th>
                      <th scope="col" className="py-2">Avg. time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.usage.pages.map((page) => (
                      <tr key={page.path} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-3">{page.label}</td>
                        <td className="py-2 pr-3">{page.views}</td>
                        <td className="py-2">{formatDuration(page.averageSeconds)}</td>
                      </tr>
                    ))}
                    {metrics.usage.pages.length === 0 && (
                      <tr><td colSpan={3} className="py-3 text-slate-500">No page views recorded yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="mt-5 text-sm font-semibold">Recent generation events</p>
              <ul className="mt-2 space-y-2 text-sm">
                {metrics.generation.recent.map((event) => (
                  <li key={event.id} className="flex justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                    <span className={event.eventType === 'GENERATION_SUCCESS' ? 'font-medium text-emerald-700 dark:text-emerald-400' : 'font-medium text-red-700 dark:text-red-400'}>
                      {event.eventType === 'GENERATION_SUCCESS' ? 'Success' : 'Failure'} · {typeLabel(event.activityType)}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">{formatTime(event.createdAt)}</span>
                  </li>
                ))}
                {metrics.generation.recent.length === 0 && <li className="text-slate-500">No generation events yet. Generate an activity to see data here.</li>}
              </ul>
            </div>
          </section>
        </>
      )}
    </>
  );
}
