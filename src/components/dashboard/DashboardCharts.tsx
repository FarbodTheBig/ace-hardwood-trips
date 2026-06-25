"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

interface Props {
  weeklyKm: { week: string; km: number }[]
  topRoutes: { route: string; count: number }[]
}

export default function DashboardCharts({ weeklyKm, topRoutes }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="glass-card">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-5">KM per Day</h2>
        {weeklyKm.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-white/20 text-sm">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyKm} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0c0c18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                cursor={{ fill: "rgba(99,102,241,0.08)" }}
              />
              <Bar dataKey="km" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="glass-card">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-5">Top Routes</h2>
        {topRoutes.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-white/20 text-sm">No data yet</div>
        ) : (
          <div className="space-y-4">
            {topRoutes.map((r, i) => (
              <div key={r.route} className="flex items-center gap-3">
                <span className="text-xs text-white/20 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/60 truncate mb-1.5">{r.route}</div>
                  <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(r.count / (topRoutes[0]?.count || 1)) * 100}%`, background: "linear-gradient(90deg, #3b82f6, #6366f1)" }} />
                  </div>
                </div>
                <span className="text-xs text-white/25 shrink-0">{r.count}×</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
