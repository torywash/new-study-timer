"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
// import { Separator } from "@/components/ui/separator";

const SESSION_GOAL_SECONDS = 0.05 * 60; // 3 seconds for testing; 25 * 60 for default prod
let BREAK_GOAL_SECONDS = SESSION_GOAL_SECONDS / 5; // break interval is 1/5 of session interval

if (BREAK_GOAL_SECONDS < 300) {
  BREAK_GOAL_SECONDS = 3; // minimum break interval is 5 minutes; 3 for dev testing
}

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((unit) => unit.toString().padStart(2, "0"))
    .join(":");
}

export default function Home() {
  const [secondsElapsed, setSecondsElapsed] = useState(SESSION_GOAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    // The pre-hydration script in layout.tsx may have already set the
    // "dark" class before React mounts; this syncs state to match it.
    // Server and first client render both default to false, so this
    // corrects the icon post-mount without causing a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  // TODO: Move this to settings tab
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    audioRef.current = new Audio("/sounds/time_finish.mp3");
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsElapsed((prev) => (prev > 0 ? prev - 1 : prev));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning || secondsElapsed !== 0) return;

    setIsRunning(false);
    if (isBreak) {
      // a break just finished, so a full study/break cycle is complete
      setSessionCount((count) => count + 1);
    }
    setIsBreak((prev) => !prev);
    audioRef.current?.play();
  }, [secondsElapsed, isRunning, isBreak]);

  const handleStart = () => {
    if (secondsElapsed === 0) {
      setSecondsElapsed(isBreak ? BREAK_GOAL_SECONDS : SESSION_GOAL_SECONDS);
    }
    setIsRunning(true);
  };

  const goalSeconds = isBreak ? BREAK_GOAL_SECONDS : SESSION_GOAL_SECONDS;
  const progressValue = Math.min(
    ((goalSeconds - secondsElapsed) / goalSeconds) * 100,
    100
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-lg font-semibold">Study Timer</span>
        <div className="flex items-center gap-3">
          <Badge variant={isRunning ? "default" : "secondary"}>
            {isRunning ? "In progress" : "Paused"}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
          >
            {isDark ? <Sun /> : <Moon />}
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-center text-base text-muted-foreground">
              {isBreak ? "Break Time" : "Focus Session"}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-6">
            <span className="font-mono text-6xl font-semibold tabular-nums tracking-tight">
              {formatTime(secondsElapsed)}
            </span>

            <Progress value={progressValue} className="w-full" />


            <Badge variant="outline">Session {sessionCount}</Badge>
          </CardContent>

          <CardFooter className="flex justify-center gap-15 bg-transparent p-4 pt-2">
            {isRunning ? (
              <Button variant="secondary" onClick={() => setIsRunning(false)}>
                Pause
              </Button>
            ) : (
              <Button onClick={handleStart}>
                {isBreak ? "Start Break" : "Start Focus"}
              </Button>
            )}
            <Button variant="destructive" onClick={() => setSessionCount(0)}>
              Reset Sessions
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
