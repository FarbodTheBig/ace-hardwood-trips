"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { generateTripPDF } from "@/lib/pdfGenerator"
import { TripSheet } from "@/types"

interface Props {
  driverId: string
  profile: Record<string, string> | null
  trips: (TripSheet & { id: string; created_at: string; status?: string; dispatcher_notes?: string })[]
  messages: { id: string; message: string; read: boolean; created_at: string }[]
  loads: { id: string; title: string; status: string; pickup_address: string; delivery_address: string; pickup_date: string; load_number: string }[]
  adminId: string
}

export default function DriverDetailClient({ driverId, profile, trips, messages: initialMessages, loads: initialLoads, adminId }: Props) {
  const [activeTab, setActiveTab] = useState<"trips" | "loads" | "messages" | "profile">("trips")
  const [editProfile, setEditProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    truck_number: profile?.truck_number || "",
    license_number: profile?.license_number || "",
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [resetMsg, setResetMsg] = useState("")
  const [messages, setMessages] = useState(initialMessages)
  const [loads, setLoads] = useState(initialLoads)
  const [newMessage, setNewMessage] = useState("")
  const [sendingMsg, setSendingMsg] = useState(false)
  const [showAssignLoad, setShowAssignLoad] = useState(false)
  const [loadForm, setLoadForm] = useState({ title: "", load_number: "", pickup_address: "", delivery_address: "", pickup_date: "", delivery_date: "", trailer_number: "", notes: "" })
  const [assigningLoad, setAssigningLoad] = useState(false)

  const totalKm = trips.reduce((sum, t) => sum + (t.total_km || 0), 0)

  async function handleSaveProfile() {
    setSavingProfile(true)
    const supabase = createClient()
    await supabase.from("driver_profiles").upsert({ id: driverId, ...profileForm })
    setSavingProfile(false)
    setEditProfile(false)
  }

  async function handleResetPassword() {
    if (!newPassword || newPassword.length < 6) { setResetMsg("Password must be at least 6 characters"); return }
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driver_id: driverId, new_password: newPassword }),
    })
    const data = await res.json()
    setResetMsg(data.success ? "Password reset successfully!" : data.error)
    setNewPassword("")
    setTimeout(() => setResetMsg(""), 3000)
  }

  async function handleSendMessage() {
    if (!newMessage.trim()) return
    setSendingMsg(true)
    const supabase = createClient()
    const { data } = await supabase.from("driver_messages").insert({
      driver_id: driverId,
      admin_id: adminId,
      message: newMessage,
    }).select().single()
    if (data) setMessages((prev) => [data, ...prev])
    setNewMessage("")
    setSendingMsg(false)
  }

  async function handleAssignLoad(e: React.FormEvent) {
    e.preventDefault()
    setAssigningLoad(true)
    const supabase = createClient()
    const { data } = await supabase.from("loads").insert({
      driver_id: driverId,
      assigned_by: adminId,
      ...loadForm,
      status: "assigned",
    }).select().single()
    if (data) setLoads((prev) => [data, ...prev])
    setLoadForm({ title: "", load_number: "", pickup_address: "", delivery_address: "", pickup_date: "", delivery_date: "", trailer_number: "", notes: "" })
    setShowAssignLoad(false)
    setAssigningLoad(false)
  }

  async function handleTripStatus(tripId: string, status: string) {
    const supabase = createClient()
    await supabase.from("trip_sheets").update({ status }).eq("id", tripId)
  }

  const tabs = [
    { id: "trips", label: `Trips (${trips.length})` },
    { id: "loads", label: `Loads (${loads.length})` },
    { id: "messages", label: `Messages (${messages.length})` },
    { id: "profile", label: "Profile" },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/drivers" className="text-gray-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center text-red-400 font-bold text-lg">
            {(profileForm.full_name || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{profileForm.full_name || "Unknown Driver"}</h1>
            <p className="text-gray-400 text-sm">{profileForm.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Trips", value: trips.length },
          { label: "Total KM", value: totalKm.toLocaleString() },
          { label: "Active Loads", value: loads.filter(l => l.status === "assigned").length },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trips Tab */}
      {activeTab === "trips" && (
        <div className="space-y-3">
          {trips.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500">No trips yet</div>
          ) : trips.map((trip) => (
            <div key={trip.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-semibold text-white">Trip {trip.trip_numbers || "—"}</span>
                  <span className="text-gray-500 text-sm ml-3">{trip.truck_number || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    defaultValue={trip.status || "pending"}
                    onChange={(e) => handleTripStatus(trip.id!, e.target.value)}
                    className="text-xs bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-gray-300"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="approved">Approved</option>
                  </select>
                  <button onClick={() => generateTripPDF(trip)} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded-lg">PDF</button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs text-gray-400">
                <div>KM: <span className="text-red-400 font-semibold">{trip.total_km?.toLocaleString()}</span></div>
                <div>Stops: <span className="text-white">{trip.stops?.length || 0}</span></div>
                <div>Date: <span className="text-white">{new Date(trip.created_at).toLocaleDateString("en-CA")}</span></div>
              </div>
              <div className="mt-3">
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-600"
                  placeholder="Add dispatcher notes..."
                  defaultValue={trip.dispatcher_notes || ""}
                  onBlur={async (e) => {
                    const supabase = createClient()
                    await supabase.from("trip_sheets").update({ dispatcher_notes: e.target.value }).eq("id", trip.id!)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loads Tab */}
      {activeTab === "loads" && (
        <div className="space-y-4">
          <button onClick={() => setShowAssignLoad(true)} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Assign New Load
          </button>

          {showAssignLoad && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">Assign Load</h2>
                  <button onClick={() => setShowAssignLoad(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                <form onSubmit={handleAssignLoad} className="space-y-4">
                  {[
                    { label: "Load Title", key: "title", placeholder: "e.g. Toronto → Ottawa Run" },
                    { label: "Load #", key: "load_number", placeholder: "e.g. LD-1225" },
                    { label: "Pickup Address", key: "pickup_address", placeholder: "Full pickup address" },
                    { label: "Delivery Address", key: "delivery_address", placeholder: "Full delivery address" },
                    { label: "Pickup Date", key: "pickup_date", placeholder: "e.g. 2026-06-20" },
                    { label: "Delivery Date", key: "delivery_date", placeholder: "e.g. 2026-06-21" },
                    { label: "Trailer #", key: "trailer_number", placeholder: "e.g. PV1021" },
                    { label: "Notes", key: "notes", placeholder: "Any special instructions..." },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{field.label}</label>
                      <input className="input-field" placeholder={field.placeholder} value={loadForm[field.key as keyof typeof loadForm]}
                        onChange={(e) => setLoadForm(p => ({ ...p, [field.key]: e.target.value }))} />
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowAssignLoad(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg">Cancel</button>
                    <button type="submit" disabled={assigningLoad} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50">
                      {assigningLoad ? "Assigning..." : "Assign Load"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loads.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500">No loads assigned yet</div>
          ) : loads.map((load) => (
            <div key={load.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white">{load.title || `Load ${load.load_number}`}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${load.status === "assigned" ? "bg-blue-900/30 text-blue-400" : load.status === "completed" ? "bg-green-900/30 text-green-400" : "bg-gray-800 text-gray-400"}`}>
                  {load.status}
                </span>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>📍 {load.pickup_address} → {load.delivery_address}</div>
                <div>📅 Pickup: {load.pickup_date}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              className="flex-1 input-field"
              placeholder="Type a message to this driver..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button onClick={handleSendMessage} disabled={sendingMsg} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50">
              {sendingMsg ? "..." : "Send"}
            </button>
          </div>
          {messages.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-500">No messages yet</div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div key={msg.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <p className="text-white text-sm">{msg.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(msg.created_at).toLocaleString("en-CA")}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Driver Information</h2>
              <button onClick={() => setEditProfile(!editProfile)} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg">
                {editProfile ? "Cancel" : "Edit"}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Full Name", key: "full_name" },
                { label: "Email", key: "email" },
                { label: "Phone", key: "phone" },
                { label: "Truck #", key: "truck_number" },
                { label: "License #", key: "license_number" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{field.label}</label>
                  {editProfile ? (
                    <input className="input-field" value={profileForm[field.key as keyof typeof profileForm]}
                      onChange={(e) => setProfileForm(p => ({ ...p, [field.key]: e.target.value }))} />
                  ) : (
                    <div className="text-white text-sm py-2">{profileForm[field.key as keyof typeof profileForm] || "—"}</div>
                  )}
                </div>
              ))}
            </div>
            {editProfile && (
              <button onClick={handleSaveProfile} disabled={savingProfile} className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg disabled:opacity-50">
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Reset Password</h2>
            <div className="flex gap-3">
              <input type="password" className="flex-1 input-field" placeholder="New password (min 6 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <button onClick={handleResetPassword} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg">Reset</button>
            </div>
            {resetMsg && <p className={`text-sm mt-2 ${resetMsg.includes("success") ? "text-green-400" : "text-red-400"}`}>{resetMsg}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
