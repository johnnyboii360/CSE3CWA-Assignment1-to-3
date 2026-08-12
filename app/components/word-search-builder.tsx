'use client';

import { useEffect, useState } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';

type WordEntry = {
  phonemeWord: string;
  englishEquivalence: string;
};

const words: WordEntry[] = [
  { phonemeWord: '/ræbɪt/', englishEquivalence: 'rabbit' },
  { phonemeWord: '/mʌfɪn/', englishEquivalence: 'muffin' },
  { phonemeWord: '/wɪndə/', englishEquivalence: 'window' },
  { phonemeWord: '/pɪkət/', englishEquivalence: 'picket' },
  { phonemeWord: '/sɪŋəl/', englishEquivalence: 'single' },
];

function cleanPhoneme(phoneme: string): string {
  return phoneme.replace(/[/ˈˌ]/g, '');
}

function formatPhonemeWithSpaces(phoneme: string): string {
  const cleaned = cleanPhoneme(phoneme);
  return cleaned.split('').join(' ');
}

function getBoardSize(difficulty: Difficulty): number {
  if (difficulty === 'easy') return 8;
  if (difficulty === 'hard') return 12;
  return 10;
}

function buildWordSearch(difficulty: Difficulty) {
  const selectedWords = words.slice(0, 5);
  const placedWords = selectedWords.map((entry) => ({
    phoneme: formatPhonemeWithSpaces(entry.phonemeWord),
    clean: cleanPhoneme(entry.phonemeWord),
  }));
  const longestWordLength = Math.max(...placedWords.map((word) => word.clean.length));
  const baseSize = Math.max(getBoardSize(difficulty), longestWordLength + 1);
  const fillerSymbols = ['θ', 'ɪ', 'æ', 'ʌ', 'ə', 'i', 'u', 'ɔ', 'ɑ', 'ʃ', 'ʒ', 'ŋ', 't', 'k', 's', 'p', 'b', 'm', 'n', 'l', 'r', 'f', 'v', 'h', 'd'];
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (let size = baseSize; size <= baseSize + 6; size += 1) {
    for (let boardAttempt = 0; boardAttempt < 40; boardAttempt += 1) {
      const board = Array.from({ length: size }, () => Array(size).fill(''));
      const placedWordsMap: { [key: string]: { phoneme: string; positions: [number, number][] } } = {};
      let allPlaced = true;
      let placedWordCount = 0;
      let overlappedWordCount = 0;

      placedWords.forEach(({ phoneme, clean }) => {
        const word = clean.toUpperCase();
        let placed = false;

        const letters = word.split('');
        const candidates: Array<{ row: number; col: number; dx: number; dy: number; overlap: number }> = [];

        for (let row = 0; row < size; row += 1) {
          for (let col = 0; col < size; col += 1) {
            directions.forEach(([dx, dy]) => {
              let fits = true;
              let overlap = 0;

              for (let index = 0; index < letters.length; index += 1) {
                const nextRow = row + dx * index;
                const nextCol = col + dy * index;

                if (nextRow < 0 || nextRow >= size || nextCol < 0 || nextCol >= size) {
                  fits = false;
                  break;
                }

                const currentCell = board[nextRow][nextCol];
                if (currentCell !== '' && currentCell !== letters[index]) {
                  fits = false;
                  break;
                }

                if (currentCell === letters[index]) {
                  overlap += 1;
                }
              }

              if (fits) {
                candidates.push({ row, col, dx, dy, overlap });
              }
            });
          }
        }

        if (candidates.length > 0) {
          const overlapCandidates = candidates.filter((candidate) => candidate.overlap > 0);
          const nonOverlapCandidates = candidates.filter((candidate) => candidate.overlap === 0);

          // Keep a balance: some words intersect, others stay separate.
          const targetOverlapRatio = 0.5;
          const currentOverlapRatio = placedWordCount === 0 ? 0 : overlappedWordCount / placedWordCount;

          let preferredCandidates = candidates;
          if (overlapCandidates.length > 0 && nonOverlapCandidates.length > 0) {
            if (currentOverlapRatio < targetOverlapRatio) {
              const maxOverlap = Math.max(...overlapCandidates.map((candidate) => candidate.overlap));
              preferredCandidates = overlapCandidates.filter((candidate) => candidate.overlap === maxOverlap);
            } else {
              preferredCandidates = nonOverlapCandidates;
            }
          } else if (overlapCandidates.length > 0) {
            const maxOverlap = Math.max(...overlapCandidates.map((candidate) => candidate.overlap));
            preferredCandidates = overlapCandidates.filter((candidate) => candidate.overlap === maxOverlap);
          }

          const chosen = preferredCandidates[Math.floor(Math.random() * preferredCandidates.length)];
          const positions: [number, number][] = [];

          letters.forEach((letter, index) => {
            const r = chosen.row + chosen.dx * index;
            const c = chosen.col + chosen.dy * index;
            board[r][c] = letter;
            positions.push([r, c]);
          });

          placedWordsMap[phoneme] = { phoneme, positions };
          placed = true;
          placedWordCount += 1;
          if (chosen.overlap > 0) {
            overlappedWordCount += 1;
          }
        }

        if (!placed) {
          allPlaced = false;
        }
      });

      if (!allPlaced) {
        continue;
      }

      for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
          if (!board[row][col]) {
            board[row][col] = fillerSymbols[Math.floor(Math.random() * fillerSymbols.length)];
          }
        }
      }

      return { size, board, placedWords, placedWordsMap };
    }
  }

  const fallbackSize = Math.max(baseSize + 7, longestWordLength + 2);
  const fallbackBoard = Array.from({ length: fallbackSize }, () => Array(fallbackSize).fill(''));
  const fallbackMap: { [key: string]: { phoneme: string; positions: [number, number][] } } = {};
  placedWords.forEach(({ phoneme, clean }, rowIndex) => {
    const word = clean.toUpperCase();
    const positions: [number, number][] = [];
    word.split('').forEach((letter, index) => {
      fallbackBoard[rowIndex][index] = letter;
      positions.push([rowIndex, index]);
    });
    fallbackMap[phoneme] = { phoneme, positions };
  });

  for (let row = 0; row < fallbackSize; row += 1) {
    for (let col = 0; col < fallbackSize; col += 1) {
      if (!fallbackBoard[row][col]) {
        fallbackBoard[row][col] = fillerSymbols[Math.floor(Math.random() * fillerSymbols.length)];
      }
    }
  }

  return { size: fallbackSize, board: fallbackBoard, placedWords, placedWordsMap: fallbackMap };
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
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [boardState, setBoardState] = useState<ReturnType<typeof buildWordSearch> | null>(null);

  useEffect(() => {
    setBoardState(buildWordSearch(difficulty));
  }, [difficulty]);

  const previewBoard = boardState?.board ?? [];
  const previewCellSize = boardState?.size === 12 ? 30 : boardState?.size === 8 ? 42 : 36;

  const handleGenerate = () => {
    const generatedBoardState = buildWordSearch(difficulty);
    setBoardState(generatedBoardState);

    const wordListHtml = Object.entries(generatedBoardState.placedWordsMap)
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
    .show-answers-btn.inactive,
    .show-answers-btn.inactive:hover {
      background: #10b981;
      color: white;
      cursor: default;
    }
    .grid { display: grid; gap: 6px; grid-template-columns: repeat(${generatedBoardState.size}, 45px); justify-content: center; margin: 30px auto; user-select: none; }
    .grid.locked .cell { cursor: default; }
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
    .cell.answer.found-cell { background: #4ade80; color: white; border-color: #22c55e; }
    .cell.answer.selected {
      background: #fbbf24;
      color: white;
      border-color: #22c55e;
      box-shadow: inset 0 0 0 3px rgba(34, 197, 94, 0.35);
    }
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
      <button class="show-answers-btn" id="show-answers-btn" onclick="toggleAnswers()">Show Answers</button>
    </div>

    <div class="grid" id="grid">
      ${generatedBoardState.board
        .flat()
        .map((letter, index) => `<div class="cell" data-index="${index}">${letter}</div>`)
        .join('')}
    </div>

    <div class="word-list">
      <div class="word-list-title">Word List: </div>
      <div class="list">
        ${wordListHtml}
      </div>
    </div>
  </main>

  <script>
    const boardSize = ${generatedBoardState.size};
    const placedWords = ${JSON.stringify(
      Object.entries(generatedBoardState.placedWordsMap).map(([phoneme, { positions }]) => ({
        phoneme,
        positions,
      }))
    )};
    let showAnswers = false;
    let selectedPath = [];
    let isDragging = false;
    let dragStartIndex = null;
    let gameSolved = false;
    const correctWords = new Set();
    const foundCells = new Set();

    function getCellIndex(row, col) {
      return row * boardSize + col;
    }

    function clearSelection() {
      selectedPath.forEach((index) => {
        const cell = document.querySelector(\`[data-index="\${index}"]\`);
        if (cell) {
          cell.classList.remove('selected');
        }
      });
      selectedPath = [];
    }

    function getIndexFromEvent(e) {
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (!element || !element.classList.contains('cell')) return null;
      return parseInt(element.dataset.index);
    }

    function isStraightLine(startIndex, endIndex) {
      const startRow = Math.floor(startIndex / boardSize);
      const startCol = startIndex % boardSize;
      const endRow = Math.floor(endIndex / boardSize);
      const endCol = endIndex % boardSize;
      const dr = endRow - startRow;
      const dc = endCol - startCol;
      return dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
    }

    function buildPath(startIndex, endIndex) {
      if (!isStraightLine(startIndex, endIndex)) return [];

      const startRow = Math.floor(startIndex / boardSize);
      const startCol = startIndex % boardSize;
      const endRow = Math.floor(endIndex / boardSize);
      const endCol = endIndex % boardSize;
      const dr = endRow - startRow;
      const dc = endCol - startCol;
      const steps = Math.max(Math.abs(dr), Math.abs(dc));
      const stepRow = dr === 0 ? 0 : dr / Math.abs(dr);
      const stepCol = dc === 0 ? 0 : dc / Math.abs(dc);

      const path = [];
      for (let step = 0; step <= steps; step += 1) {
        const row = startRow + stepRow * step;
        const col = startCol + stepCol * step;
        path.push(getCellIndex(row, col));
      }
      return path;
    }

    function applyPath(path) {
      clearSelection();
      selectedPath = [...path];
      selectedPath.forEach((index) => {
          const cell = document.querySelector(\`[data-index="\${index}"]\`);
          cell.classList.add('selected');
      });
    }

    function isExactOrderedMatch(selectionPath, wordPath) {
      if (selectionPath.length !== wordPath.length) return false;
      for (let i = 0; i < selectionPath.length; i += 1) {
        if (selectionPath[i] !== wordPath[i]) {
          return false;
        }
      }
      return true;
    }

    function validateSelection() {
      if (selectedPath.length === 0) return;

      let isCorrect = false;
      for (let word of placedWords) {
        if (correctWords.has(word.phoneme)) continue;

        const wordPath = word.positions.map(([r, c]) => getCellIndex(r, c));
        if (isExactOrderedMatch(selectedPath, wordPath)) {
          isCorrect = true;
          correctWords.add(word.phoneme);
          const pill = document.querySelector(\`[data-positions="\${word.positions.map(([r, c]) => \`\${r},\${c}\`).join('|')}"]\`);
          if (pill) pill.classList.add('found');

          // Mark these cells as found; overlaps remain reusable for later words.
          word.positions.forEach(([r, c]) => {
            foundCells.add(getCellIndex(r, c));
            const cell = document.querySelector(\`[data-index="\${getCellIndex(r, c)}"]\`);
            cell.classList.add('found-cell');
            cell.classList.remove('answer');
            cell.classList.remove('selected');
          });
          break;
        }
      }

      if (!isCorrect) {
        clearSelection();
      } else {
        selectedPath = [];
        if (correctWords.size === placedWords.length) {
          gameSolved = true;
          const grid = document.getElementById('grid');
          const showAnswersButton = document.getElementById('show-answers-btn');
          if (grid) {
            grid.classList.add('locked');
          }
          if (showAnswersButton) {
            showAnswersButton.disabled = true;
            showAnswersButton.classList.add('inactive');
          }
        }
      }
    }

    function toggleAnswers() {
      if (gameSolved) return;

      isDragging = false;
      dragStartIndex = null;
      clearSelection();
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

    document.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      if (gameSolved) return;
      const startIndex = getIndexFromEvent(e);
      if (startIndex === null) return;

      isDragging = true;
      dragStartIndex = startIndex;
      applyPath([startIndex]);
    });

    document.addEventListener('mousemove', (e) => {
      if (gameSolved) return;
      if (!isDragging || dragStartIndex === null) return;

      // Only keep dragging while left mouse button is held down.
      if ((e.buttons & 1) !== 1) {
        isDragging = false;
        dragStartIndex = null;
        validateSelection();
        return;
      }

      const currentIndex = getIndexFromEvent(e);
      if (currentIndex === null) return;

      const path = buildPath(dragStartIndex, currentIndex);
      if (path.length > 0) {
        applyPath(path);
      }
    });

    document.addEventListener('mouseup', (e) => {
      if (e.button !== 0) return;
      if (gameSolved) return;
      if (isDragging) {
        isDragging = false;
        dragStartIndex = null;
        validateSelection();
      }
    });
  </script>
</body>
</html>`;

    downloadHtml(html, 'phoneme-word-search.html');
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
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

        <div className="mt-5">
          <label className="block text-sm font-medium">
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
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Word bank (space separated phonemes)</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {words.map((word) => (
              <li key={word.phonemeWord} className="rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                {formatPhonemeWithSpaces(word.phonemeWord)} • {word.englishEquivalence}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Live preview</p>
        <h3 className="mt-1 text-center text-3xl font-semibold">Phoneme Word Search</h3>
        <p className="mt-3 text-center text-sm text-slate-600 dark:text-slate-400">Find the phoneme-based words in the grid. Drag across letters to select them.</p>

        <div className="mt-4 flex justify-center">
          <button type="button" className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white" disabled>
            Show Answers
          </button>
        </div>

        {previewBoard.length ? (
          <div className="mt-5 flex justify-center">
            <div
              className="mx-auto grid w-fit gap-1.5"
              style={{ gridTemplateColumns: `repeat(${boardState?.size ?? 10}, ${previewCellSize}px)` }}
            >
              {previewBoard.flat().map((letter, index) => (
                <div
                  key={`${letter}-${index}`}
                  className="flex items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
                  style={{ width: `${previewCellSize}px`, height: `${previewCellSize}px` }}
                >
                  {letter}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Word List:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {words.map((word) => (
              <span key={word.phonemeWord} className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300">
                {formatPhonemeWithSpaces(word.phonemeWord)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
