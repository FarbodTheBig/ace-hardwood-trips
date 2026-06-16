"use client"

import { useState } from "react"
import { TripSheet } from "@/types"

interface Trip extends TripSheet {
  id: string
  created_at: string
}

export default function ReportsClient({ trips }: { trips: Trip[] }) {
  const [filterDriver, setFilterDriver] = useState("")
  const [filterFrom, setFilterFrom] = useState("")
  const [filterTo, setFilterTo] = useState("")
  const [filterTruck, setFilterTruck] = useState("")

  const driverNames: string[] = []
  trips.forEach((t) => { if (t.driver_name && !driverNames.includes(t.driver_name)) driverNames.push(t.driver_name) })

  const truckNumbers: string[] = []
  trips.forEach((t) => { if (t.truck_number && !truckNumbers.includes(t.truck_number)) truckNumbers.push(t.truck_number) })

  const filtered = trips.filter((t) => {
    const date = new Date(t.created_at)
    const from = filterFrom ? new Date(filterFrom) : null
    const to = filterTo ? new Date(filterTo) : null
    return (
      (!filterDriver || t.driver_name === filterDriver) &&
      (!filterTruck || t.truck_number === filterTruck) &&
      (!from || date >= from) &&
      (!to || date <= to)
    )
  })

  const totalKm = filtered.reduce((sum, t) => sum + (t.total_km || 0), 0)
  const totalMiles = filtered.reduce((sum, t) => sum + (t.total_miles || 0), 0)

  const driverSummary: Record<string, { trips: number; km: number }> = {}
  filtered.forEach((t) => {
    const name = t.driver_name || "Unknown"
    if (!driverSummary[name]) driverSummary[name] = { trips: 0, km: 0 }
    driverSummary[name].trips += 1
    driverSummary[name].km += t.total_km || 0
  })

  function exportCSV() {
    const headers = ["Driver", "Trip #", "Truck", "Date", "Start KM", "End KM", "Total KM", "Total Miles", "Stops", "Status"]
    const rows = filtered.map((t) => [
      t.driver_name || "",
      t.trip_numbers || "",
      t.truck_number || "",
      new Date(t.created_at).toLocaleDateString("en-CA"),
      t.start_km || "",
      t.end_km || "",
      t.total_km?.toString() || "0",
      t.total_miles?.toString() || "0",
      t.stops?.length?.toString() || "0",
      (t as Record<string, unknown>).status as string || "pending",
    ])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ace-hardwood-trips-${new Date().toLocaleDateString("en-CA")}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} trips matching filters</p>
        </div>
        <button onClick={exportCSV} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export CSV
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Driver</label>
          <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100" value={filterDriver} onChange={(e) => setFilterDriver(e.target.value)}>
            <option value="">All Drivers</option>
            {driverNames.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Truck</label>
          <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100" value={filterTruck} onChange={(e) => setFilterTruck(e.target.value)}>
            <option value="">All Trucks</option>
            {truckNumbers.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">From Date</label>
          <input type="date" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To Date</label>
          <input type="date" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Trips", value: filtered.length },
          { label: "Total KM", value: totalKm.toLocaleString() },
          { label: "Total Miles", value: totalMiles.toLocaleString() },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="font-semibold text-white mb-4">Summary by Driver</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left py-2 px-3 text-gray-400 font-medium">Driver</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium">Trips</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium">Total KM</th>
              <th className="text-right py-2 px-3 text-gray-400 font-medium">Avg KM/Trip</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(driverSummary).sort((a, b) => b[1].km - a[1].km).map(([name, stats]) => (
              <tr key={name} className="border-b border-gray-800/50">
                <td className="py-3 px-3 text-white">{name}</td>
                <td className="py-3 px-3 text-gray-300 text-right">{stats.trips}</td>
                <td className="py-3 px-3 text-red-400 font-semibold text-right">{stats.km.toLocaleString()}</td>
                <td className="py-3 px-3 text-gray-300 text-right">{Math.round(stats.km / stats.trips).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
