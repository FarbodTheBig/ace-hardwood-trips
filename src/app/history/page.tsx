import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: sheets } = await supabase
    .from("trip_sheets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const allSheets = sheets || []

  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Trip History</h1>
          <p className="page-sub">{allSheets.length} sheet{allSheets.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link href="/trip/new" className="btn-primary text-sm flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
          New Sheet
        </Link>
      </div>

      {allSheets.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">🚛</div>
          <p className="text-[#94a3b8] mb-4">No trip sheets yet</p>
          <Link href="/trip/new" className="btn-primary text-sm inline-block">Create First Sheet</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {allSheets.map((sheet) => {
            const trips = sheet.trips || []
            return (
              <Link key={sheet.id} href={`/history/${sheet.id}`} className="card hover:border-[#2563eb] transition-colors block">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-bold text-[#0f1a35]">
                      {sheet.company_name || "Trip Sheet"}
                    </div>
                    <div className="text-[11px] text-[#94a3b8] mt-0.5">
                      {sheet.start_date || sheet.start_date_time || "—"} → {sheet.end_date || sheet.end_date_time || "—"}
                      {" · "}{trips.length} trip{trips.length !== 1 ? "s" : ""}
                      {" · "}{sheet.driver_name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-bold text-[#2563eb]">{sheet.total_km?.toLocaleString() || 0} km</div>
                    <div className="text-[10px] text-[#94a3b8] mt-0.5">{new Date(sheet.created_at).toLocaleDateString("en-CA")}</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
