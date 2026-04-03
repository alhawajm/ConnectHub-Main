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

    const [profileResult, freelancerProfileResult, proposalsResult, contractsResult] = await Promise.all([
      adminClient.from('profiles').select('*').eq('id', userId).single(),
      adminClient.from('freelancer_profiles').select('*').eq('id', userId).limit(1),
      adminClient
        .from('proposals')
        .select('*, projects(id, title, budget_max, status, updated_at, profiles!projects_client_id_fkey(full_name))')
        .eq('freelancer_id', userId)
        .order('created_at', { ascending: false }),
      adminClient
        .from('contracts')
        .select('*, projects(id, title, status, budget_max, updated_at), client:profiles!contracts_client_id_fkey(id, full_name)')
        .eq('freelancer_id', userId)
        .order('created_at', { ascending: false }),
    ])

    if (profileResult.error) {
      throw profileResult.error
    }

    const contractRows = contractsResult.data || []
    const contractIds = contractRows.map(contract => contract.id)

    const [milestonesResult, escrowResult, disputesResult] = contractIds.length
      ? await Promise.all([
          adminClient.from('milestones').select('*').in('contract_id', contractIds).order('created_at', { ascending: true }),
          adminClient
            .from('escrow')
            .select('*, contracts(title), milestones(title), from_user:profiles!escrow_from_user_id_fkey(full_name), to_user:profiles!escrow_to_user_id_fkey(full_name)')
            .in('contract_id', contractIds)
            .order('created_at', { ascending: false }),
          adminClient
            .from('disputes')
            .select('*, contracts(id, title, client_id, freelancer_id)')
            .in('contract_id', contractIds)
            .order('created_at', { ascending: false }),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }]

    return NextResponse.json({
      success: true,
      data: {
        profile: profileResult.data || null,
        freelancerProfile: freelancerProfileResult.data?.[0] || null,
        proposals: proposalsResult.data || [],
        contracts: contractRows,
        milestones: milestonesResult.data || [],
        escrowRows: escrowResult.data || [],
        disputes: disputesResult.data || [],
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Could not load freelancer dashboard.' },
      { status: 500 }
    )
  }
}
