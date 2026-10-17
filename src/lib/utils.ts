import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ActivityFeedItem } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function formatWeight(weight: number, unit: "kg" | "lbs" = "kg"): string {
  return `${weight} ${unit}`;
}

/**
 * Deduplicate activity feed entries by ID and by content signature (user + action + name + timestamp proximity)
 * Guarantees that each real meal or workout log appears strictly once across polling cycles and multi-layer syncs.
 */
export function deduplicateActivityFeed(items: ActivityFeedItem[]): ActivityFeedItem[] {
  if (!Array.isArray(items)) return [];
  const result: ActivityFeedItem[] = [];
  const seenIds = new Set<string>();

  for (const item of items) {
    if (!item) continue;

    // Direct ID duplicate check
    if (item.id && seenIds.has(item.id)) continue;

    const itemTime = item.created_at ? new Date(item.created_at).getTime() : 0;
    const foodNorm = item.food_name?.toLowerCase().trim();
    const workoutNorm = item.workout_name?.toLowerCase().trim();

    const isDuplicate = result.some((existing) => {
      // 1. Exact ID match
      if (existing.id && item.id && existing.id === item.id) return true;

      // 2. Content similarity check for same user and same action
      if (existing.user_id === item.user_id && existing.action_type === item.action_type) {
        const exTime = existing.created_at ? new Date(existing.created_at).getTime() : 0;
        const timeDiff = Math.abs(itemTime - exTime);

        // Meal logging deduplication
        if (item.action_type === "meal_logged") {
          const exFoodNorm = existing.food_name?.toLowerCase().trim();
          const namesMatch = Boolean(
            (foodNorm && exFoodNorm && foodNorm === exFoodNorm) ||
            (item.tamil_name && existing.tamil_name && item.tamil_name.trim() === existing.tamil_name.trim())
          );

          if (namesMatch) {
            // If logged within 10 minutes of each other, or if timestamps are invalid/missing, it's the exact same meal event
            if (!itemTime || !exTime || isNaN(timeDiff) || timeDiff < 10 * 60 * 1000) return true;
            // Or same meal_type (e.g. breakfast) within 45 minutes
            if (
              item.meal_type &&
              existing.meal_type &&
              item.meal_type === existing.meal_type &&
              timeDiff < 45 * 60 * 1000
            ) {
              return true;
            }
          }
        }

        // Workout logging deduplication
        if (item.action_type === "workout_completed" || item.action_type === "pr_broken") {
          const exWorkoutNorm = existing.workout_name?.toLowerCase().trim();
          const workoutsMatch = Boolean(workoutNorm && exWorkoutNorm && workoutNorm === exWorkoutNorm);

          if (workoutsMatch) {
            // Workouts completed within 15 minutes of each other
            if (!itemTime || !exTime || isNaN(timeDiff) || timeDiff < 15 * 60 * 1000) return true;
          }
        }
      }

      return false;
    });

    if (!isDuplicate) {
      if (item.id) seenIds.add(item.id);
      result.push(item);
    }
  }

  return result.sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });
}
