"use client";

import React from "react";
import { Timer, Play, Pause, Plus, Minus, X } from "lucide-react";
import { useFitness } from "@/lib/store/fitnessStore";
import { formatDuration } from "@/lib/utils";
import { Button } from "../ui/button";

export const RestTimerWidget: React.FC = () => {
  const {
    activeWorkout,
    pauseRestTimer,
    adjustRestTimer,
    startRestTimer,
  } = useFitness();

  if (!activeWorkout || activeWorkout.timerSecondsRemaining <= 0) {
    return (
      <div className="flex items-center gap-2 bg-charcoal-900 border border-white/5 rounded-xl p-3">
        <Timer className="h-5 w-5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">Quick Rest Timer:</span>
        <div className="flex items-center gap-1.5 ml-auto">
          {[60, 90, 120, 180].map((secs) => (
            <button
              key={secs}
              onClick={() => startRestTimer(secs)}
              className="text-xs font-bold px-2 py-1 rounded-lg bg-charcoal-800 text-foreground hover:bg-lime-electric hover:text-charcoal-950 transition-colors"
            >
              {secs}s
            </button>
          ))}
        </div>
      </div>
    );
  }

  const { timerSecondsRemaining, isTimerRunning, timerTargetSeconds } = activeWorkout;
  const progressPct = timerTargetSeconds > 0
    ? Math.min(100, Math.round(((timerTargetSeconds - timerSecondsRemaining) / timerTargetSeconds) * 100))
    : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-charcoal-900 border border-lime-electric/40 p-4 shadow-lime-sm">
      {/* Background progress bar */}
      <div
        className="absolute top-0 left-0 bottom-0 bg-lime-electric/10 transition-all duration-1000 -z-0"
        style={{ width: `${progressPct}%` }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-lime-electric/20 border border-lime-electric/40 flex items-center justify-center text-lime-electric shadow-lime-sm">
            <Timer className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black font-mono tracking-tight text-white">
                {formatDuration(timerSecondsRemaining)}
              </span>
              <span className="text-xs font-bold text-lime-electric uppercase tracking-wider">
                Resting
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {timerTargetSeconds}s • Next set countdown
            </p>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => adjustRestTimer(-15)}
            className="h-9 px-2 text-xs"
            title="Minus 15s"
          >
            <Minus className="h-3.5 w-3.5 mr-1" />
            15s
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={pauseRestTimer}
            className="h-9 px-4 text-xs font-bold"
          >
            {isTimerRunning ? (
              <>
                <Pause className="h-4 w-4 mr-1.5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1.5" />
                Resume
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => adjustRestTimer(30)}
            className="h-9 px-2 text-xs"
            title="Plus 30s"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            30s
          </Button>

          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => adjustRestTimer(-timerSecondsRemaining)}
            className="h-9 w-9 text-muted-foreground hover:text-white"
            title="Skip timer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
