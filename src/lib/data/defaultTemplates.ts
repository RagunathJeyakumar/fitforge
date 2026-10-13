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
  },
  {
    id: "template-full-body",
    user_id: "system",
    title: "Full Body Strength & Functional Builder",
    description: "Complete full-body compound session targeting chest, back, quads, hamstrings, and shoulders for total body balance.",
    split_type: "Full Body",
    days_count: 3,
    is_public: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    exercises: [
      {
        id: "pe-fb-1",
        exercise_id: "ex-barbell-squat",
        day_name: "Full Body",
        order_index: 0,
        target_sets: 4,
        target_reps: "6-8",
        target_weight_kg: 100,
        rest_seconds: 150,
        notes: "Primary lower compound. Braced core."
      },
      {
        id: "pe-fb-2",
        exercise_id: "ex-bench-press",
        day_name: "Full Body",
        order_index: 1,
        target_sets: 4,
        target_reps: "6-8",
        target_weight_kg: 80,
        rest_seconds: 120,
        notes: "Primary horizontal push."
      },
      {
        id: "pe-fb-3",
        exercise_id: "ex-barbell-row",
        day_name: "Full Body",
        order_index: 2,
        target_sets: 3,
        target_reps: "8-10",
        target_weight_kg: 70,
        rest_seconds: 90,
        notes: "Solid hip hinge and back thickness."
      },
      {
        id: "pe-fb-4",
        exercise_id: "ex-overhead-press",
        day_name: "Full Body",
        order_index: 3,
        target_sets: 3,
        target_reps: "8-10",
        target_weight_kg: 45,
        rest_seconds: 90,
        notes: "Strict vertical pressing strength."
      },
      {
        id: "pe-fb-5",
        exercise_id: "ex-romanian-deadlift",
        day_name: "Full Body",
        order_index: 4,
        target_sets: 3,
        target_reps: "10-12",
        target_weight_kg: 80,
        rest_seconds: 90,
        notes: "Posterior chain hypertrophy."
      }
    ]
  },
  {
    id: "template-chest-triceps",
    user_id: "system",
    title: "Chest & Triceps Hypertrophy Blast",
    description: "Intense push specialization hitting upper, mid, and lower pectoral fibers followed by tricep overload.",
    split_type: "Chest & Triceps",
    days_count: 1,
    is_public: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    exercises: [
      {
        id: "pe-ct-1",
        exercise_id: "ex-bench-press",
        day_name: "Chest & Triceps",
        order_index: 0,
        target_sets: 4,
        target_reps: "6-8",
        target_weight_kg: 85,
        rest_seconds: 120
      },
      {
        id: "pe-ct-2",
        exercise_id: "ex-incline-db-press",
        day_name: "Chest & Triceps",
        order_index: 1,
        target_sets: 3,
        target_reps: "8-10",
        target_weight_kg: 32,
        rest_seconds: 90
      },
      {
        id: "pe-ct-3",
        exercise_id: "ex-cable-flye",
        day_name: "Chest & Triceps",
        order_index: 2,
        target_sets: 3,
        target_reps: "12-15",
        target_weight_kg: 18,
        rest_seconds: 60
      },
      {
        id: "pe-ct-4",
        exercise_id: "ex-cable-tricep-pushdown",
        day_name: "Chest & Triceps",
        order_index: 3,
        target_sets: 4,
        target_reps: "10-12",
        target_weight_kg: 32,
        rest_seconds: 60
      },
      {
        id: "pe-ct-5",
        exercise_id: "ex-dips",
        day_name: "Chest & Triceps",
        order_index: 4,
        target_sets: 3,
        target_reps: "10-12",
        target_weight_kg: 0,
        rest_seconds: 60
      }
    ]
  },
  {
    id: "template-back-biceps",
    user_id: "system",
    title: "Back Thickness & Biceps Peak",
    description: "Complete pulling power routine with heavy deadlifts, lat width pull-ups, and targeted bicep work.",
    split_type: "Back & Biceps",
    days_count: 1,
    is_public: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    exercises: [
      {
        id: "pe-bb-1",
        exercise_id: "ex-deadlift",
        day_name: "Back & Biceps",
        order_index: 0,
        target_sets: 3,
        target_reps: "5",
        target_weight_kg: 140,
        rest_seconds: 180
      },
      {
        id: "pe-bb-2",
        exercise_id: "ex-pullups",
        day_name: "Back & Biceps",
        order_index: 1,
        target_sets: 4,
        target_reps: "8-10",
        target_weight_kg: 0,
        rest_seconds: 90
      },
      {
        id: "pe-bb-3",
        exercise_id: "ex-db-row",
        day_name: "Back & Biceps",
        order_index: 2,
        target_sets: 3,
        target_reps: "10-12",
        target_weight_kg: 36,
        rest_seconds: 60
      },
      {
        id: "pe-bb-4",
        exercise_id: "ex-db-bicep-curl",
        day_name: "Back & Biceps",
        order_index: 3,
        target_sets: 3,
        target_reps: "10-12",
        target_weight_kg: 16,
        rest_seconds: 60
      },
      {
        id: "pe-bb-5",
        exercise_id: "ex-hammer-curl",
        day_name: "Back & Biceps",
        order_index: 4,
        target_sets: 3,
        target_reps: "10-12",
        target_weight_kg: 16,
        rest_seconds: 60
      }
    ]
  },
  {
    id: "template-shoulders-arms",
    user_id: "system",
    title: "3D Shoulders & Arm Sculpt",
    description: "Complete upper physique shaping focusing on all three deltoid heads, bicep peaks, and tricep horseshoe.",
    split_type: "Shoulders & Arms",
    days_count: 1,
    is_public: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    exercises: [
      {
        id: "pe-sa-1",
        exercise_id: "ex-overhead-press",
        day_name: "Shoulders & Arms",
        order_index: 0,
        target_sets: 4,
        target_reps: "6-8",
        target_weight_kg: 50,
        rest_seconds: 120
      },
      {
        id: "pe-sa-2",
        exercise_id: "ex-lateral-raise",
        day_name: "Shoulders & Arms",
        order_index: 1,
        target_sets: 4,
        target_reps: "12-15",
        target_weight_kg: 12,
        rest_seconds: 60
      },
      {
        id: "pe-sa-3",
        exercise_id: "ex-face-pulls",
        day_name: "Shoulders & Arms",
        order_index: 2,
        target_sets: 3,
        target_reps: "15-20",
        target_weight_kg: 25,
        rest_seconds: 60
      },
      {
        id: "pe-sa-4",
        exercise_id: "ex-skull-crushers",
        day_name: "Shoulders & Arms",
        order_index: 3,
        target_sets: 3,
        target_reps: "10-12",
        target_weight_kg: 35,
        rest_seconds: 60
      },
      {
        id: "pe-sa-5",
        exercise_id: "ex-incline-db-curl",
        day_name: "Shoulders & Arms",
        order_index: 4,
        target_sets: 3,
        target_reps: "10-12",
        target_weight_kg: 14,
        rest_seconds: 60
      }
    ]
  },
  {
    id: "template-legs-glutes",
    user_id: "system",
    title: "Legs & Glutes Hypertrophy",
    description: "Heavy lower body builder designed to target quad development, glute activation, and hamstring tension.",
    split_type: "Legs & Glutes",
    days_count: 1,
    is_public: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    exercises: [
      {
        id: "pe-lg-1",
        exercise_id: "ex-barbell-squat",
        day_name: "Legs & Glutes",
        order_index: 0,
        target_sets: 4,
        target_reps: "6-8",
        target_weight_kg: 105,
        rest_seconds: 150
      },
      {
        id: "pe-lg-2",
        exercise_id: "ex-hip-thrust",
        day_name: "Legs & Glutes",
        order_index: 1,
        target_sets: 4,
        target_reps: "10-12",
        target_weight_kg: 110,
        rest_seconds: 120
      },
      {
        id: "pe-lg-3",
        exercise_id: "ex-romanian-deadlift",
        day_name: "Legs & Glutes",
        order_index: 2,
        target_sets: 3,
        target_reps: "8-10",
        target_weight_kg: 85,
        rest_seconds: 90
      },
      {
        id: "pe-lg-4",
        exercise_id: "ex-bulgarian-split",
        day_name: "Legs & Glutes",
        order_index: 3,
        target_sets: 3,
        target_reps: "10-12",
        target_weight_kg: 20,
        rest_seconds: 60
      },
      {
        id: "pe-lg-5",
        exercise_id: "ex-calf-raise",
        day_name: "Legs & Glutes",
        order_index: 4,
        target_sets: 4,
        target_reps: "15-20",
        target_weight_kg: 60,
        rest_seconds: 45
      }
    ]
  },
  {
    id: "template-core-abs",
    user_id: "system",
    title: "Core & Abdominals Shred",
    description: "High-density core strengthening routine targeting rectus abdominis, obliques, and transverse stabilizers.",
    split_type: "Core & Abs",
    days_count: 1,
    is_public: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    exercises: [
      {
        id: "pe-ca-1",
        exercise_id: "ex-hanging-leg-raise",
        day_name: "Core & Abs",
        order_index: 0,
        target_sets: 4,
        target_reps: "12-15",
        target_weight_kg: 0,
        rest_seconds: 60
      },
      {
        id: "pe-ca-2",
        exercise_id: "ex-cable-crunch",
        day_name: "Core & Abs",
        order_index: 1,
        target_sets: 4,
        target_reps: "15-20",
        target_weight_kg: 35,
        rest_seconds: 60
      },
      {
        id: "pe-ca-3",
        exercise_id: "ex-plank",
        day_name: "Core & Abs",
        order_index: 2,
        target_sets: 3,
        target_reps: "60s",
        target_weight_kg: 0,
        rest_seconds: 45
      },
      {
        id: "pe-ca-4",
        exercise_id: "ex-russian-twist",
        day_name: "Core & Abs",
        order_index: 3,
        target_sets: 3,
        target_reps: "20",
        target_weight_kg: 10,
        rest_seconds: 45
      },
      {
        id: "pe-ca-5",
        exercise_id: "ex-bicycle-crunch",
        day_name: "Core & Abs",
        order_index: 4,
        target_sets: 3,
        target_reps: "20",
        target_weight_kg: 0,
        rest_seconds: 45
      }
    ]
  },
  {
    id: "template-ground-calisthenics",
    user_id: "system",
    title: "Ground & Calisthenics Flow (Mat Workout)",
    description: "Zero-equipment ground workout performed on the mat or floor, building functional strength, core endurance, and joint stability.",
    split_type: "Ground & Calisthenics",
    days_count: 1,
    is_public: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    exercises: [
      {
        id: "pe-gc-1",
        exercise_id: "ex-pushups",
        day_name: "Ground Flow",
        order_index: 0,
        target_sets: 4,
        target_reps: "15-20",
        target_weight_kg: 0,
        rest_seconds: 60,
        notes: "Full lockout, tight core."
      },
      {
        id: "pe-gc-2",
        exercise_id: "ex-air-squat",
        day_name: "Ground Flow",
        order_index: 1,
        target_sets: 4,
        target_reps: "20-25",
        target_weight_kg: 0,
        rest_seconds: 60,
        notes: "Deep knee bend below parallel."
      },
      {
        id: "pe-gc-3",
        exercise_id: "ex-plank",
        day_name: "Ground Flow",
        order_index: 2,
        target_sets: 3,
        target_reps: "60s",
        target_weight_kg: 0,
        rest_seconds: 45
      },
      {
        id: "pe-gc-4",
        exercise_id: "ex-mountain-climbers",
        day_name: "Ground Flow",
        order_index: 3,
        target_sets: 3,
        target_reps: "30s",
        target_weight_kg: 0,
        rest_seconds: 45
      },
      {
        id: "pe-gc-5",
        exercise_id: "ex-dead-bug",
        day_name: "Ground Flow",
        order_index: 4,
        target_sets: 3,
        target_reps: "15",
        target_weight_kg: 0,
        rest_seconds: 45
      }
    ]
  },
  {
    id: "template-hiit-cardio",
    user_id: "system",
    title: "Metabolic HIIT & Conditioning Burn",
    description: "High-intensity metabolic conditioning combining kettlebell swings, burpees, and thrusters for maximal calorie expenditure.",
    split_type: "HIIT & Cardio",
    days_count: 1,
    is_public: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    exercises: [
      {
        id: "pe-hc-1",
        exercise_id: "ex-kb-swing",
        day_name: "HIIT Burn",
        order_index: 0,
        target_sets: 4,
        target_reps: "20",
        target_weight_kg: 24,
        rest_seconds: 45
      },
      {
        id: "pe-hc-2",
        exercise_id: "ex-burpees",
        day_name: "HIIT Burn",
        order_index: 1,
        target_sets: 4,
        target_reps: "15",
        target_weight_kg: 0,
        rest_seconds: 60
      },
      {
        id: "pe-hc-3",
        exercise_id: "ex-mountain-climbers",
        day_name: "HIIT Burn",
        order_index: 2,
        target_sets: 4,
        target_reps: "45s",
        target_weight_kg: 0,
        rest_seconds: 45
      },
      {
        id: "pe-hc-4",
        exercise_id: "ex-thrusters",
        day_name: "HIIT Burn",
        order_index: 3,
        target_sets: 3,
        target_reps: "12-15",
        target_weight_kg: 16,
        rest_seconds: 60
      }
    ]
  }
];
