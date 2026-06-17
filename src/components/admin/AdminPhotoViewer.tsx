"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

const CATEGORIES = [
  { id: "pod", label: "POD", description: "Bills & Documents" },
  { id: "pti", label: "PTI", description: "Truck & Load Inspection" },
  { id: "others", label: "Others", description: "Other Photos" },
]

interface Photo {
  id: string
  file_name: string
  file_path: string
  category: string
  stop_index: number
  url: string
  created_at: string
}

interface Props {
  tripId: string
  driverName: string
}

export default function AdminPhotoViewer({ tripId, driverName }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStop, setActiveStop] = useState<number | "all">("all")
  const [activeCategory, setActiveCategory] = useState("all")

  useEffect(() => {
    async function fetchPhotos() {
      const supabase = createClient()
      const { data } = await supabase
        .from("trip_photos")
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true })

      if (data) {
        const withUrls = data.map((p) => {
          const { data: urlData } = supabase.storage.from("trip-photos").getPublicUrl(p.file_path)
          return { ...p, url: urlData.publicUrl }
        })
        setPhotos(withUrls)
      }
      setLoading(false)
    }
    fetchPhotos()
  }, [tripId])

  const stopSet: number[] = []; photos.forEach((p) => { if (!stopSet.includes(p.stop_index)) stopSet.push(p.stop_index) }); const stops = stopSet.sort((a, b) => a - b)

  const filtered = photos.filter((p) => {
    return (activeStop === "all" || p.stop_index === activeStop) &&
      (activeCategory === "all" || p.category === activeCategory)
  })

  async function downloadAll() {
    for (const photo of filtered) {
      const a = document.createElement("a")
      a.href = photo.url
      a.download = `${driverName}-stop${photo.stop_index + 1}-${photo.category}-${photo.file_name}`
      a.target = "_blank"
      a.click()
      await new Promise((r) => setTimeout(r, 300))
    }
  }

  if (loading) return <div className="text-gray-500 text-sm py-4 text-center">Loading photos...</div>

  if (photos.length === 0) return (
    <div className="text-center py-8 text-gray-500">
      <div className="text-3xl mb-2">📷</div>
      <p className="text-sm">No photos uploaded yet</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{photos.length} photo{photos.length !== 1 ? "s" : ""} total</p>
        <button onClick={downloadAll} className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download All ({filtered.length})
        </button>
      </div>

      {/* Stop Filter */}
      <div className="flex gap-1 flex-wrap">
        <button onClick={() => setActiveStop("all")}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${activeStop === "all" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
          All Stops
        </button>
        {stops.map((s) => (
          <button key={s} onClick={() => setActiveStop(s)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${activeStop === s ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            Stop {s + 1}
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex gap-1">
        <button onClick={() => setActiveCategory("all")}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${activeCategory === "all" ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${activeCategory === cat.id ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {filtered.map((photo) => (
          <div key={photo.id} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-800">
              {photo.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img src={photo.url} alt={photo.file_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <span className="text-2xl">📄</span>
                  <span className="text-xs text-gray-400 mt-1">PDF</span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <a href={photo.url} download={photo.file_name} target="_blank"
                className="text-white bg-gray-700 hover:bg-gray-600 p-1.5 rounded" title="Download">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </a>
            </div>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-xs text-gray-500">S{photo.stop_index + 1}</span>
              <span className="text-xs bg-gray-800 text-gray-400 px-1 rounded">{photo.category.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
