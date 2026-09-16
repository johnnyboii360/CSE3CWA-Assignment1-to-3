'use client';

import { useEffect, useMemo, useState } from 'react';

type WordOption = {
  id: string;
  phonemeWord: string;
  englishEquivalence: string;
  hint: string;
  clue: string;
  cards: Array<{ symbol: string; label: string; letter: string }>;
};

type GuessState = 'correct' | 'present' | 'absent';

type StoredWord = {
  id: string;
  phonemeWord: string;
  englishEquivalence: string;
  phonemes: string | string[];
};

type StoredActivity = {
  id: string;
  title: string;
  hint: string;
  generatedHtmlSettings?: Record<string, unknown> | string;
  words: StoredWord[];
};

function getMaxAttempts(settings: StoredActivity['generatedHtmlSettings']): number {
  const parsed = typeof settings === 'string' ? JSON.parse(settings || '{}') : settings;
  const value = typeof parsed?.maxAttempts === 'number' ? parsed.maxAttempts : 6;
  return Math.min(10, Math.max(1, Math.round(value)));
}

const distractorKeys: Array<{ symbol: string; label: string }> = [
  { symbol: 'θ', label: 'TH (as in thin)' },
  { symbol: 'ʃ', label: 'SH (as in ship)' },
  { symbol: 'ʒ', label: 'ZH (as in measure)' },
  { symbol: 'ŋ', label: 'NG (as in sing)' },
  { symbol: 'u', label: 'long OO (as in boot)' },
  { symbol: 'ɔ', label: 'aw (as in saw)' },
  { symbol: 'b', label: 'B (as in bat)' },
  { symbol: 'd', label: 'D (as in dog)' },
];

const preferredKeyboardOrder = ['ɪ', 't', 'ʃ', 'ə', 'v', 'k', 'ɔ', 'm', 'θ', 'r', 'æ', 'd', 'u', 'ʒ', 'p', 'ɒ', 'l', 'ŋ', 'b', 'ɛ'];

