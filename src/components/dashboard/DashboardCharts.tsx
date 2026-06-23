"use client"

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"

interface Props {
  weeklyKm: { week: string; km: number }[]
  topRoutes: { route: string; count: number }[]
}

export default function DashboardCharts({ weeklyKm, topRoutes }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly KM */}
      <div className="card">
        <h2 className="font-semibold text-white mb-6">KM per Day</h2>
        {weeklyKm.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyKm} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="week"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#f9fafb",
                  fontSize: "12px",
                }}
                cursor={{ fill: "rgba(249,115,22,0.1)" }}
              />
              <Bar dataKey="km" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Routes */}
      <div className="card">
        <h2 className="font-semibold text-white mb-6">Top Routes</h2>
        {topRoutes.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
            No data yet
          </div>
        ) : (
          <div className="space-y-3">
            {topRoutes.map((r, i) => (
              <div key={r.route} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-200 truncate">{r.route}</div>
                  <div className="mt-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{
                        width: `${(r.count / (topRoutes[0]?.count || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{r.count}x</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
