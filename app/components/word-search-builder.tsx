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

function cleanPhoneme(phoneme: string): string {
  return phoneme.replace(/[/ˈˌ]/g, '').slice(0, 4);
}

function buildWordSearch(difficulty: Difficulty) {
  const size = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 9 : 10;
  const board = Array.from({ length: size }, () => Array(size).fill(''));
  const placedWordsMap: { [key: string]: { phoneme: string; positions: [number, number][] } } = {};
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  const selectedWords = words.slice(0, 5);
  const placedWords = selectedWords.map((entry) => ({ phoneme: entry.phonemeWord, clean: cleanPhoneme(entry.phonemeWord) }));

  placedWords.forEach(({ phoneme, clean }) => {
    const word = clean.toUpperCase();
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
        const positions: [number, number][] = [];
        word.split('').forEach((letter, index) => {
          const r = row + dx * index;
          const c = col + dy * index;
          board[r][c] = letter;
          positions.push([r, c]);
        });
        placedWordsMap[phoneme] = { phoneme, positions };
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

  return { size, board, placedWords, placedWordsMap };
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
    const wordListHtml = Object.entries(boardState.placedWordsMap)
      .map(([phoneme, { positions }]) => {
        const positionStr = positions.map(([r, c]) => `${r},${c}`).join('|');
        return `<span class="pill" data-positions="${positionStr}">${phoneme}</span>`;
      })
      .join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Phoneme Word Search</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #f4f7fb; color: #14213d; margin: 0; padding: 20px; }
    main { max-width: 900px; margin: 0 auto; }
    h1 { text-align: center; color: #14213d; margin-bottom: 10px; }
    .instructions { text-align: center; color: #666; margin-bottom: 20px; }
    .button-group { display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; }
    button { border: none; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .show-answers-btn { background: #10b981; color: white; }
    .show-answers-btn:hover { background: #059669; }
    .grid { display: grid; gap: 6px; grid-template-columns: repeat(${boardState.size}, 45px); justify-content: center; margin: 30px auto; user-select: none; }
    .cell { 
      width: 45px; height: 45px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      border-radius: 8px; 
      background: white; 
      border: 2px solid #dbeafe;
      font-weight: 700; 
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
      user-select: none;
    }
    .cell:hover { background: #f0f9ff; }
    .cell.selected { background: #4ade80; color: white; border-color: #22c55e; }
    .cell.found-cell { background: #4ade80; color: white; border-color: #22c55e; }
    .cell.answer { background: #fbbf24; color: white; border-color: #f59e0b; }
    .word-list { 
      margin-top: 30px; 
      padding: 20px; 
      background: #f9fafb; 
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }
    .word-list-title { font-size: 14px; font-weight: 600; color: #666; margin-bottom: 12px; }
    .list { display: flex; flex-wrap: wrap; gap: 8px; }
    .pill { 
      display: inline-block;
      border-radius: 999px; 
      padding: 8px 12px; 
      background: #eef4ff; 
      border: 1px solid #bfdbfe;
      font-size: 13px;
      font-weight: 500;
      user-select: none;
      transition: all 0.2s;
    }
    .pill:hover { background: #dbeafe; }
    .pill.found { background: #dcfce7; border-color: #86efac; }
  </style>
</head>
<body>
  <main>
    <h1>Phoneme Word Search</h1>
    <p class="instructions">Find the phoneme-based words in the grid. Drag across letters to select them.</p>
    
    <div class="button-group">
      <button class="show-answers-btn" onclick="toggleAnswers()">Show Answers</button>
    </div>

    <div class="grid" id="grid">
      ${boardState.board
        .flat()
        .map((letter, index) => `<div class="cell" data-index="${index}">${letter}</div>`)
        .join('')}
    </div>

    <div class="word-list">
      <div class="word-list-title">Word List: (space separated)</div>
      <div class="list">
        ${wordListHtml}
      </div>
    </div>
  </main>

  <script>
    const boardSize = ${boardState.size};
    const placedWords = ${JSON.stringify(
      Object.entries(boardState.placedWordsMap).map(([phoneme, { positions }]) => ({
        phoneme,
        positions,
      }))
    )};
    let showAnswers = false;
    let selectedCells = new Set();
    let isDragging = false;
    const correctWords = new Set();
    const foundCells = new Set();

    function getCellIndex(row, col) {
      return row * boardSize + col;
    }

    function getCellPosition(index) {
      return [Math.floor(index / boardSize), index % boardSize];
    }

    function selectCell(index) {
      const cell = document.querySelector(\`[data-index="\${index}"]\`);
      if (!selectedCells.has(index)) {
        selectedCells.add(index);
        cell.classList.add('selected');
      }
    }

    function toggleCellDuringDrag(index) {
      const cell = document.querySelector(\`[data-index="\${index}"]\`);
      if (selectedCells.has(index)) {
        selectedCells.delete(index);
        cell.classList.remove('selected');
      } else {
        selectedCells.add(index);
        cell.classList.add('selected');
      }
    }

    function deselectCell(index) {
      const cell = document.querySelector(\`[data-index="\${index}"]\`);
      if (selectedCells.has(index)) {
        selectedCells.delete(index);
        cell.classList.remove('selected');
      }
    }

    function clearSelection() {
      selectedCells.forEach(index => {
        if (!foundCells.has(index)) {
          const cell = document.querySelector(\`[data-index="\${index}"]\`);
          cell.classList.remove('selected');
        }
      });
      selectedCells.clear();
    }

    function validateSelection() {
      if (selectedCells.size === 0) return;

      let isCorrect = false;
      for (let word of placedWords) {
        if (correctWords.has(word.phoneme)) continue;
        
        const wordPositionSet = new Set(word.positions.map(([r, c]) => getCellIndex(r, c)));
        if (selectedCells.size === wordPositionSet.size) {
          const allMatch = Array.from(selectedCells).every(index => wordPositionSet.has(index));
          if (allMatch) {
            isCorrect = true;
            correctWords.add(word.phoneme);
            const pill = document.querySelector(\`[data-positions="\${word.positions.map(([r, c]) => \`\${r},\${c}\`).join('|')}"]\`);
            if (pill) pill.classList.add('found');
            
            // Mark these cells as found
            word.positions.forEach(([r, c]) => {
              foundCells.add(getCellIndex(r, c));
              const cell = document.querySelector(\`[data-index="\${getCellIndex(r, c)}"]\`);
              cell.classList.add('found-cell');
              cell.classList.remove('selected');
            });
            break;
          }
        }
      }

      if (!isCorrect) {
        clearSelection();
      } else {
        selectedCells.clear();
      }
    }

    function toggleAnswers() {
      showAnswers = !showAnswers;
      document.querySelectorAll('.cell').forEach((cell, index) => {
        if (showAnswers) {
          for (let word of placedWords) {
            if (word.positions.some(([r, c]) => getCellIndex(r, c) === index)) {
              cell.classList.add('answer');
              return;
            }
          }
        } else {
          cell.classList.remove('answer');
        }
      });
    }

    function checkFoundWords() {
      placedWords.forEach(word => {
        const pill = document.querySelector(\`[data-positions="\${word.positions.map(([r, c]) => \`\${r},\${c}\`).join('|')}"]\`);
        const allSelected = word.positions.every(([r, c]) => selectedCells.has(getCellIndex(r, c)));
        
        if (allSelected) {
          pill.classList.add('found');
        } else {
          pill.classList.remove('found');
        }
      });
    }

    document.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('cell')) {
        isDragging = true;
        clearSelection();
        selectCell(parseInt(e.target.dataset.index));
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (element && element.classList.contains('cell')) {
          toggleCellDuringDrag(parseInt(element.dataset.index));
        }
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        validateSelection();
      }
    });
  </script>
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
