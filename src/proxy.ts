import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export const proxy = auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isPublicPath =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register")

  const isApi = nextUrl.pathname.startsWith("/api/")

  if (isApi) return NextResponse.next()

  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
