import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: adminData } = await supabase.from("admin_users").select("id").eq("id", user.id).single()
  if (!adminData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { full_name, email, password, phone, truck_number } = await req.json()

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name },
    email_confirm: true,
  })

  if (createError || !newUser.user) {
    return NextResponse.json({ error: createError?.message || "Failed to create user" }, { status: 400 })
  }

  await adminSupabase.from("driver_profiles").insert({
    id: newUser.user.id,
    full_name,
    email,
    phone,
    truck_number,
    status: "active",
  })

  return NextResponse.json({ id: newUser.user.id })
}
