import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  // Note: /register removed - registration disabled for private platform
  const publicRoutes = ['/login', '/forgot-password', '/reset-password']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Allow API routes to proceed without redirection
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // If user is not logged in and trying to access protected route
  if (!userId && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is logged in and trying to access login/register
  if (userId && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
