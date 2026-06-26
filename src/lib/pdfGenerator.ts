import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { TripSheet } from "@/types"

export function generateTripPDF(trip: TripSheet) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" })

  const blue = [31, 73, 125] as [number, number, number]
  const lightBlue = [197, 217, 241] as [number, number, number]
  const black = [0, 0, 0] as [number, number, number]
  const white = [255, 255, 255] as [number, number, number]

  const pageW = 216
  const margin = 14

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
  const rowH = 8
  const col1 = margin
  const col2 = 52
  const col3 = 108
  const col4 = 148

  // Draw outer border
  doc.setDrawColor(...black)
  doc.setLineWidth(0.4)
  doc.rect(col1, infoTop, pageW - margin * 2, rowH * 4)

  // Row lines
  ;[1, 2, 3].forEach((i) => {
    doc.line(col1, infoTop + rowH * i, pageW - margin, infoTop + rowH * i)
  })
  // Vertical dividers
  doc.line(col2, infoTop, col2, infoTop + rowH * 4)
  doc.line(col3, infoTop, col3, infoTop + rowH * 4)
  doc.line(col4, infoTop, col4, infoTop + rowH * 4)

  // Left label backgrounds
  const labelBg = [220, 230, 241] as [number, number, number]
  ;[0, 1].forEach((i) => {
    doc.setFillColor(...labelBg)
    doc.rect(col1, infoTop + rowH * i, col2 - col1, rowH, "F")
  })

  function infoLabel(text: string, x: number, y: number) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(...black)
    doc.text(text, x + 1.5, y + 5.5)
  }
  function infoValue(text: string, x: number, y: number) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(...black)
    doc.text(text || "", x + 1.5, y + 5.5)
  }

  // Row 0
  infoLabel("Driver Name:", col1, infoTop)
  infoValue(trip.driver_name || "", col2, infoTop)
  infoLabel("Trip Number(s):", col3, infoTop)
  infoValue(trip.trip_numbers || "", col4, infoTop)

  // Row 1
  infoLabel("Period:", col1, infoTop + rowH)
  infoValue(`${trip.start_date || ""} – ${trip.end_date || ""}`, col2, infoTop + rowH)
  infoLabel("Start Date:", col3, infoTop + rowH)
  infoValue(trip.start_date || "", col4, infoTop + rowH)

  // Row 2 — full width KM
  doc.setFillColor(...labelBg)
  doc.rect(col1, infoTop + rowH * 2, col2 - col1, rowH, "F")
  infoLabel("Start KM:", col1, infoTop + rowH * 2)
  // right-align value
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.text(trip.start_km || "", col3 - 3, infoTop + rowH * 2 + 5.5, { align: "right" })

  doc.setFillColor(...labelBg)
  doc.rect(col3, infoTop + rowH * 2, col4 - col3, rowH, "F")
  infoLabel("End KM:", col3, infoTop + rowH * 2)
  doc.setFont("helvetica", "normal")
  doc.text(trip.end_km || "", pageW - margin - 1, infoTop + rowH * 2 + 5.5, { align: "right" })

  // Row 3
  doc.setFillColor(...labelBg)
  doc.rect(col1, infoTop + rowH * 3, col2 - col1, rowH, "F")
  infoLabel("Total KM:", col1, infoTop + rowH * 3)
  doc.setFont("helvetica", "normal")
  doc.text(trip.total_km?.toLocaleString() || "0", col3 - 3, infoTop + rowH * 3 + 5.5, { align: "right" })

  doc.setFillColor(...labelBg)
  doc.rect(col3, infoTop + rowH * 3, col4 - col3, rowH, "F")
  infoLabel("Total Miles:", col3, infoTop + rowH * 3)
  doc.setFont("helvetica", "normal")
  doc.text(trip.total_miles?.toFixed(1) || "0", pageW - margin - 1, infoTop + rowH * 3 + 5.5, { align: "right" })

  // ── TRIPS TABLE ──
  const tableTop = infoTop + rowH * 4 + 6

  const trips = (trip.trips || []) as Array<{
    date: string
    type: string
    starting_point: string
    destination: string
    trip_number: string
    trailer_number: string
    truck_number: string
  }>

  // Fill to minimum 15 rows
  const minRows = 15
  const rows = [...trips]
  while (rows.length < minRows) {
    rows.push({ date: "", type: "", starting_point: "", destination: "", trip_number: "", trailer_number: "", truck_number: "" })
  }

  autoTable(doc, {
    startY: tableTop,
    head: [["Date", "Type", "Starting Point", "Destination", "Trip #", "Trailer #", "Truck #"]],
    body: rows.map((r) => [
      r.date || "",
      r.type || "",
      r.starting_point || "",
      r.destination || "",
      r.trip_number || "",
      r.trailer_number || "",
      r.truck_number || "",
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: black,
      lineColor: black,
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: blue,
      textColor: white,
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 18, halign: "center" },
      1: { cellWidth: 34 },
      2: { cellWidth: 38 },
      3: { cellWidth: 38 },
      4: { cellWidth: 14, halign: "center" },
      5: { cellWidth: 20, halign: "center" },
      6: { cellWidth: 24, halign: "center" },
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    margin: { left: margin, right: margin },
  })

  // ── SIGNATURE ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const afterTable = (doc as any).lastAutoTable.finalY + 8

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...black)
  doc.text("Driver Signature:", margin, afterTable)

  // Signature line
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

  // Footer
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(150, 150, 150)
  doc.text(`Generated: ${new Date().toLocaleString("en-CA")} — RoadLog`, margin, 278)

  doc.save(`TripSheet_${trip.driver_name || "driver"}_${trip.start_date || "period"}.pdf`)
}
