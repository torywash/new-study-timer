"use client";

import { useEffect, useRef } from "react";

import { toast } from "@/components/ui/toast";
import { useStudyStats } from "@/hooks/use-study-stats";

// Renders nothing — lives in the persistent layout (alongside the
// StudyStats provider it reads) purely so goal completion is detected in
// real time no matter which page the user is currently on, not just the
// next time they happen to visit the Achievements page.
export function GoalCompletionWatcher() {
  const { totalSeconds, goal } = useStudyStats();

  // null = no baseline recorded yet. Without this, reloading the app after
  // already completing a goal would see complete=true starting from a fresh
  // `false`, misreading it as a brand new completion and re-toasting.
  const wasCompleteRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!goal) {
      wasCompleteRef.current = null;
      return;
    }

    const totalHours = totalSeconds / 3600;
    const isComplete = totalHours >= goal.targetHours;

    if (wasCompleteRef.current !== null && isComplete && !wasCompleteRef.current) {
      toast.add({
        title: "Goal complete",
        description: `You reached your "${goal.title}" goal of ${goal.targetHours} hours.`,
        type: "success",
      });
    }

    wasCompleteRef.current = isComplete;
  }, [totalSeconds, goal]);

  return null;
}
