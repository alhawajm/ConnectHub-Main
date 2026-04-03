import { createRouteClient } from '@/lib/supabaseServer'

/**
 * GET /api/jobs
 * Returns active jobs — public, filterable by query params
 * ?search=developer&location=Manama&type=full_time&limit=20&offset=0
 */
export async function GET(request) {
  try {
    const supabase = createRouteClient()
    const { searchParams } = new URL(request.url)

    const search   = searchParams.get('search')
    const location = searchParams.get('location')
    const jobType  = searchParams.get('type')
    const workModel= searchParams.get('work_model')
    const limit    = parseInt(searchParams.get('limit')  || '20')
    const offset   = parseInt(searchParams.get('offset') || '0')

    // Build query
    let q = supabase
      .from('jobs')
      .select('*, profiles!jobs_employer_id_fkey(full_name, employer_profiles(company_name, company_logo))', { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search)    q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    if (location)  q = q.ilike('location', `%${location}%`)
    if (jobType)   q = q.eq('job_type', jobType)
    if (workModel) q = q.eq('work_model', workModel)

    const { data, error, count } = await q
    if (error) throw error

    return Response.json({ success: true, data, total: count })

  } catch (error) {
    console.error('[GET /api/jobs]', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/jobs
 * Create a new job post (employer only)
 */
export async function POST(request) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify user is an employer
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, plan')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'employer') {
      return Response.json({ error: 'Only employers can post jobs' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, requirements, job_type, work_model, location, department,
            salary_min, salary_max, skills_required, status = 'draft' } = body

    if (!title || !description) {
      return Response.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const { data, error } = await supabase.from('jobs').insert({
      employer_id: session.user.id,
      title, description, requirements, job_type, work_model,
      location: location || 'Manama, Bahrain',
      department,
      salary_min: salary_min ? parseInt(salary_min) : null,
      salary_max: salary_max ? parseInt(salary_max) : null,
      skills_required: Array.isArray(skills_required)
        ? skills_required
        : (skills_required || '').split(',').map(s => s.trim()).filter(Boolean),
      status,
    }).select().single()

    if (error) throw error

    return Response.json({ success: true, data }, { status: 201 })

  } catch (error) {
    console.error('[POST /api/jobs]', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
