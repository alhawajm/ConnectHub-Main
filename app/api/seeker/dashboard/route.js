import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { createRouteClient } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const supabase = createRouteClient()
    const adminClient = createAdminClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    let userId = session?.user?.id || null

    if (!userId) {
      const authorization = request.headers.get('authorization') || ''
      const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''

      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const {
        data: { user },
        error: userError,
      } = await adminClient.auth.getUser(token)

      if (userError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      userId = user.id
    }

    const [profileResult, seekerProfileResult, applicationsResult, savedJobsResult, jobsResult] = await Promise.all([
      adminClient.from('profiles').select('*').eq('id', userId).single(),
      adminClient.from('seeker_profiles').select('*').eq('id', userId).limit(1),
      adminClient
        .from('applications')
        .select('*, jobs(title)')
        .eq('seeker_id', userId)
        .order('created_at', { ascending: false }),
      adminClient.from('saved_jobs').select('*, jobs(*)').eq('seeker_id', userId),
      adminClient
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(30),
    ])

    if (profileResult.error) {
      throw profileResult.error
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: profileResult.data || null,
        seekerProfile: seekerProfileResult.data?.[0] || null,
        applications: applicationsResult.data || [],
        savedJobs: savedJobsResult.data || [],
        jobs: jobsResult.data || [],
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Could not load seeker dashboard.' },
      { status: 500 }
    )
  }
}
