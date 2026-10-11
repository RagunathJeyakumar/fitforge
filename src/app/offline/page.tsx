"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, Dumbbell, RotateCcw, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-charcoal-950 text-white flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-9 w-9 rounded-xl bg-lime-electric/15 border border-lime-electric/40 flex items-center justify-center text-lime-electric shadow-lime-sm">
          <Zap className="h-5 w-5 fill-lime-electric" />
        </div>
        <span className="font-black text-xl tracking-tight text-white">
          FIT<span className="text-lime-electric">FORGE</span>
        </span>
      </div>

      <Card className="max-w-md w-full p-6 sm:p-8 bg-charcoal-900 border border-white/10 rounded-3xl text-center space-y-6 shadow-2xl">
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <WifiOff className="h-10 w-10 animate-pulse" />
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-amber-500 animate-ping" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-xs">
              Offline Gym Mode Active
            </Badge>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            No Network Connection
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Gyms often have weak reception. FitForge has saved your app shell and local workout engine.
          </p>
        </div>

        {/* Gym Safety Checklist */}
        <div className="p-4 rounded-2xl bg-charcoal-950 border border-white/5 text-left space-y-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 text-white font-semibold">
            <CheckCircle2 className="h-4 w-4 text-lime-electric shrink-0" />
            <span>Active workout sets continue recording safely</span>
          </div>
          <div className="flex items-center gap-2 text-white font-semibold">
            <CheckCircle2 className="h-4 w-4 text-lime-electric shrink-0" />
            <span>Changes are queued in secure local storage</span>
          </div>
          <div className="flex items-center gap-2 text-white font-semibold">
            <CheckCircle2 className="h-4 w-4 text-lime-electric shrink-0" />
            <span>Auto-sync resumes once Wi-Fi or cellular returns</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/active" className="flex-1">
            <Button variant="default" className="w-full font-bold h-11 shadow-lime-sm">
              <Dumbbell className="h-4 w-4 mr-2" />
              Active Workout
            </Button>
          </Link>
          <Button
            variant="secondary"
            onClick={() => window.location.reload()}
            className="flex-1 h-11 font-bold"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground/60 mt-8 font-mono">
        FitForge PWA v1.0.0 • Offline Ready
      </p>
    </div>
  );
}
