"use client";

import React from "react";
import { Share, PlusSquare, X, Check, Smartphone, Zap } from "lucide-react";
import { usePwa } from "@/lib/pwa/PwaProvider";
import { Button } from "@/components/ui/button";

export const IosInstallModal: React.FC = () => {
  const { showIosModal, setShowIosModal } = usePwa();

  if (!showIosModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-charcoal-900 border border-white/10 rounded-3xl max-w-sm w-full max-h-[92dvh] overflow-y-auto p-5 sm:p-6 space-y-5 shadow-2xl relative pb-safe">
        <button
          onClick={() => setShowIosModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-white bg-charcoal-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-lime-electric/15 border border-lime-electric/30 flex items-center justify-center mx-auto text-lime-electric shadow-lime-sm">
            <Smartphone className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-black text-white">
            Install FitForge on iPhone / iPad
          </h3>
          <p className="text-xs text-muted-foreground">
            Apple Safari requires adding to your Home Screen manually:
          </p>
        </div>

        {/* 3 Step Guide */}
        <div className="space-y-3 bg-charcoal-950 p-4 rounded-2xl border border-white/5 text-xs">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-lg bg-charcoal-800 border border-white/10 flex items-center justify-center text-lime-electric font-bold shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="font-semibold text-white">
                Tap the <span className="text-lime-electric">Share button</span>
              </p>
              <p className="text-muted-foreground text-[11px] mt-0.5 flex items-center gap-1">
                Located in Safari's bottom toolbar (<Share className="h-3 w-3 inline text-sky-400" />).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-lg bg-charcoal-800 border border-white/10 flex items-center justify-center text-lime-electric font-bold shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="font-semibold text-white">
                Select <span className="text-lime-electric">Add to Home Screen</span>
              </p>
              <p className="text-muted-foreground text-[11px] mt-0.5 flex items-center gap-1">
                Scroll down in the share sheet and tap <PlusSquare className="h-3 w-3 inline text-amber-400" />.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-lg bg-charcoal-800 border border-white/10 flex items-center justify-center text-lime-electric font-bold shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="font-semibold text-white">
                Tap <span className="text-lime-electric">Add</span>
              </p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Top right corner. FitForge will launch in standalone gym mode!
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="default"
          onClick={() => setShowIosModal(false)}
          className="w-full font-bold h-10 shadow-lime-sm"
        >
          <Check className="h-4 w-4 mr-2" />
          Got It, Let&apos;s Lift
        </Button>
      </div>
    </div>
  );
};
