import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabaseServer'
import { enforceRateLimit } from '@/lib/rateLimit'
import { recordAnalyticsEvent } from '@/lib/telemetry'

export async function POST(request) {
  try {
    const supabase = createRouteClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    let actorRole = null
    if (session?.user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()

      actorRole = profile?.role || null
    }

    const rateLimitResponse = enforceRateLimit({
      request,
      bucket: 'analytics-track',
      actorId: session?.user?.id || '',
      limit: 120,
      windowMs: 60 * 1000,
      message: 'Too many analytics events. Please slow down and try again.',
    })

    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = await request.json()

    await recordAnalyticsEvent({
      source: 'client',
      category: body.category || 'engagement',
      action: body.action || 'unknown_action',
      level: body.level || 'info',
      actorId: session?.user?.id || null,
      actorRole,
      route: body.route || request.headers.get('referer') || null,
      message: body.message || null,
      metadata: body.metadata || {},
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Could not track event.' }, { status: 500 })
  }
}
