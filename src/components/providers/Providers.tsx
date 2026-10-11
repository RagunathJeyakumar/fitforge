"use client";

import React from "react";
import { FitnessProvider } from "@/lib/store/fitnessStore";

export const Providers: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <FitnessProvider>{children}</FitnessProvider>;
};
