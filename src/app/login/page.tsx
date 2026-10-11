"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, ShieldCheck, Play, Sparkles, Lock, ArrowRight } from "lucide-react";
import { useFitness } from "@/lib/store/fitnessStore";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const { toggleDemoMode, isSupabaseConfigured } = useFitness();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured) {
      setErrorMsg(
        "Supabase credentials not yet configured in .env.local. You can click 'Explore Interactive Demo' below to test the full application immediately!"
      );
      return;
    }

    try {
      setLoading(true);
      const supabase = getSupabaseBrowserClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/api/auth/callback`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || "OAuth initiation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    toggleDemoMode(true);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Glow backdrop */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-lime-electric/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-in fade-in duration-300">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-lime-electric/15 border border-lime-electric/30 flex items-center justify-center text-lime-electric shadow-lime-md mx-auto mb-3">
            <Zap className="h-8 w-8 fill-lime-electric" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            FIT<span className="text-lime-electric">FORGE</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Personal Gym Fitness Tracker & Private Syndicate
          </p>
        </div>

        <Card className="p-8 border-white/10 bg-charcoal-900/95 shadow-2xl space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-bold text-white">Sign In to Your Account</h2>
            <p className="text-xs text-muted-foreground">
              Secure, private workout logging for you and your inner circle.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3">
            {/* Google OAuth Button */}
            <Button
              variant="outline"
              size="lg"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 border-white/20 bg-charcoal-950 hover:bg-charcoal-800 text-white font-bold gap-3"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign in with Google
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-charcoal-900 px-2 text-muted-foreground font-bold">
                  Or instant access
                </span>
              </div>
            </div>

            {/* Instant Demo Access Button */}
            <Button
              variant="default"
              size="lg"
              onClick={handleDemoSignIn}
              className="w-full h-12 font-black shadow-lime-md gap-2 text-base"
            >
              <Sparkles className="h-5 w-5 fill-charcoal-950" />
              Explore Interactive Demo Mode
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </div>

          <div className="pt-2 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Row Level Security (RLS) & Private Friend Encryption</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
