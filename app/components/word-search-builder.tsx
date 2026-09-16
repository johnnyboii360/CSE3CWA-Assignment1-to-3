'use client';

import { useEffect, useMemo, useState } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';

type WordEntry = {
  phonemeWord: string;
  englishEquivalence: string;
};

type StoredActivity = {
  id: string;
  title: string;
  difficulty: Difficulty;
  hint: string;
  generatedHtmlSettings?: Record<string, unknown> | string;
  words: WordEntry[];
};

function getGridSize(settings: StoredActivity['generatedHtmlSettings'], difficulty: Difficulty): number {
  const parsed = typeof settings === 'string' ? JSON.parse(settings || '{}') : settings;
  const value = typeof parsed?.gridSize === 'number' ? parsed.gridSize : getBoardSize(difficulty);
  return Math.min(20, Math.max(8, Math.round(value)));
}

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

function buildWordSearch(difficulty: Difficulty, sourceWords: WordEntry[] = words, sizeOverride?: number) {
  const selectedWords = sourceWords.slice(0, 5);
  const placedWords = selectedWords.map((entry) => ({
    phoneme: formatPhonemeWithSpaces(entry.phonemeWord),
    clean: cleanPhoneme(entry.phonemeWord),
  }));
  const longestWordLength = Math.max(...placedWords.map((word) => word.clean.length));
  const baseSize = Math.max(sizeOverride ?? getBoardSize(difficulty), longestWordLength + 1);
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

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

export function WordSearchBuilder() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [boardState, setBoardState] = useState<ReturnType<typeof buildWordSearch> | null>(null);
  const [storedActivities, setStoredActivities] = useState<StoredActivity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [selectedPath, setSelectedPath] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [foundWords, setFoundWords] = useState<string[]>([]);

  const boardSize = boardState?.size ?? 0;
  const selectedActivity = storedActivities.find((activity) => activity.id === selectedActivityId);
  const activeWords = selectedActivity?.words ?? words;
  const configuredGridSize = getGridSize(selectedActivity?.generatedHtmlSettings, difficulty);

  const wordPaths = useMemo(() => {
    if (!boardState) return {} as Record<string, number[]>;

    return Object.fromEntries(
      boardState.placedWords.map(({ phoneme }) => {
        const positions = boardState.placedWordsMap[phoneme]?.positions ?? [];
        return [phoneme, positions.map(([row, col]) => row * boardState.size + col)];
      })
    );
  }, [boardState]);

  const buildPath = (startIndex: number, endIndex: number) => {
    if (!boardState || boardSize <= 0) return [];

    const startRow = Math.floor(startIndex / boardSize);
    const startCol = startIndex % boardSize;
    const endRow = Math.floor(endIndex / boardSize);
    const endCol = endIndex % boardSize;
    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;

    if (rowDiff !== 0 && colDiff !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff)) {
      return [];
    }

    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
    const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
    const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);

    return Array.from({ length: steps + 1 }, (_, step) => {
      const row = startRow + rowStep * step;
      const col = startCol + colStep * step;
      return row * boardSize + col;
    });
  };

  const validateSelection = (path: number[]) => {
    if (!boardState || path.length === 0) return false;

    const match = boardState.placedWords.find(({ phoneme }) => {
      if (foundWords.includes(phoneme)) {
        return false;
      }

      const expectedPath: number[] = wordPaths[phoneme] ?? [];
      return expectedPath.length === path.length && expectedPath.every((cellIndex: number, index: number) => cellIndex === path[index]);
    });

    if (!match) {
      setSelectedPath([]);
      return false;
    }

    setFoundWords((existingWords) => (existingWords.includes(match.phoneme) ? existingWords : [...existingWords, match.phoneme]));
    setSelectedPath([]);
    return true;
  };

  const handlePointerDown = (index: number) => {
    setIsDragging(true);
    setSelectedPath([index]);
  };

  const handlePointerEnter = (index: number) => {
    if (!isDragging || selectedPath.length === 0) return;

    const nextPath = buildPath(selectedPath[0], index);
    if (nextPath.length > 0) {
      setSelectedPath(nextPath);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;

    setIsDragging(false);
    validateSelection(selectedPath);
  };

  const handleCellKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      if (selectedPath.length === 0) {
        setSelectedPath([index]);
        return;
      }

      const nextPath = buildPath(selectedPath[0], index);
      if (nextPath.length > 0) {
        setSelectedPath(nextPath);
        validateSelection(nextPath);
      }
      return;
    }

    const row = Math.floor(index / boardSize);
    const col = index % boardSize;
    const movementMap: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };

    const delta = movementMap[event.key];
    if (!delta) return;

    event.preventDefault();
    const nextRow = Math.min(boardSize - 1, Math.max(0, row + delta[0]));
    const nextCol = Math.min(boardSize - 1, Math.max(0, col + delta[1]));
    const nextIndex = nextRow * boardSize + nextCol;

    const target = event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`button[data-index="${nextIndex}"]`);
    target?.focus();

    if (selectedPath.length > 0) {
      const nextPath = buildPath(selectedPath[0], nextIndex);
      if (nextPath.length > 0) {
        setSelectedPath(nextPath);
      }
    }
  };

  const resetPreviewState = () => {
    setSelectedPath([]);
    setIsDragging(false);
    setShowAnswers(false);
    setFoundWords([]);
  };

  useEffect(() => {
    const nextBoard = buildWordSearch(difficulty, activeWords, configuredGridSize);
    // regenerate board whenever difficulty or the selected activity's words change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBoardState(nextBoard);
    resetPreviewState();
  }, [difficulty, selectedActivityId, storedActivities]);

  useEffect(() => {
    const loadActivities = () => {
      fetch('/api/activity-sets?type=WORD_SEARCH')
        .then((response) => response.ok ? response.json() : [])
        .then((activities: StoredActivity[]) => {
          setStoredActivities(activities);
          if (activities.length > 0) {
            setSelectedActivityId((current) => current || activities[0].id);
            setDifficulty((current) => current === 'medium' ? activities[0].difficulty : current);
          }
        })
        .catch(() => setStoredActivities([]));
    };

    loadActivities();
    window.addEventListener('focus', loadActivities);
    document.addEventListener('visibilitychange', loadActivities);
    return () => {
      window.removeEventListener('focus', loadActivities);
      document.removeEventListener('visibilitychange', loadActivities);
    };
  }, []);

  useEffect(() => {
    if (!boardState) return;

    const handlePointerUpAnywhere = () => {
      if (isDragging) {
        handlePointerUp();
      }
    };

    window.addEventListener('pointerup', handlePointerUpAnywhere);

    return () => {
      window.removeEventListener('pointerup', handlePointerUpAnywhere);
    };
  }, [isDragging, selectedPath, boardState]);

  const previewBoard = boardState?.board ?? [];
  const previewCellSize = boardState?.size === 12 ? 30 : boardState?.size === 8 ? 42 : 36;
  const previewSolved = Boolean(boardState && foundWords.length === boardState.placedWords.length);

  const handleGenerate = () => {
    const generatedBoardState = buildWordSearch(difficulty, activeWords, configuredGridSize);
    setBoardState(generatedBoardState);
    const generatedHint = escapeHtml(selectedActivity?.hint || 'Find the phoneme-based words in the grid. Drag across letters to select them.');

    const wordListHtml = Object.entries(generatedBoardState.placedWordsMap)
      .map(([phoneme, { positions }]) => {
        const positionStr = positions.map(([r, c]) => `${r},${c}`).join('|');
        const englishWord = activeWords.find((word) => formatPhonemeWithSpaces(word.phonemeWord) === phoneme)?.englishEquivalence ?? '';
        return `<span class="pill" data-positions="${positionStr}" data-phoneme="${phoneme}" data-english="${escapeHtml(englishWord)}">${phoneme}</span>`;
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
    body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 32px 16px; }
    main { max-width: 960px; margin: 0 auto; }
    h1 { text-align: center; color: #0f172a; margin: 0 0 8px; font-size: 30px; line-height: 1.2; }
    .instructions { text-align: center; color: #475569; margin: 12px auto 20px; max-width: 620px; font-size: 14px; }
    .button-group { display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; }
    button { border: none; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .show-answers-btn { background: #059669; color: white; }
    .show-answers-btn:hover { background: #047857; }
    .show-answers-btn.active,
    .show-answers-btn.active:hover,
    .show-answers-btn.inactive,
    .show-answers-btn.inactive:hover {
      background: #059669;
      color: white;
      cursor: pointer;
    }
    .show-answers-btn.active:hover { background: #047857; }
    .grid { display: grid; gap: 6px; grid-template-columns: repeat(${generatedBoardState.size}, 45px); justify-content: center; margin: 24px auto; user-select: none; }
    .grid.locked .cell { cursor: default; }
    .cell { 
      width: 45px; height: 45px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      border-radius: 12px; 
      background: #f8fafc; 
      border: 1px solid #cbd5e1;
      color: #1e293b;
      font-weight: 600; 
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
      user-select: none;
      padding: 0;
    }
    .cell:hover { background: #f1f5f9; }
    .cell:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }
    .cell.selected { background: #4ade80; color: white; border-color: #22c55e; box-shadow: 0 4px 8px rgba(34, 197, 94, 0.25); }
    .cell.found-cell { background: #4ade80; color: white; border-color: #22c55e; }
    .cell.answer { background: #ffb914; color: white; border-color: #f59e0b; }
    .cell.answer.found-cell { background: #4ade80; color: white; border-color: #22c55e; }
    .cell.answer.selected {
      background: #ffb914;
      color: white;
      border: 4px solid #4ade80;
      box-shadow: 0 0 0 1px rgba(74, 222, 128, 0.35);
    }
    .word-list { 
      margin-top: 30px; 
      padding: 20px; 
      background: #f8fafc; 
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    .word-list-title { font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 12px; }
    .list { display: flex; flex-wrap: wrap; gap: 8px; }
    .pill { 
      display: inline-block;
      border-radius: 999px; 
      padding: 8px 12px; 
      background: #fffbeb; 
      border: 1px solid #fcd34d;
      color: #b45309;
      font-size: 13px;
      font-weight: 500;
      user-select: none;
      transition: all 0.2s;
    }
    .pill:hover { background: #fef3c7; }
    .pill.found { background: #dcfce7; border-color: #86efac; color: #166534; }
  </style>
</head>
<body>
  <main>
    <h1>Phoneme Word Search</h1>
    <p class="instructions">${generatedHint}</p>
    
    <div class="button-group">
      <button class="show-answers-btn" id="show-answers-btn" onclick="toggleAnswers()">Show Answers</button>
    </div>

    <div class="grid" id="grid">
      ${generatedBoardState.board
        .flat()
        .map((letter, index) => `<button type="button" class="cell" data-index="${index}" aria-label="Cell ${index + 1}, letter ${letter}">${letter}</button>`)
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
            showAnswersButton.classList.remove('active');
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
      const showAnswersButton = document.getElementById('show-answers-btn');
      if (showAnswersButton) {
        showAnswersButton.classList.toggle('active', showAnswers);
      }
      document.querySelectorAll('.cell').forEach((cell, index) => {
        if (showAnswers) {
          for (let word of placedWords) {
            if (!foundCells.has(index) && word.positions.some(([r, c]) => getCellIndex(r, c) === index)) {
              cell.classList.add('answer');
              return;
            }
          }
        } else {
          cell.classList.remove('answer');
        }
      });
      document.querySelectorAll('.pill').forEach((pill) => {
        const phoneme = pill.getAttribute('data-phoneme') ?? pill.textContent ?? '';
        const englishWord = pill.getAttribute('data-english') ?? '';
        pill.textContent = showAnswers && englishWord ? phoneme + ' • ' + englishWord : phoneme;
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
          {storedActivities.length > 0 && (
            <label className="mb-4 block text-sm font-medium">
              Saved activity
              <select value={selectedActivityId} onChange={(event) => {
                const activity = storedActivities.find((item) => item.id === event.target.value);
                setSelectedActivityId(event.target.value);
                if (activity) setDifficulty(activity.difficulty);
              }} className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                {storedActivities.map((activity) => <option key={activity.id} value={activity.id}>{activity.title}</option>)}
              </select>
            </label>
          )}
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
            {activeWords.map((word) => (
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
        <p className="mt-3 text-center text-sm text-slate-600 dark:text-slate-400">{selectedActivity?.hint || 'Find the phoneme-based words in the grid. Drag across letters to select them.'}</p>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAnswers((current) => !current)}
            disabled={previewSolved}
            className={`rounded-lg px-5 py-2 text-sm font-semibold text-white transition disabled:cursor-default ${showAnswers ? 'bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600'}`}
          >
            {showAnswers ? 'Hide Answers' : 'Show Answers'}
          </button>
        </div>

        {previewBoard.length ? (
          <div className="mt-5 flex justify-center">
            <div
              className="mx-auto grid w-fit gap-1.5"
              style={{ gridTemplateColumns: `repeat(${boardState?.size ?? 10}, ${previewCellSize}px)` }}
            >
              {previewBoard.flat().map((letter, index) => (
                <button
                  key={`${letter}-${index}`}
                  type="button"
                  data-index={index}
                  aria-label={`Cell ${index + 1}, letter ${letter}`}
                  onPointerDown={() => handlePointerDown(index)}
                  onPointerEnter={() => handlePointerEnter(index)}
                  onPointerMove={() => handlePointerEnter(index)}
                  onPointerUp={handlePointerUp}
                  onKeyDown={(event) => handleCellKeyDown(event, index)}
                  className={`flex items-center justify-center rounded-xl border text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                    selectedPath.includes(index)
                      ? showAnswers && boardState?.placedWords.some(({ phoneme }) => (wordPaths[phoneme] ?? []).includes(index))
                        ? 'border-4 border-[#4ade80] bg-[#ffb914] text-white shadow-md'
                        : 'border-[#22c55e] bg-[#4ade80] text-white shadow-md'
                      : showAnswers && !foundWords.some((word) => (wordPaths[word] ?? []).includes(index)) && boardState?.placedWords.some(({ phoneme }) => (wordPaths[phoneme] ?? []).includes(index))
                        ? 'border-[#f59e0b] bg-[#ffb914] text-white shadow-sm'
                        : 'border-slate-300 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                  } ${foundWords.some((word) => (wordPaths[word] ?? []).includes(index)) ? '!border-[#22c55e] !bg-[#4ade80] !text-white shadow-sm' : ''}`}
                  style={{ width: `${previewCellSize}px`, height: `${previewCellSize}px`, touchAction: 'none' }}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Word List:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {boardState?.placedWords.map(({ phoneme }) => (
              (() => {
                const englishWord = activeWords.find((word) => formatPhonemeWithSpaces(word.phonemeWord) === phoneme)?.englishEquivalence;
                return (
              <span
                key={phoneme}
                className={`rounded-full border px-3 py-1 text-sm ${
                  foundWords.includes(phoneme)
                    ? 'border-[#86efac] bg-[#dcfce7] text-[#166534]'
                    : 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {showAnswers && englishWord ? `${phoneme} • ${englishWord}` : phoneme}
              </span>
                );
              })()
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
