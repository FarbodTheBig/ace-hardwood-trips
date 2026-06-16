"use client"

import { useState } from "react"
import Link from "next/link"

interface Load {
  id: string
  driver_id: string
  title: string
  status: string
  pickup_address: string
  delivery_address: string
  pickup_date: string
  load_number: string
}

interface Profile {
  id: string
  full_name: string
  truck_number: string
  status: string
}

interface RecentTrip {
  user_id: string
  created_at: string
}

export default function DispatchBoard({ loads, profiles, recentTrips }: { loads: Load[]; profiles: Profile[]; recentTrips: RecentTrip[] }) {
  const [statusFilter, setStatusFilter] = useState("all")

  // Figure out who's active (trip in last 24h)
  const activeDriverIds = new Set(
    recentTrips
      .filter((t) => new Date(t.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000))
      .map((t) => t.user_id)
  )

  const assignedDriverIds = new Set(loads.filter((l) => l.status === "assigned").map((l) => l.driver_id))

  const filteredLoads = loads.filter((l) => statusFilter === "all" || l.status === statusFilter)

  const statusCounts = {
    all: loads.length,
    assigned: loads.filter((l) => l.status === "assigned").length,
    completed: loads.filter((l) => l.status === "completed").length,
    cancelled: loads.filter((l) => l.status === "cancelled").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dispatch Board</h1>
        <p className="text-gray-400 text-sm mt-1">Live overview of drivers and loads</p>
      </div>

      {/* Driver Status Board */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="font-semibold text-white mb-4">Driver Status</h2>
        {profiles.length === 0 ? (
          <p className="text-gray-500 text-sm">No drivers yet</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {profiles.map((p) => {
              const isActive = activeDriverIds.has(p.id)
              const hasLoad = assignedDriverIds.has(p.id)
              const status = p.status === "inactive" ? "inactive" : isActive ? "on-trip" : hasLoad ? "assigned" : "available"
              const statusColors = {
                "on-trip": "border-green-500/50 bg-green-900/10",
                "assigned": "border-blue-500/50 bg-blue-900/10",
                "available": "border-gray-700 bg-gray-800/50",
                "inactive": "border-gray-800 bg-gray-900 opacity-50",
              }
              const statusLabels = {
                "on-trip": { label: "On Trip", color: "text-green-400" },
                "assigned": { label: "Has Load", color: "text-blue-400" },
                "available": { label: "Available", color: "text-gray-400" },
                "inactive": { label: "Inactive", color: "text-gray-600" },
              }
              return (
                <Link key={p.id} href={`/admin/drivers/${p.id}`} className={`border rounded-xl p-3 transition-colors hover:bg-gray-800 ${statusColors[status]}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center text-red-400 font-semibold text-xs shrink-0">
                      {p.full_name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white text-sm font-medium truncate">{p.full_name}</div>
                      <div className="text-xs text-gray-500 truncate">{p.truck_number || "No truck"}</div>
                    </div>
                  </div>
                  <div className={`text-xs font-semibold ${statusLabels[status].color}`}>
                    ● {statusLabels[status].label}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Load Board */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Load Board</h2>
          <div className="flex gap-1">
            {(["all", "assigned", "completed", "cancelled"] as const).map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${statusFilter === s ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)} ({statusCounts[s]})
              </button>
            ))}
          </div>
        </div>

        {filteredLoads.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No loads found</p>
        ) : (
          <div className="space-y-3">
            {filteredLoads.map((load) => {
              const driver = profiles.find((p) => p.id === load.driver_id)
              return (
                <div key={load.id} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-white">{load.title || `Load ${load.load_number}`}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${load.status === "assigned" ? "bg-blue-900/30 text-blue-400" : load.status === "completed" ? "bg-green-900/30 text-green-400" : "bg-gray-700 text-gray-400"}`}>
                        {load.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      📍 {load.pickup_address} → {load.delivery_address}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Pickup: {load.pickup_date} · Driver: {driver?.full_name || "Unknown"}
                    </div>
                  </div>
                  <Link href={`/admin/drivers/${load.driver_id}`} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg ml-4 shrink-0">
                    View Driver
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
