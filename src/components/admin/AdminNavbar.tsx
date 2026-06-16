"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import clsx from "clsx"

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/drivers", label: "Drivers" },
  { href: "/admin/trips", label: "All Trips" },
  { href: "/admin/dispatch", label: "Dispatch" },
  { href: "/admin/reports", label: "Reports" },
]

export default function AdminNavbar({ adminName }: { adminName: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <nav className="bg-gray-900 border-b border-red-900/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-white text-sm">ACE HARDWOOD</span>
                <span className="text-red-400 text-xs block font-semibold uppercase tracking-widest leading-none">Admin</span>
              </div>
            </Link>
            <div className="flex items-center gap-0.5 overflow-x-auto">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className={clsx("px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                    pathname.startsWith(link.href) ? "bg-red-600/10 text-red-400" : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm text-gray-400 hidden md:block">{adminName}</span>
            <button onClick={handleLogout} className="bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white font-medium px-3 py-2 rounded-lg transition-colors text-sm">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
