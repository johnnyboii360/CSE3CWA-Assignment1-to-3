'use client';

import { useMemo, useState } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';

type WordEntry = {
  phonemeWord: string;
  englishEquivalence: string;
};

const words: WordEntry[] = [
  { phonemeWord: '/θɪn/', englishEquivalence: 'thin' },
  { phonemeWord: '/sɪp/', englishEquivalence: 'sip' },
  { phonemeWord: '/mʌn/', englishEquivalence: 'sun' },
  { phonemeWord: '/kæt/', englishEquivalence: 'cat' },
  { phonemeWord: '/pɪg/', englishEquivalence: 'pig' },
];

function buildWordSearch(difficulty: Difficulty) {
  const size = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 9 : 10;
  const board = Array.from({ length: size }, () => Array(size).fill(''));
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  const placedWords = words.slice(0, 5).map((entry) => entry.englishEquivalence.toUpperCase());

  placedWords.forEach((word) => {
    let placed = false;
    for (let attempt = 0; attempt < 120 && !placed; attempt += 1) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
      const fits = word.split('').every((letter, index) => {
        const nextRow = row + dx * index;
        const nextCol = col + dy * index;
        return nextRow >= 0 && nextRow < size && nextCol >= 0 && nextCol < size && (board[nextRow][nextCol] === '' || board[nextRow][nextCol] === letter);
      });

      if (fits) {
        word.split('').forEach((letter, index) => {
          board[row + dx * index][col + dy * index] = letter;
        });
        placed = true;
      }
    }
  });

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!board[row][col]) {
        board[row][col] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
      }
    }
  }

  return { size, board, placedWords: placedWords.map((word) => word.toUpperCase()) };
}

function downloadHtml(content: string, fileName: string) {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function WordSearchBuilder() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const boardState = useMemo(() => buildWordSearch(difficulty), [difficulty]);
  const previewBoard = boardState.board;

  const handleGenerate = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Phoneme Word Search</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f7fb; color: #14213d; margin: 0; }
    main { max-width: 800px; margin: 0 auto; padding: 24px; }
    .grid { display: grid; gap: 8px; grid-template-columns: repeat(${boardState.size}, 44px); justify-content: center; margin-top: 16px; }
    .cell { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: white; border: 1px solid #dbeafe; font-weight: 700; }
    .list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .pill { border-radius: 999px; padding: 8px 10px; background: #eef4ff; }
  </style>
</head>
<body>
  <main>
    <h1>Phoneme Word Search</h1>
    <p>Find the phoneme-based words in the grid.</p>
    <div class="grid">
      ${previewBoard.flat().map((letter) => `<div class="cell">${letter}</div>`).join('')}
    </div>
    <div class="list">
      ${words.map((word) => `<span class="pill">${word.phonemeWord} → ${word.englishEquivalence}</span>`).join('')}
    </div>
  </main>
</body>
</html>`;

    downloadHtml(html, 'phoneme-word-search.html');
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Word Search builder</p>
            <h2 className="mt-1 text-2xl font-semibold">Generate a phoneme word search</h2>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            className="rounded-full bg-amber-600 px-4 py-2 font-medium text-white transition hover:bg-amber-700"
          >
            Generate HTML
          </button>
        </div>

        <label className="mt-6 block text-sm font-medium">
          Difficulty
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value as Difficulty)}
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Word bank</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {words.map((word) => (
              <li key={word.phonemeWord} className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                {word.phonemeWord} → {word.englishEquivalence}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Live preview</p>
        <h3 className="mt-1 text-xl font-semibold">Phoneme Word Search</h3>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          The preview uses a small fixed word list and generates a classroom-ready grid for speech and phoneme recognition.
        </p>

        {previewBoard.length ? (
          <div className="mt-5 overflow-x-auto">
            <div className="mx-auto grid w-fit gap-2" style={{ gridTemplateColumns: `repeat(${boardState.size}, minmax(34px, 42px))` }}>
              {previewBoard.flat().map((letter, index) => (
                <div key={`${letter}-${index}`} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold dark:border-slate-700 dark:bg-slate-800">
                  {letter}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Find these phoneme words</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {words.map((word) => (
              <span key={word.phonemeWord} className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300">
                {word.phonemeWord} → {word.englishEquivalence}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
