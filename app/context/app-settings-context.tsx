"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type LayoutMode = "comfortable" | "compact";

function readCookieValue(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  return document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split("=")[1] ?? null;
}

export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveTheme(theme: ThemeMode): "light" | "dark" {
  if (theme === "system") {
    return getSystemTheme();
  }

  return theme;
}

type AppSettingsContextValue = {
  theme: ThemeMode;
  layout: LayoutMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  setLayout: (layout: LayoutMode) => void;
};

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const storedTheme = readCookieValue("theme");
    return storedTheme === "dark" || storedTheme === "light" || storedTheme === "system"
      ? storedTheme
      : "system";
  });

  const [layout, setLayoutState] = useState<LayoutMode>(() => {
    const storedLayout = readCookieValue("layout");
    return storedLayout === "compact" || storedLayout === "comfortable"
      ? storedLayout
      : "comfortable";
  });

  const resolvedTheme = resolveTheme(theme);

  useEffect(() => {
    document.cookie = `theme=${theme}; path=/; max-age=31536000`;
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme, theme]);

  useEffect(() => {
    document.cookie = `layout=${layout}; path=/; max-age=31536000`;
  }, [layout]);

  useEffect(() => {
    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = () => {
      const nextTheme = resolveTheme("system");
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      document.documentElement.setAttribute("data-theme", nextTheme);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleThemeChange);
      return () => mediaQuery.removeEventListener("change", handleThemeChange);
    }

    mediaQuery.addListener(handleThemeChange);
    return () => mediaQuery.removeListener(handleThemeChange);
  }, [theme]);

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      theme,
      layout,
      resolvedTheme,
      setTheme: setThemeState,
      setLayout: setLayoutState,
    }),
    [layout, resolvedTheme, theme],
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);

  if (!context) {
    throw new Error("useAppSettings must be used within an AppSettingsProvider");
  }

  return context;
}
