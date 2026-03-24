"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

interface NotasChartProps {
  data: Array<{ name: string; nota: number }>
}

export function NotasChart({ data }: NotasChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
          formatter={(value) => [`${value}%`, "Nota"]}
        />
        <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "60%", fill: "#f59e0b", fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="nota"
          stroke="#0ea5e9"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
