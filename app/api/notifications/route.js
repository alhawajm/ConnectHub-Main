import { createRouteClient } from '@/lib/supabaseServer'

/**
 * GET /api/notifications — fetch current user's notifications
 * PATCH /api/notifications — mark all as read
 */

export async function GET() {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) throw error

    const unread = (data || []).filter(n => !n.is_read).length

    return Response.json({ success: true, data, unread })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH() {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false)

    return Response.json({ success: true })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/notifications — create a notification (internal use / server actions)
 * Body: { user_id, type, title, body, link }
 */
export async function POST(request) {
  try {
    const supabase = createRouteClient()
    const body = await request.json()
    const { user_id, type, title, body: notifBody, link } = body

    if (!user_id || !type || !title) {
      return Response.json({ error: 'user_id, type and title are required' }, { status: 400 })
    }

    const { data, error } = await supabase.from('notifications').insert({
      user_id, type, title, body: notifBody, link,
    }).select().single()

    if (error) throw error

    return Response.json({ success: true, data }, { status: 201 })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
