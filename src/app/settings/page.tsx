"use client";

import React, { useState } from "react";
import {
  Settings,
  User,
  Shield,
  Database,
  Lock,
  Sparkles,
  Check,
  Save,
  LogOut,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFitness } from "@/lib/store/fitnessStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FitnessGoal, ExperienceLevel, WeightUnit } from "@/lib/types";

export default function SettingsPage() {
  const {
    user,
    updateProfile,
    privacySettings,
    updatePrivacySettings,
    isDemoMode,
    toggleDemoMode,
    isSupabaseConfigured,
    logout,
  } = useFitness();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(user?.fitness_goal || "hypertrophy");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(user?.experience_level || "intermediate");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(user?.weight_unit || "kg");
  const [targetDays, setTargetDays] = useState(user?.target_days_per_week || 4);
  const [bio, setBio] = useState(user?.bio || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Privacy toggles
  const [shareWorkouts, setShareWorkouts] = useState(privacySettings.share_workouts);
  const [shareBodyweight, setShareBodyweight] = useState(privacySettings.share_bodyweight);
  const [sharePrs, setSharePrs] = useState(privacySettings.share_prs);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: fullName.trim(),
      fitness_goal: fitnessGoal,
      experience_level: experienceLevel,
      weight_unit: weightUnit,
      target_days_per_week: targetDays,
      bio: bio.trim(),
    });

    updatePrivacySettings({
      share_workouts: shareWorkouts,
      share_bodyweight: shareBodyweight,
      share_prs: sharePrs,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="text-xs">
              Account & Security
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Settings & Preferences
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure your lifting profile, privacy controls, and backend database integrations.
          </p>
        </div>

        {/* Database & Environment Status Card */}
        <Card className="p-6 border-white/5 bg-charcoal-900/90 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-lime-electric/15 border border-lime-electric/30 flex items-center justify-center text-lime-electric">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Supabase Backend Status
                </h3>
                <p className="text-xs text-muted-foreground">
                  PostgreSQL database & Google OAuth configuration
                </p>
              </div>
            </div>

            {isSupabaseConfigured ? (
              <Badge variant="default" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-amber-400 border-amber-500/30 bg-amber-500/10">
                Demo / Local Mode
              </Badge>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-charcoal-950/70 border border-white/5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current Operating Mode:</span>
              <span className="font-bold text-white">
                {isDemoMode ? "Interactive Demo Mode (Pre-populated squad & workouts)" : "Live User Mode"}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-muted-foreground">Quick Mode Toggle:</span>
              <Button
                variant={isDemoMode ? "secondary" : "default"}
                size="sm"
                onClick={() => toggleDemoMode(!isDemoMode)}
                className="text-xs h-8 font-bold"
              >
                {isDemoMode ? "Switch to Blank Session" : "Switch to Demo Squad Mode"}
              </Button>
            </div>
          </div>

          {!isSupabaseConfigured && (
            <div className="text-xs text-muted-foreground space-y-2 bg-charcoal-950/40 p-4 rounded-xl border border-white/5">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-sky-400" />
                Connecting Your Supabase Cloud Database:
              </p>
              <p>
                To enable live cloud Google OAuth and PostgreSQL Row Level Security sync, provide your Supabase credentials in <code className="text-lime-electric bg-charcoal-800 px-1 py-0.5 rounded">.env.local</code>:
              </p>
              <pre className="p-2.5 rounded bg-charcoal-950 text-[11px] font-mono text-lime-electric overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
              </pre>
              <p>
                Then run the SQL schema migration in Supabase SQL Editor from <code className="text-sky-300">src/lib/data/schema.sql</code>.
              </p>
            </div>
          )}
        </Card>

        {/* Profile Settings Form */}
        <form onSubmit={handleProfileSave} className="space-y-6">
          <Card className="p-6 border-white/5 bg-charcoal-900 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <div className="h-10 w-10 rounded-xl bg-charcoal-800 flex items-center justify-center text-white font-bold">
                <User className="h-5 w-5 text-lime-electric" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Athlete Profile</h3>
                <p className="text-xs text-muted-foreground">
                  Your gym identity and target training commitments
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-electric font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Fitness Primary Goal
                </label>
                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
                  className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-electric"
                >
                  <option value="hypertrophy">Hypertrophy (Muscle Size)</option>
                  <option value="strength">Strength (Powerlifting / Max Lifts)</option>
                  <option value="endurance">Endurance & Conditioning</option>
                  <option value="weight_loss">Weight Loss / Cutting</option>
                  <option value="general_fitness">General Athletic Fitness</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                  className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-electric"
                >
                  <option value="beginner">Beginner (0 - 1 year)</option>
                  <option value="intermediate">Intermediate (1 - 3 years)</option>
                  <option value="advanced">Advanced (3 - 6 years)</option>
                  <option value="elite">Elite (6+ years competitive)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Target Workouts Per Week
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={targetDays}
                  onChange={(e) => setTargetDays(parseInt(e.target.value) || 4)}
                  className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-electric font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Bio / Focus
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your squad about your current lifting split..."
                  className="w-full bg-charcoal-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-lime-electric"
                />
              </div>
            </div>
          </Card>

          {/* Privacy & Sharing Controls */}
          <Card className="p-6 border-white/5 bg-charcoal-900 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <div className="h-10 w-10 rounded-xl bg-charcoal-800 flex items-center justify-center text-white font-bold">
                <Lock className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Privacy & Group Permissions</h3>
                <p className="text-xs text-muted-foreground">
                  Fine-grained visibility controls for your private friend groups
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-charcoal-950/60 border border-white/5">
                <div>
                  <h4 className="text-sm font-bold text-white">Share Completed Workouts</h4>
                  <p className="text-xs text-muted-foreground">
                    Allow group members to view your session names and volume in the squad feed.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={shareWorkouts}
                  onChange={(e) => setShareWorkouts(e.target.checked)}
                  className="h-5 w-5 accent-lime-electric rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-charcoal-950/60 border border-white/5">
                <div>
                  <h4 className="text-sm font-bold text-white">Share Personal Records (PRs)</h4>
                  <p className="text-xs text-muted-foreground">
                    Broadcast new 1RM and weight milestones to your squad leaderboard.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={sharePrs}
                  onChange={(e) => setSharePrs(e.target.checked)}
                  className="h-5 w-5 accent-lime-electric rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-charcoal-950/60 border border-emerald-500/20">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">Share Body Weight & Body Fat</h4>
                    <Badge variant="cyan" className="text-[9px]">Private by Default</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Strict privacy: Scale weigh-ins remain completely confidential to you unless enabled.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={shareBodyweight}
                  onChange={(e) => setShareBodyweight(e.target.checked)}
                  className="h-5 w-5 accent-lime-electric rounded cursor-pointer"
                />
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={logout}
              className="text-xs text-rose-400 border-rose-500/20 hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Sign Out
            </Button>

            <Button
              type="submit"
              variant="default"
              size="lg"
              className="font-black px-8 shadow-lime-sm"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-5 w-5 mr-1.5 text-charcoal-950" />
                  Preferences Saved!
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-1.5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
