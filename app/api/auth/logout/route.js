import { createRouteClient } from '@/lib/supabaseServer'

export async function POST() {
  try {
    const supabase = createRouteClient()
    await supabase.auth.signOut()
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message || 'Could not sign out.' }, { status: 500 })
  }
}
