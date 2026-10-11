"use client";

import React from "react";
import { Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react";
import { usePwa } from "@/lib/pwa/PwaProvider";
import { cn } from "@/lib/utils";

interface NetworkStatusBadgeProps {
  className?: string;
  showDetails?: boolean;
}

export const NetworkStatusBadge: React.FC<NetworkStatusBadgeProps> = ({
  className,
  showDetails = false,
}) => {
  const { isOnline, syncStatus, pendingSyncCount, triggerManualSync } = usePwa();

  if (isOnline && syncStatus === "synced" && pendingSyncCount === 0 && !showDetails) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-400",
          className
        )}
        title="Connected to network and all changes synchronized"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="hidden sm:inline">Online</span>
      </div>
    );
  }

  if (!isOnline || syncStatus === "offline") {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-[11px] font-bold text-amber-400 animate-in fade-in",
          className
        )}
        title="Network connection lost. Offline Gym Mode is preserving workout sets locally."
      >
        <WifiOff className="h-3.5 w-3.5" />
        <span>Offline (Gym Mode)</span>
        {pendingSyncCount > 0 && (
          <span className="bg-amber-500/30 px-1 rounded text-[10px] font-mono">
            {pendingSyncCount} queued
          </span>
        )}
      </div>
    );
  }

  if (syncStatus === "syncing") {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lime-electric/15 border border-lime-electric/40 text-[11px] font-bold text-lime-electric animate-in fade-in",
          className
        )}
        title="Syncing pending workout records with server..."
      >
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        <span>Syncing{pendingSyncCount > 0 ? ` (${pendingSyncCount})` : "..."}</span>
      </div>
    );
  }

  if (syncStatus === "error") {
    return (
      <button
        onClick={triggerManualSync}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-[11px] font-bold text-rose-400 hover:bg-rose-500/30 transition-colors cursor-pointer",
          className
        )}
        title="Failed to synchronize with server. Tap to retry."
      >
        <AlertCircle className="h-3.5 w-3.5" />
        <span>Sync Error</span>
        <span className="underline ml-0.5 font-normal">Retry</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-400",
        className
      )}
    >
      <Wifi className="h-3.5 w-3.5" />
      <span>Online</span>
    </div>
  );
};
