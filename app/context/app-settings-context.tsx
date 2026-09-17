"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";
export type LayoutMode = "comfortable" | "compact";

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

export function AppSettingsProvider({
  children,
  initialTheme = "system",
  initialLayout = "comfortable",
}: {
  children: React.ReactNode;
  initialTheme?: ThemeMode;
  initialLayout?: LayoutMode;
}) {
  const [theme, setThemeState] = useState<ThemeMode>(initialTheme);
  const [layout, setLayoutState] = useState<LayoutMode>(initialLayout);

  const [hydrated] = useState(() => typeof window !== "undefined");

  const resolvedTheme = resolveTheme(theme);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    document.cookie = `theme=${theme}; path=/; max-age=31536000`;
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [hydrated, resolvedTheme, theme]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    document.cookie = `layout=${layout}; path=/; max-age=31536000`;
  }, [hydrated, layout]);

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
