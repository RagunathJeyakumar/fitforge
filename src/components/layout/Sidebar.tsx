"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  BookOpen,
  PlayCircle,
  BarChart3,
  Users,
  History,
  Settings,
  Flame,
  Zap,
  UtensilsCrossed,
  LogIn,
} from "lucide-react";
import { useFitness } from "@/lib/store/fitnessStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workouts", label: "Routines", icon: Dumbbell },
  { href: "/active", label: "Active Workout", icon: PlayCircle, isAction: true },
  { href: "/exercises", label: "Exercise Library", icon: BookOpen },
  { href: "/analytics", label: "Progress & Metrics", icon: BarChart3 },
  { href: "/social", label: "Squad & Challenges", icon: Users },
  { href: "/nutrition", label: "Diet & Nutrition", icon: UtensilsCrossed },
  { href: "/history", label: "History Log", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { activeWorkout, user, isDemoMode } = useFitness();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-charcoal-950 border-r border-white/5 h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-lime-electric/15 border border-lime-electric/30 flex items-center justify-center text-lime-electric shadow-lime-sm group-hover:scale-105 transition-transform">
            <Zap className="h-6 w-6 fill-lime-electric text-lime-electric" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              FIT<span className="text-lime-electric font-black">FORGE</span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              Syndicate Tracker
            </p>
          </div>
        </Link>
      </div>

      {/* Active Workout Banner (If running) */}
      {activeWorkout && (
        <div className="px-4 pt-4">
          <Link
            href="/active"
            className="block p-3 rounded-xl bg-gradient-to-r from-lime-electric/20 to-lime-electric/5 border border-lime-electric/40 hover:border-lime-electric transition-all shadow-lime-sm group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-lime-electric">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-electric opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-electric"></span>
                </span>
                SESSION IN PROGRESS
              </span>
              <span className="text-xs font-mono font-bold text-white">
                {Math.floor(activeWorkout.session.duration_seconds / 60)}m
              </span>
            </div>
            <p className="text-xs font-semibold text-white truncate">
              {activeWorkout.session.name}
            </p>
          </Link>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isLive = item.isAction && activeWorkout;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-charcoal-800 text-lime-electric font-semibold border border-white/5"
                  : "text-muted-foreground hover:text-white hover:bg-charcoal-900",
                isLive && !isActive && "text-lime-electric/90"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r bg-lime-electric" />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform group-hover:scale-110",
                  isActive
                    ? "text-lime-electric"
                    : isLive
                    ? "text-lime-electric animate-pulse"
                    : "text-muted-foreground group-hover:text-white"
                )}
              />
              <span className="truncate">{item.label}</span>
              {isLive && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-lime-electric animate-ping" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Mini Profile */}
      <div className="p-4 border-t border-white/5 bg-charcoal-900/50 space-y-2">
        {mounted && isDemoMode && (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-lime-electric text-charcoal-950 font-black text-xs shadow-lime-sm hover:bg-lime-electric/90 transition-all"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In with Google
          </Link>
        )}
        <Link
          href="/settings"
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-charcoal-800 transition-colors"
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="h-10 w-10 rounded-full object-cover border border-lime-electric/40"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-charcoal-700 flex items-center justify-center font-bold text-lime-electric text-sm border border-white/10">
              {user?.full_name ? user.full_name.charAt(0) : "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.full_name || "Guest Athlete"}
            </p>
            <p className="text-xs text-lime-electric flex items-center gap-1">
              <Flame className="h-3 w-3 fill-lime-electric" />
              {user?.target_days_per_week || 4} Days / Wk
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
};
