"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Driver {
  id: string
  name: string
  email: string
  phone?: string
  truck_number?: string
  km: number
  trips: number
  last_trip: string
  status: string
}

export default function AdminDriversClient({ drivers: initialDrivers }: { drivers: Driver[] }) {
  const [drivers, setDrivers] = useState(initialDrivers)
  const [search, setSearch] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newDriver, setNewDriver] = useState({ full_name: "", email: "", password: "", phone: "", truck_number: "" })
  const [createError, setCreateError] = useState("")
  const [createSuccess, setCreateSuccess] = useState("")

  const filtered = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreateDriver(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateError("")
    setCreateSuccess("")

    const res = await fetch("/api/admin/create-driver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDriver),
    })
    const data = await res.json()

    if (!res.ok) {
      setCreateError(data.error || "Failed to create driver")
    } else {
      setCreateSuccess(`Driver ${newDriver.full_name} created successfully!`)
      setNewDriver({ full_name: "", email: "", password: "", phone: "", truck_number: "" })
      setDrivers((prev) => [...prev, {
        id: data.id,
        name: newDriver.full_name,
        email: newDriver.email,
        phone: newDriver.phone,
        truck_number: newDriver.truck_number,
        km: 0,
        trips: 0,
        last_trip: new Date().toISOString(),
        status: "active",
      }])
      setTimeout(() => { setShowCreate(false); setCreateSuccess("") }, 2000)
    }
    setCreating(false)
  }

  async function handleDeactivate(id: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    const supabase = createClient()
    await supabase.from("driver_profiles").update({ status: newStatus }).eq("id", id)
    setDrivers((prev) => prev.map((d) => d.id === id ? { ...d, status: newStatus } : d))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Drivers</h1>
          <p className="text-gray-400 text-sm mt-1">{drivers.length} registered driver{drivers.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Driver
        </button>
      </div>

      {/* Create Driver Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Create Driver Account</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateDriver} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input className="input-field" placeholder="John Smith" value={newDriver.full_name} onChange={(e) => setNewDriver(p => ({ ...p, full_name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" className="input-field" placeholder="driver@email.com" value={newDriver.email} onChange={(e) => setNewDriver(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                <input type="password" className="input-field" placeholder="Min. 6 characters" value={newDriver.password} onChange={(e) => setNewDriver(p => ({ ...p, password: e.target.value }))} minLength={6} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Phone</label>
                <input className="input-field" placeholder="416-555-0000" value={newDriver.phone} onChange={(e) => setNewDriver(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Truck #</label>
                <input className="input-field" placeholder="e.g. 0013 - Volvo" value={newDriver.truck_number} onChange={(e) => setNewDriver(p => ({ ...p, truck_number: e.target.value }))} />
              </div>
              {createError && <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-400">{createError}</div>}
              {createSuccess && <div className="bg-green-900/30 border border-green-700 rounded-lg px-4 py-3 text-sm text-green-400">{createSuccess}</div>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                  {creating ? "Creating..." : "Create Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">👷</div>
          <p className="text-gray-400">No drivers found</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Driver</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium hidden md:table-cell">Truck</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Trips</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Total KM</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((driver) => (
                <tr key={driver.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center text-red-400 font-semibold text-xs shrink-0">
                        {driver.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium">{driver.name}</div>
                        <div className="text-xs text-gray-500">{driver.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300 hidden md:table-cell">{driver.truck_number || "—"}</td>
                  <td className="py-3 px-4 text-gray-300 text-right">{driver.trips}</td>
                  <td className="py-3 px-4 text-red-400 font-semibold text-right">{driver.km.toLocaleString()} km</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${driver.status === "active" ? "bg-green-900/30 text-green-400" : "bg-gray-800 text-gray-500"}`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/drivers/${driver.id}`} className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1.5 rounded-lg transition-colors">View</Link>
                      <button onClick={() => handleDeactivate(driver.id, driver.status)} className={`text-xs px-2 py-1.5 rounded-lg transition-colors ${driver.status === "active" ? "bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-400" : "bg-green-900/30 hover:bg-green-900/50 text-green-400"}`}>
                        {driver.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
