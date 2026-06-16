import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DispatchBoard from "@/components/admin/DispatchBoard"

export default async function DispatchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  const { data: adminData } = await supabase.from("admin_users").select("*").eq("id", user.id).single()
  if (!adminData) redirect("/admin/login")

  const { data: loads } = await supabase.from("loads").select("*").order("created_at", { ascending: false })
  const { data: profiles } = await supabase.from("driver_profiles").select("*")
  const { data: trips } = await supabase.from("trip_sheets").select("user_id, created_at").order("created_at", { ascending: false })

  return <DispatchBoard loads={loads || []} profiles={profiles || []} recentTrips={trips || []} />
}
