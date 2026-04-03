import { createRouteClient } from '@/lib/supabaseServer'

/**
 * GET /api/messages — list conversations for current user
 * POST /api/messages — start a conversation or send a message
 */

export async function GET() {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const uid = session.user.id

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        p1:profiles!conversations_participant_1_fkey(id, full_name, avatar_url, headline),
        p2:profiles!conversations_participant_2_fkey(id, full_name, avatar_url, headline)
      `)
      .or(`participant_1.eq.${uid},participant_2.eq.${uid}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (error) throw error

    return Response.json({ success: true, data })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { recipient_id, message } = await request.json()
    if (!recipient_id || !message) {
      return Response.json({ error: 'recipient_id and message are required' }, { status: 400 })
    }

    const uid = session.user.id

    // Find or create conversation
    const p1 = uid < recipient_id ? uid : recipient_id
    const p2 = uid < recipient_id ? recipient_id : uid

    let { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .eq('participant_1', p1)
      .eq('participant_2', p2)
      .single()

    if (!conv) {
      const { data: newConv, error: convErr } = await supabase
        .from('conversations')
        .insert({ participant_1: p1, participant_2: p2 })
        .select()
        .single()
      if (convErr) throw convErr
      conv = newConv
    }

    // Insert message
    const { data: msg, error: msgErr } = await supabase
      .from('messages')
      .insert({ conversation_id: conv.id, sender_id: uid, content: message })
      .select()
      .single()

    if (msgErr) throw msgErr

    // Update conversation last_message
    await supabase.from('conversations').update({
      last_message: message,
      last_message_at: new Date().toISOString(),
    }).eq('id', conv.id)

    return Response.json({ success: true, data: { conversation_id: conv.id, message: msg } }, { status: 201 })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
