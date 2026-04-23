"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface ChartData {
  stage: string
  count: number
  value: number
}

export function DashboardChart({ data }: { data: ChartData[] }) {
  const stageOrder = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]
  const sorted = stageOrder
    .map((s) => data.find((d) => d.stage === s))
    .filter(Boolean) as ChartData[]

  if (sorted.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        No deal data yet. Create some deals to see your pipeline.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={sorted} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#6b7280" }} />
        <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
        <Tooltip
          formatter={(value, name) =>
            name === "value"
              ? [formatCurrency(Number(value)), "Value"]
              : [String(value), "Count"]
          }
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
        />
        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="count" />
      </BarChart>
    </ResponsiveContainer>
  )
}
