import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminDriversClient from "@/components/admin/AdminDriversClient"

export default async function AdminDriversPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  const { data: adminData } = await supabase.from("admin_users").select("*").eq("id", user.id).single()
  if (!adminData) redirect("/admin/login")

  const { data: trips } = await supabase.from("trip_sheets").select("user_id, driver_name, total_km, created_at")
  const { data: profiles } = await supabase.from("driver_profiles").select("*")
  const allTrips = trips || []
  const allProfiles = profiles || []

  const driverMap: Record<string, { id: string; name: string; email: string; phone: string; truck_number: string; km: number; trips: number; last_trip: string; status: string }> = {}

  allProfiles.forEach((p) => {
    driverMap[p.id] = {
      id: p.id,
      name: p.full_name || "Unknown",
      email: p.email || "",
      phone: p.phone || "",
      truck_number: p.truck_number || "",
      km: 0,
      trips: 0,
      last_trip: p.created_at,
      status: p.status || "active",
    }
  })

  allTrips.forEach((t) => {
    if (!driverMap[t.user_id]) {
      driverMap[t.user_id] = { id: t.user_id, name: t.driver_name || "Unknown", email: "", phone: "", truck_number: "", km: 0, trips: 0, last_trip: t.created_at, status: "active" }
    }
    driverMap[t.user_id].km += t.total_km || 0
    driverMap[t.user_id].trips += 1
    if (t.created_at > driverMap[t.user_id].last_trip) driverMap[t.user_id].last_trip = t.created_at
  })

  return <AdminDriversClient drivers={Object.values(driverMap)} />
}
