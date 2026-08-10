import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { ViewTransition } from "react";
import "./globals.css";

import { NavTabs } from "@/components/nav-tabs";
import { GoalCompletionWatcher } from "@/components/goal-completion-watcher";
import { Toaster } from "@/components/ui/toast";
import { TasksProvider } from "@/hooks/use-tasks";
import { StudyStatsProvider } from "@/hooks/use-study-stats";
import { TimerSettingsProvider } from "@/hooks/use-timer-settings";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const themeInitScript = `
  (function () {
    try {
      var stored = localStorage.getItem("theme");
      var isDark = stored
        ? stored === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", isDark);
    } catch (e) {}
  })();
`;

export const metadata: Metadata = {
  title: "Study Timer",
  description: "A study timer for focused sessions and tracking time spent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <StudyStatsProvider>
          <TasksProvider>
            <TimerSettingsProvider>
              <Toaster>
                <GoalCompletionWatcher />
                <header className="flex items-center justify-between border-b px-6 py-4">
                  <span className="text-lg font-semibold">Study Timer</span>
                  <div className="flex items-center gap-3">
                    <NavTabs />
                  </div>
                </header>
                <ViewTransition>{children}</ViewTransition>
              </Toaster>
            </TimerSettingsProvider>
          </TasksProvider>
        </StudyStatsProvider>
      </body>
    </html>
  );
}
