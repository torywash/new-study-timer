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
import { useTasks } from "@/hooks/use-tasks";
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isBreak, setIsBreak] = useState(false);
  const { tasks, addTask, toggleTask, removeTask, clearTasks } = useTasks();
  const [newTaskText, setNewTaskText] = useState("");

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

  const handleAddTask = () => {
    addTask(newTaskText);
    setNewTaskText("");
  };

  const goalSeconds = isBreak ? BREAK_GOAL_SECONDS : SESSION_GOAL_SECONDS;
  const progressValue = Math.min(
    ((goalSeconds - secondsElapsed) / goalSeconds) * 100,
    100
  );

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
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
          <span className="font-mono text-6xl font-semibold tabular-nums tracking-tight">
            {formatTime(secondsElapsed)}
          </span>

          <Progress value={progressValue} className="w-full" />


          <Badge variant="outline">Session {sessionCount}</Badge>
        </CardContent>

        <CardFooter className="flex justify-center gap-4 bg-transparent p-4 pt-2">
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
              setSessionCount(0);
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
