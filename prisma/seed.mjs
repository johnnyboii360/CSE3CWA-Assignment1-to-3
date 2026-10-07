import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const words = [
  { phonemeWord: '/kæməl/', englishEquivalence: 'camel', phonemes: ['k', 'æ', 'm', 'ə', 'l'] },
  { phonemeWord: '/rɪvər/', englishEquivalence: 'river', phonemes: ['r', 'ɪ', 'v', 'ə', 'r'] },
  { phonemeWord: '/pɒkɪt/', englishEquivalence: 'pocket', phonemes: ['p', 'ɒ', 'k', 'ɪ', 't'] },
  { phonemeWord: '/mɛtəl/', englishEquivalence: 'metal', phonemes: ['m', 'ɛ', 't', 'ə', 'l'] },
  { phonemeWord: '/tɪkət/', englishEquivalence: 'ticket', phonemes: ['t', 'ɪ', 'k', 'ə', 't'] },
];

await prisma.activitySet.upsert({
  where: { id: 'starter-wordle' },
  update: {},
  create: {
    id: 'starter-wordle',
    title: 'Starter phoneme Wordle',
    activityType: 'WORDLE',
    difficulty: 'medium',
    hint: 'Use the phoneme keyboard to build the target pronunciation.',
    words: { create: words.map((word, sortOrder) => ({ ...word, phonemes: JSON.stringify(word.phonemes), sortOrder })) },
  },
});

await prisma.activitySet.upsert({
  where: { id: 'starter-word-search' },
  update: {},
  create: {
    id: 'starter-word-search',
    title: 'Starter phoneme Word Search',
    activityType: 'WORD_SEARCH',
    difficulty: 'medium',
    hint: 'Drag across the phoneme symbols to find each word.',
    words: { create: words.map((word, sortOrder) => ({ ...word, phonemes: JSON.stringify(word.phonemes), sortOrder })) },
  },
});

const existingEvents = await prisma.usageEvent.count();
if (existingEvents === 0) {
  const paths = ['/', '/wordle', '/word-search', '/activities', '/dashboard', '/about'];
  const now = Date.now();
  const events = [];
  for (let i = 0; i < 60; i += 1) {
    const path = paths[i % paths.length];
    events.push({
      eventType: 'PAGE_VIEW',
      path,
      durationMs: 8000 + ((i * 7919) % 90000),
      createdAt: new Date(now - (i * 37 + 5) * 60 * 1000),
    });
  }
  for (let i = 0; i < 24; i += 1) {
    const activityType = i % 3 === 0 ? 'WORD_SEARCH' : 'WORDLE';
    const failed = i % 8 === 7;
    events.push({
      eventType: failed ? 'GENERATION_FAILURE' : 'GENERATION_SUCCESS',
      activityType,
      path: activityType === 'WORDLE' ? '/wordle' : '/word-search',
      message: failed ? 'Simulated failure: no valid words selected.' : 'Simulated successful generation.',
      createdAt: new Date(now - (i * 53 + 10) * 60 * 1000),
    });
  }
  await prisma.usageEvent.createMany({ data: events });
}

await prisma.$disconnect();
