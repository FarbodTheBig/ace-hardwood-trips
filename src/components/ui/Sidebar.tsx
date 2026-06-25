"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { href: "/trip/new", label: "New Trip", icon: <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v16m8-8H4"/></svg> },
  { href: "/history", label: "Trip History", icon: <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
]

export default function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <aside className="w-[200px] bg-[#111] border-r border-[#222] flex flex-col h-screen sticky top-0 no-print flex-shrink-0">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#222]">
        <div className="w-7 h-7 rounded-lg bg-[#3b82f6] flex items-center justify-center flex-shrink-0">
          <svg className="w-[14px] h-[14px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
            <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 16H3m10 0h1m1-9h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16h-2"/>
          </svg>
        </div>
        <span className="text-[14px] font-bold text-white">RoadLog</span>
      </div>

      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
          return (
            <Link key={link.href} href={link.href} className={isActive ? "sidebar-item-active" : "sidebar-item"}>
              {link.icon}
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 py-3 border-t border-[#222]">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-[#181818]">
          <div className="w-6 h-6 rounded-md bg-[#1a2332] border border-[#2a3a4a] flex items-center justify-center text-[9px] font-bold text-[#60a5fa] flex-shrink-0">
            {initials}
          </div>
          <span className="text-[12px] text-[#666] truncate flex-1">{userName}</span>
          <button onClick={handleLogout} className="text-[#333] hover:text-[#666] transition-colors" title="Sign out">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
