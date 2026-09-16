import { z } from 'zod';

export const wordInputSchema = z.object({
  phonemeWord: z.string().trim().min(2, 'Phoneme word is required.'),
  englishEquivalence: z.string().trim().min(1, 'English equivalent is required.'),
  phonemes: z.array(z.string().trim().min(1)).min(1, 'At least one phoneme is required.'),
  sortOrder: z.number().int().nonnegative().optional(),
});

export const activityInputSchema = z.object({
  title: z.string().trim().min(2, 'Title must contain at least two characters.'),
  activityType: z.enum(['WORDLE', 'WORD_SEARCH']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  hint: z.string().trim().max(500).default(''),
  generatedHtmlSettings: z.record(z.string(), z.unknown()).default({}),
  words: z.array(wordInputSchema).min(1, 'Add at least one word to the activity.'),
});

export type ActivityInput = z.infer<typeof activityInputSchema>;
