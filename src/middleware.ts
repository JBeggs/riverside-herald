import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware for route protection.
 * Note: JWT token validation is handled client-side via AuthContext.
 * This middleware only handles route-based redirects.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Block image files and other static assets from being routed as pages
  const staticFileExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.css', '.js', '.ico', '.woff', '.woff2', '.ttf', '.eot']
  const isStaticFile = staticFileExtensions.some(ext => pathname.toLowerCase().endsWith(ext))
  
  if (isStaticFile) {
    // Return 404 for static files that aren't in public folder
    return new NextResponse(null, { status: 404 })
  }

  // Protected routes - require authentication
  const protectedPaths = ['/admin', '/profile', '/dashboard']
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  )

  // Check for auth token in cookies or headers
  const authToken = request.cookies.get('auth_token')?.value || 
                    request.headers.get('authorization')?.replace('Bearer ', '')

  // If accessing protected route without auth token, redirect to home
  if (isProtectedPath && !authToken) {
    const redirectUrl = new URL('/', request.url)
    redirectUrl.searchParams.set('auth', 'required')
    return NextResponse.redirect(redirectUrl)
  }

  // Admin-only routes - role checking is done client-side or via API
  // Middleware can't easily validate JWT without making API calls
  // So we'll let the route handle role checking
  const adminPaths = ['/admin']
  const isAdminPath = adminPaths.some(path => 
    pathname.startsWith(path)
  )

  // For admin paths, we'll let the page component check the role
  // If unauthorized, the page will redirect
  // This is simpler than making API calls in middleware

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - Files with image/static extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|css|js|ico|woff|woff2|ttf|eot)$).*)',
  ],
}
