"use client"

import { generateTripPDF } from "@/lib/pdfGenerator"

export default function TripDetailClient({ sheet }: { sheet: Record<string, unknown> }) {
  function handlePDF() {
    generateTripPDF({
      company_name: sheet.company_name as string,
      driver_name: sheet.driver_name as string,
      start_date: sheet.start_date as string,
      end_date: sheet.end_date as string,
      start_postal_code: sheet.start_postal_code as string || "",
      destination_postal_code: sheet.destination_postal_code as string || "",
      trips: sheet.trips as [],
      driver_signature: sheet.driver_signature as string,
      signature_date: sheet.signature_date as string,
      trip_numbers: sheet.trip_numbers as string,
      truck_number: sheet.truck_number as string,
      start_date_time: sheet.start_date_time as string,
      end_date_time: sheet.end_date_time as string,
      stops: [],
    })
  }

  return (
    <div className="flex gap-2">
      <button onClick={handlePDF} className="btn-primary text-sm flex items-center gap-2">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        Export PDF
      </button>
    </div>
  )
}
