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
  Award,
  Lock,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFitness } from "@/lib/store/fitnessStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SocialPage() {
  const {
    groups,
    groupMembers,
    challenges,
    activityFeed,
    createGroup,
    joinGroupByCode,
    user,
  } = useFitness();

  const [copiedCode, setCopiedCode] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [groupNameInput, setGroupNameInput] = useState("");
  const [groupDescInput, setGroupDescInput] = useState("");

  const currentGroup = groups[0];

  const handleCopyCode = () => {
    if (!currentGroup) return;
    navigator.clipboard.writeText(currentGroup.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    joinGroupByCode(inviteCodeInput.trim());
    setShowJoinModal(false);
    setInviteCodeInput("");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupNameInput.trim()) return;
    createGroup(groupNameInput.trim(), groupDescInput.trim());
    setShowCreateModal(false);
    setGroupNameInput("");
    setGroupDescInput("");
  };

  // Sort members by total weekly volume
  const rankedMembers = [...groupMembers].sort(
    (a, b) => b.weekly_volume_kg - a.weekly_volume_kg
  );

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="cyan" className="text-xs">
                Private Squad
              </Badge>
              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                <Lock className="h-3 w-3 text-emerald-400" /> Private RLS Encrypted
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Squad Leaderboard & Challenges
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Compete on volume, track streaks, and crush collaborative fitness goals with your inner circle.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowJoinModal(true)}
              className="text-xs h-10 px-4"
            >
              Join by Invite Code
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

        {/* Squad Profile & Invite Code Banner */}
        {currentGroup && (
          <Card className="p-6 sm:p-8 border-white/5 bg-gradient-to-r from-charcoal-900 via-charcoal-900 to-charcoal-850 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-sm">
                    {currentGroup.name.charAt(0)}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {currentGroup.name}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                  {currentGroup.description}
                </p>
                <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground pt-1">
                  <span>{groupMembers.length} Active Lifters</span>
                  <span>•</span>
                  <span>Weekly Reset: Mondays 00:00 UTC</span>
                </div>
              </div>

              {/* Invite Code Box */}
              <div className="bg-charcoal-950/80 border border-white/10 rounded-2xl p-4 flex flex-col items-center sm:items-end gap-2 shrink-0">
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
                  Share this code with your training partners.
                </p>
              </div>
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
                          ? "bg-lime-electric/10 border-lime-electric/40"
                          : "bg-charcoal-950/60 border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center font-mono font-black text-base text-muted-foreground">
                          {rankIcons[idx] || `#${idx + 1}`}
                        </span>

                        <div className="h-11 w-11 rounded-full bg-charcoal-800 border border-white/10 flex items-center justify-center font-bold text-lime-electric overflow-hidden">
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
                              <Badge variant="default" className="text-[9px] py-0 px-1.5">
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
                  Workouts and tonnage are shared to encourage friendly competition. Body metrics (such as scale weight and body fat %) are kept private by default and never exposed to other squad members.
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Active Fitness Challenges & Feed */}
          <div className="space-y-6">
            {/* Challenges List */}
            <Card className="p-6 border-white/5 bg-charcoal-900 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Target className="h-4 w-4 text-lime-electric" />
                  Squad Challenges
                </h3>
              </div>

              <div className="space-y-4">
                {challenges.map((ch) => {
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

            {/* Squad Activity Feed */}
            <Card className="p-6 border-white/5 bg-charcoal-900 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Live Squad Feed
              </h3>

              <div className="space-y-3">
                {activityFeed.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 text-xs">
                    <div className="h-8 w-8 rounded-full bg-charcoal-800 border border-white/10 flex items-center justify-center font-bold text-lime-electric shrink-0 mt-0.5 overflow-hidden">
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
                      <p className="text-foreground leading-relaxed">
                        <span className="font-bold text-white">{item.user_name}</span>{" "}
                        {item.action_type === "pr_broken" ? "set a new PR on" : "completed"}
                        {" "}
                        <span className="text-lime-electric font-semibold">
                          {item.workout_name}
                        </span>
                      </p>
                      {item.volume_kg && (
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          Tonnage: {item.volume_kg.toLocaleString()} kg
                        </p>
                      )}
                      {item.pr_detail && (
                        <p className="text-[11px] text-amber-300 font-semibold mt-0.5">
                          {item.pr_detail}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {item.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Join Group Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-charcoal-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-sm max-h-[92dvh] overflow-y-auto rounded-3xl bg-charcoal-900 border border-white/10 p-5 sm:p-6 shadow-2xl space-y-4 pb-safe">
              <h3 className="text-xl font-black text-white">Join Friend Squad</h3>
              <p className="text-xs text-muted-foreground">
                Enter the private invite code provided by your group creator.
              </p>

              <form onSubmit={handleJoin} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="e.g. FORGE-884"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-4 py-3 text-center text-lg font-mono font-black text-lime-electric tracking-widest focus:outline-none focus:border-lime-electric uppercase"
                />

                <div className="flex items-center justify-end gap-2">
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
                Start a private circle for you and your gym friends.
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
      </div>
    </AppShell>
  );
}
