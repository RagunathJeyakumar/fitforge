"use client";

import React from "react";
import { Star, ChevronRight, Dumbbell, ShieldAlert } from "lucide-react";
import { Exercise } from "@/lib/types";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: Exercise;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onClick: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  isFavorite,
  onToggleFavorite,
  onClick,
}) => {
  const difficultyColors = {
    Beginner: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    Advanced: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-charcoal-900 border border-white/5 hover:border-lime-electric/40 transition-all duration-200 cursor-pointer hover:shadow-lime-sm"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className="font-bold text-white text-base group-hover:text-lime-electric transition-colors">
            {exercise.name}
          </h4>
          <button
            onClick={onToggleFavorite}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
            title={isFavorite ? "Remove favorite" : "Add to favorites"}
          >
            <Star
              className={cn(
                "h-4 w-4",
                isFavorite
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground"
              )}
            />
          </button>
        </div>

        {/* Primary Muscle & Equipment Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {exercise.primary_muscles.map((muscle) => (
            <Badge key={muscle} variant="default" className="text-[11px]">
              {muscle}
            </Badge>
          ))}
          <Badge variant="secondary" className="text-[11px]">
            {exercise.equipment}
          </Badge>
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
              difficultyColors[exercise.difficulty]
            )}
          >
            {exercise.difficulty}
          </span>
        </div>

        {/* Brief preview of form instruction */}
        <p className="text-xs text-muted-foreground line-clamp-2">
          {exercise.instructions[0] || "Target compound exercise for strength and hypertrophy."}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground group-hover:text-white">
        <span className="font-medium text-[11px] text-lime-electric/90">
          {exercise.movement_type} Movement
        </span>
        <span className="flex items-center gap-1 text-[11px]">
          View Guide
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </div>
  );
};
