export default function AboutPage() {
  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-400">About the assessment</p>
        <h1 className="mt-2 text-3xl font-semibold">Assessment 3: data-driven web application and reporting</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600 dark:text-slate-400">
          Assessment 3 extends the same project into a data-driven web application and reporting stage. It demonstrates that the Wordle and Word Search builder can store, process, monitor and present data in a meaningful operational format, with emphasis on observability, testing and reporting.
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
            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">SQLite persistence and CRUD APIs for activities and words</span>
          </li>
          <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Dashboard with usage statistics, simulated records and alerts</span>
          </li>
          <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Observability with Jaeger, Zipkin and Prometheus, plus CSV reporting and automated tests</span>
          </li>
          <li className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300">One-click HTML download for browser use</span>
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold">Assessment scope</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Assessment 3 extends the Assessment 1 frontend and Assessment 2 backend with dashboard views, simulated input records, operational statistics, alerts, reporting, and practical testing and accessibility checks.
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
      </section>
    </>
  );
}
