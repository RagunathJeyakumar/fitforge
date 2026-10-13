"use client";

import React, { useState } from "react";
import {
  Users,
  Trophy,
  Flame,
  Copy,
  Check,
  Plus,
  ShieldCheck,
  Target,
  Sparkles,
  Lock,
  Utensils,
  Zap,
  LogOut,
  Dumbbell,
  Compass,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFitness } from "@/lib/store/fitnessStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type FeedFilter = "all" | "food" | "workouts";

export default function SocialPage() {
  const {
    groups,
    groupMembers,
    challenges,
    activityFeed,
    createGroup,
    joinGroupByCode,
    leaveGroup,
    cheerActivity,
    completedSessions,
    user,
  } = useFitness();

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [groupNameInput, setGroupNameInput] = useState("");
  const [groupDescInput, setGroupDescInput] = useState("");
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");

  // Determine current active group
  const currentGroup =
    groups.find((g) => g.id === activeGroupId) || groups[0] || null;

  const handleCopyCode = () => {
    if (!currentGroup) return;
    navigator.clipboard.writeText(currentGroup.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleJoin = (codeToJoin?: string) => {
    const code = (codeToJoin || inviteCodeInput).trim();
    if (!code) return;
    joinGroupByCode(code);
    setShowJoinModal(false);
    setInviteCodeInput("");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupNameInput.trim()) return;
    const newGrp = createGroup(groupNameInput.trim(), groupDescInput.trim());
    setActiveGroupId(newGrp.id);
    setShowCreateModal(false);
    setGroupNameInput("");
    setGroupDescInput("");
  };

  const handleLeaveCurrent = () => {
    if (!currentGroup) return;
    leaveGroup(currentGroup.id);
    setShowLeaveModal(false);
  };

  // Filter members by the current active group
  const currentGroupMembers = groupMembers.filter((m) =>
    currentGroup ? m.group_id === currentGroup.id : true
  );

  // Compute live user volume from completed sessions to reflect real lifting
  const liveUserVolume = completedSessions.reduce(
    (acc, s) => acc + (s.total_volume_kg || 0),
    0
  );

  // Sort members by total weekly volume (incorporating actual user workouts)
  const rankedMembers = [...currentGroupMembers]
    .map((member) => {
      if (member.user_id === user?.id && liveUserVolume > member.weekly_volume_kg) {
        return {
          ...member,
          weekly_volume_kg: liveUserVolume,
          weekly_workouts_count: Math.max(
            member.weekly_workouts_count,
            completedSessions.length
          ),
        };
      }
      return member;
    })
    .sort((a, b) => b.weekly_volume_kg - a.weekly_volume_kg);

  // Active group challenges
  const activeChallenges = challenges.filter((c) =>
    currentGroup ? c.group_id === currentGroup.id : true
  );

  // Filter activity feed
  const filteredFeed = activityFeed.filter((item) => {
    if (feedFilter === "food") {
      return item.action_type === "meal_logged";
    }
    if (feedFilter === "workouts") {
      return (
        item.action_type === "workout_completed" ||
        item.action_type === "pr_broken"
      );
    }
    return true;
  });

  const foodFeedCount = activityFeed.filter(
    (item) => item.action_type === "meal_logged"
  ).length;
  const workoutFeedCount = activityFeed.filter(
    (item) =>
      item.action_type === "workout_completed" ||
      item.action_type === "pr_broken"
  ).length;

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="cyan" className="text-xs">
                Private Squad Network
              </Badge>
              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                <Lock className="h-3 w-3 text-emerald-400" /> Private RLS Encrypted
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Squad Leaderboard & Friends Activity
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Compete on volume, track streaks, hype teammate meals & fuel logs in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowJoinModal(true)}
              className="text-xs h-10 px-4"
            >
              <Users className="h-4 w-4 mr-1.5 text-lime-electric" />
              Join by Code
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="text-xs font-bold h-10 px-4 shadow-lime-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Squad
            </Button>
          </div>
        </div>

        {/* Squad Selection Switcher (If member of multiple squads) */}
        {groups.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0 mr-1">
              Your Squads:
            </span>
            {groups.map((grp) => (
              <button
                key={grp.id}
                onClick={() => setActiveGroupId(grp.id)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all shrink-0 ${
                  (currentGroup?.id === grp.id)
                    ? "bg-lime-electric text-charcoal-950 shadow-lime-sm"
                    : "bg-charcoal-900 text-muted-foreground hover:text-white border border-white/5"
                }`}
              >
                {grp.name}
              </button>
            ))}
          </div>
        )}

        {/* Squad Profile Banner OR No Squad Joined Banner */}
        {currentGroup ? (
          <Card className="p-6 sm:p-8 border-white/5 bg-gradient-to-r from-charcoal-900 via-charcoal-900 to-charcoal-850 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-base border border-cyan-500/30">
                    {currentGroup.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        {currentGroup.name}
                      </h2>
                      {currentGroup.is_user_admin && (
                        <Badge variant="gold" className="text-[10px] text-amber-300">
                          Founder
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                  {currentGroup.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground pt-1">
                  <span className="text-white font-bold">
                    {currentGroupMembers.length} Active Lifters
                  </span>
                  <span>•</span>
                  <span>Weekly Reset: Mondays 00:00 UTC</span>
                  <span>•</span>
                  <button
                    onClick={() => setShowLeaveModal(true)}
                    className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 font-bold"
                  >
                    <LogOut className="h-3 w-3" /> Leave Squad
                  </button>
                </div>
              </div>

              {/* Invite Code Box */}
              <div className="bg-charcoal-950/85 border border-white/10 rounded-2xl p-4 flex flex-col items-center sm:items-end gap-2 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Private Invite Code
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-mono font-black text-lime-electric tracking-widest px-3 py-1 bg-charcoal-900 rounded-lg border border-lime-electric/30">
                    {currentGroup.invite_code}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyCode}
                    className="h-9 px-3 text-xs"
                    title="Copy code"
                  >
                    {copiedCode ? (
                      <Check className="h-4 w-4 text-lime-electric" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Share with your gym partners to join this leaderboard.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-8 border-white/10 bg-gradient-to-br from-charcoal-900 via-charcoal-900 to-charcoal-850 text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-lime-electric/10 text-lime-electric flex items-center justify-center mx-auto border border-lime-electric/20">
              <Compass className="h-7 w-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-xl font-black text-white">Join Your First Training Squad</h3>
              <p className="text-xs text-muted-foreground">
                Squads let you and your friends motivate each other, compete on weekly volume, and hype each other’s meals and PRs.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleJoin("FORGE-884")}
                className="font-bold shadow-lime-sm text-xs"
              >
                Join Iron Forge Syndicate (FORGE-884)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleJoin("DAWN-200")}
                className="text-xs font-bold"
              >
                Join Dawn Patrol (DAWN-200)
              </Button>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => handleJoin("WARRIOR-777")}
                className="text-xs font-bold"
              >
                Join Warrior Power (WARRIOR-777)
              </Button>
            </div>
          </Card>
        )}

        {/* Leaderboard & Challenges Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Weekly Leaderboard */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border-white/5 bg-charcoal-900">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    Weekly Volume Leaderboard
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Ranked by total kilograms lifted this training week
                  </p>
                </div>
                <Badge variant="gold" className="text-[10px]">
                  Week 41
                </Badge>
              </div>

              <div className="space-y-3">
                {rankedMembers.map((member, idx) => {
                  const isCurrentUser = member.user_id === user?.id;
                  const rankIcons = ["🥇", "🥈", "🥉"];

                  return (
                    <div
                      key={member.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        isCurrentUser
                          ? "bg-lime-electric/10 border-lime-electric/40 shadow-[0_0_20px_rgba(204,255,0,0.08)]"
                          : "bg-charcoal-950/60 border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center font-mono font-black text-base text-muted-foreground">
                          {rankIcons[idx] || `#${idx + 1}`}
                        </span>

                        <div className="h-11 w-11 rounded-full bg-charcoal-800 border border-white/10 flex items-center justify-center font-bold text-lime-electric overflow-hidden shrink-0">
                          {member.user_profile.avatar_url ? (
                            <img
                              src={member.user_profile.avatar_url}
                              alt={member.user_profile.full_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            member.user_profile.full_name.charAt(0)
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm">
                              {member.user_profile.full_name}
                            </h4>
                            {isCurrentUser && (
                              <Badge variant="default" className="text-[9px] py-0 px-1.5 font-bold">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1 text-amber-400 font-semibold">
                              <Flame className="h-3 w-3 fill-amber-400" />
                              {member.streak_weeks}w streak
                            </span>
                            <span>•</span>
                            <span>{member.weekly_workouts_count} workouts</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base sm:text-lg font-black font-mono text-lime-electric">
                          {member.weekly_volume_kg.toLocaleString()}{" "}
                          <span className="text-[10px] font-sans text-muted-foreground">kg</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Volume</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Privacy Guarantee Note */}
            <div className="p-4 rounded-2xl bg-charcoal-900/60 border border-white/5 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-bold text-white">Privacy Protected Social Hub</p>
                <p>
                  Workouts and nutrition logs are shared to inspire and encourage accountability. Body metrics (such as body weight and body fat %) are kept private by default and never exposed to other squad members.
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Active Fitness Challenges */}
          <div className="space-y-6">
            <Card className="p-6 border-white/5 bg-charcoal-900 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-lime-electric" />
                  Squad Challenges
                </h3>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  {activeChallenges.length} Active
                </span>
              </div>

              <div className="space-y-4">
                {activeChallenges.map((ch) => {
                  const pct = Math.min(
                    100,
                    Math.round(((ch.user_progress || 0) / ch.target_value) * 100)
                  );

                  return (
                    <div
                      key={ch.id}
                      className="p-4 rounded-2xl bg-charcoal-950/70 border border-white/5 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-white text-sm">{ch.title}</h4>
                        <span className="text-[10px] text-lime-electric font-mono font-bold">
                          {pct}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{ch.description}</p>

                      <div className="space-y-1">
                        <div className="h-2 w-full rounded-full bg-charcoal-900 overflow-hidden">
                          <div
                            className="h-full bg-lime-electric rounded-full transition-all duration-500 shadow-lime-sm"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                          <span>Progress</span>
                          <span>
                            {(ch.user_progress || 0).toLocaleString()} / {ch.target_value.toLocaleString()} {ch.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* Full-Width Friends Activity Feed with WOW Factor */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  Friends Activity & Fuel Feed
                </h2>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1.5 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cloud Sync Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Live stream of teammate meals, macros, workouts, and PR breakthroughs synced across your squad.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-charcoal-900 border border-white/10 rounded-2xl">
              <button
                onClick={() => setFeedFilter("all")}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  feedFilter === "all"
                    ? "bg-lime-electric text-charcoal-950 shadow-lime-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <span>🔥 All</span>
                <span className="text-[10px] opacity-75">({activityFeed.length})</span>
              </button>
              <button
                onClick={() => setFeedFilter("food")}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  feedFilter === "food"
                    ? "bg-lime-electric text-charcoal-950 shadow-lime-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <Utensils className="h-3 w-3" />
                <span>Fuel & Foods</span>
                <span className="text-[10px] opacity-75">({foodFeedCount})</span>
              </button>
              <button
                onClick={() => setFeedFilter("workouts")}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                  feedFilter === "workouts"
                    ? "bg-lime-electric text-charcoal-950 shadow-lime-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                <Dumbbell className="h-3 w-3" />
                <span>Workouts & PRs</span>
                <span className="text-[10px] opacity-75">({workoutFeedCount})</span>
              </button>
            </div>
          </div>

          {/* Activity Feed Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeed.map((item) => {
              const isFood = item.action_type === "meal_logged";
              const isPR = item.action_type === "pr_broken";
              const isJoined = item.action_type === "joined_group";

              if (isFood) {
                // Motivational Food Card with WOW Aesthetics
                return (
                  <Card
                    key={item.id}
                    className="p-5 border-white/10 bg-gradient-to-br from-charcoal-900/90 via-charcoal-900/80 to-charcoal-950 hover:border-lime-electric/40 transition-all rounded-3xl relative overflow-hidden group shadow-lg"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-lime-electric/5 rounded-full blur-2xl pointer-events-none group-hover:bg-lime-electric/10 transition-all" />

                    {/* Top Row: User + Meal Pill + Timestamp */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-full bg-charcoal-800 border border-white/10 flex items-center justify-center font-bold text-lime-electric shrink-0 overflow-hidden">
                          {item.user_avatar ? (
                            <img
                              src={item.user_avatar}
                              alt={item.user_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            item.user_name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm leading-snug">
                            {item.user_name}
                          </h4>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {item.timestamp}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.is_real ? (
                          <span className="text-[10px] font-bold text-lime-electric bg-lime-electric/15 border border-lime-electric/30 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_8px_rgba(204,255,0,0.12)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-lime-electric animate-pulse" />
                            Live
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-muted-foreground/75 bg-charcoal-950/70 border border-white/5 px-2 py-0.5 rounded-full">
                            Featured
                          </span>
                        )}
                        <Badge
                          variant="cyan"
                          className="text-[10px] uppercase font-bold tracking-wider py-0.5 px-2.5 flex items-center gap-1"
                        >
                          <Utensils className="h-2.5 w-2.5" />
                          {item.meal_type?.replace("_", " ") || "Fuel Meal"}
                        </Badge>
                      </div>
                    </div>

                    {/* Food Name & Tamil Script Badge */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-baseline flex-wrap gap-2">
                        <h3 className="text-base font-black text-white group-hover:text-lime-electric transition-colors">
                          {item.food_name}
                        </h3>
                        {item.tamil_name && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/20">
                            {item.tamil_name}
                          </span>
                        )}
                      </div>

                      {/* Motivational Badge */}
                      {item.motivation_badge && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-lime-electric bg-lime-electric/10 border border-lime-electric/25 px-2.5 py-1 rounded-full">
                          <span>{item.motivation_badge}</span>
                        </div>
                      )}
                    </div>

                    {/* Macro Strip */}
                    <div className="grid grid-cols-4 gap-2 p-2.5 rounded-2xl bg-charcoal-950/70 border border-white/5 mb-3.5">
                      <div className="text-center">
                        <span className="text-[10px] uppercase font-bold text-amber-300 block">
                          Calories
                        </span>
                        <span className="text-sm font-black font-mono text-white">
                          {item.calories || 0}
                          <span className="text-[9px] font-sans text-muted-foreground font-normal ml-0.5">
                            kcal
                          </span>
                        </span>
                      </div>

                      <div className="text-center border-l border-white/5">
                        <span className="text-[10px] uppercase font-bold text-lime-electric block">
                          Protein
                        </span>
                        <span className="text-sm font-black font-mono text-lime-electric">
                          {item.protein_g || 0}
                          <span className="text-[9px] font-sans font-normal ml-0.5">g</span>
                        </span>
                      </div>

                      <div className="text-center border-l border-white/5">
                        <span className="text-[10px] uppercase font-bold text-sky-400 block">
                          Carbs
                        </span>
                        <span className="text-sm font-black font-mono text-white">
                          {item.carbs_g || 0}
                          <span className="text-[9px] font-sans text-muted-foreground font-normal ml-0.5">g</span>
                        </span>
                      </div>

                      <div className="text-center border-l border-white/5">
                        <span className="text-[10px] uppercase font-bold text-rose-300 block">
                          Fat
                        </span>
                        <span className="text-sm font-black font-mono text-white">
                          {item.fat_g || 0}
                          <span className="text-[9px] font-sans text-muted-foreground font-normal ml-0.5">g</span>
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action: Hype Reaction */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                      <span className="text-[11px] text-muted-foreground">
                        {item.protein_g && item.protein_g >= 30
                          ? "🔥 High-protein powerhouse fuel"
                          : "⚡ Clean nutritious training fuel"}
                      </span>

                      <button
                        onClick={() => cheerActivity(item.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                          item.has_cheered
                            ? "bg-lime-electric/20 text-lime-electric border border-lime-electric shadow-lime-sm scale-105"
                            : "bg-charcoal-800 text-muted-foreground hover:text-white hover:bg-charcoal-700 border border-white/10"
                        }`}
                      >
                        <Flame
                          className={`h-3.5 w-3.5 ${
                            item.has_cheered ? "text-lime-electric fill-lime-electric animate-pulse" : "text-amber-400"
                          }`}
                        />
                        <span>{item.has_cheered ? "Hyped!" : "Hype"}</span>
                        <span>({item.cheers_count || 0})</span>
                      </button>
                    </div>
                  </Card>
                );
              }

              // Workout or PR Card
              return (
                <Card
                  key={item.id}
                  className="p-5 border-white/10 bg-gradient-to-br from-charcoal-900/90 via-charcoal-900/80 to-charcoal-950 hover:border-white/20 transition-all rounded-3xl relative overflow-hidden group shadow-lg flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: User + Badge + Timestamp */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-full bg-charcoal-800 border border-white/10 flex items-center justify-center font-bold text-lime-electric shrink-0 overflow-hidden">
                          {item.user_avatar ? (
                            <img
                              src={item.user_avatar}
                              alt={item.user_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            item.user_name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm leading-snug">
                            {item.user_name}
                          </h4>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {item.timestamp}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.is_real ? (
                          <span className="text-[10px] font-bold text-lime-electric bg-lime-electric/15 border border-lime-electric/30 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_8px_rgba(204,255,0,0.12)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-lime-electric animate-pulse" />
                            Live
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-muted-foreground/75 bg-charcoal-950/70 border border-white/5 px-2 py-0.5 rounded-full">
                            Featured
                          </span>
                        )}
                        <Badge
                          variant={isPR ? "gold" : isJoined ? "purple" : "cyan"}
                          className="text-[10px] uppercase font-bold tracking-wider py-0.5 px-2.5 flex items-center gap-1"
                        >
                          {isPR ? (
                            <>
                              <Trophy className="h-2.5 w-2.5" />
                              New PR
                            </>
                          ) : isJoined ? (
                            <>
                              <Sparkles className="h-2.5 w-2.5" />
                              Squad Join
                            </>
                          ) : (
                            <>
                              <Dumbbell className="h-2.5 w-2.5" />
                              Workout
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>

                    {/* Workout Details */}
                    <div className="space-y-1 mb-3">
                      <h3 className="text-base font-black text-white group-hover:text-lime-electric transition-colors">
                        {item.workout_name || "Lifting Session"}
                      </h3>

                      {item.pr_detail && (
                        <p className="text-xs font-bold text-amber-300 bg-amber-400/10 border border-amber-400/25 px-2.5 py-1 rounded-xl inline-block mt-1">
                          {item.pr_detail}
                        </p>
                      )}

                      {item.volume_kg && (
                        <div className="text-xs text-muted-foreground font-mono mt-1">
                          Session Tonnage:{" "}
                          <span className="text-lime-electric font-bold">
                            {item.volume_kg.toLocaleString()} kg
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action: Hype Reaction */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                    <span className="text-[11px] text-muted-foreground">
                      {isPR ? "🏆 Setting new personal records!" : "⚡ Consistency builds greatness"}
                    </span>

                    <button
                      onClick={() => cheerActivity(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                        item.has_cheered
                          ? "bg-lime-electric/20 text-lime-electric border border-lime-electric shadow-lime-sm scale-105"
                          : "bg-charcoal-800 text-muted-foreground hover:text-white hover:bg-charcoal-700 border border-white/10"
                      }`}
                    >
                      <Flame
                        className={`h-3.5 w-3.5 ${
                          item.has_cheered ? "text-lime-electric fill-lime-electric animate-pulse" : "text-amber-400"
                        }`}
                      />
                      <span>{item.has_cheered ? "Hyped!" : "Hype"}</span>
                      <span>({item.cheers_count || 0})</span>
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Join Group Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-charcoal-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-sm max-h-[92dvh] overflow-y-auto rounded-3xl bg-charcoal-900 border border-white/10 p-5 sm:p-6 shadow-2xl space-y-4 pb-safe">
              <h3 className="text-xl font-black text-white">Join Friend Squad</h3>
              <p className="text-xs text-muted-foreground">
                Enter the private invite code provided by your group creator, or select a community squad below.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleJoin();
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  required
                  placeholder="e.g. FORGE-884"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-4 py-3 text-center text-lg font-mono font-black text-lime-electric tracking-widest focus:outline-none focus:border-lime-electric uppercase"
                />

                {/* Quick Join Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Quick Preset Squads:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleJoin("FORGE-884")}
                      className="text-left text-xs p-2.5 rounded-xl bg-charcoal-950 hover:bg-charcoal-800 border border-white/5 text-muted-foreground hover:text-white transition-all flex items-center justify-between"
                    >
                      <span className="font-bold text-white">Iron Forge Syndicate</span>
                      <span className="font-mono text-lime-electric font-bold">FORGE-884</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJoin("DAWN-200")}
                      className="text-left text-xs p-2.5 rounded-xl bg-charcoal-950 hover:bg-charcoal-800 border border-white/5 text-muted-foreground hover:text-white transition-all flex items-center justify-between"
                    >
                      <span className="font-bold text-white">Dawn Patrol 5AM Lifters</span>
                      <span className="font-mono text-lime-electric font-bold">DAWN-200</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJoin("WARRIOR-777")}
                      className="text-left text-xs p-2.5 rounded-xl bg-charcoal-950 hover:bg-charcoal-800 border border-white/5 text-muted-foreground hover:text-white transition-all flex items-center justify-between"
                    >
                      <span className="font-bold text-white">Warrior Calisthenics & Power</span>
                      <span className="font-mono text-lime-electric font-bold">WARRIOR-777</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowJoinModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" className="font-bold shadow-lime-sm">
                    Join Squad
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-charcoal-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-3xl bg-charcoal-900 border border-white/10 p-5 sm:p-6 shadow-2xl space-y-4 pb-safe">
              <h3 className="text-xl font-black text-white">Create Private Squad</h3>
              <p className="text-xs text-muted-foreground">
                Start a private circle for you and your gym friends. You will receive a unique code to share.
              </p>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Squad Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5AM Iron Club"
                    value={groupNameInput}
                    onChange={(e) => setGroupNameInput(e.target.value)}
                    className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-electric"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Motto / Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pushing PRs, no excuses."
                    value={groupDescInput}
                    onChange={(e) => setGroupDescInput(e.target.value)}
                    className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-electric"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" className="font-bold shadow-lime-sm">
                    Create & Generate Code
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Leave Group Confirmation Modal */}
        {showLeaveModal && currentGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-charcoal-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-charcoal-900 border border-white/10 p-5 sm:p-6 shadow-2xl space-y-4">
              <h3 className="text-lg font-black text-white">Leave {currentGroup.name}?</h3>
              <p className="text-xs text-muted-foreground">
                You will be removed from this squad&apos;s leaderboard and challenges. You can rejoin at any time using the invite code <span className="font-mono text-lime-electric font-bold">{currentGroup.invite_code}</span>.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLeaveModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleLeaveCurrent}
                  className="bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold border border-rose-500/30"
                >
                  Leave Squad
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
