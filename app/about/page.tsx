import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">About the assessment</p>
        <h1 className="mt-2 text-3xl font-semibold">Frontend builder for phoneme-based classroom activities</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600 dark:text-slate-400">
          This assessment focuses on the frontend experience for teachers who are preparing speech pathology classroom activities. The builder allows a teacher to configure, preview, and export a playable Wordle or Word Search activity as a single HTML file.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">What this version includes</h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Responsive navigation with a compact menu</span>
          </li>
          <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Separate builder workflows for Wordle and Word Search</span>
          </li>
          <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Phoneme-based hints and cue cards</span>
          </li>
          <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">One-click HTML download for browser use</span>
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">Assessment scope</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Assessment 1 is frontend only. The system is intentionally built to support future database-driven word selection and richer generation options in later assessment stages.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">Student details</h2>
        <div className="mt-4 space-y-2">
          <p className="text-lg text-slate-600 dark:text-slate-400"><span className="font-semibold">Name:</span> John Pamintuan</p>
          <p className="text-lg text-slate-600 dark:text-slate-400"><span className="font-semibold">Student number:</span> 21593197</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">How to use the website</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Start on the home page, choose either the Wordle or Word Search builder, adjust the settings, preview the activity, and then generate the HTML file for classroom use.
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
          <video controls className="w-full" preload="metadata" poster="/Screenshot 2026-08-12 175400.png">
            <source src="/video1833123053.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/wordle" className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700">
            Open Wordle Builder
          </Link>
          <Link href="/word-search" className="rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700">
            Open Word Search Builder
          </Link>
        </div>
      </section>
    </>
  );
}
