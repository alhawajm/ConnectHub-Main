import { createRouteClient } from '@/lib/supabaseServer'
import { enforceRateLimit } from '@/lib/rateLimit'
import { recordAnalyticsEvent, recordServerError } from '@/lib/telemetry'

export async function POST(request) {
  try {
    const supabase = createRouteClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const rateLimitResponse = enforceRateLimit({
      request,
      bucket: 'auth-logout',
      actorId: session?.user?.id || '',
      limit: 20,
      windowMs: 5 * 60 * 1000,
      message: 'Too many sign-out requests. Please wait a moment and try again.',
    })

    if (rateLimitResponse) {
      return rateLimitResponse
    }

    let actorRole = null
    if (session?.user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()

      actorRole = profile?.role || null
    }

    await supabase.auth.signOut()

    if (session?.user?.id) {
      await recordAnalyticsEvent({
        category: 'auth',
        action: 'logout',
        actorId: session.user.id,
        actorRole,
        route: '/api/auth/logout',
        message: 'User signed out successfully.',
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    await recordServerError({
      category: 'auth',
      action: 'logout_failed',
      error,
      route: '/api/auth/logout',
    })
    return Response.json({ error: error.message || 'Could not sign out.' }, { status: 500 })
  }
}
