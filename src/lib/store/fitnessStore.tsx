"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  UserProfile,
  Exercise,
  WorkoutPlan,
  WorkoutSession,
  WorkoutSetRecord,
  ActiveWorkoutState,
  BodyMetricEntry,
  PersonalRecord,
  FriendGroup,
  GroupMember,
  GroupChallenge,
  ActivityFeedItem,
  UserPrivacySettings,
  FoodItem,
  LoggedMealEntry,
  MealType,
  NutritionDailyTargets,
} from "../types";
import { INITIAL_EXERCISES } from "../data/initialExercises";
import { DEFAULT_WORKOUT_TEMPLATES } from "../data/defaultTemplates";
import { TAMIL_NADU_FOODS } from "../data/tamilNaduFoods";
import { COMPREHENSIVE_FOODS } from "../data/comprehensiveFoods";
import {
  DEMO_CURRENT_USER,
  DEMO_FRIENDS,
  DEMO_WORKOUT_SESSIONS,
  DEMO_BODY_METRICS,
  DEMO_PERSONAL_RECORDS,
  DEMO_GROUP,
  DEMO_MEMBERS,
  DEMO_CHALLENGES,
  DEMO_ACTIVITY_FEED,
} from "../data/mockData";
import { getSupabaseConfig } from "../supabase/config";
import { getSupabaseBrowserClient } from "../supabase/client";
import {
  queueOfflineSetChange,
  queueOfflineSessionCompletion,
  clearUserOfflineData,
  saveActiveSessionBackup,
} from "../pwa/offlineSync";
import { deduplicateActivityFeed } from "../utils";

