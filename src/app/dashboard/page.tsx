import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import DashboardCharts from "@/components/dashboard/DashboardCharts"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: trips } = await supabase
    .from("trip_sheets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  const allTrips = trips || []

  const totalTrips = allTrips.length
  const totalKm = allTrips.reduce((sum, t) => sum + (t.total_km || 0), 0)

  const now = new Date()
  const thisMonth = allTrips.filter((t) => {
    const d = new Date(t.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const tripsThisMonth = thisMonth.length
  const kmThisMonth = thisMonth.reduce((sum, t) => sum + (t.total_km || 0), 0)

  // Daily KM — one bar per day that had a trip, last 30 days
  const dailyMap: Record<string, number> = {}
  allTrips.forEach((t) => {
    const d = new Date(t.created_at)
    const key = d.toLocaleDateString("en-CA", { month: "short", day: "numeric" })
    dailyMap[key] = (dailyMap[key] || 0) + (t.total_km || 0)
  })
  const weeklyKm = Object.entries(dailyMap)
    .slice(-14)
    .map(([week, km]) => ({ week, km }))

  // Top routes
  const routeMap: Record<string, number> = {}
  allTrips.forEach((t) => {
    if (t.stops && t.stops.length >= 2) {
      const first = t.stops[0]?.address?.split(",")[0] || "Unknown"
      const last = t.stops[t.stops.length - 1]?.address?.split(",")[0] || "Unknown"
      const route = `${first} → ${last}`
      routeMap[route] = (routeMap[route] || 0) + 1
    }
  })
  const topRoutes = Object.entries(routeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([route, count]) => ({ route, count }))

  const userName = user.user_metadata?.full_name || "Driver"

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {userName.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Here&apos;s your driving summary</p>
        </div>
        <Link href="/trip/new" className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Trip
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Trips", value: totalTrips.toString(), icon: "🚛" },
          { label: "Total KM", value: totalKm.toLocaleString(), icon: "📍" },
          { label: "Trips This Month", value: tripsThisMonth.toString(), icon: "📅" },
          { label: "KM This Month", value: kmThisMonth.toLocaleString(), icon: "⚡" },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <DashboardCharts weeklyKm={weeklyKm} topRoutes={topRoutes} />

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Recent Trips</h2>
          <Link href="/history" className="text-sm text-brand-500 hover:text-brand-400">View all →</Link>
        </div>
        {allTrips.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">🚛</div>
            <p>No trips yet. Start by creating your first trip sheet.</p>
            <Link href="/trip/new" className="btn-primary inline-block mt-4">Create Trip Sheet</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Trip #</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Truck</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Date</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">KM</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Stops</th>
                </tr>
              </thead>
              <tbody>
                {[...allTrips].reverse().slice(0, 5).map((trip) => (
                  <tr key={trip.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-3 px-3 text-white font-medium">{trip.trip_numbers || "—"}</td>
                    <td className="py-3 px-3 text-gray-300">{trip.truck_number || "—"}</td>
                    <td className="py-3 px-3 text-gray-300">{new Date(trip.created_at).toLocaleDateString("en-CA")}</td>
                    <td className="py-3 px-3 text-gray-300 text-right">{trip.total_km?.toLocaleString() || "0"}</td>
                    <td className="py-3 px-3 text-gray-300 text-right">{trip.stops?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
