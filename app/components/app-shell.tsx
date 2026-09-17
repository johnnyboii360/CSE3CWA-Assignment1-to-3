'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAppSettings } from '../context/app-settings-context';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/wordle', label: 'Wordle' },
  { href: '/word-search', label: 'Word Search' },
  { href: '/activities', label: 'Activity Data' },
  { href: '/settings', label: 'Settings' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { layout } = useAppSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuOpen) return;

      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="relative z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 overflow-visible px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Speech Pathology Activity Builder
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Assessment 1 • Frontend design and usability
            </p>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  item.href === pathname
                    ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div ref={menuRef} className="relative z-40 md:hidden">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-label="Toggle navigation menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-800 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full z-[60] mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block rounded-full px-3 py-2 text-sm font-medium transition ${
                      item.href === pathname
                        ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </header>

      <main className="mx-auto flex max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8" style={{ gap: layout === 'compact' ? '1rem' : '2rem' }} data-layout={layout}>
        {children}
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white/80 px-4 py-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Designed for Speech Pathology teaching practice and classroom activity planning.</p>
          <p>Student Name: John Pamintuan • Student Number: 21593197</p>
        </div>
      </footer>
    </div>
  );
}
