"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TripRow } from "@/types"
import { generateTripPDF } from "@/lib/pdfGenerator"

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

const TRIP_TYPES = [
  "Pickup Load",
  "Delivery",
  "Pickup Trailer/Truck",
  "Drop Trailer (Empty)",
  "Pickup Empty Trailer",
  "Drop Trailer",
  "Return to Terminal",
  "Bobtail",
  "Other",
]

export default function TripForm({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [companyName, setCompanyName] = useState("Ace Hardwood Inc.")
  const [driverName, setDriverName] = useState(userName)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [startKm, setStartKm] = useState("")
  const [endKm, setEndKm] = useState("")
  const [signature, setSignature] = useState("")
  const [sigDate, setSigDate] = useState("")
  const [trips, setTrips] = useState<TripRow[]>([])
  const [error, setError] = useState("")

  const totalKm = endKm && startKm ? Math.max(0, parseFloat(endKm.replace(/,/g, "")) - parseFloat(startKm.replace(/,/g, ""))) : 0
  const totalMiles = parseFloat((totalKm * 0.621371).toFixed(1))

  function addTrip() {
    setTrips((prev) => [...prev, {
      id: generateId(),
      date: "",
      type: "",
      starting_point: "",
      destination: "",
      trip_number: "",
      trailer_number: "",
      truck_number: "",
    }])
  }

  function updateTrip(id: string, field: keyof TripRow, value: string) {
    setTrips((prev) => prev.map((t) => t.id === id ? { ...t, [field]: value } : t))
  }

  function removeTrip(id: string) {
    setTrips((prev) => prev.filter((t) => t.id !== id))
  }

  async function handleSave() {
    if (!startDate || !endDate || !startKm) { setError("Please fill in dates and start KM"); return }
    setSaving(true)
    setError("")
    const supabase = createClient()
    const payload = {
      user_id: userId,
      company_name: companyName,
      driver_name: driverName,
      start_date: startDate,
      end_date: endDate,
      start_km: startKm,
      end_km: endKm,
      total_km: totalKm,
      total_miles: totalMiles,
      trips,
      driver_signature: signature,
      signature_date: sigDate,
      // legacy compat
      trip_numbers: trips.map((t) => t.trip_number).filter(Boolean).join(" / "),
      truck_number: trips[0]?.truck_number || "",
      start_date_time: startDate,
      end_date_time: endDate,
      stops: [],
    }
    const { error } = await supabase.from("trip_sheets").insert(payload)
    if (error) { setError(error.message); setSaving(false) }
    else { router.push("/history"); router.refresh() }
  }

  function handleExportPDF() {
    generateTripPDF({
      company_name: companyName,
      driver_name: driverName,
      start_date: startDate,
      end_date: endDate,
      start_km: startKm,
      end_km: endKm,
      total_km: totalKm,
      total_miles: totalMiles,
      trips,
      driver_signature: signature,
      signature_date: sigDate,
      trip_numbers: trips.map((t) => t.trip_number).filter(Boolean).join(" / "),
      truck_number: "",
      start_date_time: startDate,
      end_date_time: endDate,
      stops: [],
    })
  }

  const inputCls = "w-full border border-[#d8e0ec] rounded-lg px-3 py-2 text-sm text-[#0f1a35] bg-white placeholder-[#94a3b8] focus:outline-none focus:border-[#2563eb] transition-all"
  const labelCls = "block text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-1.5"

  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Trip Sheet</h1>
          <p className="page-sub">14-day period log</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportPDF} className="btn-secondary text-sm flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Export PDF
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            {saving ? "Saving..." : "Save Sheet"}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Header Info */}
      <div className="card">
        <h2 className="section-title">Sheet Information</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>Company Name</label>
            <input className={inputCls} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name" />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Driver Name</label>
            <input className={inputCls} value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Driver name" />
          </div>
          <div>
            <label className={labelCls}>Start Date</label>
            <input type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>End Date</label>
            <input type="date" className={inputCls} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Start KM</label>
            <input className={inputCls} value={startKm} onChange={(e) => setStartKm(e.target.value)} placeholder="e.g. 1,417,535" />
          </div>
          <div>
            <label className={labelCls}>End KM</label>
            <input className={inputCls} value={endKm} onChange={(e) => setEndKm(e.target.value)} placeholder="e.g. 1,421,406" />
          </div>
          <div>
            <label className={labelCls}>Total KM (auto)</label>
            <div className="w-full border border-[#bfdbfe] rounded-lg px-3 py-2 text-sm text-[#2563eb] font-bold bg-[#eff6ff]">
              {totalKm.toLocaleString() || "—"}
            </div>
          </div>
          <div>
            <label className={labelCls}>Total Miles (auto)</label>
            <div className="w-full border border-[#bfdbfe] rounded-lg px-3 py-2 text-sm text-[#2563eb] font-bold bg-[#eff6ff]">
              {totalMiles.toLocaleString() || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Trip Rows */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Trips <span className="ml-2 bg-[#eff6ff] text-[#2563eb] text-[10px] font-bold px-2 py-0.5 rounded-full">{trips.length}</span></h2>
          <button onClick={addTrip} className="btn-primary text-xs flex items-center gap-1.5 py-1.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4"/></svg>
            Add Trip
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-[#d8e0ec] rounded-xl">
            <p className="text-[#94a3b8] text-sm mb-3">No trips added yet</p>
            <button onClick={addTrip} className="btn-primary text-sm">+ Add First Trip</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {trips.map((trip, idx) => (
              <div key={trip.id} className="bg-[#f8fafc] border border-[#d8e0ec] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-widest">Trip {idx + 1}</span>
                  <button onClick={() => removeTrip(trip.id)} className="text-[#cbd5e1] hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className={labelCls}>Date</label>
                    <input type="date" className={inputCls} value={trip.date} onChange={(e) => updateTrip(trip.id, "date", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Type</label>
                    <select className={inputCls} value={trip.type} onChange={(e) => updateTrip(trip.id, "type", e.target.value)}>
                      <option value="">Select type...</option>
                      {TRIP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Starting Point</label>
                    <input className={inputCls} value={trip.starting_point} onChange={(e) => updateTrip(trip.id, "starting_point", e.target.value)} placeholder="Address or city" />
                  </div>
                  <div>
                    <label className={labelCls}>Destination</label>
                    <input className={inputCls} value={trip.destination} onChange={(e) => updateTrip(trip.id, "destination", e.target.value)} placeholder="Address or city" />
                  </div>
                  <div>
                    <label className={labelCls}>Trip #</label>
                    <input className={inputCls} value={trip.trip_number} onChange={(e) => updateTrip(trip.id, "trip_number", e.target.value)} placeholder="e.g. 1225" />
                  </div>
                  <div>
                    <label className={labelCls}>Trailer #</label>
                    <input className={inputCls} value={trip.trailer_number} onChange={(e) => updateTrip(trip.id, "trailer_number", e.target.value)} placeholder="e.g. PV1021" />
                  </div>
                  <div>
                    <label className={labelCls}>Truck #</label>
                    <input className={inputCls} value={trip.truck_number} onChange={(e) => updateTrip(trip.id, "truck_number", e.target.value)} placeholder="e.g. 0013 - Volvo" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Signature */}
      <div className="card">
        <h2 className="section-title">Signature</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Driver Signature</label>
            <input className={inputCls} value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="Type your full name as signature" />
          </div>
          <div>
            <label className={labelCls}>Date Signed</label>
            <input type="date" className={inputCls} value={sigDate} onChange={(e) => setSigDate(e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  )
}
