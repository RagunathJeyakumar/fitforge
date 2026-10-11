"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Dumbbell,
  Plus,
  Play,
  Copy,
  Trash2,
  Edit,
  Clock,
  Sparkles,
  Flame,
  Layers,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFitness } from "@/lib/store/fitnessStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WorkoutsPage() {
  const {
    workoutPlans,
    startWorkout,
    duplicateWorkoutPlan,
    deleteWorkoutPlan,
    exercises,
  } = useFitness();

  const [activeFilter, setActiveFilter] = useState<string>("All");

  const splitCategories = ["All", "Push/Pull/Legs", "Upper/Lower", "Full Body", "Custom"];

  const filteredPlans = activeFilter === "All"
    ? workoutPlans
    : workoutPlans.filter((p) => p.split_type === activeFilter);

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default" className="text-xs">
                Training Programs
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Workout Routines & Splits
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Organize your training cycles, configure target sets, reps, weights, and rest intervals.
            </p>
          </div>

          <Link href="/workouts/new">
            <Button variant="default" size="lg" className="h-12 font-black shadow-lime-sm">
              <Plus className="h-5 w-5 mr-2" />
              Create Custom Routine
            </Button>
          </Link>
        </div>

        {/* Category Split Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {splitCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                activeFilter === cat
                  ? "bg-lime-electric text-charcoal-950 border-lime-electric shadow-lime-sm"
                  : "bg-charcoal-900 text-muted-foreground border-white/5 hover:border-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Routines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredPlans.map((plan) => {
            const isTemplate = plan.id.startsWith("template-");

            return (
              <Card
                key={plan.id}
                className="p-6 border-white/5 bg-charcoal-900/90 flex flex-col justify-between group hover:border-lime-electric/40 transition-all hover:shadow-lime-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {plan.split_type}
                        </Badge>
                        {isTemplate && (
                          <Badge variant="cyan" className="text-[10px]">
                            Curated Split
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-white group-hover:text-lime-electric transition-colors">
                        {plan.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => duplicateWorkoutPlan(plan.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-charcoal-800 transition-colors"
                        title="Duplicate routine"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      {!isTemplate && (
                        <button
                          onClick={() => deleteWorkoutPlan(plan.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete routine"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                    {plan.description || "Structured workout routine ready for training."}
                  </p>

                  {/* Exercise Chips Preview */}
                  <div className="space-y-1.5 mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Exercise Roster ({plan.exercises.length})
                    </span>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {plan.exercises.map((item, idx) => {
                        const ex = exercises.find((e) => e.id === item.exercise_id);
                        return (
                          <div
                            key={item.id || idx}
                            className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-charcoal-950/60 border border-white/5"
                          >
                            <span className="font-semibold text-white truncate max-w-[180px]">
                              {ex?.name || "Exercise"}
                            </span>
                            <span className="text-muted-foreground font-mono text-[11px]">
                              {item.target_sets} sets × {item.target_reps}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                    <Clock className="h-3.5 w-3.5" />
                    ~45-60 min
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => startWorkout(plan)}
                      className="font-bold text-xs shadow-lime-sm px-4"
                    >
                      <Play className="h-3.5 w-3.5 mr-1.5 fill-charcoal-950" />
                      Start Session
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
