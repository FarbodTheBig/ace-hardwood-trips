import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import DriverDetailClient from "@/components/admin/DriverDetailClient"

export default async function DriverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")
  const { data: adminData } = await supabase.from("admin_users").select("*").eq("id", user.id).single()
  if (!adminData) redirect("/admin/login")

  const { data: profile } = await supabase.from("driver_profiles").select("*").eq("id", id).single()
  const { data: trips } = await supabase.from("trip_sheets").select("*").eq("user_id", id).order("created_at", { ascending: false })
  const { data: messages } = await supabase.from("driver_messages").select("*").eq("driver_id", id).order("created_at", { ascending: false })
  const { data: loads } = await supabase.from("loads").select("*").eq("driver_id", id).order("created_at", { ascending: false })

  return (
    <DriverDetailClient
      driverId={id}
      profile={profile}
      trips={trips || []}
      messages={messages || []}
      loads={loads || []}
      adminId={user.id}
    />
  )
}
