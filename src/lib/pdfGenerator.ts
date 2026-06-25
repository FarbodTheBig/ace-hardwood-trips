import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { TripSheet } from "@/types"

export function generateTripPDF(trip: TripSheet) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" })

  const blue = [59, 130, 246] as [number, number, number]
  const darkGray = [30, 30, 30] as [number, number, number]
  const lightGray = [245, 245, 245] as [number, number, number]

  // Header bar
  doc.setFillColor(...blue)
  doc.rect(0, 0, 216, 28, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("RoadLog", 14, 12)

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text("DRIVER TRIP SHEET", 14, 21)

  // Company name on right side of header
  if (trip.company_name) {
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text(trip.company_name, 200, 16, { align: "right" })
  }

  // Info grid
  const infoY = 36
  doc.setTextColor(...darkGray)
  doc.setFontSize(9)

  const infoLeft = [
    ["Driver Name", trip.driver_name],
    ["Truck #", trip.truck_number],
    ["Start KM", trip.start_km],
    ["Total KM", trip.total_km?.toString() || "0"],
  ]
  const infoRight = [
    ["Trip Number(s)", trip.trip_numbers],
    ["Start Date/Time", trip.start_date_time],
    ["End Date/Time", trip.end_date_time],
    ["End KM", trip.end_km],
    ["Total Miles", trip.total_miles?.toFixed(2) || "0"],
  ]

  infoLeft.forEach((row, i) => {
    const y = infoY + i * 8
    doc.setFont("helvetica", "bold")
    doc.setTextColor(100, 100, 100)
    doc.text(row[0] + ":", 14, y)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...darkGray)
    doc.text(row[1] || "—", 45, y)
  })

  infoRight.forEach((row, i) => {
    const y = infoY + i * 8
    doc.setFont("helvetica", "bold")
    doc.setTextColor(100, 100, 100)
    doc.text(row[0] + ":", 114, y)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...darkGray)
    doc.text(row[1] || "—", 155, y)
  })

  // Divider
  doc.setDrawColor(220, 220, 220)
  doc.line(14, infoY + 35, 200, infoY + 35)

  // Stops table
  const tableStart = infoY + 40

  autoTable(doc, {
    startY: tableStart,
    head: [["Date", "Time", "Type", "Address / Location", "Trip #", "Trailer #"]],
    body: (trip.stops || []).map((s) => [
      s.date || "",
      s.time || "",
      s.type || "",
      s.address || "",
      s.trip_number || "",
      s.trailer_number || "",
    ]),
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      textColor: darkGray,
      lineColor: [220, 220, 220],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: blue,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 14 },
      2: { cellWidth: 30 },
      3: { cellWidth: 80 },
      4: { cellWidth: 18 },
      5: { cellWidth: 22 },
    },
    margin: { left: 14, right: 14 },
  })

  // Signature area
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 14

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text("Driver Signature:", 14, finalY)

  // Draw signature line
  doc.setDrawColor(...blue)
  doc.line(50, finalY, 130, finalY)

  // Print the actual signature text on the line
  if (trip.driver_signature) {
    doc.setFont("helvetica", "italic")
    doc.setFontSize(10)
    doc.setTextColor(...darkGray)
    doc.text(trip.driver_signature, 52, finalY - 1)
  }

  // Date
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text("Date:", 140, finalY)
  doc.setTextColor(...darkGray)
  doc.setFont("helvetica", "normal")
  doc.text(trip.signature_date || "", 155, finalY)

  // Footer
  doc.setFontSize(7.5)
  doc.setTextColor(160, 160, 160)
  doc.text(
    `Generated: ${new Date().toLocaleString("en-CA")} — RoadLog`,
    14,
    285
  )

  doc.save(`TripSheet_${trip.trip_numbers || "export"}_${trip.driver_name || "driver"}.pdf`)
}
