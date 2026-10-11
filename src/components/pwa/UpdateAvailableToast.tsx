"use client";

import React from "react";
import { Sparkles, RefreshCw, X } from "lucide-react";
import { usePwa } from "@/lib/pwa/PwaProvider";
import { Button } from "@/components/ui/button";

export const UpdateAvailableToast: React.FC = () => {
  const { updateAvailable, applyUpdate } = usePwa();
  const [dismissed, setDismissed] = React.useState(false);

  if (!updateAvailable || dismissed) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 max-w-sm w-full bg-charcoal-900 border border-lime-electric/50 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-xl bg-lime-electric/20 border border-lime-electric/40 flex items-center justify-center text-lime-electric shrink-0 shadow-lime-sm">
          <Sparkles className="h-4 w-4 fill-lime-electric" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-black uppercase tracking-wider text-lime-electric">
            Update Available
          </h4>
          <p className="text-xs text-white/90 mt-0.5 leading-snug">
            A new version of FitForge has been deployed. Reload to get the latest features and bug fixes.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Button
              size="sm"
              onClick={applyUpdate}
              className="h-8 px-3 text-xs font-bold shadow-lime-sm"
            >
              <RefreshCw className="h-3 w-3 mr-1.5" />
              Update Now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-white"
            >
              Later
            </Button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-white p-1"
          title="Dismiss update notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
