"use client"

import { useState, useRef } from "react"
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
  url: string
}

interface Props {
  tripId: string
  stopIndex: number
  userId: string
  readOnly?: boolean
  initialPhotos?: Photo[]
}

export default function PhotoUpload({ tripId, stopIndex, userId, readOnly = false, initialPhotos = [] }: Props) {
  const [activeCategory, setActiveCategory] = useState("pod")
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categoryPhotos = photos.filter((p) => p.category === activeCategory)
  const MAX_FILES = 20

  async function handleFiles(files: FileList) {
    if (!files.length) return
    const remaining = MAX_FILES - categoryPhotos.length
    if (remaining <= 0) {
      alert(`Maximum ${MAX_FILES} files per category`)
      return
    }

    const filesToUpload = Array.from(files).slice(0, remaining)
    setUploading(true)

    const supabase = createClient()
    const uploaded: Photo[] = []

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i]
      setUploadProgress(`Uploading ${i + 1} of ${filesToUpload.length}...`)

      const ext = file.name.split(".").pop()
      const path = `${userId}/${tripId}/stop-${stopIndex}/${activeCategory}/${Date.now()}-${i}.${ext}`

      const { error } = await supabase.storage.from("trip-photos").upload(path, file)
      if (error) { console.error(error); continue }

      const { data: urlData } = supabase.storage.from("trip-photos").getPublicUrl(path)

      const { data: photoRecord } = await supabase.from("trip_photos").insert({
        trip_id: tripId,
        user_id: userId,
        stop_index: stopIndex,
        category: activeCategory,
        file_name: file.name,
        file_path: path,
        file_size: file.size,
      }).select().single()

      if (photoRecord) {
        uploaded.push({
          id: photoRecord.id,
          file_name: file.name,
          file_path: path,
          category: activeCategory,
          url: urlData.publicUrl,
        })
      }
    }

    setPhotos((prev) => [...prev, ...uploaded])
    setUploading(false)
    setUploadProgress("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleDelete(photo: Photo) {
    if (!confirm("Delete this photo?")) return
    const supabase = createClient()
    await supabase.storage.from("trip-photos").remove([photo.file_path])
    await supabase.from("trip_photos").delete().eq("id", photo.id)
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
  }

  async function handleDownload(photo: Photo) {
    const a = document.createElement("a")
    a.href = photo.url
    a.download = photo.file_name
    a.target = "_blank"
    a.click()
  }

  return (
    <div className="mt-4 border border-gray-700/50 rounded-xl overflow-hidden">
      {/* Category Tabs */}
      <div className="flex border-b border-gray-700/50">
        {CATEGORIES.map((cat) => {
          const count = photos.filter((p) => p.category === cat.id).length
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 py-2.5 px-3 text-xs font-semibold transition-colors ${
                activeCategory === cat.id
                  ? "bg-brand-500/10 text-brand-400 border-b-2 border-brand-500"
                  : "text-gray-500 hover:text-gray-300 bg-gray-800/30"
              }`}
            >
              {cat.label}
              {count > 0 && (
                <span className="ml-1.5 bg-brand-500/20 text-brand-400 text-xs px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="p-3 bg-gray-800/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">
            {CATEGORIES.find((c) => c.id === activeCategory)?.description} · {categoryPhotos.length}/{MAX_FILES}
          </span>
          {!readOnly && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || categoryPhotos.length >= MAX_FILES}
              className="text-xs bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {uploading ? uploadProgress : "Upload"}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>

        {categoryPhotos.length === 0 ? (
          !readOnly ? (
            <div
              className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-brand-500/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
            >
              <div className="text-2xl mb-1">📎</div>
              <p className="text-xs text-gray-500">Drag & drop or click to upload</p>
              <p className="text-xs text-gray-600 mt-0.5">Images & PDFs · Max {MAX_FILES} files</p>
            </div>
          ) : (
            <p className="text-xs text-gray-600 text-center py-4">No photos uploaded</p>
          )
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {categoryPhotos.map((photo) => (
              <div key={photo.id} className="relative group aspect-square">
                {photo.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img src={photo.url} alt={photo.file_name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-400">PDF</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                  <button onClick={() => handleDownload(photo)} className="text-white bg-gray-700 hover:bg-gray-600 p-1 rounded" title="Download">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </button>
                  {!readOnly && (
                    <button onClick={() => handleDelete(photo)} className="text-white bg-red-700 hover:bg-red-600 p-1 rounded" title="Delete">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{photo.file_name}</p>
              </div>
            ))}
            {!readOnly && categoryPhotos.length < MAX_FILES && (
              <div
                className="aspect-square border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-brand-500/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
