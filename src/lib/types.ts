export type FitnessGoal = "hypertrophy" | "strength" | "endurance" | "weight_loss" | "general_fitness";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced" | "elite";
export type WeightUnit = "kg" | "lbs";
export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Quads"
  | "Hamstrings"
  | "Glutes"
  | "Calves"
  | "Core"
  | "Forearms"
  | "Full Body";

export type EquipmentType =
  | "Barbell"
  | "Dumbbell"
  | "Cable"
  | "Machine"
  | "Bodyweight"
  | "Kettlebell"
  | "Resistance Band"
  | "Smith Machine";

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";
export type MovementType = "Compound" | "Isolation" | "Cardio" | "Isometric";
export type SetType = "normal" | "warmup" | "dropset" | "failure";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  fitness_goal: FitnessGoal;
  experience_level: ExperienceLevel;
  weight_unit: WeightUnit;
  target_days_per_week: number;
  bio?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserPrivacySettings {
  user_id: string;
  share_workouts: boolean;
  share_bodyweight: boolean;
  share_prs: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  instructions: string[];
  primary_muscles: MuscleGroup[];
  secondary_muscles: MuscleGroup[];
  equipment: EquipmentType;
  difficulty: DifficultyLevel;
  movement_type: MovementType;
  media_url?: string;
  alternatives?: string[]; // IDs or names of alternative exercises
  is_custom?: boolean;
  created_by?: string;
  is_favorite?: boolean;
  created_at: string;
}

export interface PlanExerciseItem {
  id: string;
  exercise_id: string;
  day_name?: string;
  order_index: number;
  target_sets: number;
  target_reps: string; // e.g. "8-10" or "5"
  target_weight_kg?: number;
  rest_seconds: number;
  notes?: string;
  exercise?: Exercise;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  title: string;
  description: string;
  split_type: "Push/Pull/Legs" | "Upper/Lower" | "Full Body" | "Arnold" | "Custom";
  days_count: number;
  is_public: boolean;
  exercises: PlanExerciseItem[];
  created_at: string;
  updated_at: string;
}

export interface WorkoutSetRecord {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  set_type: SetType;
  weight_kg: number;
  reps: number;
  rpe?: number; // 6 to 10
  is_completed: boolean;
  is_pr?: boolean;
  previous_weight_kg?: number;
  previous_reps?: number;
  created_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  plan_id?: string;
  name: string;
  start_time: string;
  end_time?: string;
  duration_seconds: number;
  total_volume_kg: number;
  status: "in_progress" | "completed" | "cancelled";
  notes?: string;
  sets: WorkoutSetRecord[];
  pr_count?: number;
  created_at: string;
}

export interface ActiveWorkoutState {
  session: WorkoutSession;
  activeExerciseIndex: number;
  timerSecondsRemaining: number;
  isTimerRunning: boolean;
  timerTargetSeconds: number;
  startTimeTimestamp: number;
}

export interface BodyMetricEntry {
  id: string;
  user_id: string;
  recorded_date: string; // YYYY-MM-DD
  weight_kg: number;
  body_fat_pct?: number;
  notes?: string;
  created_at: string;
}

export interface PersonalRecord {
  exercise_id: string;
  exercise_name: string;
  max_weight_kg: number;
  max_reps: number;
  estimated_one_rep_max_kg: number;
  date_achieved: string;
}

export interface FriendGroup {
  id: string;
  name: string;
  description: string;
  invite_code: string;
  created_by: string;
  members_count: number;
  created_at: string;
  is_user_admin?: boolean;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: "admin" | "member";
  user_profile: {
    full_name: string;
    avatar_url?: string;
    email: string;
  };
  weekly_workouts_count: number;
  weekly_volume_kg: number;
  streak_weeks: number;
  joined_at: string;
}

export interface GroupChallenge {
  id: string;
  group_id: string;
  title: string;
  description: string;
  challenge_type: "total_volume" | "workout_count" | "streak" | "bench_target";
  target_value: number;
  unit: string;
  start_date: string;
  end_date: string;
  user_progress?: number;
  is_completed?: boolean;
  created_at: string;
}

export interface ActivityFeedItem {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  action_type: "workout_completed" | "pr_broken" | "joined_group" | "challenge_completed";
  workout_name?: string;
  volume_kg?: number;
  pr_detail?: string;
  timestamp: string;
}
