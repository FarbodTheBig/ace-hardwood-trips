import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")

  const { data: adminData } = await supabase.from("admin_users").select("*").eq("id", user.id).single()
  if (!adminData) redirect("/admin/login")

  const { data: allTrips } = await supabase.from("trip_sheets").select("*").order("created_at", { ascending: false })
  const trips = allTrips || []

  const totalTrips = trips.length
  const totalKm = trips.reduce((sum, t) => sum + (t.total_km || 0), 0)

  const now = new Date()
  const thisMonth = trips.filter((t) => {
    const d = new Date(t.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const driverIds: string[] = []
  trips.forEach((t) => { if (!driverIds.includes(t.user_id)) driverIds.push(t.user_id) })
  const uniqueDrivers = driverIds.length

  const driverMap: Record<string, { name: string; km: number; trips: number }> = {}
  trips.forEach((t) => {
    if (!driverMap[t.user_id]) {
      driverMap[t.user_id] = { name: t.driver_name || "Unknown", km: 0, trips: 0 }
    }
    driverMap[t.user_id].km += t.total_km || 0
    driverMap[t.user_id].trips += 1
  })
  const topDrivers = Object.values(driverMap).sort((a, b) => b.km - a.km).slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-[#64748b] text-sm mt-1">Overview of all drivers and trips</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Drivers", value: uniqueDrivers.toString(), icon: "👷" },
          { label: "Total Trips", value: totalTrips.toString(), icon: "🚛" },
          { label: "Total KM", value: totalKm.toLocaleString(), icon: "📍" },
          { label: "Trips This Month", value: thisMonth.length.toString(), icon: "📅" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[#d8e0ec] rounded-xl p-6">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-[#64748b] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#d8e0ec] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Top Drivers by KM</h2>
            <Link href="/admin/drivers" className="text-sm text-red-400 hover:text-red-300">View all →</Link>
          </div>
          {topDrivers.length === 0 ? (
            <p className="text-[#94a3b8] text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topDrivers.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-[#94a3b8] w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#0f1a35] truncate">{d.name}</div>
                    <div className="mt-1 h-1.5 bg-[#f8fafc] rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 rounded-full" style={{ width: `${(d.km / (topDrivers[0]?.km || 1)) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-[#64748b] shrink-0">{d.km.toLocaleString()} km</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-[#d8e0ec] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Trips</h2>
            <Link href="/admin/trips" className="text-sm text-red-400 hover:text-red-300">View all →</Link>
          </div>
          {trips.length === 0 ? (
            <p className="text-[#94a3b8] text-sm">No trips yet</p>
          ) : (
            <div className="space-y-2">
              {trips.slice(0, 5).map((trip) => (
                <div key={trip.id} className="flex items-center justify-between py-2 border-b border-[#d8e0ec]/50">
                  <div>
                    <div className="text-sm text-white font-medium">{trip.driver_name || "Unknown"}</div>
                    <div className="text-xs text-[#94a3b8]">Trip {trip.trip_numbers || "—"} · {trip.truck_number || "—"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-red-400 font-semibold">{trip.total_km?.toLocaleString() || 0} km</div>
                    <div className="text-xs text-[#94a3b8]">{new Date(trip.created_at).toLocaleDateString("en-CA")}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
