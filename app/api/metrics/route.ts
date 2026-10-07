import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

const PAGE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/about': 'About',
  '/wordle': 'Wordle',
  '/word-search': 'Word Search',
  '/activities': 'Activity Data',
  '/dashboard': 'Dashboard',
  '/settings': 'Settings',
};

const toSeconds = (ms: number | null) => (ms ? Math.round(ms / 100) / 10 : 0);

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startedAt;
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [activityGroups, wordCount, eventGroups, pageViewAgg, pageGroups, generationGroups, recentEvents, events24h, recentActivities, difficultyGroups] =
      await Promise.all([
        prisma.activitySet.groupBy({ by: ['activityType'], _count: { _all: true } }),
        prisma.word.count(),
        prisma.usageEvent.groupBy({ by: ['eventType'], _count: { _all: true } }),
        prisma.usageEvent.aggregate({ where: { eventType: 'PAGE_VIEW', durationMs: { not: null } }, _avg: { durationMs: true } }),
        prisma.usageEvent.groupBy({ by: ['path'], where: { eventType: 'PAGE_VIEW' }, _count: { _all: true }, _avg: { durationMs: true } }),
        prisma.usageEvent.groupBy({ by: ['activityType', 'eventType'], where: { eventType: { in: ['GENERATION_SUCCESS', 'GENERATION_FAILURE'] } }, _count: { _all: true } }),
        prisma.usageEvent.findMany({ where: { eventType: { not: 'PAGE_VIEW' } }, orderBy: { createdAt: 'desc' }, take: 8 }),
        prisma.usageEvent.count({ where: { createdAt: { gte: dayAgo } } }),
        prisma.activitySet.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { _count: { select: { words: true } } } }),
        prisma.activitySet.groupBy({ by: ['difficulty'], _count: { _all: true } }),
      ]);

    const allActivities = await prisma.activitySet.findMany({
      select: { id: true, title: true, activityType: true, hint: true, generatedHtmlSettings: true, words: { select: { phonemes: true } } },
    });

    const phonemeCounts = new Map<string, number>();
    const settingCounts = new Map<string, number>();
    let withHints = 0;
    const emptyLists: string[] = [];
    const invalidWords: string[] = [];
    for (const activity of allActivities) {
      if (activity.hint.trim()) withHints += 1;
      if (activity.words.length === 0) emptyLists.push(activity.title);
      for (const word of activity.words) {
        try {
          const parsed: unknown = JSON.parse(word.phonemes);
          if (!Array.isArray(parsed) || parsed.length === 0) {
            invalidWords.push(activity.title);
            continue;
          }
          for (const symbol of parsed) phonemeCounts.set(String(symbol), (phonemeCounts.get(String(symbol)) ?? 0) + 1);
        } catch {
          invalidWords.push(activity.title);
        }
      }
      try {
        const settings = JSON.parse(activity.generatedHtmlSettings) as Record<string, unknown>;
        for (const [key, value] of Object.entries(settings)) {
          const label = `${activity.activityType === 'WORDLE' ? 'Wordle' : 'Word Search'} ${key} = ${String(value)}`;
          settingCounts.set(label, (settingCounts.get(label) ?? 0) + 1);
        }
      } catch {
        // ignore malformed settings
      }
    }

    const wordLists = {
      distinctPhonemes: phonemeCounts.size,
      topPhonemes: [...phonemeCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([symbol, count]) => ({ symbol, count })),
      wordsPerList: allActivities.map((activity) => ({ title: activity.title, activityType: activity.activityType, wordCount: activity.words.length })).sort((a, b) => b.wordCount - a.wordCount).slice(0, 8),
      hints: { withHint: withHints, withoutHint: allActivities.length - withHints },
      outputSettings: [...settingCounts.entries()].sort((a, b) => b[1] - a[1]).map(([setting, count]) => ({ setting, count })),
    };

    const activitiesByType = { WORDLE: 0, WORD_SEARCH: 0 };
    for (const group of activityGroups) activitiesByType[group.activityType] = group._count._all;

    const eventTotals = { PAGE_VIEW: 0, GENERATION_SUCCESS: 0, GENERATION_FAILURE: 0 };
    for (const group of eventGroups) eventTotals[group.eventType] = group._count._all;

    const generationsByType = {
      WORDLE: { success: 0, failure: 0 },
      WORD_SEARCH: { success: 0, failure: 0 },
    };
    for (const group of generationGroups) {
      if (!group.activityType) continue;
      const key = group.eventType === 'GENERATION_SUCCESS' ? 'success' : 'failure';
      generationsByType[group.activityType][key] += group._count._all;
    }

    const totalGenerations = eventTotals.GENERATION_SUCCESS + eventTotals.GENERATION_FAILURE;
    const wordleUse = generationsByType.WORDLE.success + generationsByType.WORDLE.failure;
    const wordSearchUse = generationsByType.WORD_SEARCH.success + generationsByType.WORD_SEARCH.failure;
    const mostUsedActivityType = wordleUse === 0 && wordSearchUse === 0 ? null : wordleUse >= wordSearchUse ? 'WORDLE' : 'WORD_SEARCH';
    const totalActivities = activitiesByType.WORDLE + activitiesByType.WORD_SEARCH;

    const successRate = totalGenerations ? (eventTotals.GENERATION_SUCCESS / totalGenerations) * 100 : null;
    const averageSeconds = toSeconds(pageViewAgg._avg.durationMs);
    const alerts: { level: 'critical' | 'warning' | 'info'; message: string }[] = [];
    if (dbLatencyMs > 500) alerts.push({ level: 'warning', message: `Database latency is high (${dbLatencyMs} ms).` });
    if (successRate !== null && totalGenerations >= 5 && successRate < 80) alerts.push({ level: 'critical', message: `Generation success rate is ${Math.round(successRate)}%, below the 80% threshold.` });
    if (recentEvents.some((event) => event.eventType === 'GENERATION_FAILURE' && Date.now() - event.createdAt.getTime() < 60 * 60 * 1000)) {
      alerts.push({ level: 'warning', message: 'At least one generation failure occurred in the last hour.' });
    }
    if (emptyLists.length > 0) alerts.push({ level: 'warning', message: `${emptyLists.length} activity word list(s) are empty: ${emptyLists.slice(0, 3).join(', ')}${emptyLists.length > 3 ? '…' : ''}.` });
    if (invalidWords.length > 0) alerts.push({ level: 'critical', message: `${invalidWords.length} word(s) have missing or invalid phoneme data (e.g. in "${invalidWords[0]}").` });
    if (totalActivities === 0) alerts.push({ level: 'warning', message: 'No activities are stored. Create or seed an activity.' });
    if (events24h === 0) alerts.push({ level: 'info', message: 'No usage events recorded in the last 24 hours.' });
    if (averageSeconds > 0 && averageSeconds < 5) alerts.push({ level: 'info', message: 'Average time on page is under 5 seconds; users may be leaving quickly.' });

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      alerts,
      wordLists,
      health: { status: 'ok', database: 'connected', dbLatencyMs },
      activities: {
        total: totalActivities,
        wordle: activitiesByType.WORDLE,
        wordSearch: activitiesByType.WORD_SEARCH,
        totalWords: wordCount,
        averageWordsPerActivity: totalActivities ? Math.round((wordCount / totalActivities) * 10) / 10 : 0,
        byDifficulty: difficultyGroups.map((group) => ({ difficulty: group.difficulty, count: group._count._all })),
        recent: recentActivities.map((activity) => ({
          id: activity.id,
          title: activity.title,
          activityType: activity.activityType,
          difficulty: activity.difficulty,
          wordCount: activity._count.words,
          createdAt: activity.createdAt,
        })),
      },
      usage: {
        pageViews: eventTotals.PAGE_VIEW,
        averageTimeOnPageSeconds: toSeconds(pageViewAgg._avg.durationMs),
        mostUsedActivityType,
        eventsLast24h: events24h,
        pages: pageGroups
          .map((group) => ({
            path: group.path,
            label: PAGE_LABELS[group.path] ?? group.path,
            views: group._count._all,
            averageSeconds: toSeconds(group._avg.durationMs),
          }))
          .sort((a, b) => b.views - a.views),
      },
      generation: {
        total: totalGenerations,
        successful: eventTotals.GENERATION_SUCCESS,
        failed: eventTotals.GENERATION_FAILURE,
        successRate: totalGenerations ? Math.round((eventTotals.GENERATION_SUCCESS / totalGenerations) * 1000) / 10 : null,
        byType: generationsByType,
        recent: recentEvents.map((event) => ({
          id: event.id,
          eventType: event.eventType,
          activityType: event.activityType,
          message: event.message,
          createdAt: event.createdAt,
        })),
      },
    });
  } catch {
    return NextResponse.json({ health: { status: 'error', database: 'unavailable' }, error: 'Unable to load metrics.' }, { status: 503 });
  }
}
