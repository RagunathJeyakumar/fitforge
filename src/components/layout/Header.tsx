"use client";

import React from "react";
import Link from "next/link";
import { Zap, Timer, Play, Pause, Plus, Sparkles } from "lucide-react";
import { useFitness } from "@/lib/store/fitnessStore";
import { formatDuration } from "@/lib/utils";
import { Badge } from "../ui/badge";

export const Header: React.FC = () => {
  const {
    activeWorkout,
    pauseRestTimer,
    adjustRestTimer,
    isDemoMode,
    isSupabaseConfigured,
  } = useFitness();

  return (
    <header className="sticky top-0 z-30 w-full bg-charcoal-950/80 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Mobile Brand */}
      <div className="flex items-center gap-3 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-lime-electric/15 border border-lime-electric/30 flex items-center justify-center text-lime-electric">
            <Zap className="h-4 w-4 fill-lime-electric" />
          </div>
          <span className="font-black text-lg text-white">
            FIT<span className="text-lime-electric">FORGE</span>
          </span>
        </Link>
      </div>

      {/* Center: Live Rest Timer Ticker if running */}
      {activeWorkout && activeWorkout.timerSecondsRemaining > 0 && (
        <div className="flex items-center gap-2 bg-charcoal-800/90 border border-lime-electric/40 px-3 py-1.5 rounded-full shadow-lime-sm animate-pulse-glow">
          <Timer className="h-4 w-4 text-lime-electric animate-spin" style={{ animationDuration: "3s" }} />
          <span className="text-xs font-mono font-bold text-white tracking-wider">
            REST: {formatDuration(activeWorkout.timerSecondsRemaining)}
          </span>
          <button
            onClick={pauseRestTimer}
            className="p-1 rounded-full hover:bg-charcoal-700 text-lime-electric"
            title={activeWorkout.isTimerRunning ? "Pause timer" : "Resume timer"}
          >
            {activeWorkout.isTimerRunning ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={() => adjustRestTimer(30)}
            className="text-[10px] font-bold text-muted-foreground hover:text-white px-1.5 py-0.5 rounded bg-charcoal-700/60"
            title="Add 30s"
          >
            +30s
          </button>
        </div>
      )}

      {/* Right: Environment / Demo Badge & Quick Actions */}
      <div className="ml-auto flex items-center gap-3">
        {isDemoMode && (
          <Link href="/settings" title="Running in Interactive Demo Mode">
            <Badge variant="default" className="cursor-pointer gap-1 text-[11px] hover:bg-lime-electric/25">
              <Sparkles className="h-3 w-3" />
              Demo Mode
            </Badge>
          </Link>
        )}

        {!isDemoMode && isSupabaseConfigured && (
          <Badge variant="secondary" className="text-[11px] text-emerald-400 border-emerald-500/30">
            Supabase Connected
          </Badge>
        )}

        <Link
          href="/active"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-lime-electric/15 text-lime-electric border border-lime-electric/30 hover:bg-lime-electric/25 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Quick Workout
        </Link>
      </div>
    </header>
  );
};
