import {
  UserProfile,
  WorkoutSession,
  BodyMetricEntry,
  FriendGroup,
  GroupMember,
  GroupChallenge,
  ActivityFeedItem,
  PersonalRecord
} from "../types";

export const DEMO_CURRENT_USER: UserProfile = {
  id: "user-marcus",
  email: "marcus.vance@fitforge.app",
  full_name: "Marcus Vance",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  fitness_goal: "hypertrophy",
  experience_level: "advanced",
  weight_unit: "kg",
  target_days_per_week: 5,
  bio: "Lifting heavy and chasing PRs with the squad. Focused on strength & clean hypertrophy.",
  created_at: "2026-01-10T08:00:00Z"
};

export const DEMO_FRIENDS: UserProfile[] = [];

export const DEMO_WORKOUT_SESSIONS: WorkoutSession[] = [
  {
    id: "sess-1",
    user_id: "user-marcus",
    plan_id: "template-ppl-push",
    name: "Push Hypertrophy",
    start_time: "2026-10-09T17:30:00Z",
    end_time: "2026-10-09T18:42:00Z",
    duration_seconds: 4320, // 72 mins
    total_volume_kg: 11420,
    status: "completed",
    notes: "Felt strong on bench press! Hit 100kg for 6 reps with 1 in reserve.",
    pr_count: 1,
    created_at: "2026-10-09T17:30:00Z",
    sets: [
      { id: "s-1", session_id: "sess-1", exercise_id: "ex-bench-press", set_number: 1, set_type: "warmup", weight_kg: 60, reps: 10, is_completed: true, created_at: "2026-10-09T17:35:00Z" },
      { id: "s-2", session_id: "sess-1", exercise_id: "ex-bench-press", set_number: 2, set_type: "normal", weight_kg: 90, reps: 8, is_completed: true, created_at: "2026-10-09T17:40:00Z" },
      { id: "s-3", session_id: "sess-1", exercise_id: "ex-bench-press", set_number: 3, set_type: "normal", weight_kg: 100, reps: 6, is_completed: true, is_pr: true, created_at: "2026-10-09T17:45:00Z" },
      { id: "s-4", session_id: "sess-1", exercise_id: "ex-bench-press", set_number: 4, set_type: "normal", weight_kg: 92.5, reps: 7, is_completed: true, created_at: "2026-10-09T17:50:00Z" },
      { id: "s-5", session_id: "sess-1", exercise_id: "ex-incline-db-press", set_number: 1, set_type: "normal", weight_kg: 34, reps: 10, is_completed: true, created_at: "2026-10-09T17:58:00Z" },
      { id: "s-6", session_id: "sess-1", exercise_id: "ex-incline-db-press", set_number: 2, set_type: "normal", weight_kg: 34, reps: 9, is_completed: true, created_at: "2026-10-09T18:03:00Z" },
      { id: "s-7", session_id: "sess-1", exercise_id: "ex-overhead-press", set_number: 1, set_type: "normal", weight_kg: 55, reps: 8, is_completed: true, created_at: "2026-10-09T18:12:00Z" },
      { id: "s-8", session_id: "sess-1", exercise_id: "ex-overhead-press", set_number: 2, set_type: "normal", weight_kg: 55, reps: 7, is_completed: true, created_at: "2026-10-09T18:17:00Z" },
      { id: "s-9", session_id: "sess-1", exercise_id: "ex-lateral-raise", set_number: 1, set_type: "normal", weight_kg: 14, reps: 15, is_completed: true, created_at: "2026-10-09T18:25:00Z" },
      { id: "s-10", session_id: "sess-1", exercise_id: "ex-lateral-raise", set_number: 2, set_type: "normal", weight_kg: 14, reps: 14, is_completed: true, created_at: "2026-10-09T18:28:00Z" },
      { id: "s-11", session_id: "sess-1", exercise_id: "ex-cable-tricep-pushdown", set_number: 1, set_type: "normal", weight_kg: 35, reps: 12, is_completed: true, created_at: "2026-10-09T18:35:00Z" },
      { id: "s-12", session_id: "sess-1", exercise_id: "ex-cable-tricep-pushdown", set_number: 2, set_type: "dropset", weight_kg: 35, reps: 12, is_completed: true, created_at: "2026-10-09T18:38:00Z" }
    ]
  },
  {
    id: "sess-2",
    user_id: "user-marcus",
    plan_id: "template-ppl-pull",
    name: "Pull Hypertrophy & Lats",
    start_time: "2026-10-07T18:00:00Z",
    end_time: "2026-10-07T19:15:00Z",
    duration_seconds: 4500, // 75 mins
    total_volume_kg: 14850,
    status: "completed",
    notes: "Heavy deadlifts moved fast. Great mind-muscle connection on lat pulldowns.",
    pr_count: 0,
    created_at: "2026-10-07T18:00:00Z",
    sets: [
      { id: "s-13", session_id: "sess-2", exercise_id: "ex-deadlift", set_number: 1, set_type: "warmup", weight_kg: 100, reps: 6, is_completed: true, created_at: "2026-10-07T18:10:00Z" },
      { id: "s-14", session_id: "sess-2", exercise_id: "ex-deadlift", set_number: 2, set_type: "normal", weight_kg: 150, reps: 5, is_completed: true, created_at: "2026-10-07T18:16:00Z" },
      { id: "s-15", session_id: "sess-2", exercise_id: "ex-deadlift", set_number: 3, set_type: "normal", weight_kg: 160, reps: 5, is_completed: true, created_at: "2026-10-07T18:22:00Z" },
      { id: "s-16", session_id: "sess-2", exercise_id: "ex-pullups", set_number: 1, set_type: "normal", weight_kg: 0, reps: 12, is_completed: true, created_at: "2026-10-07T18:32:00Z" },
      { id: "s-17", session_id: "sess-2", exercise_id: "ex-pullups", set_number: 2, set_type: "normal", weight_kg: 0, reps: 10, is_completed: true, created_at: "2026-10-07T18:36:00Z" },
      { id: "s-18", session_id: "sess-2", exercise_id: "ex-barbell-row", set_number: 1, set_type: "normal", weight_kg: 75, reps: 8, is_completed: true, created_at: "2026-10-07T18:45:00Z" },
      { id: "s-19", session_id: "sess-2", exercise_id: "ex-barbell-row", set_number: 2, set_type: "normal", weight_kg: 75, reps: 8, is_completed: true, created_at: "2026-10-07T18:50:00Z" },
      { id: "s-20", session_id: "sess-2", exercise_id: "ex-face-pulls", set_number: 1, set_type: "normal", weight_kg: 30, reps: 18, is_completed: true, created_at: "2026-10-07T18:58:00Z" },
      { id: "s-21", session_id: "sess-2", exercise_id: "ex-incline-db-curl", set_number: 1, set_type: "normal", weight_kg: 16, reps: 10, is_completed: true, created_at: "2026-10-07T19:06:00Z" }
    ]
  },
  {
    id: "sess-3",
    user_id: "user-marcus",
    plan_id: "template-ppl-legs",
    name: "Legs & Core Destruction",
    start_time: "2026-10-05T17:15:00Z",
    end_time: "2026-10-05T18:25:00Z",
    duration_seconds: 4200,
    total_volume_kg: 16240,
    status: "completed",
    notes: "Deep squats at 120kg felt crisp. Hamstrings were on fire.",
    pr_count: 1,
    created_at: "2026-10-05T17:15:00Z",
    sets: [
      { id: "s-22", session_id: "sess-3", exercise_id: "ex-barbell-squat", set_number: 1, set_type: "warmup", weight_kg: 70, reps: 10, is_completed: true, created_at: "2026-10-05T17:25:00Z" },
      { id: "s-23", session_id: "sess-3", exercise_id: "ex-barbell-squat", set_number: 2, set_type: "normal", weight_kg: 110, reps: 8, is_completed: true, created_at: "2026-10-05T17:32:00Z" },
      { id: "s-24", session_id: "sess-3", exercise_id: "ex-barbell-squat", set_number: 3, set_type: "normal", weight_kg: 120, reps: 6, is_completed: true, is_pr: true, created_at: "2026-10-05T17:39:00Z" },
      { id: "s-25", session_id: "sess-3", exercise_id: "ex-romanian-deadlift", set_number: 1, set_type: "normal", weight_kg: 95, reps: 10, is_completed: true, created_at: "2026-10-05T17:50:00Z" },
      { id: "s-26", session_id: "sess-3", exercise_id: "ex-leg-press", set_number: 1, set_type: "normal", weight_kg: 200, reps: 12, is_completed: true, created_at: "2026-10-05T18:02:00Z" },
      { id: "s-27", session_id: "sess-3", exercise_id: "ex-leg-curl", set_number: 1, set_type: "normal", weight_kg: 50, reps: 12, is_completed: true, created_at: "2026-10-05T18:14:00Z" }
    ]
  }
];

