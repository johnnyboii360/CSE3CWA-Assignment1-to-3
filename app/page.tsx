import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Assessment 1</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Build and preview phoneme-based classroom activities</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            This frontend builder helps teachers create a Wordle-style activity or a phoneme-based Word Search that can be downloaded as a single HTML file for normal browser use.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/wordle" className="rounded-full bg-sky-600 px-5 py-3 font-medium text-white transition hover:bg-sky-700">
              Create Wordle
            </Link>
            <Link href="/word-search" className="rounded-full bg-amber-600 px-5 py-3 font-medium text-white transition hover:bg-amber-700">
              Create Word Search
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-xl font-semibold">What the builder supports</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li>• A clear, responsive workflow for teachers</li>
            <li>• Phoneme-based content using symbols such as /θ/ and /ɪ/</li>
            <li>• Previewing and exporting HTML for classroom use</li>
            <li>• Flexible settings for theme and layout preferences</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
