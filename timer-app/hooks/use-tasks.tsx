"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Task = {
  id: string;
  text: string;
  description: string;
  dueDate: string; // ISO date string (yyyy-mm-dd), empty if unset
  done: boolean;
  createdAt: number;
};

const TASKS_STORAGE_KEY = "tasks";

type TasksContextValue = {
  tasks: Task[];
  addTask: (input: {
    text: string;
    description?: string;
    dueDate?: string;
  }) => void;
  toggleTask: (id: string, done: boolean) => void;
  updateTask: (
    id: string,
    updates: { text: string; description?: string; dueDate?: string }
  ) => void;
  removeTask: (id: string) => void;
  clearTasks: () => void;
};

const TasksContext = createContext<TasksContextValue | null>(null);

// Lives in the root layout (which persists across route navigations) so every
// page reads/writes the same in-memory state instead of each page owning its
// own copy that independently loads from and saves to localStorage.
export function TasksProvider({ children }: { children: ReactNode }) {
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
            dueDate: task.dueDate ?? "",
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

  const addTask: TasksContextValue["addTask"] = (input) => {
    const trimmed = input.text.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: trimmed,
        description: input.description?.trim() ?? "",
        dueDate: input.dueDate ?? "",
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

  const updateTask: TasksContextValue["updateTask"] = (id, updates) => {
    const trimmed = updates.text.trim();
    if (!trimmed) return;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              text: trimmed,
              description: updates.description?.trim() ?? "",
              dueDate: updates.dueDate ?? "",
            }
          : task
      )
    );
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const clearTasks = () => {
    setTasks([]);
  };

  return (
    <TasksContext.Provider
      value={{ tasks, addTask, toggleTask, updateTask, removeTask, clearTasks }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
}
