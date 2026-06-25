"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError || !data.user) { setError("Invalid credentials"); setLoading(false); return }
    const { data: adminData } = await supabase.from("admin_users").select("id").eq("id", data.user.id).single()
    if (!adminData) { await supabase.auth.signOut(); setError("Access denied. Admins only."); setLoading(false); return }
    router.push("/admin/dashboard")
    router.refresh()
  }

  return (
    <div className="flex rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/50" style={{height: "520px"}}>
      <div className="flex-1 bg-[#0c0c18] flex flex-col items-center justify-center p-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full" style={{background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)"}}></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-blue-500/30">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">RoadLog</h1>
          <p className="text-white/30 text-sm mb-10">Admin & Dispatch Portal</p>
          <div className="text-left space-y-4">
            {["Manage all driver accounts", "View trips & download photos", "Dispatch board & load assignment", "Export reports & CSV"].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-sm bg-gradient-to-br from-blue-400 to-indigo-400 flex-shrink-0"></div>
                <span className="text-white/30 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-72 bg-[#080810] flex flex-col justify-center p-8 border-l border-white/[0.05]">
        <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-5 w-fit">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
          <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Admin Access</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Admin Sign In</h2>
        <p className="text-white/30 text-sm mb-7">Restricted to authorized personnel</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/25 uppercase tracking-widest mb-2">Email</label>
            <input type="email" className="input-field" placeholder="admin@roadlog.app" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/25 uppercase tracking-widest mb-2">Password</label>
            <input type="password" className="input-field" placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-xs text-red-400">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? "Signing in..." : "Sign In as Admin →"}
          </button>
        </form>
        <Link href="/auth/login" className="block text-center text-xs text-white/10 hover:text-white/25 transition-colors mt-6">
          ← Driver portal
        </Link>
      </div>
    </div>
  )
}
