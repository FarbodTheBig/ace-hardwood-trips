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
    <div className="flex rounded-2xl overflow-hidden border border-[#1e1e1e]" style={{ height: "500px" }}>
      <div className="flex-1 bg-[#141414] border-r border-[#1e1e1e] flex flex-col justify-center px-10">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-7 h-7 rounded-[7px] bg-[#3b82f6] flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <span className="text-[14px] font-semibold text-[#e8e8e8]">RoadLog</span>
        </div>
        <div className="inline-flex items-center gap-1.5 border border-[#222] rounded-[4px] px-2 py-1 mb-6 w-fit">
          <div className="w-1 h-1 rounded-full bg-[#3b82f6]"></div>
          <span className="text-[9px] font-semibold text-[#3a3a3a] uppercase tracking-widest">Admin Access</span>
        </div>
        <h2 className="text-[22px] font-semibold text-[#e8e8e8] tracking-tight mb-2">Admin &amp; Dispatch<br/>Portal</h2>
        <p className="text-[12px] text-[#2e2e2e] mb-8">Restricted to authorized personnel.</p>
        <div className="flex flex-col gap-2.5">
          {["Manage all driver accounts", "View trips & download photos", "Dispatch board & load assignment", "Export reports & CSV"].map((f) => (
            <div key={f} className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-[3px] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
              </div>
              <span className="text-[12px] text-[#3a3a3a]">{f}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="w-[272px] bg-[#0f0f0f] flex flex-col justify-center px-7">
        <h3 className="text-[16px] font-semibold text-[#e8e8e8] mb-1">Admin Sign In</h3>
        <p className="text-[11px] text-[#2a2a2a] mb-6">Enter your admin credentials</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-widest mb-1.5">Email address</label>
            <input type="email" className="input-field" placeholder="admin@roadlog.app" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-widest mb-1.5">Password</label>
            <input type="password" className="input-field" placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="bg-red-500/8 border border-red-500/15 rounded-lg px-3 py-2 text-xs text-red-400">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full text-sm mt-1">
            {loading ? "Signing in..." : "Sign In as Admin"}
          </button>
        </form>
        <Link href="/auth/login" className="block text-center text-[10px] text-[#1e1e1e] hover:text-[#333] transition-colors mt-6">
          ← Driver portal
        </Link>
      </div>
    </div>
  )
}
