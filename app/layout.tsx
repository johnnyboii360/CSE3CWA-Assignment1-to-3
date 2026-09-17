import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import AppShell from "./components/app-shell";
import { AppSettingsProvider, type LayoutMode, type ThemeMode } from "./context/app-settings-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Speech Pathology Activity Builder",
  description: "Frontend builder for phoneme-based Wordle and Word Search activities",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const storedTheme = cookieStore.get("theme")?.value;
  const storedLayout = cookieStore.get("layout")?.value;
  const initialTheme: ThemeMode = storedTheme === "dark" || storedTheme === "light" || storedTheme === "system"
    ? storedTheme
    : "system";
  const initialLayout: LayoutMode = storedLayout === "compact" || storedLayout === "comfortable"
    ? storedLayout
    : "comfortable";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              const storedTheme = document.cookie.match(/(?:^|; )theme=(dark|light|system)/)?.[1] ?? "system";
              const resolvedTheme = storedTheme === "system"
                ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
                : storedTheme;
              document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
              document.documentElement.setAttribute("data-theme", resolvedTheme);
            })();`,
          }}
        />
        <AppSettingsProvider initialTheme={initialTheme} initialLayout={initialLayout}>
          <AppShell>{children}</AppShell>
        </AppSettingsProvider>
      </body>
    </html>
  );
}
