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
import { BodyMetricEntry } from "@/lib/types";

interface BodyMetricsChartProps {
  metrics: BodyMetricEntry[];
}

export const BodyMetricsChart: React.FC<BodyMetricsChartProps> = ({ metrics }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = [...metrics]
    .sort((a, b) => a.recorded_date.localeCompare(b.recorded_date))
    .map((m) => {
      const d = new Date(m.recorded_date);
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        weight: m.weight_kg,
        bodyFat: m.body_fat_pct,
      };
    });

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">Loading metrics...</div>;
  }

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
        No body weight logs recorded yet.
      </div>
    );
  }

  const minWeight = Math.min(...chartData.map((d) => d.weight)) - 1;
  const maxWeight = Math.max(...chartData.map((d) => d.weight)) + 1;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222B35" vertical={false} />
          <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#64748B"
            fontSize={11}
            domain={[Math.floor(minWeight), Math.ceil(maxWeight)]}
            tickLine={false}
            axisLine={false}
            unit="kg"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0D1015",
              borderColor: "rgba(204, 255, 0, 0.3)",
              borderRadius: "0.75rem",
              color: "#fff",
              fontSize: "12px",
            }}
            formatter={(value: any, name: any) => [
              `${value} ${name === "weight" ? "kg" : "%"}`,
              name === "weight" ? "Body Weight" : "Body Fat",
            ]}
          />
          <Line
            type="monotone"
            name="weight"
            dataKey="weight"
            stroke="#CCFF00"
            strokeWidth={3}
            dot={{ fill: "#CCFF00", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