function stripSlashes(symbol: string): string {
  return symbol.replace(/^\//, '').replace(/\/$/, '');
}

function buildKeyboardEntries(options: WordOption[]) {
  const labelMap = new Map<string, string>();
  options.forEach((option) => {
    option.cards.forEach((card) => {
      const symbol = stripSlashes(card.symbol);
      if (!labelMap.has(symbol)) {
        labelMap.set(symbol, card.label);
      }
    });
  });

  distractorKeys.forEach((key) => {
    if (!labelMap.has(key.symbol)) {
      labelMap.set(key.symbol, key.label);
    }
  });

  const availableSymbols = new Set<string>([
    ...options.flatMap((option) => option.cards.map((card) => stripSlashes(card.symbol))),
    ...distractorKeys.map((key) => key.symbol),
  ]);

  const orderMap = new Map<string, number>(preferredKeyboardOrder.map((symbol, index) => [symbol, index]));

  return Array.from(availableSymbols)
    .sort((a, b) => {
      const ai = orderMap.has(a) ? orderMap.get(a)! : Number.MAX_SAFE_INTEGER;
      const bi = orderMap.has(b) ? orderMap.get(b)! : Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;
      return a.localeCompare(b);
    })
    .map((symbol) => ({
      symbol,
      label: labelMap.get(symbol) ?? symbol,
    }));
}

function evaluateGuess(guess: string[], target: string[]): GuessState[] {
  const result: GuessState[] = Array(guess.length).fill('absent');
  const remainingTarget: Array<string | null> = [...target];

  guess.forEach((symbol, index) => {
    if (symbol === target[index]) {
      result[index] = 'correct';
      remainingTarget[index] = null;
    }
  });

  guess.forEach((symbol, index) => {
    if (result[index] === 'correct') return;

    const targetIndex = remainingTarget.indexOf(symbol);
    if (targetIndex !== -1) {
      result[index] = 'present';
      remainingTarget[targetIndex] = null;
    }
  });

  return result;
}

function getStatePriority(state: GuessState): number {
  if (state === 'correct') return 3;
  if (state === 'present') return 2;
  return 1;
}

const wordOptions: WordOption[] = [
  {
    id: 'camel',
    phonemeWord: '/kæməl/',
    englishEquivalence: 'camel',
    hint: 'This word starts with K and has a schwa before the final L sound.',
    clue: 'K + schwa + L',
    cards: [
      { symbol: '/k/', label: 'K as in kite', letter: 'c' },
      { symbol: '/æ/', label: 'short A', letter: 'a' },
      { symbol: '/m/', label: 'M as in map', letter: 'm' },
      { symbol: '/ə/', label: 'schwa', letter: 'e' },
      { symbol: '/l/', label: 'L as in lamp', letter: 'l' },
    ],
  },
  {
    id: 'river',
    phonemeWord: '/rɪvər/',
    englishEquivalence: 'river',
    hint: 'This word begins with R and has V in the middle.',
    clue: 'R + V middle',
    cards: [
      { symbol: '/r/', label: 'R as in rabbit', letter: 'r' },
      { symbol: '/ɪ/', label: 'short I', letter: 'i' },
      { symbol: '/v/', label: 'V as in van', letter: 'v' },
      { symbol: '/ə/', label: 'schwa', letter: 'e' },
      { symbol: '/r/', label: 'R as in rabbit', letter: 'r' },
    ],
  },
  {
    id: 'pocket',
    phonemeWord: '/pɒkɪt/',
    englishEquivalence: 'pocket',
    hint: 'This word starts with P and ends with T.',
    clue: 'P + short O',
    cards: [
      { symbol: '/p/', label: 'P as in pig', letter: 'p' },
      { symbol: '/ɒ/', label: 'short O', letter: 'o' },
      { symbol: '/k/', label: 'K as in kite', letter: 'ck' },
      { symbol: '/ɪ/', label: 'short I', letter: 'i' },
      { symbol: '/t/', label: 'T as in tap', letter: 't' },
    ],
  },
  {
    id: 'metal',
    phonemeWord: '/mɛtəl/',
    englishEquivalence: 'metal',
    hint: 'This word has a short E and ends with a schwa plus L.',
    clue: 'M + short E',
    cards: [
      { symbol: '/m/', label: 'M as in map', letter: 'm' },
      { symbol: '/ɛ/', label: 'short E', letter: 'e' },
      { symbol: '/t/', label: 'T as in tap', letter: 't' },
      { symbol: '/ə/', label: 'schwa', letter: 'e' },
      { symbol: '/l/', label: 'L as in lamp', letter: 'l' },
    ],
  },
  {
    id: 'ticket',
    phonemeWord: '/tɪkət/',
    englishEquivalence: 'ticket',
    hint: 'This word starts with T and has K in the middle.',
    clue: 'T + K middle',
    cards: [
      { symbol: '/t/', label: 'T as in tap', letter: 't' },
      { symbol: '/ɪ/', label: 'short I', letter: 'i' },
      { symbol: '/k/', label: 'K as in kite', letter: 'ck' },
      { symbol: '/ə/', label: 'schwa', letter: 'l' },
      { symbol: '/t/', label: 'T as in tap', letter: 'et' },
    ],
  },
];

function wordOptionFromStoredWord(word: StoredWord): WordOption {
  const phonemes = Array.isArray(word.phonemes) ? word.phonemes : JSON.parse(word.phonemes || '[]');
  return {
    id: `stored-${word.id}`,
    phonemeWord: word.phonemeWord,
    englishEquivalence: word.englishEquivalence,
    hint: `Build the phoneme sequence for ${word.englishEquivalence}.`,
    clue: phonemes.join(' + '),
    cards: phonemes.map((symbol: string, index: number) => ({ symbol: `/${symbol}/`, label: `Phoneme ${symbol}`, letter: word.englishEquivalence[index] ?? '' })),
  };
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

export function WordleBuilder() {
  const [selectedWordId, setSelectedWordId] = useState(wordOptions[0].id);
  const [storedActivities, setStoredActivities] = useState<StoredActivity[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [guesses, setGuesses] = useState<string[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [keyStates, setKeyStates] = useState<Record<string, GuessState>>({});
  const [solved, setSolved] = useState(false);

  const selectedActivity = storedActivities.find((activity) => activity.id === selectedActivityId);
  const availableWordOptions = useMemo(() => selectedActivity ? selectedActivity.words.map(wordOptionFromStoredWord) : wordOptions, [selectedActivity]);
  const selectedWord = useMemo(() => availableWordOptions.find((word) => word.id === selectedWordId) ?? availableWordOptions[0], [availableWordOptions, selectedWordId]);
  const targetSymbols = useMemo(() => selectedWord.cards.map((card) => stripSlashes(card.symbol)), [selectedWord]);
  const keyboardEntries = useMemo(() => buildKeyboardEntries(availableWordOptions), [availableWordOptions]);
  const maxAttempts = getMaxAttempts(selectedActivity?.generatedHtmlSettings);

  useEffect(() => {
    const loadActivities = () => {
      fetch('/api/activity-sets?type=WORDLE')
        .then((response) => response.ok ? response.json() : [])
        .then((activities: StoredActivity[]) => {
          setStoredActivities(activities);
          if (activities.length > 0) {
            setSelectedActivityId((current) => current || activities[0].id);
            setSelectedWordId((current) => current || `stored-${activities[0].words[0].id}`);
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
    if (selectedActivity && !selectedActivity.words.some((word) => `stored-${word.id}` === selectedWordId)) {
      // keep the selection valid when the active activity's word list changes
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedWordId(`stored-${selectedActivity.words[0].id}`);
    }
  }, [selectedActivity, selectedWordId]);

  useEffect(() => {
    // reset the guess board whenever a new word is selected
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuesses([]);
    setCurrentGuess([]);
    setKeyStates({});
    setSolved(false);
  }, [selectedWordId]);

  const addSymbol = (symbol: string) => {
    if (solved || guesses.length >= maxAttempts || currentGuess.length >= targetSymbols.length) return;
    setCurrentGuess((guess) => [...guess, symbol]);
  };

  const deleteSymbol = () => {
    if (solved || guesses.length >= maxAttempts) return;
    setCurrentGuess((guess) => guess.slice(0, -1));
  };

  const submitGuess = () => {
    if (solved || guesses.length >= maxAttempts || currentGuess.length !== targetSymbols.length) return;

    const submittedGuess = [...currentGuess];
    const score = evaluateGuess(submittedGuess, targetSymbols);

    setGuesses((existingGuesses) => [...existingGuesses, submittedGuess]);
    setKeyStates((existingStates) => {
      const nextStates = { ...existingStates };
      submittedGuess.forEach((symbol, index) => {
        const state = score[index];
        const previousState = nextStates[symbol];
        if (!previousState || getStatePriority(state) > getStatePriority(previousState)) {
          nextStates[symbol] = state;
        }
      });
      return nextStates;
    });
    setSolved(score.every((state) => state === 'correct'));
    setCurrentGuess([]);
  };

  const handleGenerate = () => {
    const generatedHint = escapeHtml(selectedActivity?.hint || selectedWord.hint);
    const generatedMaxAttempts = getMaxAttempts(selectedActivity?.generatedHtmlSettings);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Phoneme Wordle</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f4f7fb; color: #14213d; }
    main { max-width: 860px; margin: 0 auto; padding: 24px; }
    .card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 8px 24px rgba(20,33,61,0.1); }
    .hint { color: #4b5563; font-size: 0.95rem; margin-top: 8px; }
    .board { display: grid; gap: 8px; margin: 18px 0 24px; justify-content: center; }
    .row { display: grid; gap: 8px; }
    .tile {
      width: 58px;
      height: 58px;
      border: 2px solid #dbeafe;
      border-radius: 10px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 22px;
      color: #14213d;
    }
    .tile.correct { background: #22c55e; border-color: #16a34a; color: #fff; }
    .tile.present { background: #f59e0b; border-color: #d97706; color: #fff; }
    .tile.absent { background: #94a3b8; border-color: #64748b; color: #fff; }
    .keyboard { display: grid; gap: 8px; justify-content: center; }
    .kb-row { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
    .key {
      min-width: 44px;
      padding: 10px 12px;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      background: #f0f9ff;
      color: #0f172a;
      cursor: pointer;
      font-weight: 600;
    }
    .key:hover { background: #e0f2fe; }
    .key.correct { background: #22c55e; border-color: #16a34a; color: #fff; }
    .key.present { background: #f59e0b; border-color: #d97706; color: #fff; }
    .key.absent { background: #94a3b8; border-color: #64748b; color: #fff; }
    .controls { display: flex; gap: 8px; justify-content: center; margin-top: 8px; }
    .control-key {
      min-width: 96px;
      padding: 10px 14px;
      border: none;
      border-radius: 8px;
      background: #1f5eff;
      color: #fff;
      cursor: pointer;
      font-weight: 600;
    }
    .control-key:hover { background: #1d4ed8; }
    .key:disabled, .control-key:disabled { cursor: default; }
    .key:disabled:hover { background: #f0f9ff; }
    .control-key:disabled:hover { background: #1f5eff; }
    .result { margin-top: 14px; font-weight: 600; text-align: center; }
    .meta { color: #334155; text-align: center; margin-top: 6px; }
  </style>
</head>
<body>
  <main>
    <div class="card">
      <h1>Phoneme Wordle</h1>
      <p class="meta">${generatedHint}</p>

      <div id="board" class="board"></div>

      <div class="keyboard" id="keyboard">
        <div class="kb-row" id="kb-row"></div>
      </div>
      <div class="controls">
        <button class="control-key" id="enter-btn">Enter</button>
        <button class="control-key" id="delete-btn">Delete</button>
      </div>
      <p id="result" class="result"></p>
    </div>
  </main>
  <script>
    const target = ${JSON.stringify(targetSymbols)};
    const answerWord = ${JSON.stringify(selectedWord.englishEquivalence)};
    const keyboardEntries = ${JSON.stringify(keyboardEntries)};
    const maxAttempts = ${generatedMaxAttempts};
    let guesses = [];
    let currentGuess = [];
    let solved = false;
    const keyStates = {};

    function renderKeyboard() {
      const row = document.getElementById('kb-row');
      if (!row) return;
      row.innerHTML = '';

      keyboardEntries.forEach((entry) => {
        const btn = document.createElement('button');
        btn.className = 'key';
        btn.setAttribute('data-symbol', entry.symbol);
        btn.setAttribute('title', entry.label);
        btn.setAttribute('aria-label', '/' + entry.symbol + '/ ' + entry.label);
        btn.textContent = '/' + entry.symbol + '/';
        btn.addEventListener('click', () => addSymbol(entry.symbol));
        row.appendChild(btn);
      });
    }

    function statePriority(state) {
      if (state === 'correct') return 3;
      if (state === 'present') return 2;
      if (state === 'absent') return 1;
      return 0;
    }

    function updateKeyState(symbol, state) {
      const current = keyStates[symbol];
      if (!current || statePriority(state) > statePriority(current)) {
        keyStates[symbol] = state;
      }
    }

    function evaluateGuess(guess) {
      const result = Array(guess.length).fill('absent');
      const remainingTarget = [...target];

      for (let i = 0; i < guess.length; i += 1) {
        if (guess[i] === target[i]) {
          result[i] = 'correct';
          remainingTarget[i] = null;
        }
      }

      for (let i = 0; i < guess.length; i += 1) {
        if (result[i] === 'correct') continue;
        const idx = remainingTarget.indexOf(guess[i]);
        if (idx !== -1) {
          result[i] = 'present';
          remainingTarget[idx] = null;
        }
      }

      return result;
    }

    function render() {
      const board = document.getElementById('board');
      const result = document.getElementById('result');
      board.innerHTML = '';
      board.style.gridTemplateRows = 'repeat(' + maxAttempts + ', auto)';

      for (let row = 0; row < maxAttempts; row += 1) {
        const rowEl = document.createElement('div');
        rowEl.className = 'row';
        rowEl.style.gridTemplateColumns = 'repeat(' + target.length + ', 58px)';

        const guess = guesses[row];
        const score = guess ? evaluateGuess(guess) : null;

        for (let col = 0; col < target.length; col += 1) {
          const tile = document.createElement('div');
          tile.className = 'tile';

          if (guess) {
            tile.textContent = guess[col] || '';
            tile.classList.add(score[col]);
          } else if (row === guesses.length) {
            tile.textContent = currentGuess[col] || '';
          }

          rowEl.appendChild(tile);
        }

        board.appendChild(rowEl);
      }

      document.querySelectorAll('.key[data-symbol]').forEach((btn) => {
        btn.classList.remove('correct', 'present', 'absent');
        const symbol = btn.getAttribute('data-symbol');
        const state = keyStates[symbol];
        if (state) {
          btn.classList.add(state);
        }
        btn.disabled = solved || guesses.length >= maxAttempts;
      });

      const enterButton = document.getElementById('enter-btn');
      const deleteButton = document.getElementById('delete-btn');
      if (enterButton) enterButton.disabled = solved || guesses.length >= maxAttempts;
      if (deleteButton) deleteButton.disabled = solved || guesses.length >= maxAttempts;

      if (solved) {
        result.textContent = 'English equivalence: ' + answerWord;
        result.style.color = '#15803d';
      } else if (guesses.length >= maxAttempts) {
        result.textContent = 'Out of attempts. The answer was /' + target.join('') + '/ (' + answerWord + ').';
        result.style.color = '#b91c1c';
      } else {
        result.textContent = '';
        result.style.color = '#334155';
      }
    }

    function addSymbol(symbol) {
      if (solved || guesses.length >= maxAttempts) return;
      if (currentGuess.length >= target.length) return;
      currentGuess.push(symbol);
      render();
    }

    function deleteSymbol() {
      if (solved || guesses.length >= maxAttempts) return;
      currentGuess.pop();
      render();
    }

    function submitGuess() {
      if (solved || guesses.length >= maxAttempts) return;
      if (currentGuess.length !== target.length) return;

      const guess = [...currentGuess];
      guesses.push(guess);
      const score = evaluateGuess(guess);
      score.forEach((state, index) => updateKeyState(guess[index], state));

      solved = score.every((entry) => entry === 'correct');
      currentGuess = [];
      render();
    }

    renderKeyboard();
    document.getElementById('delete-btn').addEventListener('click', deleteSymbol);
    document.getElementById('enter-btn').addEventListener('click', submitGuess);

    render();
  </script>
</body>
</html>`;

    downloadHtml(html, 'phoneme-wordle.html');
  };

  const hintText = selectedWord.hint;

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
          {storedActivities.length > 0 && (
            <label className="block text-sm font-medium">
              Saved activity
              <select value={selectedActivityId} onChange={(event) => setSelectedActivityId(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                {storedActivities.map((activity) => <option key={activity.id} value={activity.id}>{activity.title}</option>)}
              </select>
            </label>
          )}
          <label className="block text-sm font-medium">
            Choose a phoneme word
            <select
              value={selectedWordId}
              onChange={(event) => {
                setSelectedWordId(event.target.value);
              }}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              {availableWordOptions.map((word) => (
                <option key={word.id} value={word.id}>
                  {word.phonemeWord} • {word.englishEquivalence}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Teacher preview</p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Phoneme word: {selectedWord.phonemeWord}</p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{selectedActivity?.hint || hintText}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Live preview</p>
        <h3 className="mt-1 text-3xl font-semibold">Phoneme Wordle</h3>
        <p className="mt-3 text-center text-sm text-slate-600 dark:text-slate-400">{selectedActivity?.hint || hintText}</p>

        <div className="mt-5 grid justify-center gap-2">
          {Array.from({ length: maxAttempts }).map((_, rowIndex) => {
            const guess = guesses[rowIndex];
            const score = guess ? evaluateGuess(guess, targetSymbols) : null;

            return (
            <div key={rowIndex} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${targetSymbols.length}, 58px)` }}>
              {Array.from({ length: targetSymbols.length }).map((__, cellIndex) => (
                <div
                  key={`${rowIndex}-${cellIndex}`}
                  className={`flex h-[58px] w-[58px] items-center justify-center rounded-[10px] border-2 text-xl font-bold transition ${
                    score
                      ? score[cellIndex] === 'correct'
                        ? 'border-green-600 bg-green-500 text-white'
                        : score[cellIndex] === 'present'
                          ? 'border-amber-600 bg-amber-400 text-white'
                          : 'border-slate-500 bg-slate-400 text-white'
                      : 'border-sky-100 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                  }`}
                >
                  {guess?.[cellIndex] ?? (rowIndex === guesses.length ? currentGuess[cellIndex] ?? '' : '')}
                </div>
              ))}
            </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {keyboardEntries.map((entry) => (
            <button
              key={entry.symbol}
              type="button"
              title={entry.label}
              aria-label={`/${entry.symbol}/ ${entry.label}`}
              onClick={() => addSymbol(entry.symbol)}
              disabled={solved || guesses.length >= maxAttempts}
              className={`min-w-[44px] rounded-lg border px-3 py-2 text-sm font-semibold transition disabled:cursor-default ${
                keyStates[entry.symbol] === 'correct'
                  ? 'border-green-600 bg-green-500 text-white'
                  : keyStates[entry.symbol] === 'present'
                    ? 'border-amber-600 bg-amber-400 text-white'
                    : keyStates[entry.symbol] === 'absent'
                      ? 'border-slate-500 bg-slate-400 text-white'
                      : 'border-sky-200 bg-sky-50 text-slate-900 hover:bg-sky-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
              }`}
            >
              /{entry.symbol}/
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-center gap-2">
          <button type="button" onClick={submitGuess} disabled={solved || guesses.length >= maxAttempts || currentGuess.length !== targetSymbols.length} className="min-w-[96px] rounded-lg bg-[#1f5eff] px-[14px] py-[10px] font-semibold text-white transition hover:bg-[#1d4ed8] disabled:cursor-default disabled:bg-[#1f5eff] disabled:text-white">
            Enter
          </button>
          <button type="button" onClick={deleteSymbol} disabled={solved || guesses.length >= maxAttempts || currentGuess.length === 0} className="min-w-[96px] rounded-lg bg-[#1f5eff] px-[14px] py-[10px] font-semibold text-white transition hover:bg-[#1d4ed8] disabled:cursor-default disabled:bg-[#1f5eff] disabled:text-white">
            Delete
          </button>
        </div>

        <p className={`mt-4 min-h-6 text-center text-sm font-semibold ${solved ? 'text-green-700' : guesses.length >= maxAttempts ? 'text-red-700' : 'text-slate-600 dark:text-slate-400'}`}>
          {solved
            ? `English equivalence: ${selectedWord.englishEquivalence}`
            : guesses.length >= maxAttempts
              ? `Out of attempts. The answer was /${targetSymbols.join('')}/ (${selectedWord.englishEquivalence}).`
              : ''}
        </p>
      </div>
    </section>
  );
}
