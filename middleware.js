import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

const KNOWN_ROLES = ['employer', 'seeker', 'freelancer', 'admin']
const PROTECTED_PATH_PREFIXES = ['/dashboard']
const HISTORY_SENSITIVE_PATHS = ['/login', '/register', '/auth/role']

function isHistorySensitivePath(pathname) {
  return (
    PROTECTED_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix)) ||
    HISTORY_SENSITIVE_PATHS.includes(pathname)
  )
}

function applySessionAwareHeaders(response, pathname) {
  if (isHistorySensitivePath(pathname)) {
    response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Vary', 'Cookie')
  }

  return response
}

function redirectWithHeaders(url, pathname) {
  return applySessionAwareHeaders(NextResponse.redirect(url), pathname)
}

export async function middleware(req) {
  const { pathname } = req.nextUrl
  const res = applySessionAwareHeaders(NextResponse.next(), pathname)
  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isSwitchMode = req.nextUrl.searchParams.get('switch') === '1'

  if (!session && (pathname.startsWith('/dashboard') || pathname === '/auth/role')) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return redirectWithHeaders(loginUrl, pathname)
  }

  let userRole = null
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()

    userRole = profile?.role || null
  }

  if (session && (pathname === '/login' || pathname === '/register') && !isSwitchMode) {
    return redirectWithHeaders(new URL(userRole ? `/dashboard/${userRole}` : '/auth/role', req.url), pathname)
  }

  if (session && pathname === '/dashboard') {
    return redirectWithHeaders(new URL(userRole ? `/dashboard/${userRole}` : '/auth/role', req.url), pathname)
  }

  if (session && pathname.startsWith('/dashboard/') && !userRole) {
    return redirectWithHeaders(new URL('/auth/role', req.url), pathname)
  }

  if (session && pathname.startsWith('/dashboard/')) {
    const pathRole = pathname.split('/')[2]

    if (userRole && KNOWN_ROLES.includes(pathRole) && pathRole !== userRole) {
      return redirectWithHeaders(new URL(`/dashboard/${userRole}`, req.url), pathname)
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
