"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
} from "../types";
import { INITIAL_EXERCISES } from "../data/initialExercises";
import { DEFAULT_WORKOUT_TEMPLATES } from "../data/defaultTemplates";
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
  IS_DEMO: "fitforge_demo_mode_v2",
  PRIVACY: "fitforge_privacy_v2",
  GROUPS: "fitforge_groups_v2",
  MEMBERS: "fitforge_group_members_v2",
  CHALLENGES: "fitforge_challenges_v2",
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

      const savedPlans = localStorage.getItem(STORAGE_KEYS.PLANS);
      if (savedPlans) {
        const parsed = JSON.parse(savedPlans);
        setWorkoutPlans([...DEFAULT_WORKOUT_TEMPLATES, ...parsed]);
      }

      const savedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (savedSessions) {
        setCompletedSessions(JSON.parse(savedSessions));
      }

      const savedMetrics = localStorage.getItem(STORAGE_KEYS.METRICS);
      if (savedMetrics) {
        setBodyMetrics(JSON.parse(savedMetrics));
      }

      const savedActiveWorkout = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT);
      if (savedActiveWorkout) {
        setActiveWorkout(JSON.parse(savedActiveWorkout));
      }

      const savedPrivacy = localStorage.getItem(STORAGE_KEYS.PRIVACY);
      if (savedPrivacy) {
        setPrivacySettings(JSON.parse(savedPrivacy));
      }

      const savedGroups = localStorage.getItem(STORAGE_KEYS.GROUPS);
      if (savedGroups) {
        setGroups(JSON.parse(savedGroups));
      }
    } catch (e) {
      console.warn("Could not read local storage state:", e);
    }
  }, []);

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

      let currentExerciseSetCount = -1;
      const updatedSets = prev.session.sets.map((s) => {
        if (s.exercise_id === targetExerciseId) {
          currentExerciseSetCount++;
          if (currentExerciseSetCount === setIndex) {
            return {
              ...s,
              [field]: value,
            };
          }
        }
        return s;
      });

      return {
        ...prev,
        session: {
          ...prev.session,
          sets: updatedSets,
        },
      };
    });
  }, []);

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

      const updatedSets = prev.session.sets.map((s) => {
        if (s.exercise_id === targetExerciseId) {
          count++;
          if (count === setIndex) {
            wasAlreadyCompleted = s.is_completed;
            targetSetWeight = s.weight_kg;
            targetSetReps = s.reps;
            return {
              ...s,
              is_completed: !s.is_completed,
            };
          }
        }
        return s;
      });

      // If we just completed the set (toggled from false to true), start rest timer
      const shouldStartTimer = !wasAlreadyCompleted;

      return {
        ...prev,
        session: {
          ...prev.session,
          sets: updatedSets,
        },
        timerSecondsRemaining: shouldStartTimer ? prev.timerTargetSeconds : prev.timerSecondsRemaining,
        isTimerRunning: shouldStartTimer ? true : prev.isTimerRunning,
      };
    });
  }, []);

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

    setCompletedSessions((prev) => {
      const updated = [finishedSession, ...prev];
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
      return updated;
    });

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

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Supabase sign out error:", e);
      }
    }
    setUser(null);
    setIsDemoMode(false);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, "false");
  }, [isSupabaseConfigured]);

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
