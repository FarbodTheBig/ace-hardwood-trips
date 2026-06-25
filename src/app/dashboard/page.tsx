import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import DashboardCharts from "@/components/dashboard/DashboardCharts"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: trips } = await supabase.from("trip_sheets").select("*").eq("user_id", user.id).order("created_at", { ascending: true })
  const allTrips = trips || []

  const totalTrips = allTrips.length
  const totalKm = allTrips.reduce((sum, t) => sum + (t.total_km || 0), 0)
  const now = new Date()
  const thisMonth = allTrips.filter((t) => {
    const d = new Date(t.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const kmThisMonth = thisMonth.reduce((sum, t) => sum + (t.total_km || 0), 0)

  const dailyMap: Record<string, number> = {}
  allTrips.forEach((t) => {
    const d = new Date(t.created_at)
    const key = d.toLocaleDateString("en-CA", { month: "short", day: "numeric" })
    dailyMap[key] = (dailyMap[key] || 0) + (t.total_km || 0)
  })
  const weeklyKm = Object.entries(dailyMap).slice(-14).map(([week, km]) => ({ week, km }))

  const routeMap: Record<string, number> = {}
  allTrips.forEach((t) => {
    if (t.stops && t.stops.length >= 2) {
      const first = t.stops[0]?.address?.split(",")[0] || "Unknown"
      const last = t.stops[t.stops.length - 1]?.address?.split(",")[0] || "Unknown"
      routeMap[`${first} → ${last}`] = (routeMap[`${first} → ${last}`] || 0) + 1
    }
  })
  const topRoutes = Object.entries(routeMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([route, count]) => ({ route, count }))
  const userName = user.user_metadata?.full_name || "Driver"

  const statTags = ["Trips", "KM", "Month", "KM"]
  const stats = [
    { label: "Total Trips", value: totalTrips.toString(), tag: "Trips" },
    { label: "Total KM", value: totalKm.toLocaleString(), tag: "KM" },
    { label: "Trips This Month", value: thisMonth.length.toString(), tag: "Month", green: true },
    { label: "KM This Month", value: kmThisMonth.toLocaleString(), tag: "KM", green: true },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Welcome back, {userName.split(" ")[0]}</p>
        </div>
        <Link href="/trip/new" className="btn-primary text-sm flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
          New Trip
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mb-3 ${stat.green ? "bg-emerald-50 text-emerald-600" : "bg-[#eff6ff] text-[#2563eb]"}`}>
              {stat.tag}
            </div>
            <div className="text-[22px] font-bold text-[#0f1a35] tracking-tight leading-none mb-1.5">{stat.value}</div>
            <div className="text-[10px] text-[#94a3b8] font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <DashboardCharts weeklyKm={weeklyKm} topRoutes={topRoutes} />

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Recent Trips</h2>
          <Link href="/history" className="text-[11px] text-[#2563eb] hover:text-[#1d4ed8]">View all →</Link>
        </div>
        {allTrips.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-3">🚛</div>
            <p className="text-[#94a3b8] text-sm mb-4">No trips yet</p>
            <Link href="/trip/new" className="btn-primary text-sm inline-block">Create Trip Sheet</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {[...allTrips].reverse().slice(0, 5).map((trip) => (
              <div key={trip.id} className="table-row">
                <div>
                  <div className="text-[12px] font-semibold text-[#0f1a35]">Trip {trip.trip_numbers || "—"}</div>
                  <div className="text-[10px] text-[#94a3b8] mt-0.5">{trip.truck_number || "—"} · {new Date(trip.created_at).toLocaleDateString("en-CA")} · {trip.stops?.length || 0} stops</div>
                </div>
                <div className="text-[12px] font-bold text-[#2563eb]">{trip.total_km?.toLocaleString() || 0} km</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
