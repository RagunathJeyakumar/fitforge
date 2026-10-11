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
import {
  DEMO_CURRENT_USER,
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
  clearToBlankState: () => void;
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
  createGroup: (name: string, description: string) => FriendGroup;
  joinGroupByCode: (code: string) => boolean;

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
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(DEMO_CURRENT_USER);
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
  const [groups, setGroups] = useState<FriendGroup[]>([DEMO_GROUP]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>(DEMO_MEMBERS);
  const [challenges, setChallenges] = useState<GroupChallenge[]>(DEMO_CHALLENGES);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>(DEMO_ACTIVITY_FEED);

  // Nutrition & Diet State
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [loggedMeals, setLoggedMeals] = useState<LoggedMealEntry[]>(getInitialDemoMeals);
  const [nutritionTargets, setNutritionTargets] = useState<NutritionDailyTargets>(DEFAULT_NUTRITION_TARGETS);

  const foodDatabase = useMemo(() => {
    return [...customFoods, ...TAMIL_NADU_FOODS];
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

        const savedGroups = localStorage.getItem(STORAGE_KEYS.GROUPS);
        if (savedGroups) {
          setGroups(JSON.parse(savedGroups));
        } else {
          setGroups([]);
          setGroupMembers([]);
          setChallenges([]);
          setActivityFeed([]);
        }
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

        const savedGroups = localStorage.getItem(STORAGE_KEYS.GROUPS);
        if (savedGroups) {
          setGroups(JSON.parse(savedGroups));
        }
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
        } catch (dbErr) {
          console.warn("Could not load cloud tables:", dbErr);
        }
      };

      // 1. Check existing session on load
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          hydrateAuthUser(session.user);
        }
      });

      // 2. Listen for auth changes (sign in, sign out, callback)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          hydrateAuthUser(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setIsDemoMode(false);
          setCompletedSessions([]);
          setPersonalRecords([]);
          setBodyMetrics([]);
          setGroups([]);
          setLoggedMeals([]);
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

    // Add activity feed item
    const feedItem: ActivityFeedItem = {
      id: `act-${Date.now()}`,
      user_id: user?.id || "user-marcus",
      user_name: user?.full_name || "Marcus Vance",
      user_avatar: user?.avatar_url,
      action_type: newPRsCount > 0 ? "pr_broken" : "workout_completed",
      workout_name: finishedSession.name,
      volume_kg: totalVolume,
      pr_detail: newPRsCount > 0 ? `Broke ${newPRsCount} personal records! 🔥` : undefined,
      timestamp: "Just now",
    };
    setActivityFeed((prev) => [feedItem, ...prev]);

    // Clear active workout
    setActiveWorkout(null);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT);

    return finishedSession;
  }, [activeWorkout, exercises, personalRecords, user]);

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
      },
    });
  }, [isSupabaseConfigured]);

  const clearToBlankState = useCallback(() => {
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
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, "false");
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.LOGGED_MEALS);
    localStorage.removeItem(STORAGE_KEYS.METRICS);
    localStorage.removeItem(STORAGE_KEYS.PRS);
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(STORAGE_KEYS.GROUPS);
  }, []);

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

  // SOCIAL & GROUPS
  const createGroup = useCallback((name: string, description: string): FriendGroup => {
    const code = `FORGE-${Math.floor(100 + Math.random() * 900)}`;
    const newGroup: FriendGroup = {
      id: `grp-${Date.now()}`,
      name,
      description,
      invite_code: code,
      created_by: user?.id || "user-marcus",
      members_count: 1,
      is_user_admin: true,
      created_at: new Date().toISOString(),
    };
    setGroups((prev) => {
      const updated = [newGroup, ...prev];
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(updated));
      return updated;
    });
    return newGroup;
  }, [user]);

  const joinGroupByCode = useCallback((code: string): boolean => {
    const formatted = code.trim().toUpperCase();
    const existing = groups.find((g) => g.invite_code.toUpperCase() === formatted);
    if (existing) {
      return true;
    }
    // Simulate finding a squad by code
    const joinedGroup: FriendGroup = {
      id: `grp-${Date.now()}`,
      name: "Dawn Patrol Lifters",
      description: "Early morning lifting crew dedicated to strength and accountability.",
      invite_code: formatted,
      created_by: "user-elena",
      members_count: 3,
      is_user_admin: false,
      created_at: new Date().toISOString(),
    };
    setGroups((prev) => [joinedGroup, ...prev]);
    return true;
  }, [groups]);

  // NUTRITION & DIET HANDLERS
  const addMealEntry = useCallback(
    (mealType: MealType, foodItem: FoodItem, servings: number, dateStr?: string) => {
      const s = Math.max(0.1, servings);
      let loggedAt = new Date().toISOString();
      if (dateStr) {
        const now = new Date();
        const timePart = now.toTimeString().split(" ")[0];
        loggedAt = `${dateStr}T${timePart}Z`;
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
    },
    []
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
