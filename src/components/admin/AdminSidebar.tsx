"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { href: "/admin/drivers", label: "Drivers", icon: <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
  { href: "/admin/trips", label: "All Trips", icon: <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 16H3m10 0h1m1-9h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16h-2"/></svg> },
  { href: "/admin/dispatch", label: "Dispatch", icon: <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg> },
  { href: "/admin/reports", label: "Reports", icon: <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
]

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  const initials = adminName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <aside className="w-[200px] bg-white border-r border-[#d8e0ec] flex flex-col h-screen sticky top-0 flex-shrink-0">
      <div className="px-4 py-4 border-b border-[#d8e0ec]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-7 rounded-lg bg-[#2563eb] flex items-center justify-center flex-shrink-0">
            <svg className="w-[14px] h-[14px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <span className="text-[14px] font-bold text-[#0f1a35]">RoadLog</span>
        </div>
        <div className="inline-flex items-center gap-1.5 bg-[#eff6ff] border border-[#bfdbfe] rounded-full px-2.5 py-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb]"></div>
          <span className="text-[10px] font-bold text-[#2563eb] uppercase tracking-widest">Admin</span>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href)
          return (
            <Link key={link.href} href={link.href} className={isActive ? "sidebar-item-active" : "sidebar-item"}>
              {link.icon}
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 py-3 border-t border-[#d8e0ec]">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-[#f8fafc]">
          <div className="w-6 h-6 rounded-md bg-[#dbeafe] flex items-center justify-center text-[9px] font-bold text-[#2563eb] flex-shrink-0">
            {initials}
          </div>
          <span className="text-[12px] text-[#64748b] truncate flex-1">{adminName}</span>
          <button onClick={handleLogout} className="text-[#cbd5e1] hover:text-[#64748b] transition-colors" title="Sign out">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
