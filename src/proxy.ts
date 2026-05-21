import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedPaths = ['/today', '/settings']
// Auth route that authenticated users should skip
const authPaths = ['/login']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userId = request.cookies.get('user_id')?.value

  // Redirect unauthenticated users away from protected routes
  if (protectedPaths.some(path => pathname.startsWith(path)) && !userId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from login to dashboard
  if (authPaths.some(path => pathname.startsWith(path)) && userId) {
    return NextResponse.redirect(new URL('/today', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/today/:path*', '/settings/:path*', '/login/:path*'],
}
