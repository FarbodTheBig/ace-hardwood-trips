import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ReportsClient from "@/components/admin/ReportsClient"

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  const { data: adminData } = await supabase.from("admin_users").select("*").eq("id", user.id).single()
  if (!adminData) redirect("/admin/login")

  const { data: trips } = await supabase.from("trip_sheets").select("*").order("created_at", { ascending: false })
  return <ReportsClient trips={trips || []} />
}
