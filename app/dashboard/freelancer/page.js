'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import DashboardLayout  from '@/components/layout/DashboardLayout'
import MessagesPanel    from '@/components/dashboard/MessagesPanel'
import ProfileEditor    from '@/components/dashboard/ProfileEditor'
import PortfolioBuilder from '@/components/dashboard/PortfolioBuilder'
import { SettingsPage, BillingPage } from '@/components/dashboard/SettingsBilling'
import { PageHeader, StatCard, DCard, DCardHeader, SectionTitle, ListRow, EmptyPlaceholder } from '@/components/dashboard/SharedComponents'
import { StatusBadge, Avatar, Badge, Modal, Spinner, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input  from '@/components/ui/Input'
import { formatBD, formatDate, timeAgo, cn } from '@/lib/utils'
import {
  LayoutDashboard, Search, FolderOpen, Send, Bell,
  DollarSign, FileText, Scale, Star, Image as ImageIcon, User,
  MessageSquare, Zap, TrendingUp, Lock, CheckCircle2,
} from 'lucide-react'

const NAV = [
  { section: 'Work', items: [
    { id: 'overview',  icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'browse',    icon: Search,          label: 'Browse Projects', badge: '28' },
    { id: 'proposals', icon: Send,            label: 'Proposals', badge: '5', badgeVariant: 'yellow' },
    { id: 'projects',  icon: FolderOpen,      label: 'Active Projects', badge: '3' },
    { id: 'alerts',    icon: Bell,            label: 'Project Alerts', badge: '7', badgeVariant: 'red' },
  ]},
  { section: 'Finance', items: [
    { id: 'earnings',  icon: DollarSign, label: 'Earnings & Escrow' },
    { id: 'contracts', icon: FileText,   label: 'Contracts' },
    { id: 'disputes',  icon: Scale,      label: 'Disputes' },
  ]},
  { section: 'Profile', items: [
    { id: 'portfolio', icon: ImageIcon,     label: 'Portfolio' },
    { id: 'profile',   icon: User,          label: 'My Profile' },
    { id: 'reviews',   icon: Star,          label: 'Reviews' },
    { id: 'messages',  icon: MessageSquare, label: 'Messages', badge: '3', badgeVariant: 'red' },
  ]},
]

/* ── Overview ──────────────────────────────────────────────────── */
function OverviewPage({ profile, fp, projects, proposals, onNavigate }) {
  const active = projects?.filter(p => p.status === 'in_progress') || []

  return (
    <div>
      <PageHeader icon={LayoutDashboard} title="Freelancer Dashboard" subtitle="Manage your projects, proposals, and earnings" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Active Projects"  value={active.length}              subtitle="In progress"           icon={FolderOpen} />
        <StatCard label="Earnings (March)" value={formatBD(fp?.total_earned || 840)} subtitle="+BD 240 vs Feb" icon={DollarSign} iconColor="#22c55e" />
        <StatCard label="In Escrow"        value={formatBD(1600)}             subtitle="3 milestones"          icon={Lock}       iconColor="#f59e0b" />
        <StatCard label="Rating"           value={fp?.rating || '4.9'}        subtitle={`${fp?.review_count || 62} reviews`} icon={Star} iconColor="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active projects */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <DCard noPad>
            <DCardHeader
              title="Active Projects"
              action={<button onClick={() => onNavigate('projects')} className="text-sm font-medium text-[#0099cc] hover:underline">View all →</button>}
            />
            {active.length > 0 ? active.slice(0, 3).map(proj => (
              <div key={proj.id} className="px-6 py-4 border-b border-[rgba(0,207,253,0.06)] last:border-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{proj.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{proj.profiles?.full_name} · Fixed Price</p>
                  </div>
                  <StatusBadge status={proj.status} />
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Progress</span><span>67%</span></div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '67%', background: 'linear-gradient(to right, #00cffd, #0099cc)' }} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Due {formatDate(proj.updated_at)}</span>
                  <span className="text-sm font-bold text-[#00cffd]">{formatBD(proj.budget_max)}</span>
                </div>
              </div>
            )) : (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-gray-400 mb-3">No active projects yet</p>
                <Button size="sm" variant="outline" onClick={() => onNavigate('browse')}>Browse Projects</Button>
              </div>
            )}
          </DCard>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-5">
          {/* Wallet */}
          <div className="rounded-xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #0e2233 0%, #1a3347 100%)' }}>
            <p className="text-xs text-white/50 mb-1">Available Balance</p>
            <p className="text-3xl font-bold mb-4">{formatBD(fp?.wallet_balance || 1240)}</p>
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white/10 transition-colors text-center">
                Withdraw
              </button>
              <Button size="sm" className="flex-1">+ Add</Button>
            </div>
          </div>

          {/* Quick Actions */}
          <DCard>
            <SectionTitle>Quick Actions</SectionTitle>
            <div className="flex flex-col gap-2">
              <Button fullWidth onClick={() => onNavigate('browse')}><Search className="h-4 w-4" /> Find Projects</Button>
              <Button fullWidth variant="outline" onClick={() => onNavigate('proposals')}><Send className="h-4 w-4" /> My Proposals</Button>
              <Button fullWidth variant="ghost"   onClick={() => onNavigate('portfolio')}><ImageIcon className="h-4 w-4" /> Portfolio</Button>
            </div>
          </DCard>
        </div>
      </div>
    </div>
  )
}

