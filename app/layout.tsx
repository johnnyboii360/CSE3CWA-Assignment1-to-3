import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppShell from "./components/app-shell";
import { AppSettingsProvider } from "./context/app-settings-context";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppSettingsProvider>
          <AppShell>{children}</AppShell>
        </AppSettingsProvider>
      </body>
    </html>
  );
}
