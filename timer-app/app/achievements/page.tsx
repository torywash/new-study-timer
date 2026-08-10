"use client";

import { Award, Pencil } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStudyStats, type StudyGoal } from "@/hooks/use-study-stats";
import { useOverflowLayout } from "@/hooks/use-overflow-layout";
import { cn } from "@/lib/utils";

const MILESTONE_COUNT = 40;

// 5, 10, 15, 20 (+5 while below 20), then 30, 40, 50 (+10 while below 50),
// then 75, 100, 125, ... (+25 forever).
function generateMilestones(count: number = MILESTONE_COUNT): number[] {
  const milestones: number[] = [];
  let value = 0;
  let step = 5;
  for (let i = 0; i < count; i++) {
    value += step;
    milestones.push(value);
    if (value >= 50) {
      step = 25;
    } else if (value >= 20) {
      step = 10;
    }
  }
  return milestones;
}

function formatDeadline(deadline: string) {
  if (!deadline) return null;
  const [year, month, day] = deadline.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function GoalForm({
  initialGoal,
  onSubmit,
  onCancel,
}: {
  initialGoal: StudyGoal | null;
  onSubmit: (goal: StudyGoal) => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initialGoal?.title ?? "");
  const [targetHours, setTargetHours] = useState(
    initialGoal ? String(initialGoal.targetHours) : "",
  );
  const [deadline, setDeadline] = useState(initialGoal?.deadline ?? "");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedHours = Number(targetHours);
    if (!title.trim() || !parsedHours || parsedHours <= 0) return;
    onSubmit({ title: title.trim(), targetHours: parsedHours, deadline });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="goal-title">Title</Label>
        <Input
          id="goal-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Finish the semester strong"
          autoFocus
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="goal-target-hours">Target Hours</Label>
        <Input
          id="goal-target-hours"
          type="number"
          min="1"
          step="1"
          value={targetHours}
          onChange={(e) => setTargetHours(e.target.value)}
          placeholder="100"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="goal-deadline">Deadline</Label>
        <Input
          id="goal-deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={!title.trim() || !targetHours}>
          {initialGoal ? "Save Changes" : "Set Goal"}
        </Button>
      </div>
    </form>
  );
}

function GoalSummary({
  goal,
  totalHours,
  onEdit,
}: {
  goal: StudyGoal;
  totalHours: number;
  onEdit: () => void;
}) {
  const progress = Math.min((totalHours / goal.targetHours) * 100, 100);
  const deadlineLabel = formatDeadline(goal.deadline);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{goal.title}</p>
          <p className="text-sm text-muted-foreground">
            Target: {goal.targetHours}h
            {deadlineLabel && ` · Due ${deadlineLabel}`}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Edit goal"
          onClick={onEdit}
        >
          <Pencil className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <Progress value={progress} />
        <p className="text-right text-sm text-muted-foreground tabular-nums">
          {totalHours.toFixed(1)} / {goal.targetHours}h
        </p>
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const { totalSeconds, goal, setGoal } = useStudyStats();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const { containerRef, setItemRef, isRow } = useOverflowLayout(2);

  const totalHours = totalSeconds / 3600;
  const milestones = generateMilestones();

  const handleGoalSubmit = (nextGoal: StudyGoal) => {
    setGoal(nextGoal);
    setIsEditingGoal(false);
  };

  return (
    <main className="flex flex-1 flex-col items-center gap-4 p-4 sm:p-6">
      <div
        ref={containerRef}
        className={cn(
          "flex w-full max-w-4xl gap-4",
          isRow ? "flex-row items-start" : "flex-col items-center",
        )}
      >
        <Card ref={setItemRef(0)} className={cn("w-full", isRow && "flex-1")}>
          <CardHeader>
            <CardTitle className="text-center text-base text-muted-foreground">
              Long-Term Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goal && !isEditingGoal ? (
              <GoalSummary
                goal={goal}
                totalHours={totalHours}
                onEdit={() => setIsEditingGoal(true)}
              />
            ) : (
              <GoalForm
                initialGoal={goal}
                onSubmit={handleGoalSubmit}
                onCancel={goal ? () => setIsEditingGoal(false) : undefined}
              />
            )}
          </CardContent>
        </Card>

        <Card ref={setItemRef(1)} className={cn("w-full", isRow && "flex-1")}>
          <CardHeader>
            <CardTitle className="text-center text-base text-muted-foreground">
              Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-center text-2xl font-semibold tabular-nums">
              {totalHours.toFixed(1)} hours studied
            </p>

            <ScrollArea className="h-64 rounded-md border">
              <div className="flex flex-col gap-1 p-2">
                {milestones.map((threshold) => {
                  const earned = totalHours >= threshold;
                  return (
                    <div
                      key={threshold}
                      className="flex items-center gap-3 rounded-md px-2 py-2"
                    >
                      <Award
                        className={
                          earned
                            ? "size-5 text-primary"
                            : "size-5 text-muted-foreground/40"
                        }
                      />
                      <span
                        className={
                          earned
                            ? "flex-1 text-sm"
                            : "flex-1 text-sm text-muted-foreground"
                        }
                      >
                        {threshold} hours
                      </span>
                      {earned && <Badge variant="outline">Earned</Badge>}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
