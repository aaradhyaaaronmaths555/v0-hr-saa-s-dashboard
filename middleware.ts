import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SESSION_COOKIE = "peopledesk_session"

function hasSession(request: NextRequest): boolean {
  return request.cookies.has(SESSION_COOKIE)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const loggedIn = hasSession(request)

  // If logged in and visiting /login, redirect to dashboard
  if (pathname === "/login" && loggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Protected routes: redirect to /login if no session
  const protectedPaths = [
    "/dashboard",
    "/employees",
    "/certificates",
    "/policies",
    "/onboarding",
    "/reports",
  ]
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )

  if (isProtected && !loggedIn) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/employees/:path*",
    "/certificates/:path*",
    "/policies/:path*",
    "/onboarding/:path*",
    "/reports/:path*",
  ],
}
