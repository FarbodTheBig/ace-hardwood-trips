"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { generateTripPDF } from "@/lib/pdfGenerator"
import { TripSheet } from "@/types"

interface Trip extends TripSheet {
  id: string
  created_at: string
}

export default function AdminTripsClient({ trips: initialTrips }: { trips: Trip[] }) {
  const [trips, setTrips] = useState(initialTrips)
  const [search, setSearch] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)

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

  function handlePDF(trip: Trip) {
    generateTripPDF(trip)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All Trips</h1>
        <p className="text-gray-400 text-sm mt-1">{trips.length} total trip{trips.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <input
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Search by driver, trip #, truck #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">🚛</div>
          <p className="text-gray-400">No trips found</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Driver</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Trip #</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Truck</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">KM</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Stops</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((trip) => (
                  <tr key={trip.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-600/20 rounded-full flex items-center justify-center text-red-400 font-semibold text-xs shrink-0">
                          {(trip.driver_name || "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium truncate max-w-[120px]">{trip.driver_name || "—"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{trip.trip_numbers || "—"}</td>
                    <td className="py-3 px-4 text-gray-300">{trip.truck_number || "—"}</td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(trip.created_at).toLocaleDateString("en-CA")}
                    </td>
                    <td className="py-3 px-4 text-red-400 font-semibold text-right">
                      {trip.total_km?.toLocaleString() || 0}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-right">
                      {trip.stops?.length || 0}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handlePDF(trip)}
                          className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1.5 rounded-lg transition-colors"
                          title="Export PDF"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => handleDelete(trip.id)}
                          disabled={deleting === trip.id}
                          className="text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete trip"
                        >
                          {deleting === trip.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
