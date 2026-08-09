"use client";

import { useEffect, useRef, useState } from "react";

export type Task = {
  id: string;
  text: string;
  description: string;
  done: boolean;
  createdAt: number;
};

const TASKS_STORAGE_KEY = "tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const tasksLoadedRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(TASKS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<Task>[];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTasks(
          parsed.map((task) => ({
            id: task.id ?? crypto.randomUUID(),
            text: task.text ?? "",
            description: task.description ?? "",
            done: task.done ?? false,
            createdAt: task.createdAt ?? Date.now(),
          }))
        );
      } catch {
        // ignore malformed data from a previous version of this app
      }
    }
    tasksLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (!tasksLoadedRef.current) return;
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: trimmed,
        description: "",
        done: false,
        createdAt: Date.now(),
      },
    ]);
  };

  const toggleTask = (id: string, done: boolean) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done } : task))
    );
  };

  const updateDescription = (id: string, description: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, description } : task))
    );
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const clearTasks = () => {
    setTasks([]);
  };

  return {
    tasks,
    addTask,
    toggleTask,
    updateDescription,
    removeTask,
    clearTasks,
  };
}
