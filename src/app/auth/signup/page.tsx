"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function SignupPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
    if (error) { setError(error.message); setLoading(false) }
    else { setSuccess(true); setLoading(false) }
  }

  if (success) {
    return (
      <div className="flex rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/50" style={{height: "520px"}}>
        <div className="flex-1 bg-[#0c0c18] flex flex-col items-center justify-center p-10 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full" style={{background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)"}}></div>
          </div>
          <div className="relative z-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-blue-500/30">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 16H3m10 0h1m1-9h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16h-2"/></svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">RoadLog</h1>
          </div>
        </div>
        <div className="w-72 bg-[#080810] flex flex-col justify-center p-8 border-l border-white/[0.05] text-center">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Check your email</h2>
          <p className="text-white/30 text-sm mb-6">We sent a link to <span className="text-white/60">{email}</span>. Click it to activate your account.</p>
          <Link href="/auth/login" className="btn-primary text-center block text-sm">Back to Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex rounded-3xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/50" style={{height: "520px"}}>
      <div className="flex-1 bg-[#0c0c18] flex flex-col items-center justify-center p-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full" style={{background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)"}}></div>
        </div>
        <div className="relative z-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-blue-500/30">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 16H3m10 0h1m1-9h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16h-2"/></svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">RoadLog</h1>
          <p className="text-white/30 text-sm">Create your free driver account</p>
        </div>
      </div>
      <div className="w-72 bg-[#080810] flex flex-col justify-center p-8 border-l border-white/[0.05]">
        <h2 className="text-xl font-bold text-white mb-1">Create account</h2>
        <p className="text-white/30 text-sm mb-7">Start logging trips for free</p>
        <form onSubmit={handleSignup} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-white/25 uppercase tracking-widest mb-2">Full Name</label>
            <input type="text" className="input-field" placeholder="John Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/25 uppercase tracking-widest mb-2">Email</label>
            <input type="email" className="input-field" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/25 uppercase tracking-widest mb-2">Password</label>
            <input type="password" className="input-field" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-xs text-red-400">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? "Creating..." : "Create Account →"}
          </button>
        </form>
        <p className="text-center text-xs text-white/25 mt-5">
          Already have one?{" "}
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
