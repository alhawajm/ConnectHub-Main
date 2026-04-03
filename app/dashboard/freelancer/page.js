'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MessagesPanel from '@/components/dashboard/MessagesPanel'
import ProfileEditor from '@/components/dashboard/ProfileEditor'
import PortfolioBuilder from '@/components/dashboard/PortfolioBuilder'
import { SettingsPage, BillingPage } from '@/components/dashboard/SettingsBilling'
import { EmptyPlaceholder } from '@/components/dashboard/SharedComponents'
import { Spinner, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import { Search, AlertTriangle } from 'lucide-react'
import { FREELANCER_DASHBOARD_NAV, FREELANCER_PAGE_TITLES } from '@/components/dashboard/freelancer/constants'
import { safeText } from '@/components/dashboard/freelancer/helpers'
import {
  AlertsPage,
  BrowsePage,
  ContractsPage,
  DisputesPage,
  EarningsPage,
  OverviewPage,
  ProjectsPage,
  ProposalsPage,
  ReviewsPage,
} from '@/components/dashboard/freelancer/views'

export default function FreelancerDashboard() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const toast = useToast()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [fp, setFp] = useState(null)
  const [proposals, setProposals] = useState([])
  const [contracts, setContracts] = useState([])
  const [milestones, setMilestones] = useState([])
  const [escrowRows, setEscrowRows] = useState([])
  const [disputes, setDisputes] = useState([])
  const [activePage, setActivePage] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [actionMilestoneId, setActionMilestoneId] = useState('')
  const [raisingDispute, setRaisingDispute] = useState(false)
  const [loadError, setLoadError] = useState('')

  const milestonesByContract = useMemo(() => milestones.reduce((acc, milestone) => {
    acc[milestone.contract_id] = acc[milestone.contract_id] || []
    acc[milestone.contract_id].push(milestone)
    return acc
  }, {}), [milestones])

  const loadDashboardData = useCallback(async session => {
    const currentUserId = session?.user?.id
    if (!currentUserId) return

    const response = await fetch('/api/freelancer/dashboard', {
      cache: 'no-store',
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : undefined,
    })
    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.error || 'Could not load freelancer dashboard.')
    }

    setLoadError('')
    setProfile(payload.data?.profile || null)
    setFp(payload.data?.freelancerProfile || null)
    setProposals(payload.data?.proposals || [])
    setContracts(payload.data?.contracts || [])
    setMilestones(payload.data?.milestones || [])
    setEscrowRows(payload.data?.escrowRows || [])
    setDisputes(payload.data?.disputes || [])
  }, [])

  useEffect(() => {
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }
      setUser(session.user)
      try {
        await loadDashboardData(session)
      } catch (error) {
        setLoadError(error.message || 'Could not load freelancer dashboard.')
      } finally {
        setLoading(false)
      }
    })()
  }, [loadDashboardData, router, supabase])

  const handleMilestoneSubmit = async milestoneId => {
    setActionMilestoneId(milestoneId)
    try {
      const response = await fetch('/api/freelance/workflow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'submit_milestone', milestoneId }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Could not submit milestone.')
      const { data: { session } } = await supabase.auth.getSession()
      await loadDashboardData(session)
      toast.success('Milestone submitted for client review')
    } catch (error) {
      toast.error(error.message || 'Could not submit milestone.')
    } finally {
      setActionMilestoneId('')
    }
  }

  const handleRaiseDispute = async form => {
    if (!form.contractId || !form.reason) { toast.error('Choose a contract and enter a reason'); return false }
    setRaisingDispute(true)
    try {
      const response = await fetch('/api/freelance/workflow', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'raise_dispute', contractId: form.contractId, reason: form.reason, details: form.details, amountDisputed: form.amountDisputed }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Could not raise dispute.')
      const { data: { session } } = await supabase.auth.getSession()
      await loadDashboardData(session)
      toast.success('Dispute opened and escrow frozen')
      return true
    } catch (error) {
      toast.error(error.message || 'Could not raise dispute.')
      return false
    } finally {
      setRaisingDispute(false)
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(to bottom right,#eff6ff,#fff,#ecfeff)' }}><Spinner /></div>

  if (loadError) {
    return (
      <DashboardLayout
        user={user}
        profile={profile}
        navItems={FREELANCER_DASHBOARD_NAV}
        activePage={activePage}
        onNavigate={setActivePage}
        pageTitle="Freelancer Dashboard"
        topbarRight={<Button size="sm" onClick={async () => {
          const { data: { session } } = await supabase.auth.getSession()
          await loadDashboardData(session)
        }}><Search className="h-4 w-4" /> Retry</Button>}
      >
        <EmptyPlaceholder
          icon={AlertTriangle}
          title="Could not load freelancer workspace"
          description={loadError}
          action={<Button size="sm" onClick={async () => {
            const { data: { session } } = await supabase.auth.getSession()
            await loadDashboardData(session)
          }}>Reload Dashboard</Button>}
        />
      </DashboardLayout>
    )
  }

  const renderPage = () => {
    switch (activePage) {
      case 'overview': return <OverviewPage fp={fp} contracts={contracts} milestonesByContract={milestonesByContract} escrowRows={escrowRows} disputes={disputes} onNavigate={setActivePage} />
      case 'browse': return <BrowsePage profile={profile} />
      case 'projects': return <ProjectsPage contracts={contracts.filter(item => item.status === 'active')} milestonesByContract={milestonesByContract} escrowRows={escrowRows} onNavigate={setActivePage} />
      case 'contracts': return <ContractsPage contracts={contracts} milestonesByContract={milestonesByContract} escrowRows={escrowRows} onSubmitMilestone={handleMilestoneSubmit} actionMilestoneId={actionMilestoneId} />
      case 'earnings': return <EarningsPage fp={fp} escrowRows={escrowRows} />
      case 'disputes': return <DisputesPage contracts={contracts} disputes={disputes} onRaiseDispute={handleRaiseDispute} raisingDispute={raisingDispute} />
      case 'portfolio': return <PortfolioBuilder profile={profile} />
      case 'profile': return <ProfileEditor profile={profile} roleProfile={fp} onSaved={async () => {
        const { data: { session } } = await supabase.auth.getSession()
        await loadDashboardData(session)
      }} />
      case 'reviews': return <ReviewsPage fp={fp} />
      case 'messages': return <MessagesPanel currentUserId={profile?.id} currentUserName={safeText(profile?.full_name, 'Freelancer')} />
      case 'settings': return <SettingsPage profile={{ ...profile, email: user?.email }} />
      case 'billing': return <BillingPage profile={profile} />
      case 'proposals': return <ProposalsPage proposals={proposals} onNavigate={setActivePage} />
      case 'alerts': return <AlertsPage />
      default: return null
    }
  }

  return <DashboardLayout user={user} profile={profile} navItems={FREELANCER_DASHBOARD_NAV} activePage={activePage} onNavigate={setActivePage} pageTitle={FREELANCER_PAGE_TITLES[activePage] || 'Dashboard'} topbarRight={<Button size="sm" onClick={() => setActivePage('browse')}><Search className="h-4 w-4" /> Browse Projects</Button>}>{renderPage()}</DashboardLayout>
}
