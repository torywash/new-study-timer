"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type SessionLockContextValue = {
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
};

const SessionLockContext = createContext<SessionLockContextValue | null>(
  null
);

// Lives in the root layout (which persists across route navigations) so
// NavTabs — also in the persistent layout — can know whether the Timer
// page's countdown is actively running, even though the countdown itself
// lives in that page's own local state. Not persisted to localStorage:
// this is transient UI state, not something meaningful to restore after a
// reload (a reload already resets the running countdown itself).
export function SessionLockProvider({ children }: { children: ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);

  return (
    <SessionLockContext.Provider value={{ isLocked, setIsLocked }}>
      {children}
    </SessionLockContext.Provider>
  );
}

export function useSessionLock() {
  const context = useContext(SessionLockContext);
  if (!context) {
    throw new Error("useSessionLock must be used within a SessionLockProvider");
  }
  return context;
}
