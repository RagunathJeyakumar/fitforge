import { WorkoutPlan } from "../types";

export const DEFAULT_WORKOUT_TEMPLATES: WorkoutPlan[] = [
  {
    id: "template-ppl-push",
    user_id: "system",
    title: "Push Hypertrophy (Chest, Delts, Triceps)",
    description: "Classic Push day focusing on barbell pressing strength followed by targeted delt and tricep isolation.",
    split_type: "Push/Pull/Legs",
    days_count: 3,
    is_public: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    exercises: [
      {
        id: "pe-1",
        exercise_id: "ex-bench-press",
        day_name: "Push Day",
        order_index: 0,
        target_sets: 4,
        target_reps: "6-8",
        target_weight_kg: 85,
        rest_seconds: 180,
        notes: "Heavy compound primer. Explode on concentric."
      },
      {
        id: "pe-2",
        exercise_id: "ex-incline-db-press",
        day_name: "Push Day",
        order_index: 1,
        target_sets: 3,
        target_reps: "8-10",
        target_weight_kg: 32,
        rest_seconds: 120,
        notes: "Deep stretch at bottom, focus on upper clavicular head."
      },
      {
        id: "pe-3",
        exercise_id: "ex-overhead-press",
        day_name: "Push Day",
        order_index: 2,
        target_sets: 3,
        target_reps: "8-10",
        target_weight_kg: 50,
        rest_seconds: 120,
        notes: "Keep glutes and core rock solid throughout."
      },
      {
        id: "pe-4",
        exercise_id: "ex-lateral-raise",
        day_name: "Push Day",
        order_index: 3,
        target_sets: 4,
        target_reps: "12-15",
        target_weight_kg: 12,
        rest_seconds: 60,
        notes: "Strict form, zero torso rocking."
      },
      {
        id: "pe-5",
        exercise_id: "ex-cable-tricep-pushdown",
        day_name: "Push Day",
        order_index: 4,
        target_sets: 3,
        target_reps: "10-12",
        target_weight_kg: 30,
        rest_seconds: 60,
        notes: "Flare rope outward at bottom for full peak squeeze."
      }
    ]
  },
  {
    id: "template-ppl-pull",
    user_id: "system",
    title: "Pull Hypertrophy (Back, Biceps, Rear Delts)",
    description: "Intense pulling workout targeting lat width, mid-back thickness, and arm development.",
    split_type: "Push/Pull/Legs",
    days_count: 3,
    is_public: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    exercises: [
      {
        id: "pe-6",
        exercise_id: "ex-deadlift",
        day_name: "Pull Day",
        order_index: 0,
        target_sets: 3,
        target_reps: "5",
        target_weight_kg: 140,
        rest_seconds: 180,
        notes: "Reset between each rep for crisp form."
      },
      {
        id: "pe-7",
        exercise_id: "ex-pullups",
        day_name: "Pull Day",
        order_index: 1,
        target_sets: 3,
        target_reps: "8-10",
        target_weight_kg: 0,
        rest_seconds: 120,
        notes: "Full range of motion, dead hang to chest level."
      },
      {
        id: "pe-8",
        exercise_id: "ex-barbell-row",
        day_name: "Pull Day",
        order_index: 2,
        target_sets: 3,
        target_reps: "8-10",
        target_weight_kg: 70,
        rest_seconds: 90,
        notes: "Pull toward lower ribcage."
      },
      {
        id: "pe-9",
        exercise_id: "ex-face-pulls",
        day_name: "Pull Day",
        order_index: 3,
        target_sets: 4,
        target_reps: "15-20",
        target_weight_kg: 25,
        rest_seconds: 60,
        notes: "External rotation and rear delt pump."
      },
      {
        id: "pe-10",
        exercise_id: "ex-incline-db-curl",
        day_name: "Pull Day",
        order_index: 4,
        target_sets: 3,
        target_reps: "10-12",
        target_weight_kg: 14,
        rest_seconds: 60,
        notes: "Deep bicep stretch at bottom."
      }
    ]
  },
  {
    id: "template-ppl-legs",
    user_id: "system",
    title: "Legs & Core Builder",
    description: "Comprehensive lower body foundation developing quad sweep, hamstrings, and core bracing.",
    split_type: "Push/Pull/Legs",
    days_count: 3,
    is_public: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    exercises: [
      {
        id: "pe-11",
        exercise_id: "ex-barbell-squat",
        day_name: "Leg Day",
        order_index: 0,
        target_sets: 4,
        target_reps: "6-8",
        target_weight_kg: 110,
        rest_seconds: 180,
        notes: "Hit depth below parallel with solid core brace."
      },
      {
        id: "pe-12",
        exercise_id: "ex-romanian-deadlift",
        day_name: "Leg Day",
        order_index: 1,
        target_sets: 3,
        target_reps: "8-10",
        target_weight_kg: 90,
        rest_seconds: 120,
        notes: "Hinge hips backward, keep lats engaged."
      },
      {
        id: "pe-13",
        exercise_id: "ex-leg-press",
        day_name: "Leg Day",
        order_index: 2,
        target_sets: 3,
        target_reps: "10-12",
        target_weight_kg: 180,
        rest_seconds: 90,
        notes: "Slow eccentric descent."
      },
      {
        id: "pe-14",
        exercise_id: "ex-leg-curl",
        day_name: "Leg Day",
        order_index: 3,
        target_sets: 3,
        target_reps: "12-15",
        target_weight_kg: 45,
        rest_seconds: 60,
        notes: "Peak hamstring squeeze at contraction."
      },
      {
        id: "pe-15",
        exercise_id: "ex-hanging-leg-raise",
        day_name: "Leg Day",
        order_index: 4,
        target_sets: 3,
        target_reps: "12-15",
        target_weight_kg: 0,
        rest_seconds: 60,
        notes: "Strict pelvic tuck, no swinging."
      }
    ]
  },
  {
    id: "template-upper-lower-upper",
    user_id: "system",
    title: "Upper Body Power & Tone",
    description: "4-Day split upper body day combining compound chest, back, and shoulder builders.",
    split_type: "Upper/Lower",
    days_count: 2,
    is_public: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    exercises: [
      {
        id: "pe-16",
        exercise_id: "ex-bench-press",
        day_name: "Upper Day",
        order_index: 0,
        target_sets: 4,
        target_reps: "5",
        target_weight_kg: 90,
        rest_seconds: 180
      },
      {
        id: "pe-17",
        exercise_id: "ex-barbell-row",
        day_name: "Upper Day",
        order_index: 1,
        target_sets: 4,
        target_reps: "6-8",
        target_weight_kg: 75,
        rest_seconds: 120
      },
      {
        id: "pe-18",
        exercise_id: "ex-overhead-press",
        day_name: "Upper Day",
        order_index: 2,
        target_sets: 3,
        target_reps: "8",
        target_weight_kg: 52.5,
        rest_seconds: 120
      },
      {
        id: "pe-19",
        exercise_id: "ex-lat-pulldown",
        day_name: "Upper Day",
        order_index: 3,
        target_sets: 3,
        target_reps: "10-12",
        target_weight_kg: 65,
        rest_seconds: 90
      },
      {
        id: "pe-20",
        exercise_id: "ex-skull-crushers",
        day_name: "Upper Day",
        order_index: 4,
        target_sets: 3,
        target_reps: "10",
        target_weight_kg: 35,
        rest_seconds: 60
      }
    ]
  }
];
