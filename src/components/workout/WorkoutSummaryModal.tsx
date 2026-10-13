"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, Flame, Clock, Dumbbell, ArrowRight, Share2 } from "lucide-react";
import { WorkoutSession } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { Button } from "../ui/button";

interface WorkoutSummaryModalProps {
  session: WorkoutSession;
  onClose: () => void;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  session,
  onClose,
}) => {
  useEffect(() => {
    // Fire festive celebration confetti
    try {
      const end = Date.now() + 1.5 * 1000;
      const colors = ["#CCFF00", "#D9FF38", "#ffffff", "#F59E0B"];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch {
      // Confetti fallback
    }
  }, []);

  const completedSets = session.sets.filter((s) => s.is_completed);
  const prSets = session.sets.filter((s) => s.is_pr);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-charcoal-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-3xl bg-charcoal-900 border border-lime-electric/40 p-5 sm:p-8 shadow-2xl relative text-center pb-safe">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-lime-electric/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Trophy Header */}
          <div className="h-20 w-20 rounded-3xl bg-lime-electric/15 border-2 border-lime-electric/50 flex items-center justify-center mx-auto text-lime-electric shadow-lime-md mb-4 animate-bounce">
            <Trophy className="h-10 w-10 text-lime-electric" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            Workout Completed!
          </h2>
          <p className="text-sm text-lime-electric font-semibold mt-1">
            {session.name}
          </p>

          {/* Metric Highlights */}
          <div className="grid grid-cols-3 gap-3 my-6">
            <div className="p-3 rounded-2xl bg-charcoal-950/80 border border-white/5">
              <Clock className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-lg font-black font-mono text-white">
                {formatDuration(session.duration_seconds)}
              </p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Time</p>
            </div>

            <div className="p-3 rounded-2xl bg-charcoal-950/80 border border-white/5">
              <Dumbbell className="h-4 w-4 text-lime-electric mx-auto mb-1" />
              <p className="text-lg font-black font-mono text-lime-electric">
                {session.total_volume_kg.toLocaleString()}
              </p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Vol (kg)</p>
            </div>

            <div className="p-3 rounded-2xl bg-charcoal-950/80 border border-white/5">
              <Flame className="h-4 w-4 text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-black font-mono text-white">
                {completedSets.length}
              </p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Sets Done</p>
            </div>
          </div>

          {/* PR Alert if any */}
          {prSets.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 mb-6">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>You crushed {prSets.length} Personal Record{prSets.length > 1 ? "s" : ""} today!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              variant="default"
              size="lg"
              onClick={onClose}
              className="w-full h-12 text-base font-black shadow-lime-md"
            >
              Back to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
