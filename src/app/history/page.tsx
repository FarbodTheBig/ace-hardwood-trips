import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: trips } = await supabase
    .from("trip_sheets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const allTrips = trips || []

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Trip History</h1>
          <p className="text-gray-400 text-sm mt-1">{allTrips.length} trip{allTrips.length !== 1 ? "s" : ""} on record</p>
        </div>
        <Link href="/trip/new" className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Trip
        </Link>
      </div>

      {allTrips.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-4">🚛</div>
          <h2 className="text-xl font-semibold text-white mb-2">No trips yet</h2>
          <p className="text-gray-400 mb-6">Your completed trip sheets will appear here.</p>
          <Link href="/trip/new" className="btn-primary inline-block">
            Create First Trip Sheet
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {allTrips.map((trip) => (
            <Link
              key={trip.id}
              href={`/history/${trip.id}`}
              className="card hover:bg-gray-800 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-white">
                    Trip {trip.trip_numbers || "—"}
                  </div>
                  <div className="text-sm text-gray-400">
                    {trip.truck_number || "No truck"} ·{" "}
                    {trip.stops?.length || 0} stop{(trip.stops?.length || 0) !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-brand-400 font-semibold">
                  {trip.total_km?.toLocaleString() || 0} km
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(trip.created_at).toLocaleDateString("en-CA", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-400 ml-4 shrink-0 transition-colors"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
