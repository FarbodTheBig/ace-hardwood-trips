"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else { router.push("/dashboard"); router.refresh() }
  }

  return (
    <div className="flex rounded-2xl overflow-hidden border border-[#1e1e1e]" style={{ height: "500px" }}>
      {/* Left */}
      <div className="flex-1 bg-[#141414] border-r border-[#1e1e1e] flex flex-col justify-center px-10 py-10">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-7 h-7 rounded-[7px] bg-[#3b82f6] flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
              <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 16H3m10 0h1m1-9h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16h-2"/>
            </svg>
          </div>
          <span className="text-[14px] font-semibold text-[#e8e8e8]">RoadLog</span>
        </div>
        <h2 className="text-[22px] font-semibold text-[#e8e8e8] tracking-tight leading-snug mb-3">
          Trip management<br/>built for drivers.
        </h2>
        <p className="text-[12px] text-[#2e2e2e] leading-relaxed mb-8">
          Log trips, upload documents,<br/>and stay in sync with dispatch.
        </p>
        <div className="flex flex-col gap-2.5">
          {["POD & PTI photo uploads per stop", "Professional PDF trip sheets", "KM tracking & route analytics", "Direct dispatcher communication"].map((f) => (
            <div key={f} className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-[3px] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
              </div>
              <span className="text-[12px] text-[#3a3a3a]">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="w-[272px] bg-[#0f0f0f] flex flex-col justify-center px-7">
        <h3 className="text-[16px] font-semibold text-[#e8e8e8] mb-1">Sign in</h3>
        <p className="text-[11px] text-[#2a2a2a] mb-6">Welcome back to RoadLog</p>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-widest mb-1.5">Email address</label>
            <input type="email" className="input-field" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-widest mb-1.5">Password</label>
            <input type="password" className="input-field" placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="bg-red-500/8 border border-red-500/15 rounded-lg px-3 py-2 text-xs text-red-400">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full text-sm mt-1">
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>
        <p className="text-center text-[11px] text-[#252525] mt-5">
          New to RoadLog?{" "}
          <Link href="/auth/signup" className="text-[#555] hover:text-[#888]">Create account</Link>
        </p>
        <Link href="/admin/login" className="block text-center text-[10px] text-[#1e1e1e] hover:text-[#333] transition-colors mt-6">
          Admin access →
        </Link>
      </div>
    </div>
  )
}
