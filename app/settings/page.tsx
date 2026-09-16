"use client";

import { useAppSettings } from "../context/app-settings-context";

export default function SettingsPage() {
  const { theme, layout, setTheme, setLayout } = useAppSettings();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Settings</p>
      <h1 className="mt-2 text-3xl font-semibold">Adjust the builder experience</h1>
      <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
        These preferences are stored in cookies so the interface stays consistent when the teacher revisits the builder.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-xl font-semibold">Theme mode</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`rounded-full px-4 py-2 text-sm font-medium ${theme === 'light' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
            >
              Light mode
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`rounded-full px-4 py-2 text-sm font-medium ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
            >
              Dark mode
            </button>
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`rounded-full px-4 py-2 text-sm font-medium ${theme === 'system' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
            >
              System
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-xl font-semibold">Layout preference</h2>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setLayout('comfortable')}
              className={`rounded-full px-4 py-2 text-sm font-medium ${layout === 'comfortable' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
            >
              Comfortable
            </button>
            <button
              type="button"
              onClick={() => setLayout('compact')}
              className={`rounded-full px-4 py-2 text-sm font-medium ${layout === 'compact' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
            >
              Compact
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
