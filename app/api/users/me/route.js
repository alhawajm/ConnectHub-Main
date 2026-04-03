import { createRouteClient } from '@/lib/supabaseServer'

/**
 * GET /api/users/me — fetch current user's profile (all fields)
 * PATCH /api/users/me — update current user's profile
 */

export async function GET() {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error) throw error

    // Fetch role-specific profile
    let roleProfile = null
    const roleTable = { employer: 'employer_profiles', seeker: 'seeker_profiles', freelancer: 'freelancer_profiles' }[profile.role]
    if (roleTable) {
      const { data: rp } = await supabase.from(roleTable).select('*').eq('id', session.user.id).maybeSingle()
      roleProfile = rp
    }

    return Response.json({ success: true, data: { ...profile, roleProfile, email: session.user.email } })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()

    // Only allow safe fields to be updated
    const { full_name, headline, bio, location, phone, website, linkedin_url, skills } = body

    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name, headline, bio, location, phone, website, linkedin_url, skills })
      .eq('id', session.user.id)
      .select()
      .single()

    if (error) throw error

    return Response.json({ success: true, data })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
