import { NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabaseServer'
import { createAdminClient } from '@/lib/supabaseAdmin'

async function getCurrentProfile(supabase) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', session.user.id)
    .single()

  if (!profile) {
    throw new Error('Profile not found')
  }

  return profile
}

async function notifyUsers(adminClient, userIds, title, body, link) {
  const rows = [...new Set((userIds || []).filter(Boolean))].map(userId => ({
    user_id: userId,
    type: 'payment',
    title,
    body,
    link,
  }))

  if (!rows.length) return
  await adminClient.from('notifications').insert(rows)
}

async function releaseHeldEscrow(adminClient, contractId) {
  const { data: heldRows } = await adminClient
    .from('escrow')
    .select('id, amount, to_user_id, milestone_id')
    .eq('contract_id', contractId)
    .in('status', ['held', 'disputed'])

  if (!heldRows?.length) return { releasedAmount: 0, recipientId: null }

  const releasedAt = new Date().toISOString()
  await adminClient
    .from('escrow')
    .update({ status: 'released', released_at: releasedAt })
    .in('id', heldRows.map(row => row.id))

  const milestoneIds = heldRows.map(row => row.milestone_id).filter(Boolean)
  if (milestoneIds.length) {
    await adminClient
      .from('milestones')
      .update({ status: 'released' })
      .in('id', milestoneIds)
  }

  const releasedAmount = heldRows.reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const recipientId = heldRows[0]?.to_user_id || null

  if (recipientId && releasedAmount > 0) {
    const { data: freelancerProfile } = await adminClient
      .from('freelancer_profiles')
      .select('wallet_balance, total_earned')
      .eq('id', recipientId)
      .single()

    await adminClient
      .from('freelancer_profiles')
      .update({
        wallet_balance: Number(freelancerProfile?.wallet_balance || 0) + releasedAmount,
        total_earned: Number(freelancerProfile?.total_earned || 0) + releasedAmount,
      })
      .eq('id', recipientId)
  }

  return { releasedAmount, recipientId }
}

async function refundHeldEscrow(adminClient, contractId) {
  const { data: heldRows } = await adminClient
    .from('escrow')
    .select('id, milestone_id')
    .eq('contract_id', contractId)
    .in('status', ['held', 'disputed'])

  if (!heldRows?.length) return

  await adminClient
    .from('escrow')
    .update({ status: 'refunded' })
    .in('id', heldRows.map(row => row.id))

  const milestoneIds = heldRows.map(row => row.milestone_id).filter(Boolean)
  if (milestoneIds.length) {
    await adminClient
      .from('milestones')
      .update({ status: 'approved' })
      .in('id', milestoneIds)
  }
}

