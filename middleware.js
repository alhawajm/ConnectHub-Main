import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

/**
 * Middleware — runs on every request before the page renders.
 * Responsibilities:
 *  1. Refresh the Supabase session cookie so it never expires mid-session
 *  2. Protect dashboard routes — redirect unauthenticated users to /login
 *  3. Redirect authenticated users away from /login and /register
 *  4. Enforce role-based routing (employer can't visit /seeker/*, etc.)
 */
export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session — MUST be called to keep session alive
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // ── Public routes (no auth required) ──────────────────────────
  const publicRoutes = ['/', '/login', '/register', '/about', '/pricing', '/contact']
  const isPublic = publicRoutes.some(r => pathname === r) || pathname.startsWith('/api/auth')

  // ── If not logged in and trying to access a dashboard ─────────
  if (!session && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname) // remember where they were going
    return NextResponse.redirect(loginUrl)
  }

  // ── Get user role from profiles table ─────────────────────────
  let userRole = 'seeker'
  if (session) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      if (profile?.role) {
        userRole = profile.role
      }
    } catch (err) {
      // If query fails, use default role
      userRole = 'seeker'
    }
  }

  // ── If logged in and visiting login/register, go to dashboard ─
  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL(`/dashboard/${userRole}`, req.url))
  }

  // ── Role enforcement — prevent cross-role dashboard access ─────
  if (session && pathname.startsWith('/dashboard/')) {
    const pathRole = pathname.split('/')[2] // e.g. "employer" from "/dashboard/employer/jobs"

    // Only enforce for known roles, not API routes
    const knownRoles = ['employer', 'seeker', 'freelancer', 'admin']
    if (knownRoles.includes(pathRole) && pathRole !== userRole) {
      // Redirect to their correct dashboard
      return NextResponse.redirect(new URL(`/dashboard/${userRole}`, req.url))
    }
  }

  return res
}

// Tell Next.js which paths to run middleware on
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
