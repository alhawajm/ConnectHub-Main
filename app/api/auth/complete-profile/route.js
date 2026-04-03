import { createRouteClient } from '@/lib/supabaseServer'

function buildDisplayName(user) {
  const metadata = user?.user_metadata || {}
  return (
    metadata.full_name ||
    metadata.name ||
    metadata.user_name ||
    user?.email?.split('@')[0] ||
    'ConnectHub User'
  )
}

async function ensureRoleProfile(supabase, userId, role, displayName) {
  if (role === 'employer') {
    await supabase.from('employer_profiles').upsert({
      id: userId,
      company_name: `${displayName}'s Company`,
      company_size: '1-10',
      industry: 'Business Services',
    })
  }

  if (role === 'seeker') {
    await supabase.from('seeker_profiles').upsert({
      id: userId,
      experience_years: 0,
      availability: 'available',
    })
  }

  if (role === 'freelancer') {
    await supabase.from('freelancer_profiles').upsert({
      id: userId,
      hourly_rate: 15,
      availability: 'available',
      categories: [],
      rating: 0,
      review_count: 0,
      completion_rate: 100,
      total_earned: 0,
      wallet_balance: 0,
    })
  }
}

export async function POST(request) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await request.json()
    const {
      data: currentProfile,
      error: currentProfileError,
    } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()

    if (currentProfileError) throw currentProfileError

    const canAssignAdmin =
      currentProfile?.role === 'admin' ||
      session.user.user_metadata?.role === 'admin'
    const validRoles = canAssignAdmin
      ? ['employer', 'seeker', 'freelancer', 'admin']
      : ['employer', 'seeker', 'freelancer']

    if (!validRoles.includes(role)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 })
    }

    const user = session.user
    const displayName = buildDisplayName(user)
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      role,
      full_name: displayName,
      avatar_url: avatarUrl,
      location: 'Bahrain',
      is_active: true,
    })

    if (profileError) throw profileError

    await ensureRoleProfile(supabase, user.id, role, displayName)

    return Response.json({ success: true, data: { role } })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
