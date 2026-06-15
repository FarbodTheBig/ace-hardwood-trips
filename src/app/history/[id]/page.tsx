import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import TripForm from "@/components/trip/TripForm"

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: trip } = await supabase
    .from("trip_sheets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!trip) notFound()

  const driverName = user.user_metadata?.full_name || user.email || "Driver"

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/history" className="btn-ghost flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          History
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Trip {trip.trip_numbers || "—"}</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Saved on {new Date(trip.created_at).toLocaleDateString("en-CA", {
              weekday: "short", year: "numeric", month: "short", day: "numeric",
            })}
          </p>
        </div>
      </div>
      <TripForm driverName={driverName} initialData={trip} readOnly />
    </div>
  )
}
