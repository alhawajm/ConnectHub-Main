import { createRouteClient } from '@/lib/supabaseServer'
import { scoreJobForSeeker } from '@/lib/jobMatching'

/**
 * GET /api/applications
 * Returns applications for the current user
 * - Seeker:   returns their own applications
 * - Employer: returns applications to their jobs
 */
export async function GET(request) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()

    let q

    if (profile?.role === 'seeker') {
      // Seeker: see their own applications
      q = supabase
        .from('applications')
        .select('*, jobs(title, location, salary_min, salary_max, profiles(employer_profiles(company_name)))')
        .eq('seeker_id', session.user.id)
        .order('created_at', { ascending: false })

    } else if (profile?.role === 'employer') {
      // Employer: see applications to their jobs
      const { data: jobs } = await supabase.from('jobs').select('id').eq('employer_id', session.user.id)
      const jobIds = (jobs || []).map(j => j.id)

      if (!jobIds.length) return Response.json({ success: true, data: [] })

      q = supabase
        .from('applications')
        .select('*, jobs(title), profiles!applications_seeker_id_fkey(full_name, avatar_url, skills, headline)')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false })

    } else {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await q
    if (error) throw error

    return Response.json({ success: true, data })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/applications
 * Submit a job application (seeker only)
 */
export async function POST(request) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const [{ data: profile }, { data: seekerProfile }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('seeker_profiles').select('*').eq('id', session.user.id).single(),
    ])
    if (profile?.role !== 'seeker') return Response.json({ error: 'Only job seekers can apply' }, { status: 403 })

    const { job_id, cover_letter, cv_url } = await request.json()
    if (!job_id) return Response.json({ error: 'job_id is required' }, { status: 400 })

    // Check if already applied
    const { data: existing } = await supabase.from('applications').select('id').eq('job_id', job_id).eq('seeker_id', session.user.id).single()
    if (existing) return Response.json({ error: 'Already applied to this job' }, { status: 409 })

    // Fetch job skills to compute AI match score
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', job_id)
      .single()

    const recommendation = scoreJobForSeeker(job, {
      profile,
      seekerProfile,
      appliedJobIds: [],
      savedJobIds: [],
    })

    const { data, error } = await supabase.from('applications').insert({
      job_id, seeker_id: session.user.id,
      cover_letter, cv_url,
      ai_match_score: recommendation.score,
      status: 'pending',
    }).select().single()

    if (error) throw error

    // Increment job applications_count
    await supabase.from('jobs').update({ applications_count: job?.applications_count + 1 }).eq('id', job_id)

    return Response.json({ success: true, data }, { status: 201 })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

/**
 * PATCH /api/applications
 * Update application status (employer only)
 * Body: { id, status }
 */
export async function PATCH(request) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, status, employer_notes } = await request.json()

    const validStatuses = ['pending','reviewed','shortlisted','interview','offered','hired','rejected']
    if (!validStatuses.includes(status)) return Response.json({ error: 'Invalid status' }, { status: 400 })

    const { data, error } = await supabase
      .from('applications')
      .update({ status, employer_notes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return Response.json({ success: true, data })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
