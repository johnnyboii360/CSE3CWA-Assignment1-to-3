import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { activityInputSchema } from '../../../../lib/activity-validation';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const activity = await prisma.activitySet.findUnique({ where: { id }, include: { words: { orderBy: { sortOrder: 'asc' } } } });
    if (!activity) return NextResponse.json({ error: 'Activity not found.' }, { status: 404 });
    return NextResponse.json(activity);
  } catch {
    return NextResponse.json({ error: 'Unable to load activity.' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const body = activityInputSchema.parse(await request.json());
    const activity = await prisma.activitySet.update({
      where: { id },
      data: {
        title: body.title,
        activityType: body.activityType,
        difficulty: body.difficulty,
        hint: body.hint,
        generatedHtmlSettings: JSON.stringify(body.generatedHtmlSettings),
        words: {
          deleteMany: {},
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
    return NextResponse.json(activity);
  } catch (error) {
    if (error instanceof Error && (error.name === 'ZodError' || error.name === 'PrismaClientKnownRequestError')) {
      return NextResponse.json({ error: 'Invalid activity data or activity does not exist.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unable to update activity.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    await prisma.activitySet.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Activity not found.' }, { status: 404 });
  }
}