/* ── Browse Projects ───────────────────────────────────────────── */
function BrowsePage({ profile }) {
  const supabase = useMemo(() => createClient(), [])
  const toast    = useToast()
  const [projects,   setProjects]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [active,     setActive]     = useState(null)
  const [proposal,   setProposal]   = useState({ cover_letter: '', bid_amount: '', delivery_days: '' })
  const [aiLoading,  setAiLoading]  = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.from('projects').select('*, profiles!projects_client_id_fkey(full_name)')
      .eq('status', 'open').order('created_at', { ascending: false }).limit(15)
      .then(({ data }) => { setProjects(data || []); setLoading(false) })
  }, [supabase])

  const generateProposal = async () => {
    if (!active) return
    setAiLoading(true)
    try {
      const r = await fetch('/api/ai/proposal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectTitle: active.title, projectDescription: active.description, skills: profile?.skills || [] }),
      })
      const { data } = await r.json()
      if (data?.proposal) setProposal(p => ({ ...p, cover_letter: data.proposal }))
      toast.success('AI proposal generated ✨')
    } catch { toast.error('AI failed — try again') }
    finally   { setAiLoading(false) }
  }

  const submitProposal = async () => {
    if (!proposal.cover_letter || !proposal.bid_amount || !proposal.delivery_days) { toast.error('Fill all fields'); return }
    setSubmitting(true)
    try {
      const { error } = await supabase.from('proposals').insert({
        project_id: active.id, freelancer_id: profile.id,
        cover_letter: proposal.cover_letter,
        bid_amount: parseFloat(proposal.bid_amount),
        delivery_days: parseInt(proposal.delivery_days),
      })
      if (error) throw error
      toast.success('Proposal submitted! 🎉')
      setActive(null)
      setProposal({ cover_letter: '', bid_amount: '', delivery_days: '' })
    } catch (e) { toast.error(e.message) }
    finally     { setSubmitting(false) }
  }

  return (
    <div>
      <PageHeader icon={Search} title="Browse Projects" subtitle="Find freelance projects matching your skills" />

      <Modal open={!!active} onClose={() => setActive(null)} title="Submit Proposal" size="md">
        {active && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{active.title}</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Bid Amount" type="number" prefix="BD" value={proposal.bid_amount} onChange={e => setProposal(p => ({ ...p, bid_amount: e.target.value }))} />
              <Input label="Delivery (days)" type="number" value={proposal.delivery_days} onChange={e => setProposal(p => ({ ...p, delivery_days: e.target.value }))} />
            </div>
            <Input label="Cover Letter" as="textarea" rows={5} value={proposal.cover_letter} onChange={e => setProposal(p => ({ ...p, cover_letter: e.target.value }))} placeholder="Explain why you're the best fit…" />
            <div className="flex gap-3">
              <Button variant="outline" size="sm" loading={aiLoading} onClick={generateProposal}><Zap className="h-4 w-4" /> AI Generate</Button>
              <Button fullWidth loading={submitting} onClick={submitProposal}>Submit Proposal</Button>
            </div>
          </div>
        )}
      </Modal>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map(proj => (
            <DCard key={proj.id} className="hover:border-[rgba(0,207,253,0.3)] hover:shadow-md transition-all duration-200 cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{proj.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{proj.profiles?.full_name} · {timeAgo(proj.created_at)}</p>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(proj.skills_required || []).slice(0, 4).map(s => (
                      <span key={s} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#00cffd]/10 to-[#0099cc]/10 text-[#0099cc] border border-[rgba(0,207,253,0.2)]">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-bold text-[#00cffd]">{formatBD(proj.budget_min)}–{formatBD(proj.budget_max)}</p>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">{proj.budget_type}</p>
                  <Button size="sm" className="mt-3" onClick={() => setActive(proj)}>Submit Proposal</Button>
                </div>
              </div>
            </DCard>
          ))}
          {projects.length === 0 && (
            <EmptyPlaceholder icon={Search} title="No open projects" description="Check back later for new opportunities." />
          )}
        </div>
      )}
    </div>
  )
}

