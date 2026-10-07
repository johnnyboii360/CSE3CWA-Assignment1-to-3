import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';
import { generationCounter, pageViewCounter, timeOnPageHistogram, tracer } from '../../../lib/telemetry';

const eventSchema = z.object({
  eventType: z.enum(['PAGE_VIEW', 'GENERATION_SUCCESS', 'GENERATION_FAILURE']),
  activityType: z.enum(['WORDLE', 'WORD_SEARCH']).optional(),
  path: z.string().max(200).default(''),
  durationMs: z.number().int().min(0).max(86_400_000).optional(),
  message: z.string().max(300).default(''),
});

export async function POST(request: Request) {
  try {
    const body = eventSchema.parse(JSON.parse(await request.text()));
    await tracer.startActiveSpan('usage-event.record', async (span) => {
      span.setAttribute('event.type', body.eventType);
      span.setAttribute('event.path', body.path);
      if (body.activityType) span.setAttribute('activity.type', body.activityType);
      try {
        await prisma.usageEvent.create({ data: body });
      } finally {
        span.end();
      }
    });

    const attributes = { activity_type: body.activityType ?? 'none', path: body.path };
    if (body.eventType === 'PAGE_VIEW') {
      pageViewCounter.add(1, { path: body.path });
      if (body.durationMs !== undefined) timeOnPageHistogram.record(body.durationMs, { path: body.path });
    } else {
      generationCounter.add(1, { ...attributes, outcome: body.eventType === 'GENERATION_SUCCESS' ? 'success' : 'failure' });
    }

    return NextResponse.json({ status: 'recorded' }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError || (error instanceof Error && error.name === 'ZodError')) {
      return NextResponse.json({ error: 'Invalid event data.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unable to record event.' }, { status: 500 });
  }
}
