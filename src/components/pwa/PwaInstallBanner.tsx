"use client";

import React from "react";
import { Download, X, Smartphone, Zap } from "lucide-react";
import { usePwa } from "@/lib/pwa/PwaProvider";
import { Button } from "@/components/ui/button";

export const PwaInstallBanner: React.FC = () => {
  const {
    showInstallBanner,
    isInstalled,
    isInstallable,
    isIos,
    triggerInstall,
    dismissInstallBanner,
  } = usePwa();

  if (!showInstallBanner || isInstalled || (!isInstallable && !isIos)) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-charcoal-900 via-charcoal-900 to-lime-electric/10 border-b border-lime-electric/30 px-4 py-2.5 sm:py-3 transition-all animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Banner Left Info */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-lime-electric/20 border border-lime-electric/40 flex items-center justify-center text-lime-electric shrink-0 shadow-lime-sm">
            <Zap className="h-4 w-4 fill-lime-electric" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-lime-electric">
                Install FitForge App
              </span>
              <span className="hidden sm:inline-block text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full font-mono">
                PWA Standalone
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Instant offline gym logging, zero browser bars, and faster performance on mobile & desktop.
            </p>
          </div>
        </div>

        {/* Banner Right Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            size="sm"
            onClick={triggerInstall}
            className="h-8 px-3.5 text-xs font-black shadow-lime-sm flex-1 sm:flex-none"
          >
            {isIos ? (
              <>
                <Smartphone className="h-3.5 w-3.5 mr-1.5" />
                How to Install (iOS)
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Install App
              </>
            )}
          </Button>

          <button
            onClick={dismissInstallBanner}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
            title="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
