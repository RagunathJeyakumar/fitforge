"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Play,
  CheckCircle2,
  Plus,
  Trash2,
  Clock,
  Dumbbell,
  Sparkles,
  Award,
  ChevronLeft,
  X,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFitness } from "@/lib/store/fitnessStore";
import { ActiveSetRow } from "@/components/workout/ActiveSetRow";
import { RestTimerWidget } from "@/components/workout/RestTimerWidget";
import { WorkoutSummaryModal } from "@/components/workout/WorkoutSummaryModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { Exercise, WorkoutSession } from "@/lib/types";

export default function ActiveWorkoutPage() {
  const {
    activeWorkout,
    startWorkout,
    updateActiveSet,
    addSetToExercise,
    removeSetFromExercise,
    addExerciseToActiveWorkout,
    removeExerciseFromActiveWorkout,
    completeActiveSet,
    finishActiveWorkout,
    cancelActiveWorkout,
    workoutPlans,
    exercises,
    personalRecords,
  } = useFitness();

  const [finishedSummarySession, setFinishedSummarySession] = useState<WorkoutSession | null>(null);
  const [showAddExerciseDrawer, setShowAddExerciseDrawer] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // If no workout is active, show the quick-start selector
  if (!activeWorkout) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
          <div className="p-8 rounded-3xl bg-charcoal-900 border border-white/5 text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-lime-electric/15 border border-lime-electric/40 flex items-center justify-center mx-auto text-lime-electric shadow-lime-sm">
              <Dumbbell className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                No Workout Active
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Ready to train? Pick an organized routine from your training plan or start an empty freestyle session.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="default"
                size="lg"
                onClick={() => startWorkout(null, "Freestyle Strength")}
                className="w-full sm:w-auto h-12 px-6 font-black shadow-lime-md"
              >
                <Plus className="h-5 w-5 mr-2" />
                Start Empty Freestyle Session
              </Button>
              <Link href="/workouts" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full h-12 px-6">
                  Browse All Routines
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick-Pick Routines */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Select a Routine to Begin
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {workoutPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => startWorkout(plan)}
                  className="p-5 rounded-2xl bg-charcoal-900 border border-white/5 hover:border-lime-electric/50 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div>
                    <Badge variant="default" className="text-[10px] mb-1">
                      {plan.split_type}
                    </Badge>
                    <h4 className="font-bold text-white text-base group-hover:text-lime-electric transition-colors">
                      {plan.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {plan.exercises.length} exercises configured
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="group-hover:bg-lime-electric group-hover:text-charcoal-950 transition-colors"
                  >
                    <Play className="h-5 w-5 fill-current" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {finishedSummarySession && (
          <WorkoutSummaryModal
            session={finishedSummarySession}
            onClose={() => setFinishedSummarySession(null)}
          />
        )}
      </AppShell>
    );
  }

  // Active workout is in progress!
  const { session } = activeWorkout;
  const uniqueExerciseIds = Array.from(new Set(session.sets.map((s) => s.exercise_id)));
  const totalSets = session.sets.length;
  const completedSetsCount = session.sets.filter((s) => s.is_completed).length;
  const progressPercent = totalSets > 0 ? Math.round((completedSetsCount / totalSets) * 100) : 0;

  // Live volume calculation
  const liveTotalVolume = session.sets
    .filter((s) => s.is_completed)
    .reduce((acc, s) => acc + (s.weight_kg || 0) * (s.reps || 0), 0);

  const handleFinish = () => {
    const finished = finishActiveWorkout();
    if (finished) {
      setFinishedSummarySession(finished);
    }
  };

  const filteredExercisesToAdd = exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      e.primary_muscles.some((m) => m.toLowerCase().includes(exerciseSearch.toLowerCase()))
  );

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Top Active Bar: Workout Name, Live Elapsed Time, Finish CTA */}
        <div className="sticky top-14 z-20 -mx-4 px-4 py-3 bg-charcoal-950/95 backdrop-blur-xl border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-lime-electric/15 border border-lime-electric/30 flex items-center justify-center text-lime-electric">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white truncate">
                  {session.name}
                </h1>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-electric opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-electric"></span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                <span>Duration: <strong className="text-white">{formatDuration(session.duration_seconds)}</strong></span>
                <span>•</span>
                <span>Volume: <strong className="text-lime-electric">{liveTotalVolume.toLocaleString()} kg</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelConfirm(true)}
              className="text-xs text-rose-400 border-rose-500/20 hover:bg-rose-500/10"
            >
              Discard
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleFinish}
              className="font-black text-xs sm:text-sm px-4 h-10 shadow-lime-sm"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Finish Workout
            </Button>
          </div>
        </div>

        {/* Workout Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Session Progress</span>
            <span className="text-lime-electric font-mono font-bold">
              {completedSetsCount} / {totalSets} Sets Completed ({progressPercent}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-charcoal-900 overflow-hidden border border-white/5">
            <div
              className="h-full bg-lime-electric transition-all duration-300 rounded-full shadow-lime-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Live Rest Timer Widget */}
        <RestTimerWidget />

        {/* Exercises List */}
        <div className="space-y-6">
          {uniqueExerciseIds.map((exId, exIndex) => {
            const exerciseObj = exercises.find((e) => e.id === exId);
            const exerciseSets = session.sets.filter((s) => s.exercise_id === exId);
            const pr = personalRecords.find((p) => p.exercise_id === exId);

            return (
              <Card
                key={exId}
                className="p-4 sm:p-6 border-white/5 bg-charcoal-900/90 shadow-xl overflow-hidden"
              >
                {/* Exercise Header */}
                <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-white/5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {exerciseObj?.name || "Exercise"}
                      </h3>
                      {pr && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          PR: {pr.max_weight_kg}kg
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{exerciseObj?.equipment}</span>
                      <span>•</span>
                      <span>{exerciseObj?.primary_muscles.join(", ")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeExerciseFromActiveWorkout(exIndex)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove exercise from session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Column Headers for One-Handed Ergonomics */}
                <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  <span className="w-8 text-center">Set</span>
                  <span className="hidden md:block w-20">Previous</span>
                  <span className="flex-1 text-center">kg</span>
                  <span className="flex-1 text-center">Reps</span>
                  <span className="hidden sm:block w-14 text-center">RPE</span>
                  <span className="w-10 sm:w-11 text-center">Done</span>
                  <span className="w-6" />
                </div>

                {/* Set Rows */}
                <div className="space-y-2 mt-1">
                  {exerciseSets.map((set, setIdx) => (
                    <ActiveSetRow
                      key={set.id}
                      set={set}
                      setIndex={setIdx}
                      exerciseIndex={exIndex}
                      onUpdate={(field, value) =>
                        updateActiveSet(exIndex, setIdx, field, value)
                      }
                      onComplete={() => completeActiveSet(exIndex, setIdx)}
                      onRemove={() => removeSetFromExercise(exIndex, setIdx)}
                    />
                  ))}
                </div>

                {/* Add Set Button */}
                <div className="mt-4 pt-2 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addSetToExercise(exIndex)}
                    className="text-xs font-bold text-lime-electric hover:bg-lime-electric/10"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Set
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Add Exercise CTA */}
        <div className="text-center pt-2">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowAddExerciseDrawer(true)}
            className="w-full sm:w-auto h-12 px-6 border-lime-electric/30 text-lime-electric hover:bg-lime-electric/10 font-bold"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Exercise to Workout
          </Button>
        </div>

        {/* Add Exercise Modal / Drawer */}
        {showAddExerciseDrawer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl bg-charcoal-900 border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-black text-white">
                  Add Exercise to Session
                </h3>
                <button
                  onClick={() => setShowAddExerciseDrawer(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 border-b border-white/5">
                <input
                  type="text"
                  placeholder="Search by exercise name or muscle..."
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-electric placeholder:text-muted-foreground"
                />
              </div>

              <div className="p-4 space-y-2 overflow-y-auto flex-1">
                {filteredExercisesToAdd.map((exercise) => (
                  <div
                    key={exercise.id}
                    onClick={() => {
                      addExerciseToActiveWorkout(exercise);
                      setShowAddExerciseDrawer(false);
                    }}
                    className="p-3.5 rounded-xl bg-charcoal-950/70 hover:bg-charcoal-800 border border-white/5 hover:border-lime-electric/30 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-lime-electric transition-colors">
                        {exercise.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {exercise.primary_muscles.join(", ")} • {exercise.equipment}
                      </p>
                    </div>
                    <Plus className="h-5 w-5 text-muted-foreground group-hover:text-lime-electric transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Discard Workout Confirmation */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-charcoal-900 border border-rose-500/30 p-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  Discard Active Session?
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Are you sure you want to cancel? This workout session data will not be saved.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1"
                >
                  Continue Lifting
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    cancelActiveWorkout();
                    setShowCancelConfirm(false);
                  }}
                  className="flex-1"
                >
                  Discard
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Workout Finish Summary Modal */}
        {finishedSummarySession && (
          <WorkoutSummaryModal
            session={finishedSummarySession}
            onClose={() => setFinishedSummarySession(null)}
          />
        )}
      </div>
    </AppShell>
  );
}
