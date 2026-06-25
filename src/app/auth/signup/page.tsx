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
      <div className="min-h-screen bg-[#eef2f7] flex items-center justify-center p-6">
        <div className="w-full max-w-[820px] flex rounded-2xl overflow-hidden border border-[#d8e0ec] shadow-sm" style={{minHeight:"500px"}}>
          <div className="flex-1 bg-[#0f1a35] flex flex-col justify-center px-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center"><svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 16H3m10 0h1m1-9h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16h-2"/></svg></div>
              <span className="text-[15px] font-bold text-white">RoadLog</span>
            </div>
            <h2 className="text-[26px] font-bold text-white">Welcome aboard.</h2>
          </div>
          <div className="w-[300px] bg-white flex flex-col justify-center px-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            </div>
            <h3 className="text-[16px] font-bold text-[#0f1a35] mb-2">Check your email</h3>
            <p className="text-[12px] text-[#94a3b8] mb-6 leading-relaxed">We sent a link to <span className="text-[#2563eb]">{email}</span></p>
            <Link href="/auth/login" className="btn-primary text-center text-sm block">Back to Sign In</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#eef2f7] flex items-center justify-center p-6">
      <div className="w-full max-w-[820px] flex rounded-2xl overflow-hidden border border-[#d8e0ec] shadow-sm" style={{minHeight:"500px"}}>
        <div className="flex-1 bg-[#0f1a35] flex flex-col justify-center px-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center"><svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 16H3m10 0h1m1-9h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16h-2"/></svg></div>
            <span className="text-[15px] font-bold text-white">RoadLog</span>
          </div>
          <h2 className="text-[26px] font-bold text-white tracking-tight mb-2">Create your account</h2>
          <p className="text-[13px] text-[#475569]">Start logging trips for free</p>
        </div>
        <div className="w-[300px] bg-white flex flex-col justify-center px-8">
          <h3 className="text-[18px] font-bold text-[#0f1a35] mb-1">Get started</h3>
          <p className="text-[12px] text-[#94a3b8] mb-7">Create your free driver account</p>
          <form onSubmit={handleSignup} className="flex flex-col gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest mb-2">Full Name</label>
              <input type="text" className="input-field" placeholder="John Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest mb-2">Email address</label>
              <input type="email" className="input-field" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest mb-2">Password</label>
              <input type="password" className="input-field" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            </div>
            {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full text-sm mt-1">
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
          <p className="text-center text-[12px] text-[#94a3b8] mt-5">
            Already have one?{" "}
            <Link href="/auth/login" className="text-[#2563eb] hover:text-[#1d4ed8]">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
