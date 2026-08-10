'use client';

import { useMemo, useState } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';

type WordOption = {
  id: string;
  phonemeWord: string;
  englishEquivalence: string;
  hint: string;
  clue: string;
  cards: Array<{ symbol: string; label: string; letter: string }>;
};

const wordOptions: WordOption[] = [
  {
    id: 'thin',
    phonemeWord: '/θɪn/',
    englishEquivalence: 'thin',
    hint: 'This word begins with the voiceless TH sound.',
    clue: 'TH (as in thin)',
    cards: [
      { symbol: '/θ/', label: 'TH (as in thin)', letter: 'th' },
      { symbol: '/ɪ/', label: 'short I', letter: 'i' },
      { symbol: '/n/', label: 'N as in nose', letter: 'n' },
    ],
  },
  {
    id: 'ship',
    phonemeWord: '/ʃɪp/',
    englishEquivalence: 'ship',
    hint: 'The first sound is like the beginning of “ship”.',
    clue: 'SH (as in ship)',
    cards: [
      { symbol: '/ʃ/', label: 'SH (as in ship)', letter: 'sh' },
      { symbol: '/ɪ/', label: 'short I', letter: 'i' },
      { symbol: '/p/', label: 'P as in pig', letter: 'p' },
    ],
  },
  {
    id: 'sock',
    phonemeWord: '/sɒk/',
    englishEquivalence: 'sock',
    hint: 'This word begins with an S sound and ends with a K sound.',
    clue: 'S (as in sun)',
    cards: [
      { symbol: '/s/', label: 'S (as in sun)', letter: 's' },
      { symbol: '/ɒ/', label: 'short O', letter: 'o' },
      { symbol: '/k/', label: 'K as in kite', letter: 'k' },
    ],
  },
];

function downloadHtml(content: string, fileName: string) {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function WordleBuilder() {
  const [selectedWordId, setSelectedWordId] = useState(wordOptions[0].id);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const selectedWord = useMemo(() => wordOptions.find((word) => word.id === selectedWordId) ?? wordOptions[0], [selectedWordId]);

  const handleGuessSubmit = () => {
    if (guess.trim().toLowerCase() === selectedWord.englishEquivalence) {
      setIsCorrect(true);
      setFeedback(`Correct! ${selectedWord.phonemeWord} matches ${selectedWord.englishEquivalence}.`);
    } else {
      setIsCorrect(false);
      setFeedback('Try again. Use the phoneme clues to build the word.');
    }
  };

  const handleGenerate = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${selectedWord.englishEquivalence} Wordle</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f4f7fb; color: #14213d; }
    main { max-width: 760px; margin: 0 auto; padding: 24px; }
    .card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 8px 24px rgba(20,33,61,0.1); }
    .chips { display: flex; gap: 10px; flex-wrap: wrap; margin: 12px 0; }
    .chip { padding: 10px 12px; border-radius: 999px; border: 1px solid #a8c0ff; background: #eef4ff; cursor: pointer; }
    button { border: none; border-radius: 999px; padding: 10px 14px; background: #1f5eff; color: white; cursor: pointer; }
    .hint { color: #4b5563; font-size: 0.95rem; margin-top: 8px; }
  </style>
</head>
<body>
  <main>
    <div class="card">
      <h1>Phoneme Wordle</h1>
      <p>Target phoneme word: <strong>${selectedWord.phonemeWord}</strong></p>
      <p>English equivalence: <strong>${selectedWord.englishEquivalence}</strong></p>
      <div class="chips">
        ${selectedWord.cards.map((card) => `<span class="chip" title="${card.label}">${card.symbol}</span>`).join('')}
      </div>
      <p class="hint">${difficulty === 'hard' ? 'No extra hints are shown.' : selectedWord.hint}</p>
      <input id="guess" placeholder="Enter the English word" style="padding:10px; border-radius:8px; border:1px solid #cbd5e1; width: 100%; margin: 12px 0;" />
      <button onclick="checkGuess()">Check answer</button>
      <p id="result" style="margin-top:12px;"></p>
    </div>
  </main>
  <script>
    function checkGuess() {
      const guess = document.getElementById('guess').value.trim().toLowerCase();
      const answer = '${selectedWord.englishEquivalence}';
      document.getElementById('result').textContent = guess === answer ? 'Correct! The phoneme word matches the English answer.' : 'Try again.';
    }
  </script>
</body>
</html>`;

    downloadHtml(html, 'phoneme-wordle.html');
  };

  const hintText = difficulty === 'hard' ? 'No extra hints are shown.' : selectedWord.hint;

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Wordle builder</p>
            <h2 className="mt-1 text-2xl font-semibold">Create a phoneme-based Wordle activity</h2>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-full bg-sky-600 px-4 py-2 font-medium text-white transition hover:bg-sky-700"
          >
            Generate HTML
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Choose a phoneme word
            <select
              value={selectedWordId}
              onChange={(event) => {
                setSelectedWordId(event.target.value);
                setGuess('');
                setFeedback('');
                setIsCorrect(false);
              }}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              {wordOptions.map((word) => (
                <option key={word.id} value={word.id}>
                  {word.phonemeWord} • {word.englishEquivalence}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium">
            Difficulty
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as Difficulty)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="easy">Easy — show the hint</option>
              <option value="medium">Medium — show a phoneme cue</option>
              <option value="hard">Hard — no extra hint</option>
            </select>
          </label>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Teacher preview</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Phoneme word: {selectedWord.phonemeWord}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">English equivalence: {selectedWord.englishEquivalence}</p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{hintText}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Live preview</p>
        <h3 className="mt-1 text-xl font-semibold">Phoneme clue cards</h3>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Hover over each cue to reveal the phonetic-to-English equivalence. Click a cue to build your answer.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {selectedWord.cards.map((card) => (
            <button
              key={card.symbol}
              type="button"
              title={card.label}
              onClick={() => setGuess((current) => current + card.letter)}
              className="rounded-full border border-sky-300 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-300"
            >
              {card.symbol} {card.label}
            </button>
          ))}
        </div>

        <label className="mt-6 block text-sm font-medium">
          Current guess
          <input
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            placeholder="Type the English answer"
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </label>

        <button
          type="button"
          onClick={handleGuessSubmit}
          className="mt-4 rounded-full bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700"
        >
          Check answer
        </button>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800">
          <p className="font-medium text-slate-700 dark:text-slate-300">Feedback</p>
          <p className={`mt-2 ${isCorrect ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'}`}>
            {feedback || 'The answer will appear here after you check the guess.'}
          </p>
        </div>
      </div>
    </section>
  );
}
