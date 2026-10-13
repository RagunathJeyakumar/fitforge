"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Timer, Play, Pause, Plus, Sparkles, Download, Smartphone, LogIn, LogOut } from "lucide-react";
import { useFitness } from "@/lib/store/fitnessStore";
import { usePwa } from "@/lib/pwa/PwaProvider";
import { formatDuration } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { NetworkStatusBadge } from "../pwa/NetworkStatusBadge";

export const Header: React.FC = () => {
  const router = useRouter();
  const {
    activeWorkout,
    pauseRestTimer,
    adjustRestTimer,
    isDemoMode,
    isSupabaseConfigured,
    user,
    signInWithGoogle,
    logout,
  } = useFitness();

  const {
    isInstallable,
    isInstalled,
    isIos,
    triggerInstall,
  } = usePwa();

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-charcoal-950/90 backdrop-blur-xl border-b border-white/5 pt-safe transition-all select-none">
      <div className="px-3.5 sm:px-4 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2.5 sm:gap-3 min-h-[56px]">
        {/* Mobile Brand (FITFORGE Logo) */}
        <div className="flex items-center gap-2 lg:hidden shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 p-1.5 -ml-1 rounded-xl active:scale-95 transition-all cursor-pointer group min-h-[44px] min-w-[44px]"
            aria-label="FitForge Home"
          >
            <div className="h-8 w-8 rounded-lg bg-lime-electric/15 border border-lime-electric/30 flex items-center justify-center text-lime-electric shrink-0 shadow-lime-sm group-hover:bg-lime-electric/25 transition-colors">
              <Zap className="h-4 w-4 fill-lime-electric" />
            </div>
            <span className="font-black text-lg text-white tracking-tight select-none">
              FIT<span className="text-lime-electric">FORGE</span>
            </span>
          </Link>
        </div>

        {/* Center: Live Rest Timer Ticker if running */}
        {activeWorkout && activeWorkout.timerSecondsRemaining > 0 && (
          <div className="hidden sm:flex items-center gap-2 bg-charcoal-800/90 border border-lime-electric/40 px-3 py-1.5 rounded-full shadow-lime-sm animate-pulse-glow">
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

        {/* Right: Connectivity Status, PWA Install & Environment Badges */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
          {/* PWA Network & Offline Gym Status */}
          <NetworkStatusBadge />

          {/* PWA Install Button when available and not installed */}
          {!isInstalled && (isInstallable || isIos) && (
            <button
              onClick={triggerInstall}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-lime-electric border border-lime-electric/30 transition-colors"
              title={isIos ? "Learn how to install FitForge on iOS" : "Install FitForge as standalone app"}
            >
              {isIos ? (
                <>
                  <Smartphone className="h-3 w-3" />
                  <span>Install iOS</span>
                </>
              ) : (
                <>
                  <Download className="h-3 w-3" />
                  <span>Install App</span>
                </>
              )}
            </button>
          )}

          {mounted && (
            isDemoMode ? (
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl bg-lime-electric text-charcoal-950 hover:bg-lime-electric/90 active:scale-95 shadow-lime-sm transition-all cursor-pointer min-h-[40px]"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign In with Google
              </button>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/settings"
                  className="h-9 px-2.5 sm:px-3 rounded-xl text-xs text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-400 active:scale-95 font-bold flex items-center gap-1.5 max-w-[110px] sm:max-w-none truncate transition-all cursor-pointer shadow-sm"
                  title="Account Settings"
                  aria-label="Account Settings"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="truncate">{user?.full_name ? user.full_name.split(" ")[0] : "Connected"}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="h-9 w-9 sm:h-9 sm:w-auto p-0 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 bg-charcoal-800 hover:bg-rose-500/20 active:scale-90 text-rose-400 border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer shadow-sm shrink-0"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="h-4 w-4 text-rose-400 shrink-0" />
                  <span className="hidden sm:inline text-xs font-bold">Sign Out</span>
                </button>
              </div>
            )
          )}

          <Link
            href="/active"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-lime-electric/15 text-lime-electric border border-lime-electric/30 hover:bg-lime-electric/25 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Quick Workout
          </Link>
        </div>
      </div>
    </header>
  );
};
