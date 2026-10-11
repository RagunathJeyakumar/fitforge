"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  PlayCircle,
  BookOpen,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { useFitness } from "@/lib/store/fitnessStore";
import { cn } from "@/lib/utils";

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { activeWorkout } = useFitness();

  const navItems = [
    { href: "/", label: "Home", icon: LayoutDashboard },
    { href: "/nutrition", label: "Diet", icon: UtensilsCrossed },
    {
      href: "/active",
      label: "Workout",
      icon: PlayCircle,
      isCenterAction: true,
    },
    { href: "/workouts", label: "Routines", icon: Dumbbell },
    { href: "/social", label: "Squad", icon: Users },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-charcoal-950/95 backdrop-blur-xl border-t border-white/10 px-3 py-2 pb-safe">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isCenterAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-5 flex flex-col items-center group"
              >
                <div
                  className={cn(
                    "h-14 w-14 rounded-full flex items-center justify-center transition-all duration-200 border-2 shadow-lg",
                    activeWorkout
                      ? "bg-lime-electric text-charcoal-950 border-white shadow-lime-md animate-pulse"
                      : "bg-charcoal-800 text-lime-electric border-lime-electric/50 hover:bg-charcoal-700"
                  )}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <span className="text-[10px] font-bold mt-1 text-lime-electric">
                  {activeWorkout ? "Active" : "Start"}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-1 px-3 rounded-lg text-xs font-medium transition-colors",
                isActive
                  ? "text-lime-electric font-bold"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