/* ── Earnings ──────────────────────────────────────────────────── */
function EarningsPage({ fp }) {
  const TRANSACTIONS = [
    { id: '#T-8841', type: 'Milestone Release', from: 'TechMart BH', amount: 400,  status: 'completed', date: 'Mar 26' },
    { id: '#T-8840', type: 'Escrow Deposit',    from: 'Gulf Air',    amount: 800,  status: 'held',      date: 'Mar 24' },
    { id: '#T-8839', type: 'Withdrawal',         from: 'BenefitPay', amount: -600, status: 'completed', date: 'Mar 20' },
    { id: '#T-8838', type: 'Milestone Release', from: 'StartupHub',  amount: 350,  status: 'completed', date: 'Mar 15' },
  ]

  return (
    <div>
      <PageHeader icon={DollarSign} title="Earnings & Escrow" subtitle="Track your income, held funds, and transaction history" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <StatCard label="Total Earned"   value={formatBD(fp?.total_earned || 4240)} subtitle="All time"              icon={TrendingUp} iconColor="#22c55e" />
        <StatCard label="In Escrow"      value={formatBD(1600)}                      subtitle="2 active contracts"   icon={Lock}       iconColor="#f59e0b" />
        <StatCard label="Wallet Balance" value={formatBD(fp?.wallet_balance || 1240)} subtitle="Available to withdraw" icon={DollarSign} iconColor="#00cffd" />
      </div>
      <DCard noPad>
        <DCardHeader title="Transaction History" action={<Button size="sm" variant="ghost">Export</Button>} />
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Tx ID</th><th>Type</th><th>Party</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {TRANSACTIONS.map(t => (
                <tr key={t.id}>
                  <td className="font-mono text-xs text-gray-400">{t.id}</td>
                  <td>{t.type}</td>
                  <td className="text-gray-500">{t.from}</td>
                  <td className={cn('font-bold', t.amount > 0 ? 'text-green-600' : 'text-red-500')}>
                    {t.amount > 0 ? '+' : ''}{formatBD(Math.abs(t.amount))}
                  </td>
                  <td className="text-gray-400">{t.date}</td>
                  <td><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DCard>
    </div>
  )
}

/* ── Reviews ───────────────────────────────────────────────────── */
function ReviewsPage({ fp }) {
  const REVIEWS = [
    { name: 'Ahmed Al-Farsi',  project: 'E-Commerce Redesign', date: 'Mar 2026', rating: 5, comment: 'Sara delivered exceptional UI work. Clean, modern, and on time. Highly recommend!' },
    { name: 'Gulf Air Digital', project: 'Brand Identity',      date: 'Feb 2026', rating: 5, comment: 'Professional and creative. The brand identity perfectly captures our vision.' },
    { name: 'StartupHub BH',   project: 'App Prototype',       date: 'Jan 2026', rating: 5, comment: 'Outstanding Figma work — the prototype impressed all our stakeholders.' },
  ]

  return (
    <div>
      <PageHeader icon={Star} title="Reviews" subtitle="Your client feedback and reputation on ConnectHub" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <StatCard label="Overall Rating"  value={fp?.rating || '4.9'}              subtitle="Top 5% on ConnectHub" icon={Star}         iconColor="#f59e0b" />
        <StatCard label="Total Reviews"   value={fp?.review_count || 62}           subtitle="All projects"        icon={FileText}     iconColor="#00cffd" />
        <StatCard label="Completion Rate" value={`${fp?.completion_rate || 100}%`} subtitle="On-time delivery"   icon={CheckCircle2} iconColor="#22c55e" />
      </div>
      <div className="flex flex-col gap-4">
        {REVIEWS.map((r, i) => (
          <DCard key={i}>
            <div className="flex items-start gap-4">
              <Avatar name={r.name} size="md" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.name}</p>
                  <span className="text-yellow-400 tracking-wide">{'★'.repeat(r.rating)}</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">{r.project} · {r.date}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
              </div>
            </div>
          </DCard>
        ))}
      </div>
    </div>
  )
}

/* ── Main ──────────────────────────────────────────────────────── */
export default function FreelancerDashboard() {
  const supabase = useMemo(() => createClient(), [])
  const router   = useRouter()
  const [user, setUser]           = useState(null)
  const [profile, setProfile]     = useState(null)
  const [fp, setFp]               = useState(null)
  const [projects, setProjects]   = useState([])
  const [proposals, setProposals] = useState([])
  const [activePage, setActivePage] = useState('overview')
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(prof)
      const { data: fpData } = await supabase.from('freelancer_profiles').select('*').eq('id', session.user.id).single()
      setFp(fpData)
      const { data: props } = await supabase.from('proposals').select('*, projects(title, budget_max)').eq('freelancer_id', session.user.id).order('created_at', { ascending: false })
      setProposals(props || [])
      setLoading(false)
    })()
  }, [router, supabase])

  const PAGE_TITLES = {
    overview:'Dashboard', browse:'Browse Projects', proposals:'My Proposals', projects:'Active Projects',
    alerts:'Job Alerts', earnings:'Earnings & Escrow', contracts:'Contracts', disputes:'Disputes',
    portfolio:'Portfolio', profile:'My Profile', reviews:'Reviews', messages:'Messages',
    settings:'Settings', billing:'Billing',
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right,#eff6ff,#fff,#ecfeff)' }}>
      <Spinner />
    </div>
  )

  const renderPage = () => {
    switch (activePage) {
      case 'overview':   return <OverviewPage profile={profile} fp={fp} projects={projects} proposals={proposals} onNavigate={setActivePage} />
      case 'browse':     return <BrowsePage profile={profile} />
      case 'earnings':   return <EarningsPage fp={fp} />
      case 'reviews':    return <ReviewsPage fp={fp} />
      case 'portfolio':  return <PortfolioBuilder profile={profile} />
      case 'profile':    return <ProfileEditor profile={profile} roleProfile={fp} onSaved={() => {}} />
      case 'messages':   return <MessagesPanel currentUserId={profile?.id} currentUserName={profile?.full_name} />
      case 'settings':   return <SettingsPage profile={{ ...profile, email: user?.email }} />
      case 'billing':    return <BillingPage profile={profile} />
      case 'proposals': return (
        <div>
          <PageHeader icon={Send} title="My Proposals" subtitle="Track proposals you've submitted to clients" />
          <DCard noPad>
            {proposals.map(p => (
              <ListRow key={p.id}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.projects?.title}</p>
                  <p className="text-xs text-gray-400">Bid: {formatBD(p.bid_amount)} · {p.delivery_days}d · {timeAgo(p.created_at)}</p>
                </div>
                <StatusBadge status={p.status} />
              </ListRow>
            ))}
            {proposals.length === 0 && (
              <EmptyPlaceholder icon={Send} title="No proposals yet" description="Submit proposals on open projects to get started." action={<Button size="sm" onClick={() => setActivePage('browse')}>Browse Projects</Button>} />
            )}
          </DCard>
        </div>
      )
      case 'projects':   return <EmptyPlaceholder icon={FolderOpen}  title="Active Projects"  description="Projects you're currently working on will appear here." />
      case 'contracts':  return <EmptyPlaceholder icon={FileText}    title="Contracts"        description="Active and completed contracts appear here." />
      case 'disputes':   return <EmptyPlaceholder icon={Scale}       title="No Disputes"      description="Clean track record — keep it up!" />
      case 'alerts':     return <EmptyPlaceholder icon={Bell}        title="Job Alerts"       description="Set up alerts to be notified of matching projects." action={<Button size="sm">Set Up Alert</Button>} />
      default: return null
    }
  }

  return (
    <DashboardLayout
      user={user} profile={profile} navItems={NAV}
      activePage={activePage} onNavigate={setActivePage}
      pageTitle={PAGE_TITLES[activePage] || 'Dashboard'}
      topbarRight={<Button size="sm" onClick={() => setActivePage('browse')}><Search className="h-4 w-4" /> Find Projects</Button>}
    >
      {renderPage()}
    </DashboardLayout>
  )
}


