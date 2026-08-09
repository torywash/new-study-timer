"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type StudyGoal = {
  title: string;
  targetHours: number;
  deadline: string; // ISO date string (yyyy-mm-dd), empty if unset
};

const STUDY_STATS_STORAGE_KEY = "study-stats";

type StudyStatsContextValue = {
  totalSeconds: number;
  addStudySeconds: (seconds: number) => void;
  goal: StudyGoal | null;
  setGoal: (goal: StudyGoal) => void;
  clearGoal: () => void;
};

const StudyStatsContext = createContext<StudyStatsContextValue | null>(null);

// Lives in the root layout (which persists across route navigations) so every
// page reads/writes the same in-memory state instead of each page owning its
// own copy that independently loads from and saves to localStorage.
export function StudyStatsProvider({ children }: { children: ReactNode }) {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [goal, setGoalState] = useState<StudyGoal | null>(null);
  const statsLoadedRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(STUDY_STATS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          totalSeconds?: number;
          goal?: StudyGoal | null;
        };
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTotalSeconds(
          typeof parsed.totalSeconds === "number" ? parsed.totalSeconds : 0
        );
        setGoalState(parsed.goal ?? null);
      } catch {
        // ignore malformed data from a previous version of this app
      }
    }
    statsLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!statsLoadedRef.current) return;
    localStorage.setItem(
      STUDY_STATS_STORAGE_KEY,
      JSON.stringify({ totalSeconds, goal })
    );
  }, [totalSeconds, goal]);

  // Stable identity (empty deps + functional setState) is required: this is
  // called once per second from the Timer page's interval, and a changing
  // identity would tear down and rebuild that interval every tick.
  const addStudySeconds = useCallback((seconds: number) => {
    setTotalSeconds((prev) => prev + seconds);
  }, []);

  const setGoal = useCallback((next: StudyGoal) => {
    setGoalState(next);
  }, []);

  const clearGoal = useCallback(() => {
    setGoalState(null);
  }, []);

  return (
    <StudyStatsContext.Provider
      value={{ totalSeconds, addStudySeconds, goal, setGoal, clearGoal }}
    >
      {children}
    </StudyStatsContext.Provider>
  );
}

export function useStudyStats() {
  const context = useContext(StudyStatsContext);
  if (!context) {
    throw new Error("useStudyStats must be used within a StudyStatsProvider");
  }
  return context;
}