export const DEMO_BODY_METRICS: BodyMetricEntry[] = [
  { id: "bm-1", user_id: "user-marcus", recorded_date: "2026-08-20", weight_kg: 79.4, body_fat_pct: 14.8, created_at: "2026-08-20T08:00:00Z" },
  { id: "bm-2", user_id: "user-marcus", recorded_date: "2026-08-27", weight_kg: 79.8, body_fat_pct: 14.7, created_at: "2026-08-27T08:00:00Z" },
  { id: "bm-3", user_id: "user-marcus", recorded_date: "2026-09-03", weight_kg: 80.2, body_fat_pct: 14.5, created_at: "2026-09-03T08:00:00Z" },
  { id: "bm-4", user_id: "user-marcus", recorded_date: "2026-09-10", weight_kg: 80.6, body_fat_pct: 14.4, created_at: "2026-09-10T08:00:00Z" },
  { id: "bm-5", user_id: "user-marcus", recorded_date: "2026-09-17", weight_kg: 81.0, body_fat_pct: 14.2, created_at: "2026-09-17T08:00:00Z" },
  { id: "bm-6", user_id: "user-marcus", recorded_date: "2026-09-24", weight_kg: 81.5, body_fat_pct: 14.1, created_at: "2026-09-24T08:00:00Z" },
  { id: "bm-7", user_id: "user-marcus", recorded_date: "2026-10-01", weight_kg: 81.9, body_fat_pct: 14.0, created_at: "2026-10-01T08:00:00Z" },
  { id: "bm-8", user_id: "user-marcus", recorded_date: "2026-10-08", weight_kg: 82.3, body_fat_pct: 13.9, created_at: "2026-10-08T08:00:00Z" }
];

