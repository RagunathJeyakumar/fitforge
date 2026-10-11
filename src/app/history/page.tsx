"use client";

import React, { useState } from "react";
import {
  History,
  Calendar,
  Clock,
  Dumbbell,
  Trophy,
  ChevronDown,
  ChevronUp,
  Play,
  Share2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFitness } from "@/lib/store/fitnessStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";

export default function HistoryPage() {
  const { completedSessions, exercises, startWorkout, workoutPlans } = useFitness();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    completedSessions[0]?.id || null
  );

  const toggleExpand = (id: string) => {
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="text-xs">
              Training Archive
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Workout History Log
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review detailed logs, set-by-set performances, volumes, and Personal Records.
          </p>
        </div>

        {completedSessions.length === 0 ? (
          <div className="p-12 rounded-2xl bg-charcoal-900 border border-white/5 text-center space-y-3">
            <History className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-bold text-white">No workouts recorded yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Start your first session from the Routines page to begin building your training history.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedSessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              const completedSets = session.sets.filter((s) => s.is_completed);
              const uniqueExercises = Array.from(
                new Set(session.sets.map((s) => s.exercise_id))
              );

              return (
                <Card
                  key={session.id}
                  className="border-white/5 bg-charcoal-900/90 overflow-hidden transition-all duration-200 hover:border-white/10"
                >
                  {/* Session Header Card */}
                  <div
                    onClick={() => toggleExpand(session.id)}
                    className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base sm:text-lg font-black text-white">
                          {session.name}
                        </h3>
                        {session.pr_count ? (
                          <Badge variant="gold" className="text-[10px]">
                            {session.pr_count} PR{session.pr_count > 1 ? "s" : ""}
                          </Badge>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(session.start_time).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuration(session.duration_seconds)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-mono font-black text-lime-electric">
                          {session.total_volume_kg.toLocaleString()} kg
                        </span>
                        <p className="text-[10px] text-muted-foreground">
                          {completedSets.length} sets completed
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const matched = workoutPlans.find((p) => p.id === session.plan_id);
                            startWorkout(matched, session.name);
                          }}
                          className="text-xs h-8 px-3"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Repeat
                        </Button>
                        <button className="p-1 rounded text-muted-foreground hover:text-white">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Set Details */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 pt-0 border-t border-white/5 space-y-4 bg-charcoal-950/40">
                      {session.notes && (
                        <div className="p-3 rounded-xl bg-charcoal-900 border border-white/5 text-xs text-muted-foreground italic">
                          &quot;{session.notes}&quot;
                        </div>
                      )}

                      <div className="space-y-4">
                        {uniqueExercises.map((exId) => {
                          const exObj = exercises.find((e) => e.id === exId);
                          const exSets = session.sets.filter((s) => s.exercise_id === exId);

                          return (
                            <div
                              key={exId}
                              className="p-3.5 rounded-xl bg-charcoal-900 border border-white/5 space-y-2"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-white">
                                  {exObj?.name || "Exercise"}
                                </span>
                                <span className="text-muted-foreground">
                                  {exObj?.equipment}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                                {exSets.map((st, sIdx) => (
                                  <div
                                    key={st.id || sIdx}
                                    className={`p-2 rounded-lg border font-mono flex items-center justify-between ${
                                      st.is_pr
                                        ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                        : "bg-charcoal-950/60 border-white/5 text-foreground"
                                    }`}
                                  >
                                    <span className="text-muted-foreground text-[10px]">
                                      Set {sIdx + 1}:
                                    </span>
                                    <span className="font-bold">
                                      {st.weight_kg}kg × {st.reps}
                                    </span>
                                    {st.is_pr && <Trophy className="h-3 w-3 text-amber-400" />}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
