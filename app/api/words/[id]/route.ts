import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { wordInputSchema } from '../../../../lib/activity-validation';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const word = await prisma.word.findUnique({ where: { id } });
  if (!word) return NextResponse.json({ error: 'Word not found.' }, { status: 404 });
  return NextResponse.json(word);
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const body = wordInputSchema.parse(await request.json());
    const word = await prisma.word.update({
      where: { id },
      data: {
        phonemeWord: body.phonemeWord,
        englishEquivalence: body.englishEquivalence,
        phonemes: JSON.stringify(body.phonemes),
        sortOrder: body.sortOrder ?? 0,
      },
    });
    return NextResponse.json(word);
  } catch (error) {
    if (error instanceof Error && (error.name === 'ZodError' || error.name === 'PrismaClientKnownRequestError')) {
      return NextResponse.json({ error: 'Invalid word data or word does not exist.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unable to update word.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    await prisma.word.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Word not found.' }, { status: 404 });
  }
}
