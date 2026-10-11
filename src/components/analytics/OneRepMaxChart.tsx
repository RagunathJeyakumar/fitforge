"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface LiftRecord {
  date: string;
  bench: number;
  squat: number;
  deadlift: number;
}

export const OneRepMaxChart: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const strengthProgressionData: LiftRecord[] = [
    { date: "Aug 15", bench: 95, squat: 110, deadlift: 150 },
    { date: "Sep 01", bench: 100, squat: 115, deadlift: 155 },
    { date: "Sep 15", bench: 105, squat: 120, deadlift: 165 },
    { date: "Oct 01", bench: 112, squat: 130, deadlift: 175 },
    { date: "Oct 10", bench: 118, squat: 142, deadlift: 191 },
  ];

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Loading lifts...</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={strengthProgressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222B35" vertical={false} />
          <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} unit="kg" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0D1015",
              borderColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "0.75rem",
              color: "#fff",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            name="Deadlift"
            dataKey="deadlift"
            stroke="#F59E0B"
            strokeWidth={3}
            dot={{ fill: "#F59E0B", r: 4 }}
          />
          <Line
            type="monotone"
            name="Squat"
            dataKey="squat"
            stroke="#CCFF00"
            strokeWidth={3}
            dot={{ fill: "#CCFF00", r: 4 }}
          />
          <Line
            type="monotone"
            name="Bench Press"
            dataKey="bench"
            stroke="#38BDF8"
            strokeWidth={3}
            dot={{ fill: "#38BDF8", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
