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
      <div className="flex rounded-2xl overflow-hidden border border-[#1e1e1e]" style={{ height: "500px" }}>
        <div className="flex-1 bg-[#141414] border-r border-[#1e1e1e] flex flex-col justify-center px-10">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-7 h-7 rounded-[7px] bg-[#3b82f6] flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 16H3m10 0h1m1-9h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16h-2"/></svg>
            </div>
            <span className="text-[14px] font-semibold text-[#e8e8e8]">RoadLog</span>
          </div>
          <h2 className="text-[22px] font-semibold text-[#e8e8e8] tracking-tight">Welcome aboard.</h2>
        </div>
        <div className="w-[272px] bg-[#0f0f0f] flex flex-col justify-center px-7 text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
          </div>
          <h3 className="text-[15px] font-semibold text-[#e8e8e8] mb-2">Check your email</h3>
          <p className="text-[11px] text-[#2a2a2a] mb-6 leading-relaxed">We sent a confirmation link to <span className="text-[#555]">{email}</span></p>
          <Link href="/auth/login" className="btn-primary text-center text-sm block">Back to Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex rounded-2xl overflow-hidden border border-[#1e1e1e]" style={{ height: "500px" }}>
      <div className="flex-1 bg-[#141414] border-r border-[#1e1e1e] flex flex-col justify-center px-10">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-7 h-7 rounded-[7px] bg-[#3b82f6] flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 16H3m10 0h1m1-9h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16h-2"/></svg>
          </div>
          <span className="text-[14px] font-semibold text-[#e8e8e8]">RoadLog</span>
        </div>
        <h2 className="text-[22px] font-semibold text-[#e8e8e8] tracking-tight mb-2">Create your account</h2>
        <p className="text-[12px] text-[#2e2e2e]">Start logging trips for free</p>
      </div>
      <div className="w-[272px] bg-[#0f0f0f] flex flex-col justify-center px-7">
        <h3 className="text-[16px] font-semibold text-[#e8e8e8] mb-1">Get started</h3>
        <p className="text-[11px] text-[#2a2a2a] mb-6">Create your free driver account</p>
        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-widest mb-1.5">Full Name</label>
            <input type="text" className="input-field" placeholder="John Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-widest mb-1.5">Email address</label>
            <input type="email" className="input-field" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#2a2a2a] uppercase tracking-widest mb-1.5">Password</label>
            <input type="password" className="input-field" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          </div>
          {error && <div className="bg-red-500/8 border border-red-500/15 rounded-lg px-3 py-2 text-xs text-red-400">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full text-sm mt-1">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p className="text-center text-[11px] text-[#252525] mt-5">
          Already have one?{" "}
          <Link href="/auth/login" className="text-[#555] hover:text-[#888]">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
