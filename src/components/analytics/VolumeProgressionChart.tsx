"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { WorkoutSession } from "@/lib/types";

interface VolumeProgressionChartProps {
  sessions: WorkoutSession[];
}

export const VolumeProgressionChart: React.FC<VolumeProgressionChartProps> = ({
  sessions,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-xs">
        Loading chart data...
      </div>
    );
  }

  // Aggregate sessions by date (oldest to newest)
  const chartData = [...sessions]
    .reverse()
    .map((s) => {
      const date = new Date(s.start_time);
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return {
        date: formattedDate,
        name: s.name,
        volume: Math.round(s.total_volume_kg),
      };
    });

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-xs">
        No completed workouts logged yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#CCFF00" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#222B35" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0D1015",
              borderColor: "rgba(204, 255, 0, 0.3)",
              borderRadius: "0.75rem",
              boxShadow: "0 0 15px rgba(0,0,0,0.5)",
              color: "#fff",
              fontSize: "12px",
            }}
            formatter={(value: any) => [`${Number(value).toLocaleString()} kg`, "Volume"]}
            labelFormatter={(label) => `Workout: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="#CCFF00"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#limeGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
