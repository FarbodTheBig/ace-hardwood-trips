"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

interface Props {
  weeklyKm: { week: string; km: number }[]
  topRoutes: { route: string; count: number }[]
}

export default function DashboardCharts({ weeklyKm, topRoutes }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card">
        <h2 className="section-title">KM per Day</h2>
        {weeklyKm.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-[#cbd5e1] text-sm">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyKm} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8f0f8" />
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #d8e0ec", borderRadius: "8px", color: "#0f1a35", fontSize: "11px" }} cursor={{ fill: "rgba(37,99,235,0.05)" }} />
              <Bar dataKey="km" fill="#2563eb" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h2 className="section-title">Top Routes</h2>
        {topRoutes.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-[#cbd5e1] text-sm">No data yet</div>
        ) : (
          <div className="flex flex-col gap-4 mt-1">
            {topRoutes.map((r, i) => (
              <div key={r.route} className="flex items-center gap-3">
                <span className="text-[10px] text-[#cbd5e1] w-3">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-[#64748b] truncate mb-1.5">{r.route}</div>
                  <div className="h-[2px] bg-[#e2e8f0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#2563eb] rounded-full" style={{ width: `${(r.count / (topRoutes[0]?.count || 1)) * 100}%` }} />
                  </div>
                </div>
                <span className="text-[10px] text-[#cbd5e1] shrink-0">{r.count}×</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
