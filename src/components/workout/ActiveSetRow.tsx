"use client";

import React from "react";
import { Check, Trash2, Award, Cloud, HardDrive } from "lucide-react";
import { WorkoutSetRecord, SetType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { usePwa } from "@/lib/pwa/PwaProvider";

interface ActiveSetRowProps {
  set: WorkoutSetRecord;
  setIndex: number;
  exerciseIndex: number;
  previousBest?: string;
  onUpdate: (field: keyof WorkoutSetRecord, value: string | number | boolean | undefined) => void;
  onComplete: () => void;
  onRemove: () => void;
}

export const ActiveSetRow: React.FC<ActiveSetRowProps> = ({
  set,
  setIndex,
  onUpdate,
  onComplete,
  onRemove,
}) => {
  const { isOnline } = usePwa();
  const isCompleted = set.is_completed;

  const handleWeightChange = (delta: number) => {
    const current = Number(set.weight_kg) || 0;
    const next = Math.max(0, current + delta);
    onUpdate("weight_kg", next);
  };

  const handleRepsChange = (delta: number) => {
    const current = Number(set.reps) || 0;
    const next = Math.max(0, current + delta);
    onUpdate("reps", next);
  };

  const setTypeLabels: Record<SetType, string> = {
    normal: "N",
    warmup: "W",
    dropset: "D",
    failure: "F",
  };

  const cycleSetType = () => {
    const types: SetType[] = ["normal", "warmup", "dropset", "failure"];
    const currentIdx = types.indexOf(set.set_type);
    const nextType = types[(currentIdx + 1) % types.length];
    onUpdate("set_type", nextType);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl transition-all duration-200 border",
        isCompleted
          ? "bg-lime-electric/10 border-lime-electric/40 text-white"
          : "bg-charcoal-900/80 border-white/5 hover:border-white/10"
      )}
    >
      {/* Set Number & Type Cycle Button */}
      <button
        onClick={cycleSetType}
        title={`Set ${setIndex + 1} (${set.set_type}). Click to change type`}
        className={cn(
          "h-8 w-8 rounded-lg flex flex-col items-center justify-center text-xs font-bold font-mono transition-transform active:scale-95",
          set.set_type === "warmup" && "bg-amber-500/20 text-amber-400 border border-amber-500/30",
          set.set_type === "dropset" && "bg-purple-500/20 text-purple-400 border border-purple-500/30",
          set.set_type === "failure" && "bg-rose-500/20 text-rose-400 border border-rose-500/30",
          set.set_type === "normal" && "bg-charcoal-800 text-muted-foreground hover:text-white"
        )}
      >
        <span>{setIndex + 1}</span>
        {set.set_type !== "normal" && (
          <span className="text-[9px] -mt-1 leading-none font-extrabold uppercase">
            {setTypeLabels[set.set_type]}
          </span>
        )}
      </button>

      {/* Previous Performance or Target Indicator */}
      <div className="hidden md:flex flex-col w-20 text-[11px] text-muted-foreground truncate">
        {set.previous_weight_kg ? (
          <span>{set.previous_weight_kg}kg × {set.previous_reps}</span>
        ) : (
          <span className="text-muted-foreground/60">—</span>
        )}
      </div>

      {/* Weight Controls */}
      <div className="flex-1 min-w-[90px] flex items-center justify-center gap-1 bg-charcoal-950/60 rounded-lg p-1 border border-white/5">
        <button
          onClick={() => handleWeightChange(-2.5)}
          className="h-7 w-6 rounded bg-charcoal-800 hover:bg-charcoal-700 text-muted-foreground hover:text-white text-xs font-bold"
          title="-2.5 kg"
        >
          -
        </button>
        <div className="flex-1 flex items-center justify-center">
          <input
            type="number"
            step="0.5"
            value={set.weight_kg === 0 ? "" : set.weight_kg}
            placeholder="0"
            onChange={(e) => onUpdate("weight_kg", parseFloat(e.target.value) || 0)}
            className="w-full text-center bg-transparent text-sm sm:text-base font-bold text-white focus:outline-none font-mono"
          />
          <span className="text-[10px] text-muted-foreground font-semibold mr-1">kg</span>
        </div>
        <button
          onClick={() => handleWeightChange(2.5)}
          className="h-7 w-6 rounded bg-charcoal-800 hover:bg-charcoal-700 text-muted-foreground hover:text-white text-xs font-bold"
          title="+2.5 kg"
        >
          +
        </button>
      </div>

      {/* Reps Controls */}
      <div className="flex-1 min-w-[80px] flex items-center justify-center gap-1 bg-charcoal-950/60 rounded-lg p-1 border border-white/5">
        <button
          onClick={() => handleRepsChange(-1)}
          className="h-7 w-6 rounded bg-charcoal-800 hover:bg-charcoal-700 text-muted-foreground hover:text-white text-xs font-bold"
          title="-1 rep"
        >
          -
        </button>
        <div className="flex-1 flex items-center justify-center">
          <input
            type="number"
            value={set.reps === 0 ? "" : set.reps}
            placeholder="0"
            onChange={(e) => onUpdate("reps", parseInt(e.target.value) || 0)}
            className="w-full text-center bg-transparent text-sm sm:text-base font-bold text-white focus:outline-none font-mono"
          />
          <span className="text-[10px] text-muted-foreground font-semibold mr-1">reps</span>
        </div>
        <button
          onClick={() => handleRepsChange(1)}
          className="h-7 w-6 rounded bg-charcoal-800 hover:bg-charcoal-700 text-muted-foreground hover:text-white text-xs font-bold"
          title="+1 rep"
        >
          +
        </button>
      </div>

      {/* RPE Selector (optional) */}
      <div className="hidden sm:flex items-center w-14">
        <select
          value={set.rpe || ""}
          onChange={(e) => onUpdate("rpe", parseFloat(e.target.value) || undefined)}
          className="w-full bg-charcoal-950 text-xs text-muted-foreground font-mono rounded border border-white/10 px-1 py-1.5 focus:outline-none focus:border-lime-electric"
        >
          <option value="">RPE</option>
          <option value="6">@ 6</option>
          <option value="7">@ 7</option>
          <option value="8">@ 8</option>
          <option value="8.5">@ 8.5</option>
          <option value="9">@ 9</option>
          <option value="9.5">@ 9.5</option>
          <option value="10">@ 10</option>
        </select>
      </div>

      {/* Complete Checkbox (Large 44px tap target) */}
      <button
        onClick={onComplete}
        className={cn(
          "h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90",
          isCompleted
            ? "bg-lime-electric text-charcoal-950 shadow-lime-sm scale-105"
            : "bg-charcoal-800 text-muted-foreground hover:text-white border border-white/10 hover:border-lime-electric/50"
        )}
        title={isCompleted ? "Mark incomplete" : "Complete set"}
      >
        <Check className={cn("h-6 w-6 stroke-[3]", isCompleted ? "text-charcoal-950" : "text-muted-foreground")} />
      </button>

      {/* Set-level Persistence / Sync visual feedback */}
      {isCompleted && (
        <div
          className={cn(
            "hidden lg:flex items-center gap-1 text-[10px] font-mono px-1.5 py-1 rounded border transition-colors",
            isOnline
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              : "text-amber-400 bg-amber-500/10 border-amber-500/20"
          )}
          title={isOnline ? "Set synced with server" : "Set safely stored in local IndexedDB"}
        >
          {isOnline ? (
            <>
              <Cloud className="h-3 w-3" />
              <span>Synced</span>
            </>
          ) : (
            <>
              <HardDrive className="h-3 w-3" />
              <span>Local</span>
            </>
          )}
        </div>
      )}

      {/* Remove Set Button */}
      <button
        onClick={onRemove}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        title="Remove set"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};
