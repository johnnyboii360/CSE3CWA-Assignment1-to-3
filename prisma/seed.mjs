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

await prisma.$disconnect();
