import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { activityInputSchema } from '../../../lib/activity-validation';

export async function GET(request: Request) {
  try {
    const type = new URL(request.url).searchParams.get('type');
    const activityType = type === 'WORDLE' || type === 'WORD_SEARCH' ? type : undefined;

    const activities = await prisma.activitySet.findMany({
      where: activityType ? { activityType } : undefined,
      include: { words: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(activities);
  } catch {
    return NextResponse.json({ error: 'Unable to load activities.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = activityInputSchema.parse(await request.json());
    const activity = await prisma.activitySet.create({
      data: {
        title: body.title,
        activityType: body.activityType,
        difficulty: body.difficulty,
        hint: body.hint,
        generatedHtmlSettings: JSON.stringify(body.generatedHtmlSettings),
        words: {
          create: body.words.map((word, index) => ({
            phonemeWord: word.phonemeWord,
            englishEquivalence: word.englishEquivalence,
            phonemes: JSON.stringify(word.phonemes),
            sortOrder: word.sortOrder ?? index,
          })),
        },
      },
      include: { words: true },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid activity data.', details: error instanceof Error ? error.message : undefined }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unable to create activity.' }, { status: 500 });
  }
}
