'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import {
  PageHeader,
  StatCard,
  DCard,
  DCardHeader,
  SectionTitle,
  ListRow,
  EmptyPlaceholder,
} from '@/components/dashboard/SharedComponents'
import { StatusBadge, Avatar, Modal, Spinner, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn, formatBD, formatDate, timeAgo } from '@/lib/utils'
import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Lock,
  Scale,
  Search,
  Send,
  Star,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { FREELANCER_REVIEWS } from './constants'
import { contractProgress, currencyTotal, safeText } from './helpers'

export function OverviewPage({ fp, contracts, milestonesByContract, escrowRows, disputes, onNavigate }) {
  const activeContracts = contracts.filter(item => item.status === 'active')
  const heldEscrow = currencyTotal(escrowRows, ['held', 'disputed'])
  const releasedEscrow = currencyTotal(escrowRows, ['released'])
  const nextMilestones = activeContracts
    .flatMap(contract =>
      (milestonesByContract[contract.id] || []).map(milestone => ({ ...milestone, contract }))
    )
    .filter(item => ['pending', 'in_progress', 'submitted', 'approved'].includes(item.status))
    .sort((a, b) => new Date(a.due_date || a.created_at) - new Date(b.due_date || b.created_at))

  return (
    <div>
      <PageHeader icon={LayoutDashboard} title="Freelancer Dashboard" subtitle="Manage your projects, milestones, escrow, and disputes" />

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Active Contracts" value={activeContracts.length} subtitle="Current freelance work" icon={FolderOpen} />
        <StatCard label="Held in Escrow" value={formatBD(heldEscrow)} subtitle="Protected milestone funds" icon={Lock} iconColor="#f59e0b" />
        <StatCard label="Released Earnings" value={formatBD(releasedEscrow)} subtitle="Confirmed milestone payouts" icon={DollarSign} iconColor="#22c55e" />
        <StatCard label="Open Disputes" value={disputes.filter(item => item.status !== 'resolved').length} subtitle="Needs review if not zero" icon={AlertTriangle} iconColor="#ef4444" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <DCard noPad>
            <DCardHeader
              title="Active Contracts"
              subtitle="Real contract, milestone, and escrow status"
              action={<button onClick={() => onNavigate('contracts')} className="text-sm font-medium text-[#0099cc] hover:underline">View all →</button>}
            />
            {activeContracts.length > 0 ? (
              activeContracts.slice(0, 3).map(contract => {
                const progress = contractProgress(contract.id, milestonesByContract)
                const contractEscrow = currencyTotal(escrowRows.filter(row => row.contract_id === contract.id), ['held', 'disputed'])
                return (
                  <div key={contract.id} className="border-b border-[rgba(0,207,253,0.06)] px-6 py-4 last:border-0">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{contract.title}</p>
                        <p className="mt-0.5 text-xs text-gray-400">{safeText(contract.projects?.title, 'Project')} · {safeText(contract.client?.full_name, 'Client')}</p>
                      </div>
                      <StatusBadge status={contract.status} />
                    </div>
                    <div className="mb-2">
                      <div className="mb-1 flex justify-between text-xs text-gray-400">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(to right, #00cffd, #0099cc)' }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{(milestonesByContract[contract.id] || []).length} milestones</span>
                      <span>{formatBD(contractEscrow)} held</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="px-6 py-10 text-center">
                <p className="mb-3 text-sm text-gray-400">No active contracts yet</p>
                <Button size="sm" variant="outline" onClick={() => onNavigate('browse')}>Browse Projects</Button>
              </div>
            )}
          </DCard>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #0e2233 0%, #1a3347 100%)' }}>
            <p className="mb-1 text-xs text-white/50">Available Balance</p>
            <p className="mb-2 text-3xl font-bold text-[#00cffd]">{formatBD(fp?.wallet_balance || 0)}</p>
            <p className="text-xs text-white/70">Released funds become withdrawable after escrow settlement.</p>
          </div>

          <DCard>
            <SectionTitle>Upcoming Milestones</SectionTitle>
            <div className="flex flex-col gap-3">
              {nextMilestones.slice(0, 3).map(item => (
                <div key={item.id} className="rounded-xl border border-[#00cffd]/10 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs text-gray-400">{safeText(item.contract?.title, 'Contract')}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Due {item.due_date ? formatDate(item.due_date) : 'TBD'}</span>
                    <span>{formatBD(item.amount)}</span>
                  </div>
                </div>
              ))}
              {!nextMilestones.length && <p className="text-sm text-gray-400">No milestone actions are waiting right now.</p>}
            </div>
          </DCard>
        </div>
      </div>
    </div>
  )
}

export function BrowsePage({ profile }) {
  const supabase = useMemo(() => createClient(), [])
  const toast = useToast()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', category: '', budgetType: 'all', sortBy: 'newest' })
  const [active, setActive] = useState(null)
  const [proposal, setProposal] = useState({ cover_letter: '', bid_amount: '', delivery_days: '' })
  const [aiLoading, setAiLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.from('projects').select('*, profiles!projects_client_id_fkey(full_name)').eq('status', 'open').order('created_at', { ascending: false }).limit(15).then(({ data }) => {
      setProjects(data || [])
      setLoading(false)
    })
  }, [supabase])

  const filteredProjects = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase()
    const filtered = projects.filter(project => {
      const haystack = `${project.title || ''} ${project.description || ''} ${(project.skills_required || []).join(' ')}`.toLowerCase()
      const matchesSearch = !searchTerm || haystack.includes(searchTerm)
      const matchesCategory = !filters.category || String(project.category || '') === filters.category
      const matchesBudgetType = filters.budgetType === 'all' || String(project.budget_type || '') === filters.budgetType
      return matchesSearch && matchesCategory && matchesBudgetType
    })

    return filtered.sort((a, b) => {
      const aBudget = Number(a.budget_max || a.budget_min || 0)
      const bBudget = Number(b.budget_max || b.budget_min || 0)
      switch (filters.sortBy) {
        case 'budget_high': return bBudget - aBudget
        case 'budget_low': return aBudget - bBudget
        case 'oldest': return new Date(a.created_at) - new Date(b.created_at)
        default: return new Date(b.created_at) - new Date(a.created_at)
      }
    })
  }, [filters, projects])

  const generateProposal = async () => {
    if (!active) return
    setAiLoading(true)
    try {
      const response = await fetch('/api/ai/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectTitle: active.title, projectDescription: active.description, skills: profile?.skills || [] }),
      })
      const { data } = await response.json()
      if (data?.proposal) setProposal(current => ({ ...current, cover_letter: data.proposal }))
      toast.success('Proposal draft generated')
    } catch {
      toast.error('Proposal draft generation failed')
    } finally {
      setAiLoading(false)
    }
  }

  const submitProposal = async () => {
    if (!proposal.cover_letter || !proposal.bid_amount || !proposal.delivery_days) {
      toast.error('Fill all proposal fields first')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase.from('proposals').insert({
        project_id: active.id,
        freelancer_id: profile.id,
        cover_letter: proposal.cover_letter,
        bid_amount: parseFloat(proposal.bid_amount),
        delivery_days: parseInt(proposal.delivery_days),
      })
      if (error) throw error
      toast.success('Proposal submitted successfully')
      setActive(null)
      setProposal({ cover_letter: '', bid_amount: '', delivery_days: '' })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader icon={Search} title="Browse Projects" subtitle="Find open freelance work and use smart drafting support for proposals" />
      <Modal open={!!active} onClose={() => setActive(null)} title="Submit Proposal" size="md">
        {active && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{active.title}</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Bid Amount" type="number" prefix="BD" value={proposal.bid_amount} onChange={e => setProposal(current => ({ ...current, bid_amount: e.target.value }))} />
              <Input label="Delivery (days)" type="number" value={proposal.delivery_days} onChange={e => setProposal(current => ({ ...current, delivery_days: e.target.value }))} />
            </div>
            <Input label="Cover Letter" as="textarea" rows={5} value={proposal.cover_letter} onChange={e => setProposal(current => ({ ...current, cover_letter: e.target.value }))} placeholder="Write a tailored response for this project..." />
            <div className="flex gap-3">
              <Button variant="outline" size="sm" loading={aiLoading} onClick={generateProposal}><Zap className="h-4 w-4" /> Draft</Button>
              <Button fullWidth loading={submitting} onClick={submitProposal}>Submit Proposal</Button>
            </div>
          </div>
        )}
      </Modal>

      <DCard className="mb-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Input label="Search" value={filters.search} onChange={e => setFilters(current => ({ ...current, search: e.target.value }))} placeholder="Project title or keyword" />
          <Input label="Category" value={filters.category} onChange={e => setFilters(current => ({ ...current, category: e.target.value }))} placeholder="Design, Development..." />
          <Input label="Budget Type" as="select" value={filters.budgetType} onChange={e => setFilters(current => ({ ...current, budgetType: e.target.value }))}>
            <option value="all">All budget types</option>
            <option value="fixed">Fixed price</option>
            <option value="hourly">Hourly</option>
          </Input>
          <Input label="Sort By" as="select" value={filters.sortBy} onChange={e => setFilters(current => ({ ...current, sortBy: e.target.value }))}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="budget_high">Highest budget</option>
            <option value="budget_low">Lowest budget</option>
          </Input>
        </div>
      </DCard>

      {loading ? <div className="flex justify-center py-12"><Spinner /></div> : (
        <div className="flex flex-col gap-4">
          {filteredProjects.map(project => (
            <DCard key={project.id} className="cursor-pointer transition-all duration-200 hover:border-[rgba(0,207,253,0.3)] hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                  <p className="mt-0.5 text-xs text-gray-400">{safeText(project.profiles?.full_name, 'Client')} · {timeAgo(project.created_at)}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">{project.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(project.skills_required || []).slice(0, 4).map(skill => (
                      <span key={skill} className="rounded-full border border-[rgba(0,207,253,0.2)] bg-gradient-to-r from-[#00cffd]/10 to-[#0099cc]/10 px-2.5 py-0.5 text-xs font-medium text-[#0099cc]">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-base font-bold text-[#00cffd]">{formatBD(project.budget_min)}–{formatBD(project.budget_max)}</p>
                  <p className="mt-0.5 text-xs capitalize text-gray-400">{project.budget_type}</p>
                  <Button size="sm" className="mt-3" onClick={() => setActive(project)}>Submit Proposal</Button>
                </div>
              </div>
            </DCard>
          ))}
          {filteredProjects.length === 0 && <EmptyPlaceholder icon={Search} title="No open projects" description="Check back later for new opportunities." />}
        </div>
      )}
    </div>
  )
}

export function ProjectsPage({ contracts, milestonesByContract, escrowRows, onNavigate }) {
  return (
    <div>
      <PageHeader icon={FolderOpen} title="Active Projects" subtitle="See progress, held escrow, and delivery cadence" />
      <div className="flex flex-col gap-4">
        {contracts.length > 0 ? contracts.map(contract => {
          const progress = contractProgress(contract.id, milestonesByContract)
          const held = currencyTotal(escrowRows.filter(row => row.contract_id === contract.id), ['held', 'disputed'])
          return (
            <DCard key={contract.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{contract.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{safeText(contract.projects?.title, 'Project')} · {safeText(contract.client?.full_name, 'Client')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={contract.status} />
                  <Button size="sm" variant="outline" onClick={() => onNavigate('contracts')}>Open Contract</Button>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-[#00cffd]/10 p-4"><p className="text-xs uppercase tracking-[0.16em] text-gray-400">Progress</p><p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{progress}%</p></div>
                <div className="rounded-xl border border-[#00cffd]/10 p-4"><p className="text-xs uppercase tracking-[0.16em] text-gray-400">Held Escrow</p><p className="mt-2 text-2xl font-bold text-[#0099cc]">{formatBD(held)}</p></div>
                <div className="rounded-xl border border-[#00cffd]/10 p-4"><p className="text-xs uppercase tracking-[0.16em] text-gray-400">Milestones</p><p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{(milestonesByContract[contract.id] || []).length}</p></div>
              </div>
            </DCard>
          )
        }) : <EmptyPlaceholder icon={FolderOpen} title="No active projects" description="Accepted proposals will become contracts and appear here." action={<Button size="sm" onClick={() => onNavigate('browse')}>Browse Projects</Button>} />}
      </div>
    </div>
  )
}

export function ContractsPage({ contracts, milestonesByContract, escrowRows, onSubmitMilestone, actionMilestoneId }) {
  return (
    <div>
      <PageHeader icon={FileText} title="Contracts" subtitle="Track each contract, milestone, and escrow release state" />
      <div className="flex flex-col gap-4">
        {contracts.length > 0 ? contracts.map(contract => {
          const milestones = milestonesByContract[contract.id] || []
          const contractEscrow = escrowRows.filter(row => row.contract_id === contract.id)
          return (
            <DCard key={contract.id} noPad>
              <DCardHeader title={safeText(contract.title, 'Contract')} subtitle={`${safeText(contract.client?.full_name, 'Client')} · ${formatBD(contract.amount)} total`} action={<StatusBadge status={contract.status} />} />
              <div className="px-6 py-5">
                <SectionTitle>Milestones</SectionTitle>
                <div className="space-y-3">
                  {milestones.map(milestone => {
                    const escrow = contractEscrow.find(row => row.milestone_id === milestone.id)
                    const canSubmit = ['pending', 'in_progress'].includes(milestone.status)
                    return (
                      <div key={milestone.id} className="rounded-xl border border-[#00cffd]/10 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{milestone.title}</p>
                            {milestone.description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{milestone.description}</p>}
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                              <span>Due {milestone.due_date ? formatDate(milestone.due_date) : 'TBD'}</span>
                              <span>{formatBD(milestone.amount)}</span>
                              {escrow && <span>Escrow: {escrow.status}</span>}
                            </div>
                          </div>
                          <div className="flex flex-col items-start gap-2 lg:items-end">
                            <StatusBadge status={milestone.status} />
                            {escrow && <StatusBadge status={escrow.status} />}
                            {canSubmit && <Button size="sm" loading={actionMilestoneId === milestone.id} onClick={() => onSubmitMilestone(milestone.id)}>Submit Milestone</Button>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {!milestones.length && <p className="text-sm text-gray-400">No milestones have been configured yet.</p>}
                </div>
              </div>
            </DCard>
          )
        }) : <EmptyPlaceholder icon={FileText} title="No contracts yet" description="Accepted proposals will create contracts that appear here." />}
      </div>
    </div>
  )
}

export function EarningsPage({ fp, escrowRows }) {
  const transactions = [...escrowRows].sort((a, b) => new Date(b.released_at || b.created_at) - new Date(a.released_at || a.created_at)).map(row => ({
    id: row.id,
    type: row.status === 'released' ? 'Milestone Release' : row.status === 'refunded' ? 'Escrow Refund' : 'Escrow Hold',
    amount: Number(row.amount || 0),
    status: row.status,
    date: row.released_at || row.created_at,
    contractTitle: safeText(row.contracts?.title, 'Contract'),
    milestoneTitle: safeText(row.milestones?.title, 'Milestone'),
    clientName: safeText(row.from_user?.full_name, 'Client'),
  }))

  return (
    <div>
      <PageHeader icon={DollarSign} title="Earnings & Escrow" subtitle="Track real released funds, protected escrow, and milestone payouts" />
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Total Earned" value={formatBD(fp?.total_earned || 0)} subtitle="Released to your account" icon={TrendingUp} iconColor="#22c55e" />
        <StatCard label="Held in Escrow" value={formatBD(currencyTotal(escrowRows, ['held', 'disputed']))} subtitle="Funds protected until release" icon={Lock} iconColor="#f59e0b" />
        <StatCard label="Wallet Balance" value={formatBD(fp?.wallet_balance || 0)} subtitle="Available to withdraw" icon={DollarSign} iconColor="#00cffd" />
      </div>
      <DCard noPad>
        <DCardHeader title="Transaction History" subtitle="Escrow deposits, releases, and refunds" />
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Type</th><th>Contract</th><th>Milestone</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {transactions.map(item => (
                <tr key={item.id}>
                  <td>{item.type}</td>
                  <td><div><p className="font-medium text-gray-900 dark:text-white">{item.contractTitle}</p><p className="text-xs text-gray-400">{item.clientName}</p></div></td>
                  <td className="text-gray-500 dark:text-gray-400">{item.milestoneTitle}</td>
                  <td className={cn('font-bold', item.status === 'released' ? 'text-green-600' : item.status === 'refunded' ? 'text-red-500' : 'text-[#0099cc]')}>{formatBD(item.amount)}</td>
                  <td className="text-gray-400">{formatDate(item.date)}</td>
                  <td><StatusBadge status={item.status} /></td>
                </tr>
              ))}
              {!transactions.length && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">No escrow transactions yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </DCard>
    </div>
  )
}

export function DisputesPage({ contracts, disputes, onRaiseDispute, raisingDispute }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ contractId: '', reason: '', details: '', amountDisputed: '' })

  const submit = async () => {
    const ok = await onRaiseDispute(form)
    if (ok) {
      setOpen(false)
      setForm({ contractId: '', reason: '', details: '', amountDisputed: '' })
    }
  }

  return (
    <div>
      <PageHeader icon={Scale} title="Disputes" subtitle="Open and track escrow disputes tied to your freelance contracts" />
      <Modal open={open} onClose={() => setOpen(false)} title="Open Escrow Dispute" size="md">
        <div className="space-y-4">
          <Input label="Contract" as="select" value={form.contractId} onChange={e => setForm(current => ({ ...current, contractId: e.target.value }))}>
            <option value="">Select contract</option>
            {contracts.map(contract => <option key={contract.id} value={contract.id}>{contract.title}</option>)}
          </Input>
          <Input label="Reason" value={form.reason} onChange={e => setForm(current => ({ ...current, reason: e.target.value }))} placeholder="Scope clarification, missing deliverable..." />
          <Input label="Amount Disputed" type="number" prefix="BD" value={form.amountDisputed} onChange={e => setForm(current => ({ ...current, amountDisputed: e.target.value }))} />
          <Input label="Details" as="textarea" rows={5} value={form.details} onChange={e => setForm(current => ({ ...current, details: e.target.value }))} placeholder="Describe what happened and what resolution is needed." />
          <div className="flex gap-3"><Button fullWidth loading={raisingDispute} onClick={submit}>Submit Dispute</Button><Button variant="ghost" fullWidth onClick={() => setOpen(false)}>Cancel</Button></div>
        </div>
      </Modal>

      <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-[#00cffd]/10 bg-[#00cffd]/5 p-4 dark:bg-[#102034]">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Escrow protection stays linked to disputes</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">When a dispute opens, held escrow is frozen until admin release or refund.</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>Raise Dispute</Button>
      </div>

      <div className="flex flex-col gap-4">
        {disputes.length > 0 ? disputes.map(dispute => (
          <DCard key={dispute.id}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3"><h3 className="text-base font-semibold text-gray-900 dark:text-white">{dispute.reason}</h3><StatusBadge status={dispute.status} /></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{dispute.details || 'No additional details provided.'}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400"><span>Opened {timeAgo(dispute.created_at)}</span>{dispute.amount_disputed && <span>Amount: {formatBD(dispute.amount_disputed)}</span>}<span>{safeText(dispute.contracts?.title, 'Contract')}</span></div>
                {dispute.resolution && <div className="mt-4 rounded-xl border border-[#00cffd]/10 bg-[#00cffd]/5 p-3 text-sm text-gray-600 dark:text-gray-300">{dispute.resolution}</div>}
              </div>
              <div className="rounded-xl border border-[#00cffd]/10 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">Raised by {dispute.raised_by === dispute.contracts?.freelancer_id ? 'freelancer' : 'client'}</div>
            </div>
          </DCard>
        )) : <EmptyPlaceholder icon={Scale} title="No disputes" description="You have no open escrow issues right now." action={<Button size="sm" variant="outline" onClick={() => setOpen(true)}>Raise Dispute</Button>} />}
      </div>
    </div>
  )
}

export function ReviewsPage({ fp }) {
  return (
    <div>
      <PageHeader icon={Star} title="Reviews" subtitle="Your client feedback and platform reputation" />
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Overall Rating" value={fp?.rating || '0.0'} subtitle="Platform score" icon={Star} iconColor="#f59e0b" />
        <StatCard label="Total Reviews" value={fp?.review_count || 0} subtitle="Completed work feedback" icon={FileText} iconColor="#00cffd" />
        <StatCard label="Completion Rate" value={`${fp?.completion_rate || 0}%`} subtitle="On-time delivery" icon={CheckCircle2} iconColor="#22c55e" />
      </div>
      <div className="flex flex-col gap-4">
        {FREELANCER_REVIEWS.map(review => (
          <DCard key={`${review.name}-${review.project}`}>
            <div className="flex items-start gap-4">
              <Avatar name={review.name} size="md" />
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{review.name}</p>
                  <span className="tracking-wide text-yellow-400">{'★'.repeat(review.rating)}</span>
                </div>
                <p className="mb-3 text-xs text-gray-400">{review.project} · {review.date}</p>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">“{review.comment}”</p>
              </div>
            </div>
          </DCard>
        ))}
      </div>
    </div>
  )
}

export function ProposalsPage({ proposals, onNavigate }) {
  return (
    <div>
      <PageHeader icon={Send} title="My Proposals" subtitle="Track submitted proposals and accepted project entries" />
      <DCard noPad>
        {proposals.map(proposal => (
          <ListRow key={proposal.id}>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{safeText(proposal.projects?.title, 'Project')}</p>
              <p className="text-xs text-gray-400">Bid: {formatBD(proposal.bid_amount)} · {proposal.delivery_days}d · {timeAgo(proposal.created_at)}</p>
            </div>
            <StatusBadge status={proposal.status} />
          </ListRow>
        ))}
        {proposals.length === 0 && <EmptyPlaceholder icon={Send} title="No proposals yet" description="Submit proposals on open projects to get started." action={<Button size="sm" onClick={() => onNavigate('browse')}>Browse Projects</Button>} />}
      </DCard>
    </div>
  )
}

export function AlertsPage() {
  return <EmptyPlaceholder icon={Search} title="Project Alerts" description="Saved searches and matching alerts can be expanded next." action={<Button size="sm">Set Up Alert</Button>} />
}
