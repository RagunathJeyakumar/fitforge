"use client";

import React from "react";
import Link from "next/link";
import {
  Flame,
  Zap,
  Play,
  Trophy,
  Dumbbell,
  Clock,
  TrendingUp,
  Users,
  ChevronRight,
  Calendar,
  Sparkles,
  Lock,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFitness } from "@/lib/store/fitnessStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { VolumeProgressionChart } from "@/components/analytics/VolumeProgressionChart";

export default function DashboardPage() {
  const {
    user,
    activeWorkout,
    startWorkout,
    workoutPlans,
    completedSessions,
    personalRecords,
    challenges,
    activityFeed,
    cheerActivity,
    isDemoMode,
    clearToBlankState,
    signInWithGoogle,
    groups,
    groupMembers,
  } = useFitness();

  // Calculate current week metrics
  const totalVolumeThisWeek = completedSessions
    .slice(0, 3)
    .reduce((acc, s) => acc + s.total_volume_kg, 0);

  const workoutsThisWeekCount = completedSessions.length;
  const currentStreakWeeks = isDemoMode ? 4 : Math.min(1, completedSessions.length);

  // Next recommended workout routine
  const recommendedPlan = workoutPlans[0];

  const primaryGroup = groups[0] || null;
  const currentGroupMembers = primaryGroup
    ? groupMembers.filter((m) => m.group_id === primaryGroup.id)
    : [];
  const userRank =
    primaryGroup && currentGroupMembers.length > 0
      ? currentGroupMembers.findIndex((m) => m.user_id === user?.id) + 1 || 1
      : 1;

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Demo Mode Notice & Action Banner */}
        {mounted && isDemoMode && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-charcoal-900 border border-lime-electric/30 shadow-lg animate-in slide-in-from-top">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-lime-electric/20 border border-lime-electric/40 flex items-center justify-center text-lime-electric shrink-0">
                <Sparkles className="h-4 w-4 fill-lime-electric" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Previewing Interactive Demo Data (Sample Athlete)
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Sign in with Google to sync your own personal workouts to Supabase, or clear to a clean slate.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={clearToBlankState}
                className="h-8 text-xs border-white/10 hover:border-white/20 text-white"
              >
                Clear Mock Data
              </Button>
              <Button
                size="sm"
                onClick={signInWithGoogle}
                className="h-8 text-xs font-black shadow-lime-sm"
              >
                Sign In with Google
              </Button>
            </div>
          </div>
        )}

        {/* Welcome & Streak Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-charcoal-900 via-charcoal-900 to-charcoal-850 border border-white/5 relative overflow-hidden shadow-2xl">
          {/* Subtle electric-lime glow accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-lime-electric/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="gap-1.5 py-1 px-3">
                <Flame className="h-3.5 w-3.5 text-lime-electric fill-lime-electric" />
                {currentStreakWeeks} Week Consistency Streak
              </Badge>
              <span className="text-xs text-muted-foreground font-semibold">
                • {(user?.fitness_goal || "hypertrophy").toUpperCase()} PHASE
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready to crush it,{" "}
              <span className="text-lime-electric">
                {user?.full_name ? user.full_name.split(" ")[0] : "Lifter"}
              </span>
              ?
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Consistency builds champions. You are scheduled for{" "}
              <span className="text-white font-bold">
                {recommendedPlan ? recommendedPlan.title : "Freestyle Session"}
              </span>{" "}
              today.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            {activeWorkout ? (
              <Link href="/active">
                <Button
                  variant="default"
                  size="lg"
                  className="shadow-lime-md animate-pulse gap-2 h-14 px-6 text-base"
                >
                  <Play className="h-5 w-5 fill-charcoal-950" />
                  Resume Live Workout
                </Button>
              </Link>
            ) : (
              <Button
                variant="default"
                size="lg"
                onClick={() => startWorkout(recommendedPlan)}
                className="shadow-lime-md gap-2 h-14 px-6 text-base font-black hover:scale-[1.02] transition-transform"
              >
                <Play className="h-5 w-5 fill-charcoal-950" />
                Start Today&apos;s Workout
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-white/5 bg-charcoal-900/80">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Weekly Volume</span>
              <Dumbbell className="h-4 w-4 text-lime-electric" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {totalVolumeThisWeek.toLocaleString()} <span className="text-xs font-sans text-muted-foreground font-semibold">kg</span>
            </div>
            <p className="text-xs text-lime-electric mt-1 flex items-center gap-1 font-semibold">
              <TrendingUp className="h-3 w-3" /> +12% vs last week
            </p>
          </Card>

          <Card className="p-5 border-white/5 bg-charcoal-900/80">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Workouts Logged</span>
              <Calendar className="h-4 w-4 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {workoutsThisWeekCount} <span className="text-xs font-sans text-muted-foreground font-semibold">/ {user?.target_days_per_week || 5}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              On track for weekly goal
            </p>
          </Card>

          <Card className="p-5 border-white/5 bg-charcoal-900/80">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">All-Time PRs</span>
              <Trophy className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
              {personalRecords.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {personalRecords.length > 0
                ? `Top: ${personalRecords[0].exercise_name.split(" ")[0]} ${personalRecords[0].max_weight_kg}kg`
                : "Log sets to record PRs"}
            </p>
          </Card>

          <Card className="p-5 border-white/5 bg-charcoal-900/80">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Syndicate Rank</span>
              <Users className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {primaryGroup ? (
                <>
                  #{userRank}{" "}
                  <span className="text-xs font-sans text-muted-foreground font-semibold">
                    of {Math.max(1, currentGroupMembers.length)}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-muted-foreground">Solo</span>
              )}
            </div>
            <p className="text-xs text-purple-400 mt-1 truncate">
              {primaryGroup ? primaryGroup.name : "Join squad to rank"}
            </p>
          </Card>
        </div>

        {/* Main Content Layout: Chart + Planned Workouts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Volume Progression Chart */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border-white/5 bg-charcoal-900">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-lime-electric" />
                    Training Volume Progression
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Total load lifted (kg) across recent sessions
                  </p>
                </div>
                <Link href="/analytics">
                  <Button variant="ghost" size="sm" className="text-xs text-lime-electric">
                    Full Analytics
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>

              <VolumeProgressionChart sessions={completedSessions} />
            </Card>

            {/* Recent Workouts Log */}
            <Card className="p-6 border-white/5 bg-charcoal-900">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-sky-400" />
                    Recent Workout Logs
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Your previous gym performances
                  </p>
                </div>
                <Link href="/history">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View History
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {completedSessions.slice(0, 3).map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-charcoal-950/60 border border-white/5 hover:border-white/10 transition-colors gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">
                          {session.name}
                        </h4>
                        {session.pr_count ? (
                          <Badge variant="gold" className="text-[10px]">
                            {session.pr_count} PR{session.pr_count > 1 ? "s" : ""}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(session.start_time).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        • {formatDuration(session.duration_seconds)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-lime-electric">
                          {session.total_volume_kg.toLocaleString()} kg
                        </span>
                        <p className="text-[10px] text-muted-foreground">
                          {session.sets.filter((s) => s.is_completed).length} sets completed
                        </p>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const matchedPlan = workoutPlans.find((p) => p.id === session.plan_id);
                          startWorkout(matchedPlan, session.name);
                        }}
                        className="text-xs"
                      >
                        Repeat
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Active Challenges & Squad Activity */}
          <div className="space-y-6">
            {/* Squad Challenge Card */}
            {challenges.length > 0 && (
              <Card className="p-6 border-white/5 bg-charcoal-900 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="cyan" className="text-[11px]">
                    Syndicate Challenge
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    Ends Oct 31
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">
                  {challenges[0].title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  {challenges[0].description}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Group Progress</span>
                    <span className="text-lime-electric font-bold">
                      {(challenges[0].user_progress || 0).toLocaleString()} / {challenges[0].target_value.toLocaleString()} {challenges[0].unit}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-charcoal-950 overflow-hidden">
                    <div
                      className="h-full bg-lime-electric rounded-full transition-all duration-500 shadow-lime-sm"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(((challenges[0].user_progress || 0) / challenges[0].target_value) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <Link href="/social" className="block mt-4">
                  <Button variant="subtle" size="sm" className="w-full text-xs font-bold">
                    View Leaderboard & Squad
                  </Button>
                </Link>
              </Card>
            )}

            {/* Personal Records Spotlight */}
            <Card className="p-6 border-white/5 bg-charcoal-900">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  Key Personal Records
                </h3>
                <Link href="/analytics" className="text-[11px] text-lime-electric hover:underline font-semibold">
                  View All
                </Link>
              </div>

              <div className="space-y-2.5">
                {personalRecords.slice(0, 3).map((pr) => (
                  <div
                    key={pr.exercise_id}
                    className="p-3 rounded-xl bg-charcoal-950/70 border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[150px]">
                        {pr.exercise_name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {pr.max_weight_kg} kg × {pr.max_reps} reps
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-black text-amber-400">
                        {pr.estimated_one_rep_max_kg} kg
                      </span>
                      <p className="text-[9px] text-muted-foreground">1RM</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Squad Feed Spotlight */}
            <Card className="p-6 border-white/5 bg-charcoal-900">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  Friends Activity & Fuel
                </h3>
                <Link href="/social" className="text-[11px] text-lime-electric hover:underline font-semibold">
                  View Feed
                </Link>
              </div>

              <div className="space-y-3">
                {!primaryGroup ? (
                  <div className="p-5 rounded-2xl bg-charcoal-950/60 border border-white/5 text-center space-y-2.5 py-6">
                    <div className="h-8 w-8 rounded-full bg-charcoal-800 text-muted-foreground flex items-center justify-center mx-auto">
                      <Lock className="h-4 w-4 text-emerald-400" />
                    </div>
                    <p className="text-xs font-bold text-white">Private Squad Network</p>
                    <p className="text-xs text-muted-foreground">
                      Join a squad to unlock your teammates&apos; live workout and food fuel feed.
                    </p>
                    <div className="pt-1">
                      <Link href="/social">
                        <Button size="sm" variant="default" className="text-xs h-8 font-bold shadow-lime-sm">
                          Join or Create Squad →
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : activityFeed.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-charcoal-950/60 border border-white/5 text-center space-y-2.5 py-6">
                    <p className="text-xs text-muted-foreground">
                      Your squad feed is active! Complete a workout or log a fuel meal to share live motivation.
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <Link href="/workouts">
                        <Button size="sm" variant="outline" className="text-xs h-8">
                          🏋️ Workout
                        </Button>
                      </Link>
                      <Link href="/diet">
                        <Button size="sm" variant="default" className="text-xs h-8">
                          🥗 Log Meal
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  activityFeed.slice(0, 4).map((item) => {
                    const isFood = item.action_type === "meal_logged";
                    const isPR = item.action_type === "pr_broken";

                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-charcoal-950/60 border border-white/5 hover:border-white/10 transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-charcoal-800 border border-white/10 flex items-center justify-center font-bold text-lime-electric shrink-0 overflow-hidden text-xs">
                              {item.user_avatar ? (
                                <img src={item.user_avatar} alt={item.user_name} className="h-full w-full object-cover" />
                              ) : (
                                item.user_name.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-foreground font-bold text-white leading-tight">
                                {item.user_name}
                              </p>
                              <span className="text-[10px] text-muted-foreground font-mono">{item.timestamp}</span>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-charcoal-900 border border-white/10 text-muted-foreground">
                            {isFood ? "🥗 Fuel" : isPR ? "🏆 PR" : "⚡ Lift"}
                          </span>
                        </div>

                        {isFood ? (
                          <div className="text-xs space-y-1">
                            <p className="font-semibold text-white leading-snug">
                              {item.food_name}
                              {item.tamil_name && (
                                <span className="text-[10px] text-amber-300 ml-1.5 font-normal">
                                  ({item.tamil_name})
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] font-mono">
                              <span className="text-lime-electric font-bold">{item.protein_g}g Protein</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-amber-300">{item.calories} kcal</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs space-y-0.5">
                            <p className="font-semibold text-white">
                              {isPR ? "Broke PR on " : "Completed "}
                              <span className="text-lime-electric">{item.workout_name}</span>
                            </p>
                            {item.volume_kg && (
                              <p className="text-[10px] text-muted-foreground font-mono">
                                Volume: {item.volume_kg.toLocaleString()} kg
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                          <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                            {isFood ? (item.motivation_badge || "Clean fuel") : "Consistency"}
                          </span>
                          <button
                            onClick={() => cheerActivity(item.id)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                              item.has_cheered
                                ? "bg-lime-electric/20 text-lime-electric border border-lime-electric"
                                : "bg-charcoal-800 text-muted-foreground hover:text-white"
                            }`}
                          >
                            <Flame className="h-3 w-3 text-amber-400" />
                            <span>{item.has_cheered ? "Hyped" : "Hype"} ({item.cheers_count || 0})</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <Link href="/social" className="block mt-3">
                <Button variant="ghost" size="sm" className="w-full text-xs text-lime-electric hover:bg-lime-electric/10">
                  Open Social Hub & Full Feed
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
