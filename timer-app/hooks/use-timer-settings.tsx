"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const TIMER_SETTINGS_STORAGE_KEY = "timer-settings";

const DEFAULT_FOCUS_MINUTES = 25;
const BREAK_RATIO = 1 / 5;
const DEFAULT_VOLUME = 50;

export type AmbientMode = "generated" | "file";
export type NoiseType = "white" | "brown" | "pink";

type TimerSettingsContextValue = {
  focusMinutes: number;
  breakMinutes: number; // derived: always 1/5 of focusMinutes
  soundEnabled: boolean;
  volume: number; // 0-100
  ambientEnabled: boolean;
  ambientMode: AmbientMode;
  noiseType: NoiseType;
  // The actual picked file can't survive a reload (the File System Access
  // API doesn't allow persisting real file contents to localStorage), so
  // this is in-memory only, unlike everything else in this context.
  ambientFile: File | null;
  setFocusMinutes: (minutes: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  setAmbientEnabled: (enabled: boolean) => void;
  setAmbientMode: (mode: AmbientMode) => void;
  setNoiseType: (type: NoiseType) => void;
  setAmbientFile: (file: File | null) => void;
};

const TimerSettingsContext =
  createContext<TimerSettingsContextValue | null>(null);

// Lives in the root layout (which persists across route navigations) so the
// Timer page and Settings page always agree on the same values instead of
// each page owning its own copy that independently loads from localStorage.
export function TimerSettingsProvider({ children }: { children: ReactNode }) {
  const [focusMinutes, setFocusMinutesState] = useState(DEFAULT_FOCUS_MINUTES);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [ambientEnabled, setAmbientEnabledState] = useState(false);
  const [ambientMode, setAmbientModeState] = useState<AmbientMode>("generated");
  const [noiseType, setNoiseTypeState] = useState<NoiseType>("white");
  const [ambientFile, setAmbientFileState] = useState<File | null>(null);
  const settingsLoadedRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(TIMER_SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          focusMinutes?: number;
          soundEnabled?: boolean;
          volume?: number;
          ambientEnabled?: boolean;
          ambientMode?: AmbientMode;
          noiseType?: NoiseType;
        };
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFocusMinutesState(
          typeof parsed.focusMinutes === "number" && parsed.focusMinutes > 0
            ? parsed.focusMinutes
            : DEFAULT_FOCUS_MINUTES
        );
        setSoundEnabledState(
          typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : true
        );
        setVolumeState(
          typeof parsed.volume === "number" &&
            parsed.volume >= 0 &&
            parsed.volume <= 100
            ? parsed.volume
            : DEFAULT_VOLUME
        );
        setAmbientEnabledState(
          typeof parsed.ambientEnabled === "boolean"
            ? parsed.ambientEnabled
            : false
        );
        setAmbientModeState(
          parsed.ambientMode === "file" ? "file" : "generated"
        );
        setNoiseTypeState(
          parsed.noiseType === "brown" || parsed.noiseType === "pink"
            ? parsed.noiseType
            : "white"
        );
      } catch {
        // ignore malformed data from a previous version of this app
      }
    }
    settingsLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!settingsLoadedRef.current) return;
    localStorage.setItem(
      TIMER_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        focusMinutes,
        soundEnabled,
        volume,
        ambientEnabled,
        ambientMode,
        noiseType,
      })
    );
  }, [focusMinutes, soundEnabled, volume, ambientEnabled, ambientMode, noiseType]);

  const setFocusMinutes = (minutes: number) => {
    if (minutes > 0) setFocusMinutesState(minutes);
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
  };

  const setVolume = (next: number) => {
    setVolumeState(Math.min(100, Math.max(0, next)));
  };

  const setAmbientEnabled = (enabled: boolean) => {
    setAmbientEnabledState(enabled);
  };

  const setAmbientMode = (mode: AmbientMode) => {
    setAmbientModeState(mode);
  };

  const setNoiseType = (type: NoiseType) => {
    setNoiseTypeState(type);
  };

  const setAmbientFile = (file: File | null) => {
    setAmbientFileState(file);
  };

  return (
    <TimerSettingsContext.Provider
      value={{
        focusMinutes,
        breakMinutes: focusMinutes * BREAK_RATIO,
        soundEnabled,
        volume,
        ambientEnabled,
        ambientMode,
        noiseType,
        ambientFile,
        setFocusMinutes,
        setSoundEnabled,
        setVolume,
        setAmbientEnabled,
        setAmbientMode,
        setNoiseType,
        setAmbientFile,
      }}
    >
      {children}
    </TimerSettingsContext.Provider>
  );
}

export function useTimerSettings() {
  const context = useContext(TimerSettingsContext);
  if (!context) {
    throw new Error(
      "useTimerSettings must be used within a TimerSettingsProvider"
    );
  }
  return context;
}
