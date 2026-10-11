"use client";

import React from "react";
import { X, Star, Trophy, Plus, Dumbbell, ShieldCheck, RefreshCw } from "lucide-react";
import { Exercise } from "@/lib/types";
import { useFitness } from "@/lib/store/fitnessStore";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
  onSelectAlternative?: (altName: string) => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose,
  onSelectAlternative,
}) => {
  const {
    favoriteExerciseIds,
    toggleFavoriteExercise,
    personalRecords,
    activeWorkout,
    addExerciseToActiveWorkout,
  } = useFitness();

  if (!exercise) return null;

  const isFavorite = favoriteExerciseIds.includes(exercise.id);
  const pr = personalRecords.find((p) => p.exercise_id === exercise.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-charcoal-900 border border-white/10 shadow-2xl overflow-hidden">
        {/* Header with image/media or dark stylized hero */}
        <div className="relative p-6 bg-gradient-to-b from-charcoal-800 to-charcoal-900 border-b border-white/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="text-xs">
                  {exercise.movement_type}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {exercise.equipment}
                </Badge>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-charcoal-700 text-muted-foreground">
                  {exercise.difficulty}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {exercise.name}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFavoriteExercise(exercise.id)}
                className="p-2 rounded-xl bg-charcoal-800/80 hover:bg-charcoal-700 text-muted-foreground hover:text-amber-400 border border-white/5 transition-colors"
                title="Favorite"
              >
                <Star className={`h-5 w-5 ${isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-charcoal-800/80 hover:bg-charcoal-700 text-muted-foreground hover:text-white border border-white/5 transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* PR Showcase if available */}
          {pr && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Personal Best Record
                  </p>
                  <p className="text-base font-black text-white">
                    {pr.max_weight_kg} kg × {pr.max_reps} reps
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Est. 1RM</span>
                <p className="text-sm font-black text-amber-300 font-mono">
                  {pr.estimated_one_rep_max_kg} kg
                </p>
              </div>
            </div>
          )}

          {/* Muscle Anatomy Targets */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Muscle Groups Targeted
            </h4>
            <div className="flex flex-wrap gap-2">
              {exercise.primary_muscles.map((muscle) => (
                <div
                  key={muscle}
                  className="px-3 py-1.5 rounded-xl bg-lime-electric/15 border border-lime-electric/30 text-lime-electric text-xs font-bold flex items-center gap-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-lime-electric" />
                  Primary: {muscle}
                </div>
              ))}
              {exercise.secondary_muscles.map((muscle) => (
                <div
                  key={muscle}
                  className="px-3 py-1.5 rounded-xl bg-charcoal-800 border border-white/10 text-muted-foreground text-xs font-medium"
                >
                  Secondary: {muscle}
                </div>
              ))}
            </div>
          </div>

          {/* Form Instructions / Coaching Cues */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-lime-electric" />
              Step-by-Step Execution Guide
            </h4>
            <div className="space-y-2.5">
              {exercise.instructions.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-charcoal-950/60 border border-white/5"
                >
                  <span className="h-5 w-5 rounded-full bg-charcoal-800 text-lime-electric text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Exercise Alternatives */}
          {exercise.alternatives && exercise.alternatives.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <RefreshCw className="h-4 w-4 text-sky-400" />
                Exercise Alternatives & Swaps
              </h4>
              <div className="flex flex-wrap gap-2">
                {exercise.alternatives.map((alt) => (
                  <button
                    key={alt}
                    onClick={() => onSelectAlternative && onSelectAlternative(alt)}
                    className="px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 border border-white/10 text-xs font-semibold text-white transition-colors"
                  >
                    {alt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-charcoal-950 border-t border-white/5 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onClose} className="text-xs">
            Close
          </Button>

          {activeWorkout && (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                addExerciseToActiveWorkout(exercise);
                onClose();
              }}
              className="text-xs font-bold shadow-lime-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add to Active Session
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
