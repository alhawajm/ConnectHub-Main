import { createRouteClient } from '@/lib/supabaseServer'

/**
 * GET /api/freelance
 * Returns open freelance projects — public
 * ?search=&category=&budget_min=&budget_max=&limit=20
 */
export async function GET(request) {
  try {
    const supabase = createRouteClient()
    const { searchParams } = new URL(request.url)

    const search    = searchParams.get('search')
    const category  = searchParams.get('category')
    const budgetMin = searchParams.get('budget_min')
    const limit     = parseInt(searchParams.get('limit') || '20')
    const offset    = parseInt(searchParams.get('offset') || '0')

    let q = supabase
      .from('projects')
      .select('*, profiles!projects_client_id_fkey(full_name, avatar_url)', { count: 'exact' })
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search)    q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    if (category)  q = q.eq('category', category)
    if (budgetMin) q = q.gte('budget_max', parseFloat(budgetMin))

    const { data, error, count } = await q
    if (error) throw error

    return Response.json({ success: true, data, total: count })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/freelance
 * Post a new freelance project (employer/client)
 */
export async function POST(request) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { title, description, category, skills_required, budget_type,
            budget_min, budget_max, duration, experience_level } = body

    if (!title || !description || !category) {
      return Response.json({ error: 'Title, description and category are required' }, { status: 400 })
    }

    const { data, error } = await supabase.from('projects').insert({
      client_id: session.user.id,
      title, description, category,
      skills_required: Array.isArray(skills_required) ? skills_required : [],
      budget_type: budget_type || 'fixed',
      budget_min: budget_min ? parseFloat(budget_min) : null,
      budget_max: budget_max ? parseFloat(budget_max) : null,
      duration, experience_level,
      status: 'open',
    }).select().single()

    if (error) throw error

    return Response.json({ success: true, data }, { status: 201 })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
