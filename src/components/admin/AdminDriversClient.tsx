"use client"

import { useState } from "react"
import Link from "next/link"

interface Driver {
  id: string
  name: string
  km: number
  trips: number
  last_trip: string
}

export default function AdminDriversClient({ drivers }: { drivers: Driver[] }) {
  const [search, setSearch] = useState("")

  const filtered = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Drivers</h1>
          <p className="text-gray-400 text-sm mt-1">{drivers.length} registered driver{drivers.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <input
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Search drivers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Trips</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Total KM</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Last Trip</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((driver) => (
                <tr key={driver.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center text-red-400 font-semibold text-xs">
                        {driver.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{driver.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-right">{driver.trips}</td>
                  <td className="py-3 px-4 text-red-400 font-semibold text-right">{driver.km.toLocaleString()} km</td>
                  <td className="py-3 px-4 text-gray-400 text-right">
                    {new Date(driver.last_trip).toLocaleDateString("en-CA")}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/trips?driver=${driver.id}`}
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      View Trips
                    </Link>
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
