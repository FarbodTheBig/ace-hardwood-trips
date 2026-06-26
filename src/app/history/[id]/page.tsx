import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import TripDetailClient from "@/components/trip/TripDetailClient"

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: sheet } = await supabase.from("trip_sheets").select("*").eq("id", id).eq("user_id", user.id).single()
  if (!sheet) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <Link href="/history" className="text-[11px] text-[#94a3b8] hover:text-[#2563eb] mb-1 block">← Back to History</Link>
          <h1 className="page-title">{sheet.company_name || "Trip Sheet"}</h1>
          <p className="page-sub">{sheet.start_date || sheet.start_date_time} → {sheet.end_date || sheet.end_date_time} · {sheet.driver_name}</p>
        </div>
        <TripDetailClient sheet={sheet} />
      </div>

      <div className="card">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total KM", value: sheet.total_km?.toLocaleString() || "0" },
            { label: "Total Miles", value: sheet.total_miles?.toFixed(1) || "0" },
            { label: "Start KM", value: sheet.start_km || "—" },
            { label: "End KM", value: sheet.end_km || "—" },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="text-[18px] font-bold text-[#0f1a35]">{s.value}</div>
              <div className="text-[10px] text-[#94a3b8] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="section-title">Trips</h2>
        {(sheet.trips || []).length === 0 ? (
          <p className="text-[#94a3b8] text-sm">No trips recorded</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#d8e0ec]">
                  {["Date", "Type", "Starting Point", "Destination", "Trip #", "Trailer #", "Truck #"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(sheet.trips || []).map((t: Record<string, string>, i: number) => (
                  <tr key={i} className="border-b border-[#f0f4f8]">
                    <td className="py-2.5 px-3 text-[#0f1a35] text-[12px]">{t.date}</td>
                    <td className="py-2.5 px-3 text-[#0f1a35] text-[12px]">{t.type}</td>
                    <td className="py-2.5 px-3 text-[#64748b] text-[12px]">{t.starting_point}</td>
                    <td className="py-2.5 px-3 text-[#64748b] text-[12px]">{t.destination}</td>
                    <td className="py-2.5 px-3 text-[#0f1a35] text-[12px] font-medium">{t.trip_number}</td>
                    <td className="py-2.5 px-3 text-[#64748b] text-[12px]">{t.trailer_number}</td>
                    <td className="py-2.5 px-3 text-[#64748b] text-[12px]">{t.truck_number}</td>
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
