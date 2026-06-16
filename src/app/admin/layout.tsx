import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminNavbar from "@/components/admin/AdminNavbar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/admin/login")

  const { data: adminData } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!adminData) redirect("/admin/login")

  return (
    <div className="min-h-screen bg-gray-950">
      <AdminNavbar adminName={adminData.full_name || adminData.email} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
