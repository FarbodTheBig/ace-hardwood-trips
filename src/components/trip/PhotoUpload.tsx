"use client"

import { useState, useRef, useEffect } from "react"
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
}

export default function PhotoUpload({ tripId, stopIndex, userId, readOnly = false }: Props) {
  const [activeCategory, setActiveCategory] = useState("pod")
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load existing photos for this trip+stop on mount
  useEffect(() => {
    async function loadPhotos() {
      const supabase = createClient()
      const { data } = await supabase
        .from("trip_photos")
        .select("*")
        .eq("trip_id", tripId)
        .eq("stop_index", stopIndex)
        .order("created_at", { ascending: true })

      if (data) {
        const withUrls = data.map((p) => {
          const { data: urlData } = supabase.storage.from("trip-photos").getPublicUrl(p.file_path)
          return { ...p, url: urlData.publicUrl }
        })
        setPhotos(withUrls)
      }
    }
    if (tripId) loadPhotos()
  }, [tripId, stopIndex])

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
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      const path = `${userId}/${tripId}/stop-${stopIndex}/${activeCategory}/${Date.now()}-${i}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from("trip-photos")
        .upload(path, file, { upsert: false })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        continue
      }

      const { data: urlData } = supabase.storage.from("trip-photos").getPublicUrl(path)

      const { data: photoRecord, error: dbError } = await supabase
        .from("trip_photos")
        .insert({
          trip_id: tripId,
          user_id: userId,
          stop_index: stopIndex,
          category: activeCategory,
          file_name: file.name,
          file_path: path,
          file_size: file.size,
        })
        .select()
        .single()

      if (dbError) {
        console.error("DB error:", dbError)
        continue
      }

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

  const totalPhotos = photos.length

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
                  ? "bg-blue-500/10 text-blue-400 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-300 bg-gray-800/30"
              }`}
            >
              {cat.label}
              {count > 0 && (
                <span className="ml-1.5 bg-blue-500/20 text-blue-400 text-xs px-1.5 py-0.5 rounded-full">
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
            {totalPhotos > 0 && <span className="ml-2 text-blue-400">({totalPhotos} total)</span>}
          </span>
          {!readOnly && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || categoryPhotos.length >= MAX_FILES}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1"
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
              className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
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
              <div key={photo.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-800">
                  {photo.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img src={photo.url} alt={photo.file_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-800 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-xl">📄</span>
                      <span className="text-xs text-gray-400 mt-1">PDF</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                  <a href={photo.url} target="_blank" rel="noreferrer"
                    className="text-white bg-gray-700 hover:bg-gray-600 p-1 rounded" title="View">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </a>
                  {!readOnly && (
                    <button onClick={() => handleDelete(photo)}
                      className="text-white bg-red-700 hover:bg-red-600 p-1 rounded" title="Delete">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{photo.file_name}</p>
              </div>
            ))}
            {!readOnly && categoryPhotos.length < MAX_FILES && (
              <div
                className="aspect-square border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