interface FitnessContextType {
  // Auth & Profile
  user: UserProfile | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isSupabaseConfigured: boolean;
  privacySettings: UserPrivacySettings;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updatePrivacySettings: (settings: Partial<UserPrivacySettings>) => void;
  toggleDemoMode: (enable: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  clearToBlankState: () => Promise<void> | void;
  logout: () => Promise<void>;

  // Exercises
  exercises: Exercise[];
  favoriteExerciseIds: string[];
  toggleFavoriteExercise: (exerciseId: string) => void;
  addCustomExercise: (exercise: Omit<Exercise, "id" | "created_at">) => Exercise;

  // Workout Plans
  workoutPlans: WorkoutPlan[];
  createWorkoutPlan: (plan: Omit<WorkoutPlan, "id" | "created_at" | "updated_at">) => WorkoutPlan;
  updateWorkoutPlan: (id: string, plan: Partial<WorkoutPlan>) => void;
  duplicateWorkoutPlan: (id: string) => WorkoutPlan;
  deleteWorkoutPlan: (id: string) => void;

  // Active Workout
  activeWorkout: ActiveWorkoutState | null;
  startWorkout: (planOrEmpty?: WorkoutPlan | null, customName?: string) => void;
  updateActiveSet: (
    exerciseIndex: number,
    setIndex: number,
    field: keyof WorkoutSetRecord,
    value: string | number | boolean | undefined
  ) => void;
  addSetToExercise: (exerciseIndex: number) => void;
  removeSetFromExercise: (exerciseIndex: number, setIndex: number) => void;
  addExerciseToActiveWorkout: (exercise: Exercise) => void;
  removeExerciseFromActiveWorkout: (exerciseIndex: number) => void;
  completeActiveSet: (exerciseIndex: number, setIndex: number) => void;
  startRestTimer: (seconds: number) => void;
  pauseRestTimer: () => void;
  adjustRestTimer: (secondsDelta: number) => void;
  finishActiveWorkout: () => WorkoutSession | null;
  cancelActiveWorkout: () => void;
  hasUnsavedActiveWorkout: boolean;

  // History & Analytics
  completedSessions: WorkoutSession[];
  bodyMetrics: BodyMetricEntry[];
  addBodyMetric: (entry: Omit<BodyMetricEntry, "id" | "user_id" | "created_at">) => void;
  deleteBodyMetric: (id: string) => void;
  personalRecords: PersonalRecord[];

  // Social & Groups
  groups: FriendGroup[];
  groupMembers: GroupMember[];
  challenges: GroupChallenge[];
  activityFeed: ActivityFeedItem[];
  createGroup: (name: string, description: string) => Promise<FriendGroup | null>;
  joinGroupByCode: (code: string) => Promise<boolean> | boolean;
  leaveGroup: (groupId: string) => void;
  cheerActivity: (activityId: string) => void;
  refreshSquadData: (customUserId?: string, customGroupId?: string) => Promise<void>;

  // Nutrition & Diet
  foodDatabase: FoodItem[];
  customFoods: FoodItem[];
  addCustomFood: (food: Omit<FoodItem, "id" | "is_custom">) => FoodItem;
  deleteCustomFood: (id: string) => void;
  loggedMeals: LoggedMealEntry[];
  nutritionTargets: NutritionDailyTargets;
  addMealEntry: (mealType: MealType, foodItem: FoodItem, servings: number, dateStr?: string) => void;
  updateMealEntryServings: (id: string, newServings: number) => void;
  removeMealEntry: (id: string) => void;
  updateNutritionTargets: (targets: Partial<NutritionDailyTargets>) => void;
  clearTodayMeals: (dateStr?: string) => void;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACTIVE_WORKOUT: "fitforge_active_workout_v2",
  PLANS: "fitforge_custom_plans_v2",
  SESSIONS: "fitforge_sessions_v2",
  FAVORITES: "fitforge_favorites_v2",
  METRICS: "fitforge_metrics_v2",
  USER: "fitforge_user_profile_v2",
  CUSTOM_EXERCISES: "fitforge_custom_exercises_v2",
  CUSTOM_FOODS: "fitforge_custom_foods_v2",
  IS_DEMO: "fitforge_demo_mode_v2",
  PRIVACY: "fitforge_privacy_v2",
  GROUPS: "fitforge_groups_v2",
  MEMBERS: "fitforge_group_members_v2",
  CHALLENGES: "fitforge_challenges_v2",
  LOGGED_MEALS: "fitforge_logged_meals_v2",
  NUTRITION_TARGETS: "fitforge_nutrition_targets_v2",
  PRS: "fitforge_prs_v2",
  ACTIVITY_FEED: "fitforge_activity_feed_v2",
};

const DEFAULT_NUTRITION_TARGETS: NutritionDailyTargets = {
  calories: 2300,
  protein_g: 145,
  carbs_g: 240,
  fat_g: 65,
  fiber_g: 30,
  max_saturated_fat_g: 20,
  max_sodium_mg: 2300,
  max_added_sugar_g: 25,
};

const getInitialDemoMeals = (): LoggedMealEntry[] => {
  const today = typeof window !== "undefined"
    ? new Date().toISOString().split("T")[0]
    : "2026-10-11";

  return [
    {
      id: "meal-1",
      meal_type: "breakfast",
      food_id: "tn-idli",
      food_name: "Idli (Steamed Rice-Urad Dal Cake)",
      tamil_name: "இட்லி",
      servings: 3,
      serving_unit: "piece (50g)",
      calories: 174,
      protein_g: 6.3,
      carbs_g: 36.0,
      fiber_g: 2.4,
      healthy_fat_g: 0.6,
      bad_nutrients: { saturated_fat_g: 0.15, trans_fat_g: 0, sodium_mg: 285, added_sugar_g: 0, cholesterol_mg: 0 },
      micronutrients: { vitamin_a_mcg: 6, vitamin_c_mg: 0, vitamin_d_iu: 0, vitamin_b12_mcg: 0, iron_mg: 1.5, calcium_mg: 36, potassium_mg: 135, zinc_mg: 0.9 },
      logged_at: `${today}T08:30:00Z`,
    },
    {
      id: "meal-2",
      meal_type: "breakfast",
      food_id: "tn-sambar",
      food_name: "Drumstick & Vegetable Sambar",
      tamil_name: "முருங்கைக்காய் சாம்பார்",
      servings: 1,
      serving_unit: "bowl (150ml)",
      calories: 110,
      protein_g: 5.4,
      carbs_g: 16.5,
      fiber_g: 3.8,
      healthy_fat_g: 2.2,
      bad_nutrients: { saturated_fat_g: 0.6, trans_fat_g: 0, sodium_mg: 420, added_sugar_g: 0.8, cholesterol_mg: 0 },
      micronutrients: { vitamin_a_mcg: 95, vitamin_c_mg: 12, vitamin_d_iu: 0, vitamin_b12_mcg: 0, iron_mg: 2.1, calcium_mg: 48, potassium_mg: 280, zinc_mg: 0.9 },
      logged_at: `${today}T08:32:00Z`,
    },
    {
      id: "meal-3",
      meal_type: "morning_snack",
      food_id: "tn-elaneer",
      food_name: "Tender Coconut Water / Elaneer",
      tamil_name: "இளநீர்",
      servings: 1,
      serving_unit: "nut (250ml)",
      calories: 48,
      protein_g: 1.8,
      carbs_g: 10.5,
      fiber_g: 1.2,
      healthy_fat_g: 0.3,
      bad_nutrients: { saturated_fat_g: 0.2, trans_fat_g: 0, sodium_mg: 85, added_sugar_g: 0, cholesterol_mg: 0 },
      micronutrients: { vitamin_a_mcg: 0, vitamin_c_mg: 14, vitamin_d_iu: 0, vitamin_b12_mcg: 0, iron_mg: 0.8, calcium_mg: 48, potassium_mg: 620, zinc_mg: 0.3 },
      logged_at: `${today}T11:15:00Z`,
    },
    {
      id: "meal-4",
      meal_type: "lunch",
      food_id: "tn-ponni-rice",
      food_name: "Boiled Ponni White Rice (Cooked)",
      tamil_name: "பொன்னி புழுங்கல் அரிசி சாதம்",
      servings: 1.5,
      serving_unit: "cup cooked (150g)",
      calories: 292,
      protein_g: 5.8,
      carbs_g: 63.8,
      fiber_g: 1.6,
      healthy_fat_g: 0.7,
      bad_nutrients: { saturated_fat_g: 0.15, trans_fat_g: 0, sodium_mg: 7.5, added_sugar_g: 0, cholesterol_mg: 0 },
      micronutrients: { vitamin_a_mcg: 0, vitamin_c_mg: 0, vitamin_d_iu: 0, vitamin_b12_mcg: 0, iron_mg: 1.2, calcium_mg: 21, potassium_mg: 82, zinc_mg: 1.2 },
      logged_at: `${today}T13:30:00Z`,
    },
    {
      id: "meal-5",
      meal_type: "lunch",
      food_id: "tn-chicken-sukka",
      food_name: "Chettinad Chicken Chukka / Varuval",
      tamil_name: "செட்டிநாடு சிக்கன் சுக்கா",
      servings: 1,
      serving_unit: "portion (150g)",
      calories: 270,
      protein_g: 32.5,
      carbs_g: 5.2,
      fiber_g: 1.8,
      healthy_fat_g: 9.8,
      bad_nutrients: { saturated_fat_g: 3.2, trans_fat_g: 0, sodium_mg: 480, added_sugar_g: 0, cholesterol_mg: 95 },
      micronutrients: { vitamin_a_mcg: 45, vitamin_c_mg: 5, vitamin_d_iu: 8, vitamin_b12_mcg: 0.8, iron_mg: 2.4, calcium_mg: 28, potassium_mg: 380, zinc_mg: 2.2 },
      logged_at: `${today}T13:35:00Z`,
    },
    {
      id: "meal-6",
      meal_type: "lunch",
      food_id: "tn-keerai-masiyal",
      food_name: "Murungai / Siru Keerai Masiyal",
      tamil_name: "முருங்கைக்கீரை மசியல்",
      servings: 1,
      serving_unit: "cup (120g)",
      calories: 85,
      protein_g: 4.8,
      carbs_g: 9.5,
      fiber_g: 4.2,
      healthy_fat_g: 2.5,
      bad_nutrients: { saturated_fat_g: 0.4, trans_fat_g: 0, sodium_mg: 180, added_sugar_g: 0, cholesterol_mg: 0 },
      micronutrients: { vitamin_a_mcg: 750, vitamin_c_mg: 45, vitamin_d_iu: 0, vitamin_b12_mcg: 0, iron_mg: 5.2, calcium_mg: 185, potassium_mg: 380, zinc_mg: 1.1 },
      logged_at: `${today}T13:40:00Z`,
    },
    {
      id: "meal-7",
      meal_type: "post_workout",
      food_id: "tn-whey-water",
      food_name: "Whey Protein Isolate (in Water)",
      tamil_name: "வே புரத பவுடர் (தண்ணீரில்)",
      servings: 1,
      serving_unit: "scoop (30g)",
      calories: 120,
      protein_g: 25.0,
      carbs_g: 1.5,
      fiber_g: 0.2,
      healthy_fat_g: 0.8,
      bad_nutrients: { saturated_fat_g: 0.4, trans_fat_g: 0, sodium_mg: 110, added_sugar_g: 0, cholesterol_mg: 15 },
      micronutrients: { vitamin_a_mcg: 0, vitamin_c_mg: 0, vitamin_d_iu: 0, vitamin_b12_mcg: 0.6, iron_mg: 0.3, calcium_mg: 140, potassium_mg: 160, zinc_mg: 0.4 },
      logged_at: `${today}T18:45:00Z`,
    },
  ];
};

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConfigured } = getSupabaseConfig();
  const [isSupabaseConfigured] = useState(isConfigured);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
      if (saved !== null) return saved === "true";
    }
    return true;
  });
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {}
      }
      const isDemo = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
      if (isDemo === "false") return null;

      // Unique guest athlete ID and friendly identifier per browser session so unauthenticated users don't collide
      let guestId = localStorage.getItem("fitforge_guest_uid");
      let guestName = localStorage.getItem("fitforge_guest_name");
      if (!guestId) {
        const randNum = Math.floor(1000 + Math.random() * 9000);
        guestId = `athlete-${randNum}`;
        guestName = `Athlete #${randNum}`;
        localStorage.setItem("fitforge_guest_uid", guestId);
        localStorage.setItem("fitforge_guest_name", guestName);
      }
      return {
        ...DEMO_CURRENT_USER,
        id: guestId,
        full_name: guestName || `Athlete #${guestId.slice(-4)}`,
      };
    }
    return DEMO_CURRENT_USER;
  });
  const [privacySettings, setPrivacySettings] = useState<UserPrivacySettings>({
    user_id: DEMO_CURRENT_USER.id,
    share_workouts: true,
    share_bodyweight: false,
    share_prs: true,
  });

  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_EXERCISES);
  const [favoriteExerciseIds, setFavoriteExerciseIds] = useState<string[]>([
    "ex-bench-press",
    "ex-deadlift",
    "ex-barbell-squat",
    "ex-pullups",
  ]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>(DEFAULT_WORKOUT_TEMPLATES);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(null);
  const [completedSessions, setCompletedSessions] = useState<WorkoutSession[]>(DEMO_WORKOUT_SESSIONS);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetricEntry[]>(DEMO_BODY_METRICS);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(DEMO_PERSONAL_RECORDS);

  // Social
  const [groups, setGroups] = useState<FriendGroup[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.GROUPS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const [challenges, setChallenges] = useState<GroupChallenge[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITY_FEED);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.filter(
              (i: any) =>
                i &&
                i.is_real === true &&
                !i.user_id?.startsWith("user-elena") &&
                !i.user_id?.startsWith("user-liam") &&
                !i.user_id?.startsWith("user-dave")
            );
          }
        }
      } catch {}
    }
    return [];
  });

  // Nutrition & Diet State
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [loggedMeals, setLoggedMeals] = useState<LoggedMealEntry[]>(getInitialDemoMeals);
  const [nutritionTargets, setNutritionTargets] = useState<NutritionDailyTargets>(DEFAULT_NUTRITION_TARGETS);

  const foodDatabase = useMemo(() => {
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const consolidated: FoodItem[] = [];

    const processFood = (food: FoodItem) => {
      const normalizedName = food.name.trim().toLowerCase();
      if (seenIds.has(food.id) || seenNames.has(normalizedName)) {
        return;
      }
      seenIds.add(food.id);
      seenNames.add(normalizedName);

      // Normalize missing fields for legacy or custom foods
      const servingSize = food.serving_size_grams > 0 ? food.serving_size_grams : 100;
      const calPer100g = food.calories_per_100g && food.calories_per_100g > 0
        ? food.calories_per_100g
        : Math.round((food.calories / servingSize) * 100);

      let inferredDietary: "veg" | "non_veg" | "vegan" | "egg" = food.dietary_type || "veg";
      if (!food.dietary_type) {
        const lowerName = food.name.toLowerCase();
        if (lowerName.includes("chicken") || lowerName.includes("mutton") || lowerName.includes("fish") || lowerName.includes("prawn") || lowerName.includes("beef") || lowerName.includes("pork") || lowerName.includes("meat")) {
          inferredDietary = "non_veg";
        } else if (lowerName.includes("egg") || lowerName.includes("omelette") || lowerName.includes("albumin")) {
          inferredDietary = "egg";
        } else if (lowerName.includes("milk") || lowerName.includes("paneer") || lowerName.includes("curd") || lowerName.includes("yogurt") || lowerName.includes("cheese") || lowerName.includes("ghee") || lowerName.includes("butter")) {
          inferredDietary = "veg";
        } else {
          inferredDietary = "vegan";
        }
      }

      consolidated.push({
        ...food,
        calories_per_100g: calPer100g,
        dietary_type: inferredDietary,
        goal_suitability: food.goal_suitability && food.goal_suitability.length > 0
          ? food.goal_suitability
          : food.protein_g >= 15
            ? ["muscle_gain", "fat_loss", "general_health"]
            : ["general_health"],
        preparation_state: food.preparation_state || "cooked",
      });
    };

    // Priority: Custom user foods first, then Comprehensive Master List, then Regional Staples
    customFoods.forEach(processFood);
    COMPREHENSIVE_FOODS.forEach(processFood);
    TAMIL_NADU_FOODS.forEach(processFood);

    return consolidated;
  }, [customFoods]);

  // Load state from local storage on mount
  useEffect(() => {
    try {
      const savedDemo = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
      if (savedDemo !== null) {
        setIsDemoMode(savedDemo === "true");
      }

      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      const savedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (savedFavorites) {
        setFavoriteExerciseIds(JSON.parse(savedFavorites));
      }

      const savedCustomExercises = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
      if (savedCustomExercises) {
        const parsed = JSON.parse(savedCustomExercises);
        setExercises([...INITIAL_EXERCISES, ...parsed]);
      }

      const savedCustomFoods = localStorage.getItem(STORAGE_KEYS.CUSTOM_FOODS);
      if (savedCustomFoods) {
        setCustomFoods(JSON.parse(savedCustomFoods));
      }

      const savedPlans = localStorage.getItem(STORAGE_KEYS.PLANS);
      if (savedPlans) {
        const parsed = JSON.parse(savedPlans);
        setWorkoutPlans([...DEFAULT_WORKOUT_TEMPLATES, ...parsed]);
      }

      if (savedDemo === "false") {
        setIsDemoMode(false);
        const savedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
        setCompletedSessions(savedSessions ? JSON.parse(savedSessions) : []);

        const savedMetrics = localStorage.getItem(STORAGE_KEYS.METRICS);
        setBodyMetrics(savedMetrics ? JSON.parse(savedMetrics) : []);

        const savedMeals = localStorage.getItem(STORAGE_KEYS.LOGGED_MEALS);
        setLoggedMeals(savedMeals ? JSON.parse(savedMeals) : []);

        const savedPRs = localStorage.getItem(STORAGE_KEYS.PRS);
        setPersonalRecords(savedPRs ? JSON.parse(savedPRs) : []);

      } else {
        const savedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
        if (savedSessions) {
          setCompletedSessions(JSON.parse(savedSessions));
        }

        const savedMetrics = localStorage.getItem(STORAGE_KEYS.METRICS);
        if (savedMetrics) {
          setBodyMetrics(JSON.parse(savedMetrics));
        }

        const savedMeals = localStorage.getItem(STORAGE_KEYS.LOGGED_MEALS);
        if (savedMeals) {
          setLoggedMeals(JSON.parse(savedMeals));
        }

        const savedPRs = localStorage.getItem(STORAGE_KEYS.PRS);
        if (savedPRs) {
          setPersonalRecords(JSON.parse(savedPRs));
        }
      }

      // Restore social data from storage (persist squads and activities across reloads)
      const savedGroups = localStorage.getItem(STORAGE_KEYS.GROUPS);
      if (savedGroups) {
        try {
          const parsed = JSON.parse(savedGroups);
          if (Array.isArray(parsed)) setGroups(parsed);
          else setGroups([]);
        } catch {
          setGroups([]);
        }
      } else {
        setGroups([]);
      }

      const savedMembers = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (savedMembers) {
        try {
          const parsed = JSON.parse(savedMembers);
          if (Array.isArray(parsed)) {
            const cleanMembers = parsed.filter(
              (m: any) =>
                !m.user_id?.startsWith("user-elena") &&
                !m.user_id?.startsWith("user-liam") &&
                !m.user_id?.startsWith("user-dave") &&
                !m.id?.includes("elena") &&
                !m.id?.includes("liam") &&
                !m.id?.includes("dave")
            );
            setGroupMembers(cleanMembers);
          } else {
            setGroupMembers([]);
          }
        } catch {
          setGroupMembers([]);
        }
      } else {
        setGroupMembers([]);
      }

      const savedChallenges = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
      if (savedChallenges) {
        try {
          const parsed = JSON.parse(savedChallenges);
          if (Array.isArray(parsed)) setChallenges(parsed);
          else setChallenges([]);
        } catch {
          setChallenges([]);
        }
      } else {
        setChallenges([]);
      }

      const savedFeed = localStorage.getItem(STORAGE_KEYS.ACTIVITY_FEED);
      if (savedFeed) {
        try {
          const parsed = JSON.parse(savedFeed);
          if (Array.isArray(parsed)) {
            const cleanFeed = deduplicateActivityFeed(
              parsed.filter(
                (i: any) =>
                  i &&
                  i.is_real === true &&
                  !i.user_id?.startsWith("user-elena") &&
                  !i.user_id?.startsWith("user-liam") &&
                  !i.user_id?.startsWith("user-dave")
              )
            );
            setActivityFeed(cleanFeed);
            localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify(cleanFeed));
          } else {
            setActivityFeed([]);
            localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify([]));
          }
        } catch {
          setActivityFeed([]);
          localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify([]));
        }
      } else {
        setActivityFeed([]);
        localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify([]));
      }

      const savedTargets = localStorage.getItem(STORAGE_KEYS.NUTRITION_TARGETS);
      if (savedTargets) {
        setNutritionTargets(JSON.parse(savedTargets));
      }
    } catch (e) {
      console.warn("Could not read local storage state:", e);
    }
  }, []);

  // Supabase Auth Listener & Cloud Data Hydration
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    try {
      const supabase = getSupabaseBrowserClient();

      const hydrateAuthUser = async (authUser: any) => {
        setIsDemoMode(false);
        localStorage.setItem(STORAGE_KEYS.IS_DEMO, "false");

        const profile: UserProfile = {
          id: authUser.id,
          email: authUser.email || "",
          full_name:
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            authUser.email?.split("@")[0] ||
            "Athlete",
          avatar_url:
            authUser.user_metadata?.avatar_url ||
            authUser.user_metadata?.picture,
          fitness_goal: "hypertrophy",
          experience_level: "intermediate",
          weight_unit: "kg",
          target_days_per_week: 4,
          created_at: authUser.created_at || new Date().toISOString(),
        };

        setUser(profile);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));

        // Sync real squad memberships & live friends activity from DB / API
        try {
          const squadRes = await fetch(`/api/squad?userId=${authUser.id}`);
          if (squadRes.ok) {
            const squadData = await squadRes.json();
            if (squadData.success && squadData.inSquad && squadData.squads?.length > 0) {
              const deduplicatedSquadActs = deduplicateActivityFeed(squadData.activities || []);
              setGroups(squadData.squads);
              setGroupMembers(squadData.members || []);
              setActivityFeed(deduplicatedSquadActs);
              localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(squadData.squads));
              localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(squadData.members || []));
              localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify(deduplicatedSquadActs));
            } else {
              // User has NOT joined any squad: Strict privacy requirement: ZERO friends activity!
              setGroups([]);
              setGroupMembers([]);
              setChallenges([]);
              setActivityFeed([]);
              localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify([]));
              localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify([]));
              localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify([]));
              localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify([]));
            }
          }
        } catch (squadErr) {
          console.warn("Could not query squads from API:", squadErr);
          const rawSavedGroups = localStorage.getItem(STORAGE_KEYS.GROUPS);
          if (rawSavedGroups) {
            try {
              const parsed = JSON.parse(rawSavedGroups);
              if (Array.isArray(parsed)) setGroups(parsed);
              else setGroups([]);
            } catch {
              setGroups([]);
            }
          } else {
            setGroups([]);
          }
        }

        // Hydrate from Supabase cloud database
        try {
          const { data: sessions } = await supabase
            .from("workout_sessions")
            .select("*, sets:workout_sets(*)")
            .eq("user_id", authUser.id)
            .order("created_at", { ascending: false });

          if (sessions && sessions.length > 0) {
            setCompletedSessions(sessions);
            localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
          } else {
            // Brand new account: start clean with 0 sessions
            setCompletedSessions([]);
            localStorage.removeItem(STORAGE_KEYS.SESSIONS);
          }

          const { data: prs } = await supabase
            .from("personal_records")
            .select("*")
            .eq("user_id", authUser.id);
          if (prs && prs.length > 0) {
            setPersonalRecords(prs);
          } else {
            setPersonalRecords([]);
          }

          const { data: metrics } = await supabase
            .from("body_metrics")
            .select("*")
            .eq("user_id", authUser.id)
            .order("recorded_date", { ascending: false });
          if (metrics && metrics.length > 0) {
            setBodyMetrics(metrics);
          } else {
            setBodyMetrics([]);
          }

          const { data: meals } = await supabase
            .from("diet_logs")
            .select("*")
            .eq("user_id", authUser.id)
            .order("logged_at", { ascending: false });
          if (meals && meals.length > 0) {
            setLoggedMeals(meals);
          } else {
            setLoggedMeals([]);
          }

          // Squad activities are already fetched and ranked from /api/squad above.
          // Personal meals and sessions are loaded into loggedMeals and completedSessions for personal history.
        } catch (dbErr) {
          console.warn("Could not load cloud tables:", dbErr);
        }
      };

      // 1. Check existing user session on load (using getUser from @supabase/ssr)
      supabase.auth.getUser().then((res: any) => {
        const authUser = res?.data?.user;
        if (authUser) {
          hydrateAuthUser(authUser);
        } else {
          supabase.auth.getSession().then((sessionRes: any) => {
            const session = sessionRes?.data?.session;
            if (session?.user) {
              hydrateAuthUser(session.user);
            }
          });
        }
      });

      // 2. Listen for auth changes (sign in, initial session, sign out, callback)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
        if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED")) {
          hydrateAuthUser(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setIsDemoMode(false);
          setCompletedSessions([]);
          setPersonalRecords([]);
          setBodyMetrics([]);
          setGroups([]);
          setGroupMembers([]);
          setChallenges([]);
          setActivityFeed([]);
          setLoggedMeals([]);
          localStorage.removeItem(STORAGE_KEYS.USER);
          localStorage.setItem(STORAGE_KEYS.IS_DEMO, "false");
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (authErr) {
      console.warn("Supabase auth listener initialization error:", authErr);
    }
  }, [isSupabaseConfigured]);

  // Save active workout to localStorage on change
  useEffect(() => {
    try {
      if (activeWorkout) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(activeWorkout));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      }
    } catch (e) {
      console.warn("Could not persist active workout state:", e);
    }
  }, [activeWorkout]);

  // Rest timer countdown effect
  useEffect(() => {
    if (!activeWorkout || !activeWorkout.isTimerRunning) return;

    const interval = setInterval(() => {
      setActiveWorkout((prev) => {
        if (!prev || !prev.isTimerRunning) return prev;
        if (prev.timerSecondsRemaining <= 1) {
          // Play audio notification chime if supported
          try {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch A5 chime
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
          } catch {
            // AudioContext not allowed or not supported
          }

          return {
            ...prev,
            timerSecondsRemaining: 0,
            isTimerRunning: false,
          };
        }
        return {
          ...prev,
          timerSecondsRemaining: prev.timerSecondsRemaining - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout?.isTimerRunning]);

  // Live elapsed session duration ticker
  useEffect(() => {
    if (!activeWorkout) return;

    const interval = setInterval(() => {
      setActiveWorkout((prev) => {
        if (!prev) return null;
        const elapsed = Math.floor((Date.now() - prev.startTimeTimestamp) / 1000);
        return {
          ...prev,
          session: {
            ...prev.session,
            duration_seconds: Math.max(0, elapsed),
          },
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout?.startTimeTimestamp]);

  const toggleFavoriteExercise = useCallback((exerciseId: string) => {
    setFavoriteExerciseIds((prev) => {
      const next = prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId];
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(next));
      return next;
    });
  }, []);

  const addCustomExercise = useCallback((exerciseData: Omit<Exercise, "id" | "created_at">): Exercise => {
    const newEx: Exercise = {
      ...exerciseData,
      id: `custom-ex-${Date.now()}`,
      is_custom: true,
      created_at: new Date().toISOString(),
    };
    setExercises((prev) => {
      const updated = [newEx, ...prev];
      const customOnly = updated.filter((e) => e.is_custom);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(customOnly));
      return updated;
    });
    return newEx;
  }, []);

  const createWorkoutPlan = useCallback((planData: Omit<WorkoutPlan, "id" | "created_at" | "updated_at">): WorkoutPlan => {
    const newPlan: WorkoutPlan = {
      ...planData,
      id: `plan-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setWorkoutPlans((prev) => {
      const updated = [newPlan, ...prev];
      const customPlans = updated.filter((p) => !p.id.startsWith("template-"));
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(customPlans));
      return updated;
    });
    return newPlan;
  }, []);

  const updateWorkoutPlan = useCallback((id: string, updates: Partial<WorkoutPlan>) => {
    setWorkoutPlans((prev) => {
      const updated = prev.map((plan) =>
        plan.id === id ? { ...plan, ...updates, updated_at: new Date().toISOString() } : plan
      );
      const customPlans = updated.filter((p) => !p.id.startsWith("template-"));
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(customPlans));
      return updated;
    });
  }, []);

  const duplicateWorkoutPlan = useCallback((id: string): WorkoutPlan => {
    const original = workoutPlans.find((p) => p.id === id);
    if (!original) throw new Error("Plan not found");
    const duplicated: WorkoutPlan = {
      ...original,
      id: `plan-${Date.now()}`,
      title: `${original.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      exercises: original.exercises.map((e, idx) => ({
        ...e,
        id: `pe-${Date.now()}-${idx}`,
      })),
    };
    setWorkoutPlans((prev) => {
      const updated = [duplicated, ...prev];
      const customPlans = updated.filter((p) => !p.id.startsWith("template-"));
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(customPlans));
      return updated;
    });
    return duplicated;
  }, [workoutPlans]);

  const deleteWorkoutPlan = useCallback((id: string) => {
    setWorkoutPlans((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      const customPlans = updated.filter((p) => !p.id.startsWith("template-"));
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(customPlans));
      return updated;
    });
  }, []);

  // START ACTIVE WORKOUT
  const startWorkout = useCallback((plan?: WorkoutPlan | null, customName?: string) => {
    const now = Date.now();
    const sessionId = `sess-${now}`;
    const initialSets: WorkoutSetRecord[] = [];

    if (plan && plan.exercises.length > 0) {
      plan.exercises.forEach((item) => {
        const targetSetsCount = item.target_sets || 3;
        for (let i = 1; i <= targetSetsCount; i++) {
          initialSets.push({
            id: `set-${now}-${item.exercise_id}-${i}`,
            session_id: sessionId,
            exercise_id: item.exercise_id,
            set_number: i,
            set_type: "normal",
            weight_kg: item.target_weight_kg || 0,
            reps: parseInt(item.target_reps) || 10,
            is_completed: false,
            created_at: new Date().toISOString(),
          });
        }
      });
    }

    const newSession: WorkoutSession = {
      id: sessionId,
      user_id: user?.id || "user-marcus",
      plan_id: plan?.id,
      name: customName || (plan ? plan.title : "Freestyle Workout"),
      start_time: new Date().toISOString(),
      duration_seconds: 0,
      total_volume_kg: 0,
      status: "in_progress",
      sets: initialSets,
      created_at: new Date().toISOString(),
    };

    const newState: ActiveWorkoutState = {
      session: newSession,
      activeExerciseIndex: 0,
      timerSecondsRemaining: 0,
      isTimerRunning: false,
      timerTargetSeconds: 90,
      startTimeTimestamp: now,
    };

    setActiveWorkout(newState);
  }, [user]);

  // UPDATE SET VALUES
  const updateActiveSet = useCallback((
    exerciseIndex: number,
    setIndex: number,
    field: keyof WorkoutSetRecord,
    value: string | number | boolean | undefined
  ) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      // Find sets matching this exercise
      const exerciseIds = Array.from(new Set(prev.session.sets.map((s) => s.exercise_id)));
      const targetExerciseId = exerciseIds[exerciseIndex];
      if (!targetExerciseId) return prev;

      let updatedTargetSet: WorkoutSetRecord | undefined;
      let currentExerciseSetCount = -1;
      const updatedSets = prev.session.sets.map((s) => {
        if (s.exercise_id === targetExerciseId) {
          currentExerciseSetCount++;
          if (currentExerciseSetCount === setIndex) {
            const modified = {
              ...s,
              [field]: value,
            };
            updatedTargetSet = modified;
            return modified;
          }
        }
        return s;
      });

      const nextSession = {
        ...prev.session,
        sets: updatedSets,
      };

      // Queue into IndexedDB for reliable offline gym persistence
      if (updatedTargetSet) {
        queueOfflineSetChange(user?.id || "user-marcus", prev.session.id, "update_set", updatedTargetSet);
        saveActiveSessionBackup(user?.id || "user-marcus", nextSession);
      }

      return {
        ...prev,
        session: nextSession,
      };
    });
  }, [user]);

  const addSetToExercise = useCallback((exerciseIndex: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const exerciseIds = Array.from(new Set(prev.session.sets.map((s) => s.exercise_id)));
      const targetExerciseId = exerciseIds[exerciseIndex];
      if (!targetExerciseId) return prev;

      const exerciseSets = prev.session.sets.filter((s) => s.exercise_id === targetExerciseId);
      const lastSet = exerciseSets[exerciseSets.length - 1];

      const newSet: WorkoutSetRecord = {
        id: `set-${Date.now()}-${targetExerciseId}-${exerciseSets.length + 1}`,
        session_id: prev.session.id,
        exercise_id: targetExerciseId,
        set_number: exerciseSets.length + 1,
        set_type: "normal",
        weight_kg: lastSet ? lastSet.weight_kg : 0,
        reps: lastSet ? lastSet.reps : 10,
        is_completed: false,
        created_at: new Date().toISOString(),
      };

      // Insert right after last set of this exercise
      const lastGlobalIndex = prev.session.sets.map((s) => s.exercise_id).lastIndexOf(targetExerciseId);
      const newSets = [...prev.session.sets];
      newSets.splice(lastGlobalIndex + 1, 0, newSet);

      return {
        ...prev,
        session: {
          ...prev.session,
          sets: newSets,
        },
      };
    });
  }, []);

  const removeSetFromExercise = useCallback((exerciseIndex: number, setIndex: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const exerciseIds = Array.from(new Set(prev.session.sets.map((s) => s.exercise_id)));
      const targetExerciseId = exerciseIds[exerciseIndex];
      if (!targetExerciseId) return prev;

      let count = -1;
      const newSets = prev.session.sets.filter((s) => {
        if (s.exercise_id === targetExerciseId) {
          count++;
          return count !== setIndex;
        }
        return true;
      });

      return {
        ...prev,
        session: {
          ...prev.session,
          sets: newSets,
        },
      };
    });
  }, []);

  const addExerciseToActiveWorkout = useCallback((exercise: Exercise) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const newSet: WorkoutSetRecord = {
        id: `set-${Date.now()}-${exercise.id}-1`,
        session_id: prev.session.id,
        exercise_id: exercise.id,
        set_number: 1,
        set_type: "normal",
        weight_kg: 20,
        reps: 10,
        is_completed: false,
        created_at: new Date().toISOString(),
      };
      return {
        ...prev,
        session: {
          ...prev.session,
          sets: [...prev.session.sets, newSet],
        },
      };
    });
  }, []);

  const removeExerciseFromActiveWorkout = useCallback((exerciseIndex: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const exerciseIds = Array.from(new Set(prev.session.sets.map((s) => s.exercise_id)));
      const targetExerciseId = exerciseIds[exerciseIndex];
      if (!targetExerciseId) return prev;

      const newSets = prev.session.sets.filter((s) => s.exercise_id !== targetExerciseId);
      return {
        ...prev,
        session: {
          ...prev.session,
          sets: newSets,
        },
      };
    });
  }, []);

  // COMPLETE ACTIVE SET + AUTO-START REST TIMER
  const completeActiveSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const exerciseIds = Array.from(new Set(prev.session.sets.map((s) => s.exercise_id)));
      const targetExerciseId = exerciseIds[exerciseIndex];
      if (!targetExerciseId) return prev;

      let count = -1;
      let targetSetWeight = 0;
      let targetSetReps = 0;
      let wasAlreadyCompleted = false;

      let updatedTargetSet: WorkoutSetRecord | undefined;
      const updatedSets = prev.session.sets.map((s) => {
        if (s.exercise_id === targetExerciseId) {
          count++;
          if (count === setIndex) {
            wasAlreadyCompleted = s.is_completed;
            targetSetWeight = s.weight_kg;
            targetSetReps = s.reps;
            const modified = {
              ...s,
              is_completed: !s.is_completed,
            };
            updatedTargetSet = modified;
            return modified;
          }
        }
        return s;
      });

      // If we just completed the set (toggled from false to true), start rest timer
      const shouldStartTimer = !wasAlreadyCompleted;

      const nextSession = {
        ...prev.session,
        sets: updatedSets,
      };

      // Queue into IndexedDB for offline gym persistence
      if (updatedTargetSet) {
        queueOfflineSetChange(user?.id || "user-marcus", prev.session.id, "complete_set", updatedTargetSet);
        saveActiveSessionBackup(user?.id || "user-marcus", nextSession);
      }

      return {
        ...prev,
        session: nextSession,
        timerSecondsRemaining: shouldStartTimer ? prev.timerTargetSeconds : prev.timerSecondsRemaining,
        isTimerRunning: shouldStartTimer ? true : prev.isTimerRunning,
      };
    });
  }, [user]);

  // REST TIMER CONTROLS
  const startRestTimer = useCallback((seconds: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        timerTargetSeconds: seconds,
        timerSecondsRemaining: seconds,
        isTimerRunning: true,
      };
    });
  }, []);

  const pauseRestTimer = useCallback(() => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isTimerRunning: !prev.isTimerRunning,
      };
    });
  }, []);

  const adjustRestTimer = useCallback((secondsDelta: number) => {
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const nextRemaining = Math.max(0, prev.timerSecondsRemaining + secondsDelta);
      return {
        ...prev,
        timerSecondsRemaining: nextRemaining,
        isTimerRunning: nextRemaining > 0,
      };
    });
  }, []);

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    try {
      if (typeof window !== "undefined" && isSupabaseConfigured) {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        if (data?.session?.access_token) {
          headers["Authorization"] = `Bearer ${data.session.access_token}`;
          console.log("🔑 [FITNESS-STORE] Forwarding Supabase auth token to API for user:", data.session.user.id);
        }
      }
    } catch (e) {
      console.warn("Could not retrieve auth token:", e);
    }
    return headers;
  }, [isSupabaseConfigured]);

  // FINISH ACTIVE WORKOUT
  const finishActiveWorkout = useCallback((): WorkoutSession | null => {
    if (!activeWorkout) return null;

    const completedSets = activeWorkout.session.sets.filter((s) => s.is_completed);
    let totalVolume = 0;
    let newPRsCount = 0;

    // Detect Personal Records
    const updatedPRs = [...personalRecords];

    completedSets.forEach((set) => {
      const volume = (set.weight_kg || 0) * (set.reps || 0);
      totalVolume += volume;

      // Check PR: 1RM formula = weight * (1 + reps / 30)
      const est1RM = Math.round((set.weight_kg || 0) * (1 + (set.reps || 0) / 30));
      const existingPR = updatedPRs.find((p) => p.exercise_id === set.exercise_id);

      if (!existingPR || est1RM > existingPR.estimated_one_rep_max_kg) {
        newPRsCount++;
        set.is_pr = true;
        const exName = exercises.find((e) => e.id === set.exercise_id)?.name || "Exercise";
        if (existingPR) {
          existingPR.max_weight_kg = Math.max(existingPR.max_weight_kg, set.weight_kg);
          existingPR.max_reps = Math.max(existingPR.max_reps, set.reps);
          existingPR.estimated_one_rep_max_kg = est1RM;
          existingPR.date_achieved = new Date().toISOString().split("T")[0];
        } else {
          updatedPRs.push({
            exercise_id: set.exercise_id,
            exercise_name: exName,
            max_weight_kg: set.weight_kg,
            max_reps: set.reps,
            estimated_one_rep_max_kg: est1RM,
            date_achieved: new Date().toISOString().split("T")[0],
          });
        }
      }
    });

    const finishedSession: WorkoutSession = {
      ...activeWorkout.session,
      end_time: new Date().toISOString(),
      duration_seconds: Math.max(60, activeWorkout.session.duration_seconds),
      total_volume_kg: totalVolume,
      status: "completed",
      pr_count: newPRsCount,
    };

    setPersonalRecords(updatedPRs);
    localStorage.setItem(STORAGE_KEYS.PRS, JSON.stringify(updatedPRs));

    setCompletedSessions((prev) => {
      const updated = [finishedSession, ...prev];
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
      return updated;
    });

    // Queue session completion to IndexedDB for offline sync
    queueOfflineSessionCompletion(user?.id || "user-marcus", finishedSession);

    // Save to Supabase cloud database
    if (isSupabaseConfigured && user?.id && !isDemoMode) {
      try {
        const supabase = getSupabaseBrowserClient();
        supabase
          .from("workout_sessions")
          .insert({
            user_id: user.id,
            name: finishedSession.name,
            duration_seconds: finishedSession.duration_seconds,
            total_volume_kg: finishedSession.total_volume_kg,
            status: "completed",
            pr_count: newPRsCount,
            created_at: finishedSession.end_time || new Date().toISOString(),
          })
          .then(({ error }: any) => {
            if (error) console.warn("Supabase workout session insert warning:", error);
          });
      } catch (err) {
        console.warn("Could not insert workout to Supabase:", err);
      }
    }

    // Add activity feed item
    const feedItem: ActivityFeedItem = {
      id: `sess-${finishedSession.id}-${Date.now()}`,
      user_id: user?.id || "athlete-me",
      user_name: user?.full_name || "Athlete",
      user_avatar: user?.avatar_url,
      action_type: newPRsCount > 0 ? "pr_broken" : "workout_completed",
      workout_name: finishedSession.name,
      volume_kg: totalVolume,
      pr_detail: newPRsCount > 0 ? `Broke ${newPRsCount} personal records! 🔥` : undefined,
      cheers_count: 0,
      has_cheered: false,
      is_real: true,
      timestamp: "Just now",
      created_at: finishedSession.end_time || new Date().toISOString(),
    };
    // Only publish to squad activity feed if user is part of a squad!
    if (groups.length > 0) {
      setActivityFeed((prev) => {
        const updated = deduplicateActivityFeed([feedItem, ...prev]);
        localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify(updated));
        return updated;
      });

      // Sync activity to squad stream in background
      if (user?.id) {
        console.log("💪 [STORE:WORKOUT] Syncing workout to squad:", feedItem.workout_name, feedItem.volume_kg, "kg for squads:", groups.map(g => g.invite_code));
        getAuthHeaders().then((headers) => {
          fetch("/api/squad", {
            method: "POST",
            headers,
            body: JSON.stringify({
              action: "log_activity",
              userId: user.id,
              groupId: groups[0]?.id,
              inviteCode: groups[0]?.invite_code,
              activity: feedItem,
              volume: totalVolume,
              workouts_increment: 1,
            }),
          })
            .then((r) => r.json())
            .then((d) => console.log("💪 [STORE:WORKOUT] Workout sync response:", d))
            .catch((err) => console.warn("💪 [STORE:WORKOUT] Workout sync error:", err));
        });
      }
    }

    // Clear active workout
    setActiveWorkout(null);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);

    return finishedSession;
  }, [activeWorkout, exercises, personalRecords, user, groups, getAuthHeaders]);

  const cancelActiveWorkout = useCallback(() => {
    setActiveWorkout(null);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);
  }, []);

  // BODY METRICS
  const addBodyMetric = useCallback((entryData: Omit<BodyMetricEntry, "id" | "user_id" | "created_at">) => {
    const newEntry: BodyMetricEntry = {
      ...entryData,
      id: `bm-${Date.now()}`,
      user_id: user?.id || "user-marcus",
      created_at: new Date().toISOString(),
    };
    setBodyMetrics((prev) => {
      const updated = [newEntry, ...prev].sort((a, b) => b.recorded_date.localeCompare(a.recorded_date));
      localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(updated));
      return updated;
    });
  }, [user]);

  const deleteBodyMetric = useCallback((id: string) => {
    setBodyMetrics((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // PROFILE & PRIVACY
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updatePrivacySettings = useCallback((updates: Partial<UserPrivacySettings>) => {
    setPrivacySettings((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEYS.PRIVACY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleDemoMode = useCallback((enable: boolean) => {
    setIsDemoMode(enable);
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, enable ? "true" : "false");
    if (enable && !user) {
      setUser(DEMO_CURRENT_USER);
    }
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) {
      window.location.href = "/login";
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/api/auth/callback`,
        scopes: "email profile openid",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  }, [isSupabaseConfigured]);

  const clearToBlankState = useCallback(async () => {
    setIsDemoMode(false);
    setUser({
      id: `local-user-${Date.now()}`,
      email: "athlete@fitforge.app",
      full_name: "Athlete",
      fitness_goal: "hypertrophy",
      experience_level: "intermediate",
      weight_unit: "kg",
      target_days_per_week: 4,
      created_at: new Date().toISOString(),
    });
    setCompletedSessions([]);
    setPersonalRecords([]);
    setBodyMetrics([]);
    setGroups([]);
    setGroupMembers([]);
    setChallenges([]);
    setActivityFeed([]);
    setLoggedMeals([]);
    setActiveWorkout(null);

    if (typeof window !== "undefined") {
      Object.values(STORAGE_KEYS).forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });
      try {
        localStorage.removeItem("fitforge_guest_uid");
        localStorage.removeItem("fitforge_guest_name");
        localStorage.setItem(STORAGE_KEYS.IS_DEMO, "false");
      } catch {}

      if (user?.id) {
        clearUserOfflineData(user.id);
      }
    }

    try {
      await fetch("/api/squad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });
      console.log("🧹 [STORE:CLEAR] Test user data and squad persistence cleared successfully.");
    } catch (e) {
      console.warn("Could not clear server squad data:", e);
    }
  }, [user?.id]);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Supabase sign out error:", e);
      }
    }
    // Clean up local IndexedDB cache for user to prevent cross-account leaks on shared device
    if (user?.id) {
      clearUserOfflineData(user.id);
    }
    setUser(null);
    setIsDemoMode(false);
    setCompletedSessions([]);
    setPersonalRecords([]);
    setBodyMetrics([]);
    setLoggedMeals([]);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.LOGGED_MEALS);
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, "false");
  }, [isSupabaseConfigured, user?.id]);

  // SOCIAL & SQUAD SYNC
  const refreshSquadData = useCallback(async (customUserId?: string, customGroupId?: string) => {
    const targetUserId = customUserId || user?.id;
    if (!targetUserId) return;

    try {
      const q = new URLSearchParams({ userId: targetUserId });
      if (customGroupId) q.set("groupId", customGroupId);

      const authHeaders = await getAuthHeaders();
      console.log("⚡ [STORE:REFRESH] Polling /api/squad for userId:", targetUserId, "groupId:", customGroupId);

      const res = await fetch(`/api/squad?${q.toString()}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        console.log("⚡ [STORE:REFRESH] Poll response. inSquad:", data.inSquad, "squads:", data.squads?.length, "members:", data.members?.length, "activities:", data.activities?.length);
        if (data.success) {
          if (!data.inSquad || !data.squads || data.squads.length === 0) {
            console.log("⚡ [STORE:REFRESH] User is not in any squad. Clearing social state for privacy.");
            setGroups([]);
            setGroupMembers([]);
            setChallenges([]);
            setActivityFeed([]);
            localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify([]));
            localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify([]));
            localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify([]));
            localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify([]));
          } else {
            console.log("⚡ [STORE:REFRESH] Updating live squad members:", data.members?.map((m: any) => m.user_profile?.full_name), "activities count:", data.activities?.length);
            setGroups(data.squads);
            setGroupMembers(data.members || []);
            setActivityFeed((prev) => {
              const serverActivities: ActivityFeedItem[] = data.activities || [];

              // Retain genuinely un-synced local activities (where server does not have a matching ID AND does not have a matching content signature)
              const localUnsynced = prev.filter((p) => {
                if (!p.is_real) return false;
                if (serverActivities.some((s) => s.id === p.id)) return false;

                const pTime = p.created_at ? new Date(p.created_at).getTime() : 0;
                const pFood = p.food_name?.toLowerCase().trim();
                const pWorkout = p.workout_name?.toLowerCase().trim();

                const matchedInServer = serverActivities.some((s) => {
                  if (s.user_id === p.user_id && s.action_type === p.action_type) {
                    const sTime = s.created_at ? new Date(s.created_at).getTime() : 0;
                    const timeDiff = Math.abs(pTime - sTime);

                    if (p.action_type === "meal_logged") {
                      const sFood = s.food_name?.toLowerCase().trim();
                      const namesMatch = Boolean(
                        (pFood && sFood && pFood === sFood) ||
                        (p.tamil_name && s.tamil_name && p.tamil_name.trim() === s.tamil_name.trim())
                      );
                      if (namesMatch) {
                        if (!pTime || !sTime || isNaN(timeDiff) || timeDiff < 10 * 60 * 1000) return true;
                        if (p.meal_type && s.meal_type && p.meal_type === s.meal_type && timeDiff < 45 * 60 * 1000) return true;
                      }
                    }

                    if (p.action_type === "workout_completed" || p.action_type === "pr_broken") {
                      const sWorkout = s.workout_name?.toLowerCase().trim();
                      if (pWorkout && sWorkout && pWorkout === sWorkout && timeDiff < 15 * 60 * 1000) {
                        return true;
                      }
                    }
                  }
                  return false;
                });

                return !matchedInServer;
              });

              const combined = deduplicateActivityFeed([...localUnsynced, ...serverActivities]);
              localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify(combined));
              return combined;
            });
            localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(data.squads));
            localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data.members || []));
          }
        }
      }
    } catch (e) {
      console.warn("⚡ [STORE:REFRESH] Could not refresh squad data:", e);
    }
  }, [user?.id, getAuthHeaders]);

  const createGroup = useCallback(async (name: string, description: string): Promise<FriendGroup | null> => {
    const liveVolume = completedSessions.reduce((acc, s) => acc + (s.total_volume_kg || 0), 0);
    const currentUserId =
      user?.id ||
      (typeof window !== "undefined" ? localStorage.getItem("fitforge_guest_uid") : null) ||
      "user-current";
    const currentUserName = user?.full_name || (typeof window !== "undefined" ? localStorage.getItem("fitforge_guest_name") : null) || "Athlete";

    const newGroupId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `00000000-0000-4000-8000-${Date.now().toString().slice(-12).padStart(12, "0")}`;

    console.log("⚡ [STORE:CREATE] createGroup called. Name:", name, "User:", currentUserId, currentUserName);

    const recentActivities = completedSessions.slice(0, 3).map((s) => ({
      id: `sess-${s.id}-${Date.now()}`,
      user_id: currentUserId,
      user_name: currentUserName,
      user_avatar: user?.avatar_url,
      action_type: (s.pr_count && s.pr_count > 0 ? "pr_broken" : "workout_completed") as any,
      workout_name: s.name,
      volume_kg: Math.round(Number(s.total_volume_kg) || 0),
      pr_detail: s.pr_count && s.pr_count > 0 ? `Broke ${s.pr_count} personal records! 🔥` : undefined,
      timestamp: "Recent workout",
      created_at: s.created_at || s.start_time || new Date().toISOString(),
      cheers_count: 0,
      has_cheered: false,
      is_real: true,
    }));

    try {
      const authHeaders = await getAuthHeaders();
      console.log("⚡ [STORE:CREATE] Sending POST /api/squad with action: create...");

      const res = await fetch("/api/squad", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          action: "create",
          userId: currentUserId,
          name: name.trim(),
          description: description.trim(),
          groupId: newGroupId,
          initialVolume: liveVolume,
          initialWorkoutsCount: completedSessions.length || 1,
          recentActivities,
          userProfile: {
            full_name: currentUserName,
            avatar_url: user?.avatar_url,
            email: user?.email || "",
          },
        }),
      });

      const d = await res.json();
      console.log("⚡ [STORE:CREATE] Server response:", d);

      if (d.success && d.squad) {
        const createdSquad: FriendGroup = d.squad;

        setGroups((prev) => {
          const updated = [createdSquad, ...prev.filter((g) => g.id !== createdSquad.id && g.id !== newGroupId)];
          localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(updated));
          return updated;
        });

        if (d.members) {
          setGroupMembers(d.members);
          localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(d.members));
        }

        if (d.activities) {
          const deduped = deduplicateActivityFeed(d.activities);
          setActivityFeed(deduped);
          localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify(deduped));
        }

        const newChallenge: GroupChallenge = {
          id: `ch-${createdSquad.id}`,
          group_id: createdSquad.id,
          title: "Squad 50,000kg Volume Milestone",
          description: "Work together to hit 50,000kg lifted across all squad members.",
          challenge_type: "total_volume",
          target_value: 50000,
          unit: "kg",
          start_date: new Date().toISOString().split("T")[0],
          end_date: "2026-11-30",
          user_progress: liveVolume,
          created_at: new Date().toISOString(),
        };

        setChallenges((prev) => {
          const updated = [newChallenge, ...prev.filter((c) => c.group_id !== createdSquad.id)];
          localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(updated));
          return updated;
        });

        return createdSquad;
      } else {
        throw new Error(d.error || "Failed to create squad on server");
      }
    } catch (err: any) {
      console.warn("⚡ [STORE:CREATE] Network or server error, using fallback:", err?.message);
      const fallbackCode = `FORGE-${Math.floor(100 + Math.random() * 900)}`;
      const fallbackGroup: FriendGroup = {
        id: newGroupId,
        name: name.trim(),
        description: description.trim() || "Private training squad.",
        invite_code: fallbackCode,
        created_by: currentUserId,
        members_count: 1,
        is_user_admin: true,
        created_at: new Date().toISOString(),
      };

      setGroups((prev) => {
        const updated = [fallbackGroup, ...prev.filter((g) => g.id !== fallbackGroup.id)];
        localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(updated));
        return updated;
      });

      const founderMember: GroupMember = {
        id: `mem-${newGroupId}-${currentUserId}`,
        group_id: fallbackGroup.id,
        user_id: currentUserId,
        role: "admin",
        user_profile: {
          full_name: currentUserName,
          avatar_url: user?.avatar_url,
          email: user?.email || "",
        },
        weekly_workouts_count: completedSessions.length || 1,
        weekly_volume_kg: liveVolume,
        streak_weeks: 1,
        joined_at: new Date().toISOString(),
      };

      setGroupMembers((prev) => {
        const updated = [founderMember, ...prev.filter((m) => m.group_id !== fallbackGroup.id)];
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
        return updated;
      });

      return fallbackGroup;
    }
  }, [user, completedSessions, getAuthHeaders]);

  const joinGroupByCode = useCallback(async (code: string): Promise<boolean> => {
    const formatted = code.trim().toUpperCase();
    console.log("⚡ [STORE:JOIN] joinGroupByCode invoked with code:", formatted, "User:", user?.id, user?.full_name);

    if (!formatted) {
      console.warn("⚡ [STORE:JOIN] Empty code provided!");
      return false;
    }

    const liveVolume = completedSessions.reduce((acc, s) => acc + (s.total_volume_kg || 0), 0);
    console.log("⚡ [STORE:JOIN] User live volume:", liveVolume, "completed sessions:", completedSessions.length);

    const recentActivities = completedSessions.slice(0, 3).map((s) => ({
      id: `sess-${s.id}-${Date.now()}`,
      user_id: user?.id || "user-current",
      user_name: user?.full_name || "Athlete",
      user_avatar: user?.avatar_url,
      action_type: (s.pr_count && s.pr_count > 0 ? "pr_broken" : "workout_completed") as any,
      workout_name: s.name,
      volume_kg: Math.round(Number(s.total_volume_kg) || 0),
      pr_detail: s.pr_count && s.pr_count > 0 ? `Broke ${s.pr_count} personal records! 🔥` : undefined,
      timestamp: "Recent workout",
      created_at: s.created_at || s.start_time || new Date().toISOString(),
      cheers_count: 0,
      has_cheered: false,
      is_real: true,
    }));

    try {
      const authHeaders = await getAuthHeaders();
      console.log("⚡ [STORE:JOIN] Sending POST /api/squad with auth headers present:", Boolean(authHeaders["Authorization"]));

      const res = await fetch("/api/squad", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          action: "join",
          userId: user?.id || "user-current",
          inviteCode: formatted,
          initialVolume: liveVolume,
          initialWorkoutsCount: completedSessions.length,
          recentActivities,
          userProfile: {
            full_name: user?.full_name || "Athlete",
            avatar_url: user?.avatar_url,
            email: user?.email || "",
          },
        }),
      });

      console.log("⚡ [STORE:JOIN] HTTP response status:", res.status);
      const data = await res.json();
      console.log("⚡ [STORE:JOIN] API returned data:", data);

      if (data.success && data.squad) {
        console.log(
          "⚡ [STORE:JOIN] SUCCESS! Joined squad:", data.squad.name,
          "Squad ID:", data.squad.id,
          "Total members returned:", data.members?.length,
          data.members?.map((m: any) => m.user_profile?.full_name),
          "Total activities returned:", data.activities?.length
        );

        // Update groups state
        setGroups((prev) => {
          const updated = [data.squad, ...prev.filter((g) => g.id !== data.squad.id)];
          localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(updated));
          return updated;
        });

        // Update members state (contains both User A and User B!)
        if (data.members) {
          setGroupMembers(data.members);
          localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data.members));
        }

        // Update activities feed (contains both User A and User B activities!)
        if (data.activities) {
          const deduped = deduplicateActivityFeed(data.activities);
          setActivityFeed(deduped);
          localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify(deduped));
        }

        const squadChallenge: GroupChallenge = {
          id: `ch-${data.squad.id}`,
          group_id: data.squad.id,
          title: "Squad 40,000kg Weekly Volume Blitz",
          description: "Collectively crush 40,000kg of lifting volume before Sunday midnight.",
          challenge_type: "total_volume",
          target_value: 40000,
          unit: "kg",
          start_date: new Date().toISOString().split("T")[0],
          end_date: "2026-10-31",
          user_progress: liveVolume,
          created_at: new Date().toISOString(),
        };

        setChallenges((prev) => {
          const updated = [squadChallenge, ...prev.filter((c) => c.group_id !== data.squad.id)];
          localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(updated));
          return updated;
        });

        return true;
      } else {
        console.warn("⚡ [STORE:JOIN] Join squad rejected by API:", data.error);
        alert(data.error || `Squad code "${formatted}" not found. Verify the code with your squad founder.`);
        return false;
      }
    } catch (err) {
      console.error("⚡ [STORE:JOIN] Critical Network/Fetch error during join:", err);
      alert(`Could not connect to join squad "${formatted}". Please check your connection.`);
      return false;
    }
  }, [groups, user, completedSessions, getAuthHeaders]);

  const leaveGroup = useCallback((groupId: string) => {
    setGroups((prev) => {
      const updated = prev.filter((g) => g.id !== groupId);
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(updated));
      return updated;
    });
    setGroupMembers((prev) => {
      const updated = prev.filter((m) => m.group_id !== groupId);
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(updated));
      return updated;
    });
    setChallenges((prev) => {
      const updated = prev.filter((c) => c.group_id !== groupId);
      localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(updated));
      return updated;
    });

    // If no groups remain, clear activity feed too!
    const remainingGroups = groups.filter((g) => g.id !== groupId);
    if (remainingGroups.length === 0) {
      setActivityFeed([]);
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify([]));
    }

    if (user?.id) {
      fetch("/api/squad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "leave",
          userId: user.id,
          groupId,
        }),
      }).catch((e) => console.warn("Squad leave sync error:", e));
    }
  }, [groups, user?.id]);

  const cheerActivity = useCallback((activityId: string) => {
    setActivityFeed((prev) => {
      const updated = prev.map((item) => {
        if (item.id !== activityId) return item;
        const wasCheered = Boolean(item.has_cheered);
        const newCount = wasCheered
          ? Math.max(0, (item.cheers_count || 1) - 1)
          : (item.cheers_count || 0) + 1;
        return {
          ...item,
          has_cheered: !wasCheered,
          cheers_count: newCount,
        };
      });
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // NUTRITION & DIET HANDLERS
  const addMealEntry = useCallback(
    (mealType: MealType, foodItem: FoodItem, servings: number, dateStr?: string) => {
      const s = Math.max(0.1, servings);
      let loggedAt = new Date().toISOString();
      if (dateStr) {
        const todayStr = new Date().toISOString().split("T")[0];
        if (dateStr !== todayStr) {
          loggedAt = new Date(`${dateStr}T12:00:00.000Z`).toISOString();
        }
      }

      const newEntry: LoggedMealEntry = {
        id: `meal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        meal_type: mealType,
        food_id: foodItem.id,
        food_name: foodItem.name,
        tamil_name: foodItem.tamil_name,
        servings: s,
        serving_unit: foodItem.serving_unit,
        calories: Math.round(foodItem.calories * s),
        protein_g: Number((foodItem.protein_g * s).toFixed(1)),
        carbs_g: Number((foodItem.carbs_g * s).toFixed(1)),
        fiber_g: Number((foodItem.fiber_g * s).toFixed(1)),
        healthy_fat_g: Number((foodItem.healthy_fat_g * s).toFixed(1)),
        bad_nutrients: {
          saturated_fat_g: Number((foodItem.bad_nutrients.saturated_fat_g * s).toFixed(1)),
          trans_fat_g: Number((foodItem.bad_nutrients.trans_fat_g * s).toFixed(2)),
          sodium_mg: Math.round(foodItem.bad_nutrients.sodium_mg * s),
          added_sugar_g: Number((foodItem.bad_nutrients.added_sugar_g * s).toFixed(1)),
          cholesterol_mg: Math.round(foodItem.bad_nutrients.cholesterol_mg * s),
        },
        micronutrients: {
          vitamin_a_mcg: Math.round(foodItem.micronutrients.vitamin_a_mcg * s),
          vitamin_c_mg: Math.round(foodItem.micronutrients.vitamin_c_mg * s),
          vitamin_d_iu: Math.round(foodItem.micronutrients.vitamin_d_iu * s),
          vitamin_b12_mcg: Number((foodItem.micronutrients.vitamin_b12_mcg * s).toFixed(1)),
          iron_mg: Number((foodItem.micronutrients.iron_mg * s).toFixed(1)),
          calcium_mg: Math.round(foodItem.micronutrients.calcium_mg * s),
          potassium_mg: Math.round(foodItem.micronutrients.potassium_mg * s),
          zinc_mg: Number((foodItem.micronutrients.zinc_mg * s).toFixed(1)),
        },
        logged_at: loggedAt,
      };

      setLoggedMeals((prev) => {
        const updated = [newEntry, ...prev];
        localStorage.setItem(STORAGE_KEYS.LOGGED_MEALS, JSON.stringify(updated));
        return updated;
      });

      // Save to Supabase cloud database
      if (isSupabaseConfigured && user?.id && !isDemoMode) {
        try {
          const supabase = getSupabaseBrowserClient();
          supabase
            .from("diet_logs")
            .insert({
              user_id: user.id,
              meal_type: newEntry.meal_type,
              food_name: newEntry.food_name,
              tamil_name: newEntry.tamil_name || null,
              servings: newEntry.servings,
              serving_unit: newEntry.serving_unit,
              calories: newEntry.calories,
              protein_g: newEntry.protein_g,
              carbs_g: newEntry.carbs_g,
              healthy_fat_g: newEntry.healthy_fat_g,
              logged_at: newEntry.logged_at,
            })
            .then(({ error }: any) => {
              if (error) console.warn("Supabase diet log insert warning:", error);
            });
        } catch (err) {
          console.warn("Could not insert meal to Supabase:", err);
        }
      }

      // Automatically publish to friends activity feed with motivational badges and macros
      const totalProtein = Number((foodItem.protein_g * s).toFixed(1));
      const totalCalories = Math.round(foodItem.calories * s);
      let motivationBadge = `🥗 Clean Fuel • ${totalCalories} kcal`;
      if (totalProtein >= 35) {
        motivationBadge = `🍗 ${totalProtein}g High-Protein Muscle Fuel 🔥`;
      } else if (totalProtein >= 20) {
        motivationBadge = `💪 ${totalProtein}g Lean Protein Power`;
      } else if (
        foodItem.tamil_name &&
        (foodItem.category === "lentils_sundal" || foodItem.category === "fitness_staples")
      ) {
        motivationBadge = `🌿 Tamil Nadu Traditional Superfood • Plant Power`;
      } else if (mealType === "post_workout") {
        motivationBadge = `⚡ Anabolic Post-Workout Recovery Window`;
      }

      const mealFeedItem: ActivityFeedItem = {
        id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        user_id: user?.id || "user-current",
        user_name: user?.full_name || "Athlete",
        user_avatar: user?.avatar_url,
        action_type: "meal_logged",
        meal_type: mealType,
        food_name: foodItem.name,
        tamil_name: foodItem.tamil_name,
        servings: s,
        serving_unit: foodItem.serving_unit,
        calories: totalCalories,
        protein_g: totalProtein,
        carbs_g: Number((foodItem.carbs_g * s).toFixed(1)),
        fat_g: Number((foodItem.healthy_fat_g * s).toFixed(1)),
        motivation_badge: motivationBadge,
        cheers_count: 0,
        has_cheered: false,
        is_real: true,
        timestamp: "Just now",
        created_at: loggedAt,
      };

      // Only publish to squad activity feed if user is part of a squad!
      if (groups.length > 0) {
        setActivityFeed((prev) => {
          const updated = deduplicateActivityFeed([mealFeedItem, ...prev]);
          localStorage.setItem(STORAGE_KEYS.ACTIVITY_FEED, JSON.stringify(updated));
          return updated;
        });

        // Sync meal activity to squad stream in background
        if (user?.id) {
          console.log("🥗 [STORE:MEAL] Syncing meal to squad:", mealFeedItem.food_name, mealFeedItem.calories, "kcal for squads:", groups.map(g => g.invite_code));
          getAuthHeaders().then((headers) => {
            fetch("/api/squad", {
              method: "POST",
              headers,
              body: JSON.stringify({
                action: "log_activity",
                userId: user.id,
                groupId: groups[0]?.id,
                inviteCode: groups[0]?.invite_code,
                activity: mealFeedItem,
              }),
            })
              .then((r) => r.json())
              .then((d) => console.log("🥗 [STORE:MEAL] Meal sync response:", d))
              .catch((err) => console.warn("🥗 [STORE:MEAL] Meal sync error:", err));
          });
        }
      }
    },
    [user, groups, getAuthHeaders]
  );

  const updateMealEntryServings = useCallback((id: string, newServings: number) => {
    if (newServings <= 0) {
      setLoggedMeals((prev) => {
        const updated = prev.filter((m) => m.id !== id);
        localStorage.setItem(STORAGE_KEYS.LOGGED_MEALS, JSON.stringify(updated));
        return updated;
      });
      return;
    }

    setLoggedMeals((prev) => {
      const target = prev.find((m) => m.id === id);
      if (!target) return prev;
      const ratio = newServings / target.servings;
      const updated = prev.map((m) => {
        if (m.id !== id) return m;
        return {
          ...m,
          servings: newServings,
          calories: Math.round(m.calories * ratio),
          protein_g: Number((m.protein_g * ratio).toFixed(1)),
          carbs_g: Number((m.carbs_g * ratio).toFixed(1)),
          fiber_g: Number((m.fiber_g * ratio).toFixed(1)),
          healthy_fat_g: Number((m.healthy_fat_g * ratio).toFixed(1)),
          bad_nutrients: {
            saturated_fat_g: Number((m.bad_nutrients.saturated_fat_g * ratio).toFixed(1)),
            trans_fat_g: Number((m.bad_nutrients.trans_fat_g * ratio).toFixed(2)),
            sodium_mg: Math.round(m.bad_nutrients.sodium_mg * ratio),
            added_sugar_g: Number((m.bad_nutrients.added_sugar_g * ratio).toFixed(1)),
            cholesterol_mg: Math.round(m.bad_nutrients.cholesterol_mg * ratio),
          },
          micronutrients: {
            vitamin_a_mcg: Math.round(m.micronutrients.vitamin_a_mcg * ratio),
            vitamin_c_mg: Math.round(m.micronutrients.vitamin_c_mg * ratio),
            vitamin_d_iu: Math.round(m.micronutrients.vitamin_d_iu * ratio),
            vitamin_b12_mcg: Number((m.micronutrients.vitamin_b12_mcg * ratio).toFixed(1)),
            iron_mg: Number((m.micronutrients.iron_mg * ratio).toFixed(1)),
            calcium_mg: Math.round(m.micronutrients.calcium_mg * ratio),
            potassium_mg: Math.round(m.micronutrients.potassium_mg * ratio),
            zinc_mg: Number((m.micronutrients.zinc_mg * ratio).toFixed(1)),
          },
        };
      });
      localStorage.setItem(STORAGE_KEYS.LOGGED_MEALS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeMealEntry = useCallback((id: string) => {
    setLoggedMeals((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      localStorage.setItem(STORAGE_KEYS.LOGGED_MEALS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addCustomFood = useCallback((newFoodData: Omit<FoodItem, "id" | "is_custom">) => {
    const newFood: FoodItem = {
      ...newFoodData,
      id: `custom-food-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      is_custom: true,
    };
    setCustomFoods((prev) => {
      const updated = [newFood, ...prev];
      localStorage.setItem(STORAGE_KEYS.CUSTOM_FOODS, JSON.stringify(updated));
      return updated;
    });
    return newFood;
  }, []);

  const deleteCustomFood = useCallback((id: string) => {
    setCustomFoods((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_FOODS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateNutritionTargets = useCallback((targets: Partial<NutritionDailyTargets>) => {
    setNutritionTargets((prev) => {
      const updated = { ...prev, ...targets };
      localStorage.setItem(STORAGE_KEYS.NUTRITION_TARGETS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearTodayMeals = useCallback((dateStr?: string) => {
    setLoggedMeals((prev) => {
      let updated: LoggedMealEntry[];
      if (dateStr) {
        updated = prev.filter((m) => !m.logged_at.startsWith(dateStr));
      } else {
        updated = [];
      }
      localStorage.setItem(STORAGE_KEYS.LOGGED_MEALS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <FitnessContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isDemoMode,
        isSupabaseConfigured,
        privacySettings,
        updateProfile,
        updatePrivacySettings,
        toggleDemoMode,
        signInWithGoogle,
        clearToBlankState,
        logout,

        exercises,
        favoriteExerciseIds,
        toggleFavoriteExercise,
        addCustomExercise,

        workoutPlans,
        createWorkoutPlan,
        updateWorkoutPlan,
        duplicateWorkoutPlan,
        deleteWorkoutPlan,

        activeWorkout,
        startWorkout,
        updateActiveSet,
        addSetToExercise,
        removeSetFromExercise,
        addExerciseToActiveWorkout,
        removeExerciseFromActiveWorkout,
        completeActiveSet,
        startRestTimer,
        pauseRestTimer,
        adjustRestTimer,
        finishActiveWorkout,
        cancelActiveWorkout,
        hasUnsavedActiveWorkout: Boolean(activeWorkout),

        completedSessions,
        bodyMetrics,
        addBodyMetric,
        deleteBodyMetric,
        personalRecords,

        groups,
        groupMembers,
        challenges,
        activityFeed,
        createGroup,
        joinGroupByCode,
        leaveGroup,
        cheerActivity,
        refreshSquadData,

        // Nutrition & Diet
        foodDatabase,
        customFoods,
        addCustomFood,
        deleteCustomFood,
        loggedMeals,
        nutritionTargets,
        addMealEntry,
        updateMealEntryServings,
        removeMealEntry,
        updateNutritionTargets,
        clearTodayMeals,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error("useFitness must be used within a FitnessProvider");
  }
  return context;
};
