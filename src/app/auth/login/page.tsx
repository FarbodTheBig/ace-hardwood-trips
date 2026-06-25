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
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-6">
      <div className="w-full max-w-[820px] flex rounded-2xl overflow-hidden border border-[#151d35]" style={{minHeight:"500px"}}>
        <div className="flex-1 bg-[#070b16] border-r border-[#151d35] flex flex-col justify-center px-10 py-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
                <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 16H3m10 0h1m1-9h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16h-2"/>
              </svg>
            </div>
            <span className="text-[15px] font-bold text-white">RoadLog</span>
          </div>
          <h2 className="text-[26px] font-bold text-white tracking-tight leading-snug mb-3">
            Trip management<br/>built for drivers.
          </h2>
          <p className="text-[13px] text-[#2a3560] leading-relaxed mb-8">
            Log trips, upload documents,<br/>and stay in sync with dispatch.
          </p>
          <div className="flex flex-col gap-3">
            {["POD & PTI photo uploads per stop", "Professional PDF trip sheets", "KM tracking & route analytics", "Direct dispatcher communication"].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded border border-[#1e2a50] flex items-center justify-center flex-shrink-0 bg-[#0f1e4a]">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                </div>
                <span className="text-[13px] text-[#4a5a90]">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="w-[300px] bg-[#0a0e1a] flex flex-col justify-center px-8">
          <h3 className="text-[18px] font-bold text-white mb-1">Sign in</h3>
          <p className="text-[12px] text-[#2a3560] mb-7">Welcome back to RoadLog</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#2a3560] uppercase tracking-widest mb-2">Email address</label>
              <input type="email" className="input-field" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#2a3560] uppercase tracking-widest mb-2">Password</label>
              <input type="password" className="input-field" placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full text-sm mt-1">
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>
          <p className="text-center text-[12px] text-[#1e2a50] mt-5">
            New to RoadLog?{" "}
            <Link href="/auth/signup" className="text-[#60a5fa] hover:text-[#93c5fd]">Create account</Link>
          </p>
          <Link href="/admin/login" className="block text-center text-[11px] text-[#151d35] hover:text-[#2a3560] transition-colors mt-6">
            Admin access →
          </Link>
        </div>
      </div>
    </div>
  )
}
