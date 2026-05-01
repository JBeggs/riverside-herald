import { NextResponse, type NextRequest } from 'next/server'

/**
 * Proxy for route protection (Next.js 16+).
 * JWT token validation is handled client-side via AuthContext.
 * This proxy only handles route-based redirects.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Block image files and other static assets from being routed as pages
  const staticFileExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.css', '.js', '.ico', '.woff', '.woff2', '.ttf', '.eot']
  const isStaticFile = staticFileExtensions.some(ext => pathname.toLowerCase().endsWith(ext))

  if (isStaticFile) {
    return new NextResponse(null, { status: 404 })
  }

  // Protected routes - require authentication
  const protectedPaths = ['/admin', '/profile', '/dashboard']
  const isProtectedPath = protectedPaths.some(path =>
    pathname.startsWith(path)
  )

  const authToken = request.cookies.get('auth_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  // Redirect to login when accessing protected route without auth (no blank UI)
  if (isProtectedPath && !authToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|css|js|ico|woff|woff2|ttf|eot)$).*)',
  ],
}
