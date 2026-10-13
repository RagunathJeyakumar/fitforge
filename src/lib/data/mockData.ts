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

export const DEMO_FRIENDS: UserProfile[] = [
  {
    id: "user-elena",
    email: "elena.power@fitforge.app",
    full_name: "Elena Rostova",
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    fitness_goal: "strength",
    experience_level: "elite",
    weight_unit: "kg",
    target_days_per_week: 4,
    bio: "Powerlifter competing in 63kg class. Deadlifts are my religion.",
    created_at: "2026-01-12T09:00:00Z"
  },
  {
    id: "user-liam",
    email: "liam.cali@fitforge.app",
    full_name: "Liam Chen",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    fitness_goal: "hypertrophy",
    experience_level: "intermediate",
    weight_unit: "kg",
    target_days_per_week: 4,
    bio: "Hybrid lifter: Weighted calisthenics & heavy barbell compounds.",
    created_at: "2026-01-15T11:00:00Z"
  },
  {
    id: "user-dave",
    email: "dave.iron@fitforge.app",
    full_name: "Dave Miller",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    fitness_goal: "general_fitness",
    experience_level: "intermediate",
    weight_unit: "kg",
    target_days_per_week: 3,
    bio: "Consistency over perfection. Grinding 5 AM sessions.",
    created_at: "2026-02-01T14:00:00Z"
  }
];

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

export const DEMO_MEMBERS: GroupMember[] = [
  {
    id: "gm-1",
    group_id: "grp-iron-forge",
    user_id: "user-marcus",
    role: "admin",
    user_profile: { full_name: "Marcus Vance", avatar_url: DEMO_CURRENT_USER.avatar_url, email: DEMO_CURRENT_USER.email },
    weekly_workouts_count: 4,
    weekly_volume_kg: 42510,
    streak_weeks: 6,
    joined_at: "2026-01-10T08:00:00Z"
  },
  {
    id: "gm-2",
    group_id: "grp-iron-forge",
    user_id: "user-elena",
    role: "member",
    user_profile: { full_name: "Elena Rostova", avatar_url: DEMO_FRIENDS[0].avatar_url, email: DEMO_FRIENDS[0].email },
    weekly_workouts_count: 5,
    weekly_volume_kg: 48200,
    streak_weeks: 9,
    joined_at: "2026-01-12T09:00:00Z"
  },
  {
    id: "gm-3",
    group_id: "grp-iron-forge",
    user_id: "user-liam",
    role: "member",
    user_profile: { full_name: "Liam Chen", avatar_url: DEMO_FRIENDS[1].avatar_url, email: DEMO_FRIENDS[1].email },
    weekly_workouts_count: 3,
    weekly_volume_kg: 31400,
    streak_weeks: 4,
    joined_at: "2026-01-15T11:00:00Z"
  },
  {
    id: "gm-4",
    group_id: "grp-iron-forge",
    user_id: "user-dave",
    role: "member",
    user_profile: { full_name: "Dave Miller", avatar_url: DEMO_FRIENDS[2].avatar_url, email: DEMO_FRIENDS[2].email },
    weekly_workouts_count: 3,
    weekly_volume_kg: 27800,
    streak_weeks: 3,
    joined_at: "2026-02-01T14:00:00Z"
  }
];

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

export const DEMO_ACTIVITY_FEED: ActivityFeedItem[] = [
  {
    id: "act-food-1",
    user_id: "user-elena",
    user_name: "Elena Rostova",
    user_avatar: DEMO_FRIENDS[0].avatar_url,
    action_type: "meal_logged",
    meal_type: "lunch",
    food_name: "Grilled Chicken Breast with Quinoa & Steamed Greens",
    calories: 520,
    protein_g: 48,
    carbs_g: 44,
    fat_g: 11,
    motivation_badge: "🍗 48g High-Protein Muscle Fuel",
    cheers_count: 8,
    has_cheered: false,
    timestamp: "25m ago",
  },
  {
    id: "act-1",
    user_id: "user-marcus",
    user_name: "Marcus Vance",
    user_avatar: DEMO_CURRENT_USER.avatar_url,
    action_type: "pr_broken",
    workout_name: "Push Hypertrophy",
    pr_detail: "Bench Press: 100 kg × 6 reps (New PR! 🚀)",
    volume_kg: 14200,
    cheers_count: 14,
    has_cheered: true,
    timestamp: "1h ago",
  },
  {
    id: "act-food-2",
    user_id: "user-liam",
    user_name: "Liam Chen",
    user_avatar: DEMO_FRIENDS[1].avatar_url,
    action_type: "meal_logged",
    meal_type: "dinner",
    food_name: "Murungai Keerai Masiyal with Brown Rice & 3 Egg Whites",
    tamil_name: "முருங்கைக்கீரை மசியல் & நாட்டுக்கோழி முட்டை",
    calories: 430,
    protein_g: 27,
    carbs_g: 52,
    fat_g: 8,
    motivation_badge: "🌿 Tamil Nadu Superfood • Iron & Calcium Peak",
    cheers_count: 7,
    has_cheered: false,
    timestamp: "2h ago",
  },
  {
    id: "act-2",
    user_id: "user-elena",
    user_name: "Elena Rostova",
    user_avatar: DEMO_FRIENDS[0].avatar_url,
    action_type: "workout_completed",
    workout_name: "Heavy Deadlift & Hamstrings",
    volume_kg: 18400,
    cheers_count: 11,
    has_cheered: false,
    timestamp: "3h ago",
  },
  {
    id: "act-food-3",
    user_id: "user-dave",
    user_name: "Dave Miller",
    user_avatar: DEMO_FRIENDS[2].avatar_url,
    action_type: "meal_logged",
    meal_type: "post_workout",
    food_name: "Whey Protein Isolate with Banana Peanut Butter Shake",
    calories: 395,
    protein_g: 38,
    carbs_g: 36,
    fat_g: 9,
    motivation_badge: "⚡ Anabolic Post-Workout Recovery Window",
    cheers_count: 15,
    has_cheered: true,
    timestamp: "5h ago",
  },
  {
    id: "act-food-4",
    user_id: "user-priya",
    user_name: "Priya Raman",
    user_avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    action_type: "meal_logged",
    meal_type: "evening_snack",
    food_name: "Sprouted Green Gram Sundal & Roasted Paneer",
    tamil_name: "முளைகட்டிய பாசிப்பயறு சுண்டல்",
    calories: 310,
    protein_g: 26,
    carbs_g: 28,
    fat_g: 7,
    motivation_badge: "💪 Clean Vegetarian Protein • Zero Added Sugar",
    cheers_count: 9,
    has_cheered: false,
    timestamp: "6h ago",
  },
  {
    id: "act-3",
    user_id: "user-liam",
    user_name: "Liam Chen",
    user_avatar: DEMO_FRIENDS[1].avatar_url,
    action_type: "workout_completed",
    workout_name: "Upper Body Calisthenics & OHP",
    volume_kg: 10200,
    cheers_count: 6,
    has_cheered: false,
    timestamp: "Yesterday",
  },
  {
    id: "act-4",
    user_id: "user-dave",
    user_name: "Dave Miller",
    user_avatar: DEMO_FRIENDS[2].avatar_url,
    action_type: "workout_completed",
    workout_name: "Full Body Foundation",
    volume_kg: 9400,
    cheers_count: 5,
    has_cheered: false,
    timestamp: "2 days ago",
  },
];
