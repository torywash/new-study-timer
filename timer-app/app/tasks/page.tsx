"use client";

import { Pencil, Plus, X } from "lucide-react";
import {
  useState,
  type FormEvent,
  type ReactElement,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useTasks } from "@/hooks/use-tasks";

function formatDueDate(dueDate: string) {
  if (!dueDate) return null;
  // dueDate is stored as yyyy-mm-dd; parse as local date to avoid a UTC off-by-one
  const [year, month, day] = dueDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function TaskFormDialog({
  trigger,
  heading,
  submitLabel,
  initialTitle = "",
  initialDescription = "",
  initialDueDate = "",
  onSubmit,
}: {
  trigger: ReactElement;
  heading: string;
  submitLabel: string;
  initialTitle?: string;
  initialDescription?: string;
  initialDueDate?: string;
  onSubmit: (values: {
    text: string;
    description: string;
    dueDate: string;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [dueDate, setDueDate] = useState(initialDueDate);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setTitle(initialTitle);
      setDescription(initialDescription);
      setDueDate(initialDueDate);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ text: title, description, dueDate });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />

      <DialogContent>
        <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{heading}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-due-date">Timeline</Label>
            <Input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!title.trim()}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function TasksPage() {
  const { tasks, addTask, toggleTask, updateTask, removeTask } = useTasks();
  const [search, setSearch] = useState("");

  const filteredTasks = tasks.filter((task) =>
    task.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex min-h-0 flex-1 flex-col items-center gap-4 overflow-hidden p-4 sm:overflow-visible sm:p-6">
      <Card className="flex min-h-0 w-full max-w-2xl flex-1 flex-col">
        <CardHeader>
          <CardTitle className="text-center text-base text-muted-foreground">
            Task Timeline
          </CardTitle>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="flex-1"
            />

            <TaskFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" />
                  Add Task
                </Button>
              }
              heading="New Task"
              submitLabel="Add Task"
              onSubmit={(values) => addTask(values)}
            />
          </div>

          <ScrollArea className="min-h-0 flex-1">
            {filteredTasks.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                {tasks.length === 0
                  ? "No tasks yet."
                  : "No tasks match your search."}
              </p>
            ) : (
              <div className="flex flex-col gap-3 pb-1">
                {filteredTasks.map((task) => (
                  <Card key={task.id} size="sm">
                    <CardContent className="flex items-start gap-3">
                      <Checkbox
                        className="mt-1"
                        checked={task.done}
                        onCheckedChange={(checked) =>
                          toggleTask(task.id, checked)
                        }
                      />

                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={
                              task.done
                                ? "font-medium text-muted-foreground line-through"
                                : "font-medium"
                            }
                          >
                            {task.text}
                          </span>
                          {formatDueDate(task.dueDate) && (
                            <Badge variant="outline">
                              {formatDueDate(task.dueDate)}
                            </Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <TaskFormDialog
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Edit task"
                          >
                            <Pencil className="size-4" />
                          </Button>
                        }
                        heading="Edit Task"
                        submitLabel="Save Changes"
                        initialTitle={task.text}
                        initialDescription={task.description}
                        initialDueDate={task.dueDate}
                        onSubmit={(values) => updateTask(task.id, values)}
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove task"
                        onClick={() => removeTask(task.id)}
                      >
                        <X className="size-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </main>
  );
}
