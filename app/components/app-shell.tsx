'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type ThemeMode = 'light' | 'dark';
type LayoutMode = 'comfortable' | 'compact';

function readCookieValue(name: string) {
  if (typeof document === 'undefined') {
    return null;
  }

  return document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split('=')[1] ?? null;
}

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/wordle', label: 'Wordle' },
  { href: '/word-search', label: 'Word Search' },
  { href: '/settings', label: 'Settings' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const storedTheme = readCookieValue('theme');
    return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light';
  });
  const [layout, setLayout] = useState<LayoutMode>(() => {
    const storedLayout = readCookieValue('layout');
    return storedLayout === 'compact' || storedLayout === 'comfortable' ? storedLayout : 'comfortable';
  });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    document.cookie = `theme=${theme}; path=/; max-age=31536000`;
  }, [theme]);

  useEffect(() => {
    document.cookie = `layout=${layout}; path=/; max-age=31536000`;
  }, [layout]);

  useEffect(() => {
    const onSettings = (event: Event) => {
      const detail = (event as CustomEvent<{ theme?: ThemeMode; layout?: LayoutMode }>).detail;
      if (detail?.theme) setTheme(detail.theme);
      if (detail?.layout) setLayout(detail.layout);
    };

    window.addEventListener('settings:updated', onSettings as EventListener);
    return () => window.removeEventListener('settings:updated', onSettings as EventListener);
  }, []);

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

  const spacingClass = layout === 'compact' ? 'space-y-4' : 'space-y-8';

  return (
    <div className={`flex min-h-screen flex-col transition-colors ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <header className={`border-b backdrop-blur ${theme === 'dark' ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white/90'}`}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Speech Pathology Activity Builder
            </Link>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Assessment 1 • Frontend design and usability
            </p>
          </div>

          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  item.href === pathname
                    ? theme === 'dark'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-950'
                    : theme === 'dark'
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div ref={menuRef} className="relative">
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-label="Toggle navigation menu"
                onClick={() => setMenuOpen((open) => !open)}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition ${theme === 'dark' ? 'text-slate-100 hover:bg-slate-800 hover:text-white' : 'text-slate-800 hover:bg-slate-100 hover:text-slate-950'}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>

              {menuOpen && (
                <div className={`absolute left-1/2 top-full z-20 mt-2 w-48 -translate-x-1/2 rounded-xl border p-2 shadow-lg ${theme === 'dark' ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block rounded-full px-3 py-2 text-sm font-medium transition ${
                        item.href === pathname
                          ? theme === 'dark'
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-950'
                          : theme === 'dark'
                            ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

      </header>

      <main className="mx-auto flex max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8" style={{ gap: layout === 'compact' ? '1rem' : '2rem' }} data-layout={layout}>
        {children}
      </main>

      <footer className={`mt-auto border-t px-4 py-6 text-sm ${theme === 'dark' ? 'border-slate-800 bg-slate-900/80 text-slate-400' : 'border-slate-200 bg-white/80 text-slate-600'}`}>
        <div className="mx-auto flex max-w-6xl flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Designed for Speech Pathology teaching practice and classroom activity planning.</p>
          <p>Student Name: John Pamintuan • Student Number: 21593197</p>
        </div>
      </footer>
    </div>
  );
}
