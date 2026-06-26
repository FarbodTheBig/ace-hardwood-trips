"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { generateTripPDF } from "@/lib/pdfGenerator"
import { TripSheet } from "@/types"
import AdminPhotoViewer from "./AdminPhotoViewer"

interface Trip extends TripSheet {
  id: string
  created_at: string
}

export default function AdminTripsClient({ trips: initialTrips }: { trips: Trip[] }) {
  const [trips, setTrips] = useState(initialTrips)
  const [search, setSearch] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)
  const [expandedPhotos, setExpandedPhotos] = useState<string | null>(null)

  const filtered = trips.filter((t) => {
    const q = search.toLowerCase()
    return (
      (t.driver_name || "").toLowerCase().includes(q) ||
      (t.trip_numbers || "").toLowerCase().includes(q) ||
      (t.truck_number || "").toLowerCase().includes(q)
    )
  })

  async function handleDelete(id: string) {
    if (!confirm("Delete this trip permanently?")) return
    setDeleting(id)
    const supabase = createClient()
    await supabase.from("trip_sheets").delete().eq("id", id)
    setTrips((prev) => prev.filter((t) => t.id !== id))
    setDeleting(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All Trips</h1>
        <p className="text-[#64748b] text-sm mt-1">{trips.length} total trip{trips.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="bg-white border border-[#d8e0ec] rounded-xl p-4">
        <input className="w-full bg-[#f8fafc] border border-[#d8e0ec] rounded-lg px-3 py-2 text-sm text-[#0f1a35] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Search by driver, trip #, truck #..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-[#d8e0ec] rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">🚛</div>
          <p className="text-[#64748b]">No trips found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((trip) => (
            <div key={trip.id} className="bg-white border border-[#d8e0ec] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center text-red-400 font-semibold text-xs shrink-0">
                    {(trip.driver_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-medium">{trip.driver_name || "—"}</div>
                    <div className="text-xs text-[#94a3b8]">
                      Trip {trip.trip_numbers || "—"} · {trip.truck_number || "—"} · {new Date(trip.created_at).toLocaleDateString("en-CA")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-semibold text-sm">{trip.total_km?.toLocaleString() || 0} km</span>
                  <button
                    onClick={() => setExpandedPhotos(expandedPhotos === trip.id ? null : trip.id)}
                    className={`text-xs px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${expandedPhotos === trip.id ? "bg-brand-500/20 text-brand-400" : "bg-[#f8fafc] hover:bg-gray-700 text-[#0f1a35]"}`}>
                    📷 Photos
                  </button>
                  <button onClick={() => generateTripPDF(trip)}
                    className="text-xs bg-[#f8fafc] hover:bg-gray-700 text-[#0f1a35] px-2 py-1.5 rounded-lg transition-colors">
                    PDF
                  </button>
                  <button onClick={() => handleDelete(trip.id)} disabled={deleting === trip.id}
                    className="text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                    {deleting === trip.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>

              {expandedPhotos === trip.id && (
                <div className="border-t border-[#d8e0ec] p-4">
                  <AdminPhotoViewer tripId={trip.id} driverName={trip.driver_name || "driver"} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
