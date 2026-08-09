"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useTasks } from "@/hooks/use-tasks";

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function TasksPage() {
  const { tasks, addTask, toggleTask, updateDescription, removeTask } =
    useTasks();
  const [newTaskText, setNewTaskText] = useState("");

  const handleAddTask = () => {
    addTask(newTaskText);
    setNewTaskText("");
  };

  return (
    <main className="flex flex-1 flex-col items-center gap-4 p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-base text-muted-foreground">
            Task Timeline
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

          {tasks.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No tasks yet.
            </p>
          ) : (
            <ol className="relative flex flex-col gap-6 border-l border-border pl-6">
              {tasks.map((task) => (
                <li key={task.id} className="relative">
                  <span
                    className={
                      task.done
                        ? "absolute top-1 -left-[1.6rem] size-2.5 rounded-full bg-primary"
                        : "absolute top-1 -left-[1.6rem] size-2.5 rounded-full bg-muted-foreground/40"
                    }
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        className="mt-1"
                        checked={task.done}
                        onCheckedChange={(checked) =>
                          toggleTask(task.id, checked)
                        }
                      />
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={
                            task.done
                              ? "font-medium text-muted-foreground line-through"
                              : "font-medium"
                          }
                        >
                          {task.text}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Added {formatDate(task.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove task"
                      onClick={() => removeTask(task.id)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>

                  <textarea
                    value={task.description}
                    onChange={(e) =>
                      updateDescription(task.id, e.target.value)
                    }
                    placeholder="Add a description..."
                    rows={2}
                    className="mt-2 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
