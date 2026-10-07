import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

const escapeCsv = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export async function GET() {
  try {
    const [activities, events] = await Promise.all([
      prisma.activitySet.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { words: true } } } }),
      prisma.usageEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 }),
    ]);

    const lines = [
      'Section,Id,Type,Title/Path,Detail,Value,Timestamp',
      ...activities.map((a) => ['activity', a.id, a.activityType, a.title, `difficulty=${a.difficulty}`, a._count.words, a.createdAt.toISOString()].map(escapeCsv).join(',')),
      ...events.map((e) => ['event', e.id, e.eventType, e.path, e.activityType ?? e.message, e.durationMs ?? '', e.createdAt.toISOString()].map(escapeCsv).join(',')),
    ];

    return new Response(lines.join('\r\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="usage-report.csv"',
      },
    });
  } catch {
    return Response.json({ error: 'Unable to generate report.' }, { status: 503 });
  }
}
