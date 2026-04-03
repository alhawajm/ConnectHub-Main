import { createRouteClient } from '@/lib/supabaseServer'
import { createAdminClient } from '@/lib/supabaseAdmin'
import { scoreJobForSeeker } from '@/lib/jobMatching'
import { sendTransactionalEmail } from '@/lib/email'
import { renderApplicationReceivedEmail, renderApplicationStatusEmail } from '@/lib/engagementEmails'
import { enforceRateLimit } from '@/lib/rateLimit'
import { recordAnalyticsEvent, recordServerError } from '@/lib/telemetry'

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

    await recordAnalyticsEvent({
      category: 'applications',
      action: 'list',
      actorId: session.user.id,
      actorRole: profile?.role,
      route: '/api/applications',
      metadata: { count: data?.length || 0 },
    })

    return Response.json({ success: true, data })

  } catch (error) {
    await recordServerError({
      category: 'applications',
      action: 'list_failed',
      error,
      route: '/api/applications',
    })
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
    const adminClient = createAdminClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const [{ data: profile }, { data: seekerProfile }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('seeker_profiles').select('*').eq('id', session.user.id).single(),
    ])
    if (profile?.role !== 'seeker') return Response.json({ error: 'Only job seekers can apply' }, { status: 403 })

    const rateLimitResponse = enforceRateLimit({
      request,
      bucket: 'applications-submit',
      actorId: session.user.id,
      limit: 12,
      windowMs: 10 * 60 * 1000,
      message: 'Too many application attempts. Please wait a few minutes before trying again.',
    })

    if (rateLimitResponse) {
      return rateLimitResponse
    }

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

    if (job?.employer_id) {
      await adminClient.from('notifications').insert({
        user_id: job.employer_id,
        type: 'application',
        title: 'New job application',
        body: `${profile?.full_name || 'A candidate'} applied for ${job?.title || 'your role'}.`,
        link: '/dashboard/employer',
      })

      const { data: employerProfile } = await adminClient
        .from('profiles')
        .select('full_name')
        .eq('id', job.employer_id)
        .single()

      const { data: employerAuth } = await adminClient.auth.admin.getUserById(job.employer_id)

      if (employerAuth?.user?.email) {
        await sendTransactionalEmail({
          to: employerAuth.user.email,
          subject: `New application for ${job?.title || 'your role'}`,
          html: renderApplicationReceivedEmail({
            seekerName: profile?.full_name,
            jobTitle: job?.title,
            employerName: employerProfile.full_name,
          }),
        })
      }
    }

    await recordAnalyticsEvent({
      category: 'applications',
      action: 'submitted',
      actorId: session.user.id,
      actorRole: profile?.role,
      route: '/api/applications',
      message: `${profile?.full_name || 'A seeker'} applied for ${job?.title || 'a role'}.`,
      metadata: { jobId: job_id, aiMatchScore: recommendation.score },
    })

    return Response.json({ success: true, data }, { status: 201 })

  } catch (error) {
    await recordServerError({
      category: 'applications',
      action: 'submit_failed',
      error,
      route: '/api/applications',
    })
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
    const adminClient = createAdminClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id, status, employer_notes } = await request.json()

    const validStatuses = ['pending','reviewed','shortlisted','interview','offered','hired','rejected']
    if (!validStatuses.includes(status)) return Response.json({ error: 'Invalid status' }, { status: 400 })

    const { data: actorProfile } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .eq('id', session.user.id)
      .single()

    const rateLimitResponse = enforceRateLimit({
      request,
      bucket: 'applications-status-update',
      actorId: session.user.id,
      limit: 40,
      windowMs: 10 * 60 * 1000,
      message: 'Too many application updates. Please wait a few minutes before continuing.',
    })

    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const { data: currentApplication } = await adminClient
      .from('applications')
      .select('id, seeker_id, jobs!inner(title, employer_id)')
      .eq('id', id)
      .single()

    if (!currentApplication || currentApplication.jobs?.employer_id !== session.user.id) {
      return Response.json({ error: 'Application not found for this employer' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('applications')
      .update({ status, employer_notes, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    const { data: applicationDetails } = await adminClient
      .from('applications')
      .select(`
        id,
        status,
        employer_notes,
        seeker_id,
        jobs(title, employer_id),
        profiles!applications_seeker_id_fkey(full_name)
      `)
      .eq('id', id)
      .single()

    if (applicationDetails?.seeker_id) {
      await adminClient.from('notifications').insert({
        user_id: applicationDetails.seeker_id,
        type: 'application',
        title: 'Application status updated',
        body: `Your application for ${applicationDetails.jobs?.title || 'a role'} is now ${status}.`,
        link: '/dashboard/seeker',
      })

      const { data: seekerAuth } = await adminClient.auth.admin.getUserById(applicationDetails.seeker_id)

      if (seekerAuth?.user?.email) {
        await sendTransactionalEmail({
          to: seekerAuth.user.email,
          subject: `Application update: ${applicationDetails.jobs?.title || 'ConnectHub role'}`,
          html: renderApplicationStatusEmail({
            seekerName: applicationDetails.profiles.full_name,
            jobTitle: applicationDetails.jobs?.title,
            status,
            employerName: actorProfile?.full_name,
            employerNotes: employer_notes,
          }),
        })
      }
    }

    await recordAnalyticsEvent({
      category: 'applications',
      action: 'status_updated',
      actorId: session.user.id,
      actorRole: actorProfile?.role,
      route: '/api/applications',
      message: `${actorProfile?.full_name || 'An employer'} marked an application as ${status}.`,
      metadata: { applicationId: id, status },
    })

    return Response.json({ success: true, data })

  } catch (error) {
    await recordServerError({
      category: 'applications',
      action: 'status_update_failed',
      error,
      route: '/api/applications',
    })
    return Response.json({ error: error.message }, { status: 500 })
  }
}