export async function POST(request) {
  try {
    const supabase = createRouteClient()
    const adminClient = createAdminClient()
    const actor = await getCurrentProfile(supabase)
    const body = await request.json()
    const action = body.action

    if (action === 'submit_milestone') {
      const { milestoneId } = body
      if (!milestoneId) {
        return NextResponse.json({ error: 'milestoneId is required.' }, { status: 400 })
      }

      const { data: milestone } = await adminClient
        .from('milestones')
        .select('id, title, status, contract_id, contracts!inner(id, title, freelancer_id, client_id)')
        .eq('id', milestoneId)
        .single()

      if (!milestone) {
        return NextResponse.json({ error: 'Milestone not found.' }, { status: 404 })
      }

      if (milestone.contracts.freelancer_id !== actor.id) {
        return NextResponse.json({ error: 'Only the assigned freelancer can submit this milestone.' }, { status: 403 })
      }

      await adminClient
        .from('milestones')
        .update({ status: 'submitted' })
        .eq('id', milestoneId)

      await notifyUsers(
        adminClient,
        [milestone.contracts.client_id],
        'Milestone submitted for review',
        `${actor.full_name || 'Your freelancer'} submitted "${milestone.title}" for ${milestone.contracts.title}.`,
        '/dashboard/freelancer'
      )

      return NextResponse.json({ success: true })
    }

    if (action === 'raise_dispute') {
      const { contractId, reason, details, amountDisputed } = body
      if (!contractId || !reason) {
        return NextResponse.json({ error: 'contractId and reason are required.' }, { status: 400 })
      }

      const { data: contract } = await adminClient
        .from('contracts')
        .select('id, title, client_id, freelancer_id')
        .eq('id', contractId)
        .single()

      if (!contract) {
        return NextResponse.json({ error: 'Contract not found.' }, { status: 404 })
      }

      const isParticipant = [contract.client_id, contract.freelancer_id].includes(actor.id)
      if (!isParticipant && actor.role !== 'admin') {
        return NextResponse.json({ error: 'Only contract participants can raise disputes.' }, { status: 403 })
      }

      const against = actor.id === contract.client_id ? contract.freelancer_id : contract.client_id

      await adminClient.from('disputes').insert({
        contract_id: contractId,
        raised_by: actor.id,
        against,
        reason,
        details,
        amount_disputed: amountDisputed ? Number(amountDisputed) : null,
      })

      await adminClient
        .from('contracts')
        .update({ status: 'disputed' })
        .eq('id', contractId)

      await adminClient
        .from('escrow')
        .update({ status: 'disputed' })
        .eq('contract_id', contractId)
        .eq('status', 'held')

      const { data: admins } = await adminClient
        .from('profiles')
        .select('id')
        .eq('role', 'admin')

      await notifyUsers(
        adminClient,
        [against, ...(admins || []).map(item => item.id)],
        'Escrow dispute opened',
        `${actor.full_name || 'A user'} opened a dispute for ${contract.title}.`,
        '/dashboard/admin'
      )

      return NextResponse.json({ success: true })
    }

    if (action === 'resolve_dispute') {
      const { disputeId, resolutionAction, resolution } = body
      if (actor.role !== 'admin') {
        return NextResponse.json({ error: 'Only admins can resolve disputes.' }, { status: 403 })
      }

      if (!disputeId || !['release', 'refund'].includes(resolutionAction)) {
        return NextResponse.json({ error: 'Valid disputeId and resolutionAction are required.' }, { status: 400 })
      }

      const { data: dispute } = await adminClient
        .from('disputes')
        .select('id, contract_id, raised_by, against, reason, contracts!inner(id, title, client_id, freelancer_id)')
        .eq('id', disputeId)
        .single()

      if (!dispute) {
        return NextResponse.json({ error: 'Dispute not found.' }, { status: 404 })
      }

      let releasedAmount = 0
      if (resolutionAction === 'release') {
        const result = await releaseHeldEscrow(adminClient, dispute.contract_id)
        releasedAmount = result.releasedAmount
      } else {
        await refundHeldEscrow(adminClient, dispute.contract_id)
      }

      await adminClient
        .from('disputes')
        .update({
          status: 'resolved',
          resolution:
            resolution ||
            (resolutionAction === 'release'
              ? `Escrow released to freelancer${releasedAmount ? ` for BD ${releasedAmount.toFixed(3)}` : ''}.`
              : 'Escrow refunded to client.'),
          resolved_by: actor.id,
        })
        .eq('id', disputeId)

      await adminClient
        .from('contracts')
        .update({ status: 'active' })
        .eq('id', dispute.contract_id)

      await notifyUsers(
        adminClient,
        [dispute.raised_by, dispute.against, dispute.contracts.client_id, dispute.contracts.freelancer_id],
        'Dispute resolved',
        resolutionAction === 'release'
          ? `Admin released escrow for ${dispute.contracts.title}.`
          : `Admin refunded the escrow for ${dispute.contracts.title}.`,
        actor.role === 'admin' ? '/dashboard/admin' : '/dashboard/freelancer'
      )

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 })
  } catch (error) {
    const status = error.message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: error.message || 'Workflow action failed.' }, { status })
  }
}
