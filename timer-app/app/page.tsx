"use client";

import { X } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notify } from "@/lib/notify";
import { useTasks } from "@/hooks/use-tasks";
import { useStudyStats } from "@/hooks/use-study-stats";
import {
  useTimerSettings,
  volumeToNotificationGain,
} from "@/hooks/use-timer-settings";
import { useAmbientPlayer } from "@/hooks/use-ambient-player";
import { useSessionLock } from "@/hooks/use-session-lock";
// import { Separator } from "@/components/ui/separator";

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((unit) => unit.toString().padStart(2, "0"))
    .join(":");
}

export default function Home() {
  const { focusMinutes, breakMinutes, soundEnabled, notificationVolume } =
    useTimerSettings();
  const sessionGoalSeconds = focusMinutes * 60;
  const breakGoalSeconds = breakMinutes * 60;

  const [secondsElapsed, setSecondsElapsed] = useState(sessionGoalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isBreak, setIsBreak] = useState(false);
  const { tasks, addTask, toggleTask, removeTask, clearTasks } = useTasks();
  const [newTaskText, setNewTaskText] = useState("");
  const {
    addStudySeconds,
    sessionCount,
    incrementSessionCount,
    resetSessionCount,
  } = useStudyStats();
  const secondsElapsedRef = useRef(secondsElapsed);
  const { setIsLocked } = useSessionLock();

  useEffect(() => {
    secondsElapsedRef.current = secondsElapsed;
  }, [secondsElapsed]);

  // Mirror isRunning into the shared session lock so NavTabs (which lives in
  // the persistent layout, not this page) can disable the other tabs while a
  // session is actively running. The cleanup is a safety net so the lock
  // can't get stuck on if this page ever unmounts while still running.
  useEffect(() => {
    setIsLocked(isRunning);
    return () => setIsLocked(false);
  }, [isRunning, setIsLocked]);

  // Resync the displayed countdown when the Focus/Break duration settings
  // change (loaded from localStorage after mount, or edited on the Settings
  // page) — but never while a session is actively counting down. isRunning
  // and isBreak are read via closure and deliberately left out of the deps
  // array so this only re-fires when the settings themselves change, not on
  // every start/pause/completion.
  useEffect(() => {
    if (!isRunning) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSecondsElapsed(isBreak ? breakGoalSeconds : sessionGoalSeconds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionGoalSeconds, breakGoalSeconds]);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/time_finish.mp3");
  }, []);

  useEffect(() => {
    if (audioRef.current)
      audioRef.current.volume = volumeToNotificationGain(notificationVolume);
  }, [notificationVolume]);

  useAmbientPlayer(isRunning);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        // addStudySeconds updates a different component's (StudyStatsProvider)
        // state, so it must not be called from inside setSecondsElapsed's
        // updater — React can invoke updaters more than once, which would
        // double-count. Read the latest value from a ref instead.
        if (secondsElapsedRef.current > 0 && !isBreak) {
          addStudySeconds(1);
        }
        setSecondsElapsed((prev) => (prev > 0 ? prev - 1 : prev));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isBreak, addStudySeconds]);

  useEffect(() => {
    if (!isRunning || secondsElapsed !== 0) return;

    setIsRunning(false);
    if (isBreak) {
      // a break just finished, so a full study/break cycle is complete
      incrementSessionCount();
    }
    setIsBreak((prev) => !prev);
    if (soundEnabled) audioRef.current?.play();
    notify({
      title: isBreak ? "Break complete" : "Focus session complete",
      description: isBreak
        ? "Time to start your next focus session."
        : "Nice work — time for a break.",
      type: "success",
    });
  }, [secondsElapsed, isRunning, isBreak, soundEnabled, incrementSessionCount]);

  const handleStart = () => {
    if (secondsElapsed === 0) {
      setSecondsElapsed(isBreak ? breakGoalSeconds : sessionGoalSeconds);
    }
    setIsRunning(true);
  };

  const handleAddTask = () => {
    addTask({ text: newTaskText });
    setNewTaskText("");
  };

  const goalSeconds = isBreak ? breakGoalSeconds : sessionGoalSeconds;
  const progressValue = Math.min(
    ((goalSeconds - secondsElapsed) / goalSeconds) * 100,
    100
  );

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 sm:p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-base text-muted-foreground">
            {isBreak ? "Break Time" : "Focus Session"}
          </CardTitle>
          <Badge variant={isRunning ? "default" : "secondary"}>
            {isRunning ? "In progress" : "Paused"}
          </Badge>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-6">
          <span className="font-mono text-5xl font-semibold tabular-nums tracking-tight sm:text-6xl">
            {formatTime(secondsElapsed)}
          </span>

          <Progress value={progressValue} className="w-full" />


          <Badge variant="outline">Session {sessionCount}</Badge>
        </CardContent>

        <CardFooter className="flex flex-wrap justify-center gap-3 bg-transparent p-4 pt-2 sm:gap-4">
          {isRunning ? (
            <Button variant="secondary" onClick={() => setIsRunning(false)}>
              Pause
            </Button>
          ) : (
            <Button onClick={handleStart}>
              {isBreak ? "Start Break" : "Start Focus"}
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => {
              resetSessionCount();
              clearTasks();
            }}
          >
            Reset Sessions
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-base text-muted-foreground">
            Task Manager
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTask();
              }}
              placeholder="Add a task..."
              className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <Button onClick={handleAddTask}>Add</Button>
          </div>

          <ScrollArea className="h-64 rounded-md border">
            {tasks.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No tasks yet.
              </p>
            ) : (
              <div className="flex flex-col gap-1 p-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent"
                  >
                    <Checkbox
                      checked={task.done}
                      onCheckedChange={(checked) =>
                        toggleTask(task.id, checked)
                      }
                    />
                    <span
                      className={
                        task.done
                          ? "flex-1 text-sm text-muted-foreground line-through"
                          : "flex-1 text-sm"
                      }
                    >
                      {task.text}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove task"
                      onClick={() => removeTask(task.id)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <CardFooter className="flex justify-center gap-4 bg-transparent p-4 pt-2">
          <Button
            variant="destructive"
            disabled={tasks.length === 0}
            onClick={clearTasks}
          >
            Clear Tasks
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
