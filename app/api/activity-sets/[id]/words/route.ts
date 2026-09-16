import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { wordInputSchema } from '../../../../../lib/activity-validation';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const activity = await prisma.activitySet.findUnique({ where: { id }, select: { id: true } });
  if (!activity) return NextResponse.json({ error: 'Activity not found.' }, { status: 404 });

  const words = await prisma.word.findMany({ where: { activitySetId: id }, orderBy: { sortOrder: 'asc' } });
  return NextResponse.json(words);
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const activity = await prisma.activitySet.findUnique({ where: { id }, select: { id: true } });
    if (!activity) return NextResponse.json({ error: 'Activity not found.' }, { status: 404 });

    const body = wordInputSchema.parse(await request.json());
    const lastWord = await prisma.word.findFirst({ where: { activitySetId: id }, orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } });
    const word = await prisma.word.create({
      data: {
        activitySetId: id,
        phonemeWord: body.phonemeWord,
        englishEquivalence: body.englishEquivalence,
        phonemes: JSON.stringify(body.phonemes),
        sortOrder: body.sortOrder ?? (lastWord ? lastWord.sortOrder + 1 : 0),
      },
    });
    return NextResponse.json(word, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid word data.', details: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unable to create word.' }, { status: 500 });
  }
}
