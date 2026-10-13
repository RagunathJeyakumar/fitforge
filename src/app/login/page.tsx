"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, ShieldCheck, Mail, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useFitness } from "@/lib/store/fitnessStore";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const { toggleDemoMode, clearToBlankState, isSupabaseConfigured, user, isDemoMode } = useFitness();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. If already authenticated with real account, redirect to dashboard immediately
  React.useEffect(() => {
    if (user && !isDemoMode) {
      router.push("/");
    }
  }, [user, isDemoMode, router]);

  // 2. Handle incoming Magic Link tokens and error parameters
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // If URL hash contains access_token, user is authenticated via Magic Link!
    if (window.location.hash.includes("access_token")) {
      setLoading(true);
      const supabase = getSupabaseBrowserClient();
      supabase.auth.getSession().then((res: any) => {
        const session = res?.data?.session;
        if (session?.user) {
          router.push("/");
        }
      });
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const desc = hash.get("error_description") || params.get("error_description");
    const err = params.get("error") || hash.get("error");
    if (desc) {
      setErrorMsg(decodeURIComponent(desc).replace(/\+/g, " "));
    } else if (err && err !== "undefined") {
      setErrorMsg("Authentication failed. Please verify your Supabase credentials.");
    }
  }, [router]);

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured) {
      setErrorMsg(
        "Supabase credentials not yet configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel settings."
      );
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
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
      setErrorMsg(e?.message || "Google sign-in initiation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (!isSupabaseConfigured) {
      setErrorMsg("Supabase credentials not yet configured in Vercel settings.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      const supabase = getSupabaseBrowserClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/api/auth/callback`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setEmailSent(true);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  const handleCleanSlate = () => {
    clearToBlankState();
    router.push("/");
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
          <Link href="/" className="inline-block">
            <div className="h-14 w-14 rounded-2xl bg-lime-electric/15 border border-lime-electric/30 flex items-center justify-center text-lime-electric shadow-lime-md mx-auto mb-3">
              <Zap className="h-8 w-8 fill-lime-electric" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              FIT<span className="text-lime-electric">FORGE</span>
            </h1>
          </Link>
          <p className="text-sm text-muted-foreground font-medium">
            Personal Gym Fitness Tracker & Cloud Sync
          </p>
        </div>

        <Card className="p-6 sm:p-8 border-white/10 bg-charcoal-900/95 shadow-2xl space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-bold text-white">Sign In to Your Account</h2>
            <p className="text-xs text-muted-foreground">
              Sync your workouts, strength progression, and diet to your Supabase cloud database.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs leading-relaxed flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {emailSent ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-white text-sm">Check Your Email</h3>
              <p className="text-xs text-muted-foreground">
                We sent a secure login link to <strong className="text-white">{email}</strong>. Click it to log in instantly.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEmailSent(false)}
                className="text-xs text-lime-electric"
              >
                Use another email
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
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

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-charcoal-900 px-2 text-muted-foreground font-semibold">
                    Or with Magic Link
                  </span>
                </div>
              </div>

              {/* Email Magic Link Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email..."
                    required
                    className="flex-1 bg-charcoal-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-lime-electric"
                  />
                  <Button
                    type="submit"
                    disabled={loading || !email.trim()}
                    size="sm"
                    className="h-9 px-3 text-xs font-bold shadow-lime-sm"
                  >
                    <Mail className="h-3.5 w-3.5 mr-1" />
                    Send Link
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="pt-2 border-t border-white/5 space-y-2">
            {/* Clean Slate Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCleanSlate}
              className="w-full text-xs font-bold"
            >
              Start Clean (0 Mock Data, Local Mode)
            </Button>

            {/* Instant Demo Access Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDemoSignIn}
              className="w-full text-xs text-muted-foreground hover:text-white"
            >
              <Sparkles className="h-3 w-3 mr-1 text-lime-electric" />
              Explore Sample Demo Workouts
            </Button>
          </div>

          <div className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Row Level Security (RLS) & Private Personal Storage</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
