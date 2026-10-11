"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Dumbbell,
  Clock,
  Save,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFitness } from "@/lib/store/fitnessStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlanExerciseItem, Exercise } from "@/lib/types";

export default function NewWorkoutRoutinePage() {
  const router = useRouter();
  const { exercises, createWorkoutPlan } = useFitness();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [splitType, setSplitType] = useState<"Push/Pull/Legs" | "Upper/Lower" | "Full Body" | "Arnold" | "Custom">("Custom");
  const [routineExercises, setRoutineExercises] = useState<PlanExerciseItem[]>([]);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddExercise = (exercise: Exercise) => {
    const newItem: PlanExerciseItem = {
      id: `pe-${Date.now()}-${routineExercises.length}`,
      exercise_id: exercise.id,
      day_name: "Day 1",
      order_index: routineExercises.length,
      target_sets: 3,
      target_reps: "8-12",
      target_weight_kg: 50,
      rest_seconds: 90,
    };
    setRoutineExercises([...routineExercises, newItem]);
    setShowAddDrawer(false);
  };

  const handleRemoveExercise = (index: number) => {
    setRoutineExercises(routineExercises.filter((_, idx) => idx !== index));
  };

  const handleMoveExercise = (index: number, direction: "up" | "down") => {
    const newItems = [...routineExercises];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setRoutineExercises(newItems);
  };

  const handleUpdateItem = (index: number, field: keyof PlanExerciseItem, value: any) => {
    const updated = [...routineExercises];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setRoutineExercises(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please provide a title for your routine.");
      return;
    }

    createWorkoutPlan({
      user_id: "user-marcus",
      title: title.trim(),
      description: description.trim(),
      split_type: splitType,
      days_count: 1,
      is_public: false,
      exercises: routineExercises,
    });

    router.push("/workouts");
  };

  const filteredLibrary = exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.primary_muscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center gap-3">
          <Link href="/workouts">
            <Button variant="ghost" size="iconSm" className="rounded-xl">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">Create New Routine</h1>
            <p className="text-xs text-muted-foreground">
              Define your exercises, rep ranges, target weights, and rest intervals.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Metadata Card */}
          <Card className="p-6 border-white/5 bg-charcoal-900 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Routine Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Heavy Upper Body Strength"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-4 py-3 text-white text-base font-bold focus:outline-none focus:border-lime-electric placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Split Type
                </label>
                <select
                  value={splitType}
                  onChange={(e) => setSplitType(e.target.value as any)}
                  className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-electric"
                >
                  <option value="Push/Pull/Legs">Push / Pull / Legs</option>
                  <option value="Upper/Lower">Upper / Lower</option>
                  <option value="Full Body">Full Body</option>
                  <option value="Arnold">Arnold Split</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Description / Focus
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chest hypertrophy + heavy barbell rows"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-electric placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
          </Card>

          {/* Exercises Roster */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Exercise Roster ({routineExercises.length})
              </h3>
              <Button
                type="button"
                variant="subtle"
                size="sm"
                onClick={() => setShowAddDrawer(true)}
                className="text-xs font-bold"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Exercise
              </Button>
            </div>

            {routineExercises.length === 0 ? (
              <div className="p-8 rounded-2xl bg-charcoal-900/60 border border-dashed border-white/10 text-center space-y-2">
                <Dumbbell className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  No exercises added yet. Click &quot;Add Exercise&quot; to configure your routine.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {routineExercises.map((item, idx) => {
                  const exerciseObj = exercises.find((e) => e.id === item.exercise_id);

                  return (
                    <Card
                      key={item.id || idx}
                      className="p-4 border-white/5 bg-charcoal-900/90 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded bg-charcoal-800 text-lime-electric text-xs font-mono font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h4 className="font-bold text-white text-sm sm:text-base">
                            {exerciseObj?.name || "Exercise"}
                          </h4>
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            • {exerciseObj?.equipment}
                          </span>
                        </div>

                        {/* Reorder and remove buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveExercise(idx, "up")}
                            className="p-1 rounded text-muted-foreground hover:text-white disabled:opacity-30"
                            title="Move Up"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === routineExercises.length - 1}
                            onClick={() => handleMoveExercise(idx, "down")}
                            className="p-1 rounded text-muted-foreground hover:text-white disabled:opacity-30"
                            title="Move Down"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(idx)}
                            className="p-1 rounded text-muted-foreground hover:text-rose-400"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Target sets, reps, weight, rest configuration */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5 text-xs">
                        <div>
                          <label className="text-muted-foreground block text-[10px] uppercase font-bold mb-0.5">
                            Target Sets
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={item.target_sets}
                            onChange={(e) =>
                              handleUpdateItem(idx, "target_sets", parseInt(e.target.value) || 1)
                            }
                            className="w-full bg-charcoal-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-muted-foreground block text-[10px] uppercase font-bold mb-0.5">
                            Target Reps
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 8-10"
                            value={item.target_reps}
                            onChange={(e) =>
                              handleUpdateItem(idx, "target_reps", e.target.value)
                            }
                            className="w-full bg-charcoal-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-muted-foreground block text-[10px] uppercase font-bold mb-0.5">
                            Target kg
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={item.target_weight_kg || 0}
                            onChange={(e) =>
                              handleUpdateItem(idx, "target_weight_kg", parseFloat(e.target.value) || 0)
                            }
                            className="w-full bg-charcoal-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-muted-foreground block text-[10px] uppercase font-bold mb-0.5">
                            Rest (sec)
                          </label>
                          <select
                            value={item.rest_seconds}
                            onChange={(e) =>
                              handleUpdateItem(idx, "rest_seconds", parseInt(e.target.value) || 90)
                            }
                            className="w-full bg-charcoal-950 border border-white/10 rounded-lg px-2 py-1.5 text-white font-mono"
                          >
                            <option value="45">45s</option>
                            <option value="60">60s</option>
                            <option value="90">90s</option>
                            <option value="120">120s (2m)</option>
                            <option value="180">180s (3m)</option>
                          </select>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link href="/workouts">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="px-8 font-black shadow-lime-md"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Routine
            </Button>
          </div>
        </form>

        {/* Exercise Selection Drawer */}
        {showAddDrawer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl bg-charcoal-900 border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-black text-white">Select Exercise</h3>
                <button
                  onClick={() => setShowAddDrawer(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 border-b border-white/5">
                <input
                  type="text"
                  placeholder="Search exercise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-electric"
                />
              </div>

              <div className="p-4 space-y-2 overflow-y-auto flex-1">
                {filteredLibrary.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => handleAddExercise(ex)}
                    className="p-3.5 rounded-xl bg-charcoal-950/70 hover:bg-charcoal-800 border border-white/5 hover:border-lime-electric/30 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-lime-electric transition-colors">
                        {ex.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {ex.primary_muscles.join(", ")} • {ex.equipment}
                      </p>
                    </div>
                    <Plus className="h-5 w-5 text-muted-foreground group-hover:text-lime-electric transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
