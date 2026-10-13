"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Trophy,
  Scale,
  Dumbbell,
  Calendar,
  Flame,
  Plus,
  Trash2,
  X,
  Award,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useFitness } from "@/lib/store/fitnessStore";
import { VolumeProgressionChart } from "@/components/analytics/VolumeProgressionChart";
import { OneRepMaxChart } from "@/components/analytics/OneRepMaxChart";
import { BodyMetricsChart } from "@/components/analytics/BodyMetricsChart";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsPage() {
  const {
    completedSessions,
    personalRecords,
    bodyMetrics,
    addBodyMetric,
    deleteBodyMetric,
  } = useFitness();

  const [showAddMetricModal, setShowAddMetricModal] = useState(false);
  const [metricDate, setMetricDate] = useState(new Date().toISOString().split("T")[0]);
  const [metricWeight, setMetricWeight] = useState("");
  const [metricBodyFat, setMetricBodyFat] = useState("");
  const [metricNotes, setMetricNotes] = useState("");

  const allTimeVolume = completedSessions.reduce((acc, s) => acc + s.total_volume_kg, 0);
  const allTimeSets = completedSessions.reduce(
    (acc, s) => acc + s.sets.filter((st) => st.is_completed).length,
    0
  );

  const handleAddMetricSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricWeight) return;

    addBodyMetric({
      recorded_date: metricDate,
      weight_kg: parseFloat(metricWeight),
      body_fat_pct: metricBodyFat ? parseFloat(metricBodyFat) : undefined,
      notes: metricNotes.trim() || undefined,
    });

    setShowAddMetricModal(false);
    setMetricWeight("");
    setMetricBodyFat("");
    setMetricNotes("");
  };

  const latestWeight = bodyMetrics[0]?.weight_kg || 82.3;

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="text-xs">
              Performance Insights
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Analytics & Strength Progression
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visualize your training volume trends, estimated 1RM progression, and body composition.
          </p>
        </div>

        {/* Milestone Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-white/5 bg-charcoal-900/90">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              All-Time Volume
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-lime-electric">
              {(allTimeVolume / 1000).toFixed(1)}k <span className="text-xs font-sans text-muted-foreground">kg</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all logged sets</p>
          </Card>

          <Card className="p-5 border-white/5 bg-charcoal-900/90">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Total Reps Completed
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {allTimeSets * 9}
            </div>
            <p className="text-xs text-muted-foreground mt-1">~{allTimeSets} effective sets</p>
          </Card>

          <Card className="p-5 border-white/5 bg-charcoal-900/90">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Personal Records
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
              {personalRecords.length}
            </div>
            <p className="text-xs text-amber-400/80 mt-1">Milestones unlocked</p>
          </Card>

          <Card className="p-5 border-white/5 bg-charcoal-900/90">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Current Body Weight
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-sky-400">
              {latestWeight} <span className="text-xs font-sans text-muted-foreground">kg</span>
            </div>
            <p className="text-xs text-sky-400/80 mt-1">Lean bulking target</p>
          </Card>
        </div>

        {/* Visual Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Volume Progression */}
          <Card className="p-6 border-white/5 bg-charcoal-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-lime-electric" />
                  Total Training Volume (kg)
                </h3>
                <p className="text-xs text-muted-foreground">Cumulative volume per session</p>
              </div>
            </div>
            <VolumeProgressionChart sessions={completedSessions} />
          </Card>

          {/* Chart 2: 1RM Strength Progression */}
          <Card className="p-6 border-white/5 bg-charcoal-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  Estimated 1RM Progression
                </h3>
                <p className="text-xs text-muted-foreground">Deadlift (Gold), Squat (Lime), Bench (Cyan)</p>
              </div>
            </div>
            <OneRepMaxChart />
          </Card>
        </div>

        {/* Body Weight Tracking Section */}
        <Card className="p-6 border-white/5 bg-charcoal-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="h-5 w-5 text-sky-400" />
                Body Composition & Weight Trend
              </h3>
              <p className="text-xs text-muted-foreground">
                Track weigh-ins privately (Private to you by default)
              </p>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={() => setShowAddMetricModal(true)}
              className="text-xs font-bold shadow-lime-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Log Weigh-In
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BodyMetricsChart metrics={bodyMetrics} />
            </div>

            {/* Weigh-In History List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                Recent Logs
              </span>
              {bodyMetrics.map((bm) => (
                <div
                  key={bm.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-charcoal-950/70 border border-white/5 text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{bm.weight_kg} kg</span>
                    {bm.body_fat_pct && (
                      <span className="text-muted-foreground ml-2">({bm.body_fat_pct}% BF)</span>
                    )}
                    <p className="text-[10px] text-muted-foreground">{bm.recorded_date}</p>
                  </div>
                  <button
                    onClick={() => deleteBodyMetric(bm.id)}
                    className="p-1 rounded text-muted-foreground hover:text-rose-400"
                    title="Delete entry"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* All-Time PR Hall of Fame */}
        <Card className="p-6 border-white/5 bg-charcoal-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-400" />
                Personal Records Hall of Fame
              </h3>
              <p className="text-xs text-muted-foreground">
                Highest calculated 1RM and heaviest working sets
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {personalRecords.map((pr) => (
              <div
                key={pr.exercise_id}
                className="p-4 rounded-2xl bg-charcoal-950/80 border border-amber-500/20 hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="gold" className="text-[10px]">
                    1RM: {pr.estimated_one_rep_max_kg} kg
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{pr.date_achieved}</span>
                </div>
                <h4 className="font-bold text-white text-sm mb-1">{pr.exercise_name}</h4>
                <p className="text-xs text-amber-300 font-mono font-semibold">
                  Best Set: {pr.max_weight_kg} kg × {pr.max_reps} reps
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Log Weigh-In Modal */}
        {showAddMetricModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-charcoal-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-sm max-h-[92dvh] overflow-y-auto rounded-3xl bg-charcoal-900 border border-white/10 p-5 sm:p-6 shadow-2xl space-y-4 pb-safe">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white">Log Weigh-In</h3>
                <button
                  onClick={() => setShowAddMetricModal(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddMetricSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={metricDate}
                    onChange={(e) => setMetricDate(e.target.value)}
                    className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-electric"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 82.5"
                    value={metricWeight}
                    onChange={(e) => setMetricWeight(e.target.value)}
                    className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-electric font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Body Fat % (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 14.2"
                    value={metricBodyFat}
                    onChange={(e) => setMetricBodyFat(e.target.value)}
                    className="w-full bg-charcoal-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime-electric font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddMetricModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="default" className="font-bold shadow-lime-sm">
                    Save Entry
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
