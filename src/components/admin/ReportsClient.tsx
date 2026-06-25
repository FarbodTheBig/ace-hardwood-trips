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
      (t as unknown as Record<string, string>)["status"] || "pending",
    ])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `roadlog-trips-${new Date().toLocaleDateString("en-CA")}.csv`
    a.click()
  }

  const inputClass = "w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#ccc]"

  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-sub">{filtered.length} trips matching filters</p>
        </div>
        <button onClick={exportCSV} className="btn-primary text-sm flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Export CSV
        </button>
      </div>

      <div className="card grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="section-title block mb-1.5">Driver</label>
          <select className={inputClass} value={filterDriver} onChange={(e) => setFilterDriver(e.target.value)}>
            <option value="">All Drivers</option>
            {driverNames.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="section-title block mb-1.5">Truck</label>
          <select className={inputClass} value={filterTruck} onChange={(e) => setFilterTruck(e.target.value)}>
            <option value="">All Trucks</option>
            {truckNumbers.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="section-title block mb-1.5">From Date</label>
          <input type="date" className={inputClass} value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
        </div>
        <div>
          <label className="section-title block mb-1.5">To Date</label>
          <input type="date" className={inputClass} value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Trips", value: filtered.length },
          { label: "Total KM", value: totalKm.toLocaleString() },
          { label: "Total Miles", value: totalMiles.toLocaleString() },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="w-5 h-[2px] bg-[#3b82f6] rounded-full mb-3"></div>
            <div className="text-[22px] font-bold text-[#e8e8e8] tracking-tight">{s.value}</div>
            <div className="text-[10px] text-[#2e2e2e] font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="section-title mb-4">Summary by Driver</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              <th className="text-left py-2 px-3 text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-widest">Driver</th>
              <th className="text-right py-2 px-3 text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-widest">Trips</th>
              <th className="text-right py-2 px-3 text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-widest">Total KM</th>
              <th className="text-right py-2 px-3 text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-widest">Avg KM/Trip</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(driverSummary).sort((a, b) => b[1].km - a[1].km).map(([name, stats]) => (
              <tr key={name} className="border-b border-[#1a1a1a]">
                <td className="py-2.5 px-3 text-[#ccc] text-[12px]">{name}</td>
                <td className="py-2.5 px-3 text-[#555] text-right text-[12px]">{stats.trips}</td>
                <td className="py-2.5 px-3 text-[#3b82f6] font-semibold text-right text-[12px]">{stats.km.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-[#555] text-right text-[12px]">{Math.round(stats.km / stats.trips).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
