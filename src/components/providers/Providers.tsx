"use client";

import React from "react";
import { FitnessProvider } from "@/lib/store/fitnessStore";
import { PwaProvider } from "@/lib/pwa/PwaProvider";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallBanner";
import { IosInstallModal } from "@/components/pwa/IosInstallModal";
import { UpdateAvailableToast } from "@/components/pwa/UpdateAvailableToast";

export const Providers: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <FitnessProvider>
      <PwaProvider>
        <PwaInstallBanner />
        {children}
        <IosInstallModal />
        <UpdateAvailableToast />
      </PwaProvider>
    </FitnessProvider>
  );
};
