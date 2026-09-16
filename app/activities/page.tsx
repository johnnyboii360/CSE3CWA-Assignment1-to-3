'use client';

import { FormEvent, useEffect, useState } from 'react';

type Word = { id?: string; phonemeWord: string; englishEquivalence: string; phonemes: string[]; sortOrder?: number };
type Activity = { id: string; title: string; activityType: 'WORDLE' | 'WORD_SEARCH'; difficulty: string; hint: string; generatedHtmlSettings?: Record<string, unknown> | string; words: Word[] };

type FormState = Omit<Activity, 'id' | 'words'> & { words: Word[] };

const blankWord = (): Word => ({ phonemeWord: '', englishEquivalence: '', phonemes: [''] });
const blankForm: FormState = { title: '', activityType: 'WORDLE', difficulty: 'medium', hint: '', words: [blankWord()] };

function inferPhonemes(phonemeWord: string): string[] {
  return phonemeWord.replace(/[\/,\s]/gu, '').split('').filter(Boolean);
}

function formatActivityType(activityType: Activity['activityType']): string {
  return activityType === 'WORD_SEARCH' ? 'Word Search' : 'Wordle';
}

function formatDifficulty(difficulty: string): string {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
}

function normaliseActivity(activity: Activity): Activity {
  return {
    ...activity,
    words: activity.words.map((word) => ({ ...word, phonemes: Array.isArray(word.phonemes) ? word.phonemes : JSON.parse(String(word.phonemes || '[]')) })),
  };
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [form, setForm] = useState<FormState>(blankForm);
  const [phonemeDrafts, setPhonemeDrafts] = useState<string[]>(['']);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadActivities = async () => {
    const response = await fetch('/api/activity-sets');
    if (!response.ok) throw new Error('Unable to load saved activities.');
    setActivities((await response.json()).map(normaliseActivity));
  };

  useEffect(() => {
    // one-time load of saved activities on mount; error is surfaced via state
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadActivities().catch((loadError: Error) => setError(loadError.message));
  }, []);

  const updateWord = (wordIndex: number, field: keyof Word, value: string) => {
    setForm((current) => ({ ...current, words: current.words.map((word, index) => index === wordIndex ? { ...word, [field]: value } : word) }));
  };

  const updatePhonemeWord = (wordIndex: number, value: string) => {
    const inferredPhonemes = inferPhonemes(value);

    setForm((current) => ({
      ...current,
      words: current.words.map((word, index) => index === wordIndex
        ? { ...word, phonemeWord: value, phonemes: inferredPhonemes }
        : word),
    }));
    setPhonemeDrafts((current) => current.map((draft, index) => index === wordIndex ? inferredPhonemes.join(', ') : draft));
  };

  const updatePhonemesDraft = (wordIndex: number, value: string) => {
    setForm((current) => ({
      ...current,
      words: current.words.map((word, index) => index === wordIndex ? { ...word, phonemes: [value] } : word),
    }));
    setPhonemeDrafts((current) => current.map((draft, index) => index === wordIndex ? value : draft));
  };

  const normalisePhonemes = (wordIndex: number) => {
    setForm((current) => {
      const word = current.words[wordIndex];
      const phonemes = inferPhonemes(word?.phonemeWord ?? '');

      setPhonemeDrafts((drafts) => drafts.map((draft, index) => index === wordIndex ? phonemes.join(', ') : draft));
      return {
        ...current,
        words: current.words.map((item, index) => index === wordIndex ? { ...item, phonemes } : item),
      };
    });
  };

  const removeWord = (wordIndex: number) => {
    setForm((current) => ({
      ...current,
      words: current.words.length === 1 ? [blankWord()] : current.words.filter((_, index) => index !== wordIndex),
    }));
    setPhonemeDrafts((current) => current.length === 1 ? [''] : current.filter((_, index) => index !== wordIndex));
  };

  const saveActivity = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    const response = await fetch(editingId ? `/api/activity-sets/${editingId}` : '/api/activity-sets', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        generatedHtmlSettings: form.activityType === 'WORD_SEARCH'
          ? { gridSize: form.difficulty === 'easy' ? 8 : form.difficulty === 'hard' ? 12 : 10 }
          : { maxAttempts: 6 },
        words: form.words.map((word) => ({ ...word, phonemes: word.phonemes.filter(Boolean).length ? word.phonemes.filter(Boolean) : inferPhonemes(word.phonemeWord) })),
      }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(result?.error ?? 'Unable to save activity.');
      return;
    }
    setMessage(editingId ? 'Activity updated.' : 'Activity saved.');
    setForm(blankForm);
    setPhonemeDrafts(['']);
    setEditingId(null);
    await loadActivities();
  };

  const editActivity = (activity: Activity) => {
    setEditingId(activity.id);
    setForm({ title: activity.title, activityType: activity.activityType, difficulty: activity.difficulty, hint: activity.hint, words: activity.words.length ? activity.words : [blankWord()] });
    setPhonemeDrafts(activity.words.length ? activity.words.map((word) => word.phonemes.join(', ')) : ['']);
    setMessage('Editing selected activity.');
  };

  const deleteActivity = async (id: string) => {
    const response = await fetch(`/api/activity-sets/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      setError('Unable to delete activity.');
      return;
    }
    setMessage('Activity deleted.');
    if (editingId === id) {
      setEditingId(null);
      setForm(blankForm);
      setPhonemeDrafts(['']);
    }
    await loadActivities();
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Assessment 2</p>
        <h1 className="mt-1 text-3xl font-semibold">Activity data manager</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Save phoneme words and activity settings in SQLite. Saved records drive the classroom builders.</p>
        <form className="mt-6 space-y-4" onSubmit={saveActivity}>
          <label className="block text-sm font-medium">Activity title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">Type<select value={form.activityType} onChange={(event) => setForm({ ...form, activityType: event.target.value as FormState['activityType'] })} className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"><option value="WORDLE">Wordle</option><option value="WORD_SEARCH">Word Search</option></select></label>
            {form.activityType === 'WORD_SEARCH' && <label className="block text-sm font-medium">Difficulty<select value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value })} className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>}
          </div>
          <label className="block text-sm font-medium">Hint<textarea value={form.hint} onChange={(event) => setForm({ ...form, hint: event.target.value })} className="mt-2 min-h-20 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800" /></label>
          <div className="space-y-3"><div className="flex items-center justify-between"><p className="text-sm font-semibold">Words and phonemes</p><button type="button" onClick={() => { setForm({ ...form, words: [...form.words, blankWord()] }); setPhonemeDrafts([...phonemeDrafts, '']); }} className="rounded-full border border-sky-300 px-3 py-1 text-sm text-sky-700">Add word</button></div>{form.words.map((word, index) => <div key={index} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700"><div className="mb-2 flex justify-end"><button type="button" onClick={() => removeWord(index)} aria-label={`Remove word ${index + 1}`} className="text-sm font-medium text-red-700 underline hover:text-red-900">Remove</button></div><input required aria-label={`Phoneme transcription for word ${index + 1}`} placeholder="Phoneme transcription" value={word.phonemeWord} onChange={(event) => updatePhonemeWord(index, event.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" /><input required aria-label={`English word for word ${index + 1}`} placeholder="English word" value={word.englishEquivalence} onChange={(event) => updateWord(index, 'englishEquivalence', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" /><input required aria-label={`Phoneme symbols for word ${index + 1}`} placeholder="Phoneme symbols, separated by commas" value={phonemeDrafts[index] ?? word.phonemes.join(', ')} onChange={(event) => updatePhonemesDraft(index, event.target.value)} onBlur={() => normalisePhonemes(index)} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" /></div>)}</div>
          <div className="flex gap-2"><button type="submit" className="rounded-full bg-sky-600 px-4 py-2 font-medium text-white">{editingId ? 'Update activity' : 'Save activity'}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(blankForm); }} className="rounded-full border border-slate-300 px-4 py-2">Cancel</button>}</div>
          {message && <p className="text-sm text-emerald-700">{message}</p>}{error && <p className="text-sm text-red-700">{error}</p>}
        </form>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Stored records</p><h2 className="mt-1 text-2xl font-semibold">Saved activities</h2></div><a href="/api/health" target="_blank" rel="noreferrer" className="text-sm text-sky-700 underline">Health API</a></div><div className="mt-5 space-y-3">{activities.map((activity) => <article key={activity.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{activity.title}</h3><p className="text-sm text-slate-500">{formatActivityType(activity.activityType)}{activity.activityType === 'WORD_SEARCH' ? ` · ${formatDifficulty(activity.difficulty)}` : ''} · {activity.words.length} words</p></div><div className="flex gap-2"><button type="button" onClick={() => editActivity(activity)} className="text-sm text-sky-700 underline">Edit</button><button type="button" onClick={() => deleteActivity(activity.id)} className="text-sm text-red-700 underline">Delete</button></div></div><ul className="mt-3 flex flex-wrap gap-2">{activity.words.map((word) => <li key={word.id ?? word.phonemeWord} className="rounded-full bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800">{word.phonemeWord} · {word.englishEquivalence}</li>)}</ul></article>)}{activities.length === 0 && <p className="text-sm text-slate-500">No saved activities yet.</p>}</div></div>
    </section>
  );
}
