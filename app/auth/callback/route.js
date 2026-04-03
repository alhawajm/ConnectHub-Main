import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabaseServer'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const chosenRole = requestUrl.searchParams.get('role')
  const nextPath = requestUrl.searchParams.get('next')

  const supabase = createRouteClient()

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const roleUrl = new URL('/auth/role', request.url)
  if (chosenRole) roleUrl.searchParams.set('role', chosenRole)
  if (nextPath) roleUrl.searchParams.set('next', nextPath)
  return NextResponse.redirect(roleUrl)
}
