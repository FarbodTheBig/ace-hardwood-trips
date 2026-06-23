"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { generateTripPDF } from "@/lib/pdfGenerator"
import { TripSheet, TripStop } from "@/types"
import { v4 as uuidv4 } from "uuid"
import PhotoUpload from "./PhotoUpload"

const STOP_TYPES = [
  "Pickup Trailer/Truck",
  "Drop Trailer (Empty)",
  "Pickup Empty Trailer",
  "Pickup Load",
  "Delivery",
  "Drop Trailer",
  "Return to Terminal",
  "Other",
]

function blankStop(): TripStop {
  return {
    id: uuidv4(),
    date: "",
    time: "",
    type: "",
    address: "",
    trip_number: "",
    trailer_number: "",
  }
}

function AddressInput({ value, onChange, disabled, placeholder }: {
  value: string; onChange: (val: string) => void; disabled?: boolean; placeholder?: string
}) {
  const [suggestions, setSuggestions] = useState<{ display_name: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) { setSuggestions([]); return }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ca&limit=5`,
        { headers: { "Accept-Language": "en" } }
      )
      const data = await res.json()
      setSuggestions(data)
      setShowSuggestions(true)
    } catch { setSuggestions([]) }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    onChange(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 400)
  }

  function handleSelect(addr: string) {
    onChange(addr)
    setSuggestions([])
    setShowSuggestions(false)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowSuggestions(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <input className="input-field" placeholder={placeholder || "Start typing address..."} value={value}
        onChange={handleChange} disabled={disabled} autoComplete="off" />
      {showSuggestions && suggestions.length > 0 && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
          {suggestions.map((s, i) => (
            <button key={i} type="button"
              className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0"
              onMouseDown={() => handleSelect(s.display_name)}>
              {s.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DatePickerInput({ value, onChange, disabled }: {
  value: string; onChange: (val: string) => void; disabled?: boolean
}) {
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

  function selectDay(day: number) {
    const d = new Date(viewYear, viewMonth, day)
    onChange(d.toLocaleDateString("en-CA", { day: "numeric", month: "short" }))
    setShow(false)
  }

  const selectedParts = value ? value.split(" ") : []
  const selectedDay = selectedParts.length === 2 ? parseInt(selectedParts[0]) : null
  const selectedMonth = selectedParts.length === 2 ? selectedParts[1] : null

  return (
    <div ref={ref} className="relative">
      <input className="input-field cursor-pointer" placeholder="e.g. 12 Jun" value={value}
        onClick={() => !disabled && setShow(true)} onChange={(e) => onChange(e.target.value)}
        disabled={disabled} readOnly={!disabled} />
      {show && (
        <div className="absolute z-50 mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-3 w-64">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) } else setViewMonth(m => m - 1) }}
              className="text-gray-400 hover:text-white p-1 rounded">‹</button>
            <span className="text-white text-sm font-semibold">{monthNames[viewMonth]} {viewYear}</span>
            <button type="button" onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) } else setViewMonth(m => m + 1) }}
              className="text-gray-400 hover:text-white p-1 rounded">›</button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
              <div key={d} className="text-center text-xs text-gray-500 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isSelected = selectedDay === day && selectedMonth === monthNames[viewMonth]
              return (
                <button key={day} type="button" onClick={() => selectDay(day)}
                  className={`text-center text-xs py-1.5 rounded-lg transition-colors ${isSelected ? "bg-brand-500 text-white" : "text-gray-300 hover:bg-gray-700"}`}>
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface Props {
  initialData?: TripSheet & { id?: string }
  driverName: string
  userId: string
  readOnly?: boolean
}

export default function TripForm({ initialData, driverName, userId, readOnly = false }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const tripId = useRef<string>(initialData?.id || uuidv4())

  const [form, setForm] = useState<TripSheet>(() => ({
    driver_name: driverName,
    company_name: "",
    trip_numbers: "",
    truck_number: "",
    start_date_time: "",
    end_date_time: "",
    start_km: "",
    end_km: "",
    total_km: 0,
    total_miles: 0,
    stops: [blankStop()],
    driver_signature: "",
    signature_date: new Date().toLocaleDateString("en-CA"),
    ...initialData,
  }))

  useEffect(() => {
    const start = parseFloat(form.start_km) || 0
    const end = parseFloat(form.end_km) || 0
    const totalKm = end > start ? end - start : 0
    setForm((f) => ({ ...f, total_km: totalKm, total_miles: parseFloat((totalKm * 0.621371).toFixed(2)) }))
  }, [form.start_km, form.end_km])

  useEffect(() => {
    const firstStopTripNum = form.stops[0]?.trip_number
    if (firstStopTripNum && !readOnly) {
      setForm((f) => ({ ...f, trip_numbers: firstStopTripNum }))
    }
  }, [form.stops, readOnly])

  function updateField(field: keyof TripSheet, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function updateStop(id: string, field: keyof TripStop, value: string) {
    setForm((f) => ({ ...f, stops: f.stops.map((s) => (s.id === id ? { ...s, [field]: value } : s)) }))
  }

  function addStop() {
    setForm((f) => ({ ...f, stops: [...f.stops, blankStop()] }))
  }

  function removeStop(id: string) {
    setForm((f) => ({ ...f, stops: f.stops.filter((s) => s.id !== id) }))
  }

  async function handleSave() {
    setSaving(true)
    setError("")
    const supabase = createClient()

    const payload = { ...form, id: tripId.current, user_id: userId }
    const { error: dbError } = await supabase.from("trip_sheets").upsert(payload)

    if (dbError) { setError(dbError.message) } else {
      setSaved(true)
      setTimeout(() => router.push("/history"), 1200)
    }
    setSaving(false)
  }

  const inputClass = readOnly
    ? "w-full bg-gray-800/40 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-300 cursor-not-allowed"
    : "input-field"

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-brand-500 rounded-full" />
          <h2 className="font-semibold text-white">Trip Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Company Name</label>
            <input className={inputClass} placeholder="e.g. Ace Hardwood Inc." value={form.company_name} onChange={(e) => updateField("company_name", e.target.value)} disabled={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Driver Name</label>
            <input className={inputClass} placeholder="Your full name" value={form.driver_name} onChange={(e) => updateField("driver_name", e.target.value)} disabled={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Trip Number(s) <span className="text-brand-500">(auto-filled from stops)</span>
            </label>
            <input className="w-full bg-brand-500/10 border border-brand-500/30 rounded-lg px-3 py-2 text-sm text-brand-400 font-semibold"
              value={form.trip_numbers} onChange={(e) => updateField("trip_numbers", e.target.value)}
              placeholder="Auto-filled from first stop" readOnly={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Truck #</label>
            <input className={inputClass} placeholder="e.g. 0013 - Volvo" value={form.truck_number}
              onChange={(e) => updateField("truck_number", e.target.value)} disabled={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Start Date / Time</label>
            <input type="datetime-local" className={inputClass} value={form.start_date_time}
              onChange={(e) => updateField("start_date_time", e.target.value)} disabled={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">End Date / Time</label>
            <input type="datetime-local" className={inputClass} value={form.end_date_time}
              onChange={(e) => updateField("end_date_time", e.target.value)} disabled={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Start KM</label>
            <input type="number" className={inputClass} placeholder="e.g. 1417535" value={form.start_km}
              onChange={(e) => updateField("start_km", e.target.value)} disabled={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">End KM</label>
            <input type="number" className={inputClass} placeholder="e.g. 1421406" value={form.end_km}
              onChange={(e) => updateField("end_km", e.target.value)} disabled={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Total KM <span className="text-brand-500">(auto)</span></label>
            <input className="w-full bg-brand-500/10 border border-brand-500/30 rounded-lg px-3 py-2 text-sm text-brand-400 font-semibold" value={form.total_km.toLocaleString()} readOnly />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Total Miles <span className="text-brand-500">(auto)</span></label>
            <input className="w-full bg-brand-500/10 border border-brand-500/30 rounded-lg px-3 py-2 text-sm text-brand-400 font-semibold" value={form.total_miles.toLocaleString()} readOnly />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-brand-500 rounded-full" />
            <h2 className="font-semibold text-white">Trip Stops</h2>
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{form.stops.length} stop{form.stops.length !== 1 ? "s" : ""}</span>
          </div>
          {!readOnly && (
            <button onClick={addStop} className="btn-secondary flex items-center gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Stop
            </button>
          )}
        </div>

        <div className="space-y-6">
          {form.stops.map((stop, i) => (
            <div key={stop.id} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stop {i + 1}</span>
                {!readOnly && form.stops.length > 1 && (
                  <button onClick={() => removeStop(stop.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date</label>
                  {readOnly ? (
                    <input className={inputClass} value={stop.date} disabled readOnly />
                  ) : (
                    <DatePickerInput value={stop.date} onChange={(v) => updateStop(stop.id, "date", v)} />
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Time</label>
                  <input type="time" className={readOnly ? inputClass : "input-field"} value={stop.time}
                    onChange={(e) => updateStop(stop.id, "time", e.target.value)} disabled={readOnly} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                  <select className={readOnly ? inputClass : "input-field"} value={stop.type}
                    onChange={(e) => updateStop(stop.id, "type", e.target.value)} disabled={readOnly}>
                    <option value="">Select type…</option>
                    {STOP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Address / Location</label>
                  {readOnly ? (
                    <input className={inputClass} value={stop.address} disabled readOnly />
                  ) : (
                    <AddressInput value={stop.address} onChange={(v) => updateStop(stop.id, "address", v)} />
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Trip #</label>
                  <input className={readOnly ? inputClass : "input-field"} placeholder="e.g. 1225" value={stop.trip_number}
                    onChange={(e) => updateStop(stop.id, "trip_number", e.target.value)} disabled={readOnly} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Trailer #</label>
                  <input className={readOnly ? inputClass : "input-field"} placeholder="e.g. PV1021" value={stop.trailer_number}
                    onChange={(e) => updateStop(stop.id, "trailer_number", e.target.value)} disabled={readOnly} />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">📎 Photos</p>
                <PhotoUpload
                  tripId={tripId.current}
                  stopIndex={i}
                  userId={userId}
                  readOnly={readOnly}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-brand-500 rounded-full" />
          <h2 className="font-semibold text-white">Driver Signature</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Signature (type your name)</label>
            <input className={inputClass} placeholder="Type full name as signature" value={form.driver_signature}
              onChange={(e) => updateField("driver_signature", e.target.value)} disabled={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
            <input type="date" className={inputClass} value={form.signature_date}
              onChange={(e) => updateField("signature_date", e.target.value)} disabled={readOnly} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 no-print">
        {!readOnly && (
          <button onClick={handleSave} disabled={saving || saved} className="btn-primary flex items-center gap-2">
            {saved ? <>✓ Saved — redirecting…</> : saving ? <>Saving…</> : (
              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>Save Trip</>
            )}
          </button>
        )}
        <button onClick={() => generateTripPDF(form)} className="btn-secondary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export PDF
        </button>
        <button onClick={() => window.print()} className="btn-ghost flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print
        </button>
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>
    </div>
  )
}
