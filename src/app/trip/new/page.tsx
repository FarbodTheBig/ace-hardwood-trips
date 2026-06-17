import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import TripForm from "@/components/trip/TripForm"

export default async function NewTripPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const driverName = user.user_metadata?.full_name || user.email || "Driver"

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">New Trip Sheet</h1>
        <p className="text-gray-400 text-sm mt-1">Fill in the trip details and save when done.</p>
      </div>
      <TripForm driverName={driverName} userId={user.id} />
    </div>
  )
}
