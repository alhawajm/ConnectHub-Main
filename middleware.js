import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

const KNOWN_ROLES = ['employer', 'seeker', 'freelancer', 'admin']

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const { pathname } = req.nextUrl
  const isSwitchMode = req.nextUrl.searchParams.get('switch') === '1'

  if (!session && (pathname.startsWith('/dashboard') || pathname === '/auth/role')) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
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
    return NextResponse.redirect(new URL(userRole ? `/dashboard/${userRole}` : '/auth/role', req.url))
  }

  if (session && pathname.startsWith('/dashboard/') && !userRole) {
    return NextResponse.redirect(new URL('/auth/role', req.url))
  }

  if (session && pathname.startsWith('/dashboard/')) {
    const pathRole = pathname.split('/')[2]

    if (userRole && KNOWN_ROLES.includes(pathRole) && pathRole !== userRole) {
      return NextResponse.redirect(new URL(`/dashboard/${userRole}`, req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
