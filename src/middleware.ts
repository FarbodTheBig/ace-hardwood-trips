import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Public routes — never redirect these
  if (
    pathname === "/auth/login" ||
    pathname === "/auth/signup" ||
    pathname === "/admin/login"
  ) {
    return supabaseResponse
  }

  // Protected driver routes
  const driverRoutes = ["/dashboard", "/trip", "/history"]
  const isDriverRoute = driverRoutes.some((r) => pathname.startsWith(r))
  if (!user && isDriverRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Protected admin routes
  const adminRoutes = ["/admin/dashboard", "/admin/drivers", "/admin/trips"]
  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r))
  if (!user && isAdminRoute) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  // Root redirect
  if (user && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
