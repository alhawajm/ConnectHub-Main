'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MessagesPanel from '@/components/dashboard/MessagesPanel'
import ProfileEditor from '@/components/dashboard/ProfileEditor'
import { SettingsPage, BillingPage } from '@/components/dashboard/SettingsBilling'
import { Spinner, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import { EMPLOYER_DASHBOARD_NAV, EMPLOYER_PAGE_TITLES } from '@/components/dashboard/employer/constants'
import {
  EmployerAnalyticsPage,
  EmployerCandidatesPage,
  EmployerJobsPage,
  EmployerOverviewPage,
  EmployerPostJobPage,
} from '@/components/dashboard/employer/views'
import { compareApplicationsForJob } from '@/lib/jobMatching'
import { Plus } from 'lucide-react'

export default function EmployerDashboard() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const toast = useToast()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [contracts, setContracts] = useState([])
  const [milestones, setMilestones] = useState([])
  const [activePage, setActivePage] = useState('overview')
  const [loading, setLoading] = useState(true)

  const loadDashboardData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.replace('/login')
      return
    }

    setUser(session.user)

    const [{ data: employerProfile }, { data: jobData }, { data: contractData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('jobs').select('*').eq('employer_id', session.user.id).order('created_at', { ascending: false }),
      supabase
        .from('contracts')
        .select('*, client:profiles!contracts_client_id_fkey(full_name), freelancer:profiles!contracts_freelancer_id_fkey(full_name), projects(title)')
        .eq('client_id', session.user.id)
        .order('created_at', { ascending: false }),
    ])

    setProfile(employerProfile || null)
    setJobs(jobData || [])
    setContracts(contractData || [])

    const contractIds = (contractData || []).map((contract) => contract.id)
    if (contractIds.length) {
      const { data: milestoneData } = await supabase
        .from('milestones')
        .select('*, contracts(title)')
        .in('contract_id', contractIds)
        .order('created_at', { ascending: false })

      setMilestones(milestoneData || [])
    } else {
      setMilestones([])
    }

    if (!jobData?.length) {
      setApplications([])
      return
    }

    const { data: applicationData } = await supabase
      .from('applications')
      .select('*, profiles!applications_seeker_id_fkey(full_name, avatar_url, skills, headline, location), jobs(id, title, location, skills_required, status)')
      .in('job_id', jobData.map(job => job.id))
      .order('created_at', { ascending: false })

    const enrichedApplications = (applicationData || []).map(application => ({
      ...application,
      jobs: {
        ...(jobData.find(job => job.id === application.job_id) || {}),
        ...(application.jobs || {}),
      },
    }))

    setApplications(enrichedApplications)
  }, [router, supabase])

  useEffect(() => {
    ;(async () => {
      await loadDashboardData()
      setLoading(false)
    })()
  }, [loadDashboardData])

  const comparedApplications = useMemo(() => (
    applications.map(application => {
      const job = jobs.find(item => item.id === application.job_id) || application.jobs
      return compareApplicationsForJob([application], job)[0] || application
    })
  ), [applications, jobs])

  const updateApplicationStatus = async (id, status, employer_notes = '') => {
    const response = await fetch('/api/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, employer_notes }),
    })

    const payload = await response.json()
    if (!response.ok) {
      toast.error(payload.error || 'Could not update application')
      return
    }

    toast.success('Application updated')
    await loadDashboardData()
  }

  const approveMilestone = async (milestoneId) => {
    const response = await fetch('/api/freelance/workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve_milestone', milestoneId }),
    })

    const payload = await response.json()
    if (!response.ok) {
      toast.error(payload.error || 'Could not approve milestone')
      return
    }

    toast.success(payload.releasedAmount ? 'Milestone approved and escrow released' : 'Milestone approved')
    await loadDashboardData()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(to bottom right,#eff6ff,#fff,#ecfeff)' }}>
        <Spinner />
      </div>
    )
  }

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return (
          <EmployerOverviewPage
            jobs={jobs}
            applications={comparedApplications}
            contracts={contracts}
            milestones={milestones}
            onApproveMilestone={approveMilestone}
            onNavigate={setActivePage}
          />
        )
      case 'jobs':
        return <EmployerJobsPage jobs={jobs} onNavigate={setActivePage} onJobsChanged={loadDashboardData} />
      case 'post-job':
        return <EmployerPostJobPage profile={profile} onCreated={loadDashboardData} />
      case 'analytics':
        return <EmployerAnalyticsPage />
      case 'candidates':
        return <EmployerCandidatesPage jobs={jobs} applications={applications} onUpdateStatus={updateApplicationStatus} />
      case 'messages':
        return <MessagesPanel currentUserId={profile?.id} currentUserName={profile?.full_name} />
      case 'settings':
        return <SettingsPage profile={{ ...profile, email: user?.email }} />
      case 'billing':
        return <BillingPage profile={profile} />
      default:
        return null
    }
  }

  return (
    <DashboardLayout
      user={user}
      profile={profile}
      navItems={EMPLOYER_DASHBOARD_NAV}
      activePage={activePage}
      onNavigate={setActivePage}
      pageTitle={EMPLOYER_PAGE_TITLES[activePage]}
      topbarRight={activePage === 'overview' && <Button size="sm" onClick={() => setActivePage('post-job')}><Plus className="h-4 w-4" /> Post Job</Button>}
    >
      {renderPage()}
    </DashboardLayout>
  )
}
