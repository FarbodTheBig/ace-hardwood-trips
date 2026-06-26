import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import TripForm from "@/components/trip/TripForm"

export default async function NewTripPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const userName = user.user_metadata?.full_name || user.email || "Driver"
  return <TripForm userId={user.id} userName={userName} />
}
