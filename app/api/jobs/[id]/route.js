import { createRouteClient } from '@/lib/supabaseServer'

/**
 * GET /api/jobs/[id] — Get a single job by ID (increments view count)
 * PATCH /api/jobs/[id] — Update job (employer only)
 * DELETE /api/jobs/[id] — Delete/close job (employer only)
 */

export async function GET(request, { params }) {
  try {
    const supabase = createRouteClient()
    const { id }   = params

    const { data, error } = await supabase
      .from('jobs')
      .select('*, profiles!jobs_employer_id_fkey(full_name, headline, employer_profiles(company_name, company_size, industry, company_logo))')
      .eq('id', id)
      .single()

    if (error) throw error

    // Increment view count
    await supabase.from('jobs').update({ views_count: (data.views_count || 0) + 1 }).eq('id', id)

    return Response.json({ success: true, data })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const body   = await request.json()

    // Verify ownership
    const { data: job } = await supabase.from('jobs').select('employer_id').eq('id', id).single()
    if (job?.employer_id !== session.user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabase.from('jobs').update(body).eq('id', id).select().single()
    if (error) throw error

    return Response.json({ success: true, data })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = createRouteClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params

    // Soft delete — set status to closed
    const { error } = await supabase
      .from('jobs')
      .update({ status: 'closed' })
      .eq('id', id)
      .eq('employer_id', session.user.id) // ownership check via RLS

    if (error) throw error

    return Response.json({ success: true, message: 'Job closed' })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
