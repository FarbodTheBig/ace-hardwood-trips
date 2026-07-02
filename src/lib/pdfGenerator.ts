import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { TripSheet } from "@/types"

export function generateTripPDF(trip: TripSheet) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" })

  const blue = [31, 73, 125] as [number, number, number]
  const white = [255, 255, 255] as [number, number, number]
  const black = [0, 0, 0] as [number, number, number]
  const labelBg = [220, 230, 241] as [number, number, number]

  const pageW = 216
  const margin = 14
  const rowH = 8

  // ── TITLE ──
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(...black)
  doc.text((trip.company_name || "ACE HARDWOOD INC.").toUpperCase(), pageW / 2, 18, { align: "center" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(...blue)
  doc.text("DRIVER TRIP SHEET", pageW / 2, 25, { align: "center" })

  // ── INFO GRID ──
  const infoTop = 30
  const col1 = margin
  const col2 = 52
  const col3 = 114
  const col4 = 155

  // Outer border
  doc.setDrawColor(...black)
  doc.setLineWidth(0.4)
  doc.rect(col1, infoTop, pageW - margin * 2, rowH * 3)

  // Row dividers
  ;[1, 2].forEach((i) => doc.line(col1, infoTop + rowH * i, pageW - margin, infoTop + rowH * i))

  // Vertical dividers
  doc.line(col2, infoTop, col2, infoTop + rowH * 3)
  doc.line(col3, infoTop, col3, infoTop + rowH * 3)
  doc.line(col4, infoTop, col4, infoTop + rowH * 3)

  function drawLabelBg(x: number, y: number, w: number) {
    doc.setFillColor(...labelBg)
    doc.rect(x, y, w, rowH, "F")
  }

  function label(text: string, x: number, y: number) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(...black)
    doc.text(text, x + 1.5, y + 5.5)
  }

  function value(text: string, x: number, y: number) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(...black)
    doc.text(text || "", x + 1.5, y + 5.5)
  }

  // Row 0 — Driver Name | value | Period | value
  drawLabelBg(col1, infoTop, col2 - col1)
  drawLabelBg(col3, infoTop, col4 - col3)
  label("Driver Name:", col1, infoTop)
  value(trip.driver_name || "", col2, infoTop)
  label("Period:", col3, infoTop)
  value(`${trip.start_date || ""} – ${trip.end_date || ""}`, col4, infoTop)

  // Row 1 — Start Postal Code | value | End Postal Code | value
  drawLabelBg(col1, infoTop + rowH, col2 - col1)
  drawLabelBg(col3, infoTop + rowH, col4 - col3)
  label("Start Postal Code:", col1, infoTop + rowH)
  value(trip.start_postal_code || "", col2, infoTop + rowH)
  label("Dest. Postal Code:", col3, infoTop + rowH)
  value(trip.destination_postal_code || "", col4, infoTop + rowH)

  // Row 2 — Trip Numbers | value (full width)
  drawLabelBg(col1, infoTop + rowH * 2, col2 - col1)
  label("Trip Number(s):", col1, infoTop + rowH * 2)
  value(trip.trip_numbers || trips(trip).map((t) => t.trip_number).filter(Boolean).join(" / ") || "", col2, infoTop + rowH * 2)

  // ── TRIPS TABLE ──
  const tableTop = infoTop + rowH * 3 + 6

  const rows = [...(trip.trips || [])] as Array<{
    date: string; type: string; starting_point: string
    destination: string; trip_number: string; trailer_number: string; truck_number: string
  }>

  while (rows.length < 15) {
    rows.push({ date: "", type: "", starting_point: "", destination: "", trip_number: "", trailer_number: "", truck_number: "" })
  }

  autoTable(doc, {
    startY: tableTop,
    head: [["Date", "Type", "Starting Point", "Destination", "Trip #", "Trailer #", "Truck #"]],
    body: rows.map((r) => [r.date, r.type, r.starting_point, r.destination, r.trip_number, r.trailer_number, r.truck_number]),
    styles: { fontSize: 8, cellPadding: 2.5, textColor: black, lineColor: black, lineWidth: 0.3 },
    headStyles: { fillColor: blue, textColor: white, fontStyle: "bold", fontSize: 8.5, halign: "center" },
    columnStyles: {
      0: { cellWidth: 18, halign: "center" },
      1: { cellWidth: 34 },
      2: { cellWidth: 38 },
      3: { cellWidth: 38 },
      4: { cellWidth: 14, halign: "center" },
      5: { cellWidth: 20, halign: "center" },
      6: { cellWidth: 24, halign: "center" },
    },
    margin: { left: margin, right: margin },
  })

  // ── SIGNATURE ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const afterTable = (doc as any).lastAutoTable.finalY + 8

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...black)
  doc.text("Driver Signature:", margin, afterTable)
  doc.setDrawColor(...black)
  doc.setLineWidth(0.4)
  doc.line(margin + 32, afterTable, margin + 90, afterTable)

  if (trip.driver_signature) {
    doc.setFont("helvetica", "italic")
    doc.setFontSize(10)
    doc.text(trip.driver_signature, margin + 33, afterTable - 1)
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.text("Date:", margin + 100, afterTable)
  doc.line(margin + 110, afterTable, margin + 150, afterTable)
  if (trip.signature_date) {
    doc.setFont("helvetica", "normal")
    doc.text(trip.signature_date, margin + 111, afterTable - 1)
  }

  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(150, 150, 150)
  doc.text(`Generated: ${new Date().toLocaleString("en-CA")} — RoadLog`, margin, 278)

  doc.save(`TripSheet_${trip.driver_name || "driver"}_${trip.start_date || "period"}.pdf`)
}

function trips(trip: TripSheet) {
  return (trip.trips || []) as Array<{ trip_number: string }>
}
