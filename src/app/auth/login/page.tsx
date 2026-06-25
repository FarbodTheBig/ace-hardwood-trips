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
    <div className="flex rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/50" style={{height: "520px"}}>
      {/* Left Panel */}
      <div className="flex-1 bg-[#0c0c18] flex flex-col items-center justify-center p-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full" style={{background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)"}}></div>
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full" style={{background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)"}}></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-blue-500/30">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
              <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 16H3m10 0h1m1-9h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16h-2"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">RoadLog</h1>
          <p className="text-white/30 text-sm mb-10">Driver Trip Management</p>
          <div className="text-left space-y-4">
            {["Log trips with photo uploads", "Export professional PDF sheets", "Track KM and routes daily", "Stay connected with dispatch"].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-sm bg-gradient-to-br from-blue-400 to-indigo-400 flex-shrink-0"></div>
                <span className="text-white/30 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-72 bg-[#080810] flex flex-col justify-center p-8 border-l border-white/[0.05]">
        <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
        <p className="text-white/30 text-sm mb-7">Sign in to your driver account</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/25 uppercase tracking-widest mb-2">Email</label>
            <input type="email" className="input-field" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/25 uppercase tracking-widest mb-2">Password</label>
            <input type="password" className="input-field" placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-xs text-red-400">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>
        <p className="text-center text-xs text-white/25 mt-5">
          No account?{" "}
          <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300">Create one free</Link>
        </p>
        <Link href="/admin/login" className="block text-center text-xs text-white/10 hover:text-white/25 transition-colors mt-6">
          Admin portal →
        </Link>
      </div>
    </div>
  )
}