export const DEMO_PERSONAL_RECORDS: PersonalRecord[] = [
  { exercise_id: "ex-bench-press", exercise_name: "Barbell Bench Press", max_weight_kg: 100, max_reps: 6, estimated_one_rep_max_kg: 118, date_achieved: "2026-10-09" },
  { exercise_id: "ex-deadlift", exercise_name: "Conventional Barbell Deadlift", max_weight_kg: 165, max_reps: 5, estimated_one_rep_max_kg: 191, date_achieved: "2026-09-28" },
  { exercise_id: "ex-barbell-squat", exercise_name: "Barbell Back Squat", max_weight_kg: 120, max_reps: 6, estimated_one_rep_max_kg: 142, date_achieved: "2026-10-05" },
  { exercise_id: "ex-overhead-press", exercise_name: "Standing Barbell Overhead Press", max_weight_kg: 62.5, max_reps: 5, estimated_one_rep_max_kg: 72, date_achieved: "2026-09-15" }
];

export const DEMO_GROUP: FriendGroup = {
  id: "grp-iron-forge",
  name: "Iron Forge Syndicate",
  description: "Private circle of dedicated lifters. Tracking progress, pushing each other beyond plateaus.",
  invite_code: "FORGE-884",
  created_by: "user-marcus",
  members_count: 4,
  is_user_admin: true,
  created_at: "2026-01-10T08:00:00Z"
};

export const DEMO_MEMBERS: GroupMember[] = [];

export const DEMO_CHALLENGES: GroupChallenge[] = [
  {
    id: "ch-1",
    group_id: "grp-iron-forge",
    title: "100,000 kg Volume Clash",
    description: "Lift a combined 100,000 kg across all exercises this October. Every set counts toward the syndicate goal.",
    challenge_type: "total_volume",
    target_value: 100000,
    unit: "kg",
    start_date: "2026-10-01",
    end_date: "2026-10-31",
    user_progress: 78500,
    is_completed: false,
    created_at: "2026-10-01T00:00:00Z"
  },
  {
    id: "ch-2",
    group_id: "grp-iron-forge",
    title: "Iron Discipline: 16 Workouts",
    description: "Complete 16 high-intensity workout sessions in 30 days.",
    challenge_type: "workout_count",
    target_value: 16,
    unit: "sessions",
    start_date: "2026-10-01",
    end_date: "2026-10-31",
    user_progress: 11,
    is_completed: false,
    created_at: "2026-10-01T00:00:00Z"
  }
];

export const DEMO_ACTIVITY_FEED: ActivityFeedItem[] = [];
