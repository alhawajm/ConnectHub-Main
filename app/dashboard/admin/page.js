'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Button from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Components'
import {
  AnalyticsView,
  AdminOverview,
  ContentView,
  EmptyAdminPanel,
  PaymentAuditView,
  UsersView,
} from '@/components/dashboard/admin/views'
import { ADMIN_NAV } from '@/components/dashboard/admin/constants'
import { Shield, Briefcase, FolderOpen, Scale } from 'lucide-react'

export default function AdminDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])
  const [projects, setProjects] = useState([])
  const [disputes, setDisputes] = useState([])
  const [systemEvents, setSystemEvents] = useState([])
  const [paymentWebhookEvents, setPaymentWebhookEvents] = useState([])
  const [sensitiveEvents, setSensitiveEvents] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [activeView, setActiveView] = useState('overview')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [disputeActionId, setDisputeActionId] = useState('')

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileData?.role !== 'admin') {
        router.replace(`/dashboard/${profileData?.role || 'seeker'}`)
        return
      }

      setProfile(profileData)
      setUser(session.user)
      setLoading(false)
    }

    loadSession()
  }, [router, supabase])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const [jobsResult, usersResult, applicationsResult, projectsResult, disputesResult, analyticsEventsResult, webhookEventsResult] = await Promise.all([
          supabase.from('jobs').select('*'),
          supabase.from('profiles').select('*'),
          supabase.from('applications').select('*'),
          supabase.from('projects').select('*'),
          supabase.from('disputes').select('*, contracts(title, client_id, freelancer_id)'),
          supabase.from('analytics_events').select('*').order('created_at', { ascending: false }).limit(24),
          supabase.from('payment_webhook_events').select('*').order('created_at', { ascending: false }).limit(12),
        ])

        const jobsData = jobsResult.data || []
        const usersData = usersResult.data || []
        const applicationsData = applicationsResult.data || []
        const projectsData = projectsResult.data || []
        const disputesData = disputesResult.data || []
        const analyticsEventsData = analyticsEventsResult.data || []
        const paymentWebhookEventsData = webhookEventsResult.data || []
        const openDisputes = disputesData.filter(item => item.status === 'open')
        const now = Date.now()
        const sensitiveActions = new Set([
          'role_assigned',
          'status_updated',
          'milestone_submitted',
          'milestone_approved',
          'dispute_opened',
          'dispute_resolved',
          'checkout_created',
          'checkout_failed',
          'webhook_processed',
          'webhook_rejected',
          'webhook_failed',
          'logout',
        ])

        const usersByRole = {
          seeker: usersData.filter(item => item.role === 'seeker').length,
          employer: usersData.filter(item => item.role === 'employer').length,
          freelancer: usersData.filter(item => item.role === 'freelancer').length,
          admin: usersData.filter(item => item.role === 'admin').length,
        }

        setStats({
          totalUsers: usersData.length,
          totalJobs: jobsData.length,
          totalApplications: applicationsData.length,
          totalProjects: projectsData.length,
          totalDisputes: openDisputes.length,
          paymentVol: 4200000,
          retention: 72,
          usersByRole,
          failedEvents24h: analyticsEventsData.filter(item => {
            if (item.level !== 'error') return false
            const createdAt = item.created_at ? new Date(item.created_at).getTime() : 0
            return now - createdAt <= 24 * 60 * 60 * 1000
          }).length,
          trackedEvents7d: analyticsEventsData.filter(item => {
            const createdAt = item.created_at ? new Date(item.created_at).getTime() : 0
            return now - createdAt <= 7 * 24 * 60 * 60 * 1000
          }).length,
          processedWebhooks7d: paymentWebhookEventsData.filter(item => {
            const createdAt = item.created_at ? new Date(item.created_at).getTime() : 0
            return now - createdAt <= 7 * 24 * 60 * 60 * 1000
          }).length,
          paymentSignals24h: analyticsEventsData.filter(item => {
            const createdAt = item.created_at ? new Date(item.created_at).getTime() : 0
            return item.category === 'payments' && now - createdAt <= 24 * 60 * 60 * 1000
          }).length,
        })

        setUsers(usersData)
        setJobs(jobsData)
        setProjects(projectsData)
        setDisputes(openDisputes)
        setSystemEvents(analyticsEventsData.slice(0, 8))
        setPaymentWebhookEvents(paymentWebhookEventsData)
        setSensitiveEvents(
          analyticsEventsData.filter(item => item.level === 'error' || sensitiveActions.has(item.action)).slice(0, 12)
        )
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [supabase, user])

  const refreshDisputes = async () => {
    const { data } = await supabase.from('disputes').select('*, contracts(title, client_id, freelancer_id)')
    const disputesData = data || []
    setDisputes(disputesData.filter(item => item.status === 'open' || item.status === 'under_review'))
  }

  const resolveDispute = async (disputeId, resolutionAction) => {
    setDisputeActionId(`${disputeId}:${resolutionAction}`)
    try {
      const response = await fetch('/api/freelance/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve_dispute', disputeId, resolutionAction }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Could not resolve dispute.')
      await refreshDisputes()
    } catch (error) {
      console.error(error)
    } finally {
      setDisputeActionId('')
    }
  }

  if (loading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-8 dark:from-[#08111f] dark:via-[#0b1728] dark:to-[#0f2133]">
        <Spinner />
      </div>
    )
  }

  const filteredUsers = users.filter(item => {
    const q = searchQuery.toLowerCase()
    return item.full_name?.toLowerCase().includes(q) || item.email?.toLowerCase().includes(q)
  })

  return (
    <DashboardLayout
      user={user}
      profile={profile}
      navItems={ADMIN_NAV}
      activePage={activeView}
      onNavigate={setActiveView}
      pageTitle="Admin Dashboard"
    >
      <div className="space-y-8">
        <div className="flex items-start gap-4 rounded-2xl border border-[#00cffd]/10 bg-white p-6 shadow-sm dark:bg-[#0e1a2b]">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#00cffd] to-[#0099cc]">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users, content, analytics, and operational health for ConnectHub.</p>
          </div>
        </div>

        {activeView === 'overview' && <AdminOverview stats={stats} systemEvents={systemEvents} onNavigate={setActiveView} />}
        {activeView === 'users' && <UsersView filteredUsers={filteredUsers} searchQuery={searchQuery} onSearchChange={setSearchQuery} />}
        {activeView === 'content' && <ContentView jobs={jobs} projects={projects} />}

        {activeView === 'jobs' && (
          <EmptyAdminPanel icon={Briefcase} title="Job Posts Management" description="Platform-wide job listings moderation and tooling can expand from here." />
        )}

        {activeView === 'projects' && (
          <EmptyAdminPanel icon={FolderOpen} title="Freelance Projects" description="All active freelance projects on the platform are available for review here." />
        )}

        {activeView === 'payments' && (
          <PaymentAuditView stats={stats} paymentWebhookEvents={paymentWebhookEvents} />
        )}

        {activeView === 'disputes' && (
          <div className="overflow-hidden rounded-xl border-2 border-[#00cffd]/10 bg-white shadow-sm dark:bg-[#0e1a2b]">
            <div className="border-b border-[#00cffd]/10 p-6">
              <h2 className="text-xl font-bold text-gray-900">Open Disputes</h2>
              <p className="mt-1 text-sm text-gray-600">Resolve platform disputes and manage held funds.</p>
            </div>
            {disputes.length > 0 ? (
              <div className="divide-y divide-[#00cffd]/5">
                {disputes.map(item => (
                  <div key={item.id} className="flex items-start justify-between gap-4 p-6">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.reason || 'Dispute'}</p>
                      <p className="mt-1 text-sm text-gray-500">{item.details || 'Pending review'}</p>
                      <p className="mt-2 text-xs text-gray-400">
                        {item.contracts?.title || 'Contract'}
                        {item.amount_disputed ? ` · BD ${Number(item.amount_disputed).toLocaleString('en-BH')}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" loading={disputeActionId === `${item.id}:release`} onClick={() => resolveDispute(item.id, 'release')}>Release Funds</Button>
                      <Button size="sm" variant="outline" loading={disputeActionId === `${item.id}:refund`} onClick={() => resolveDispute(item.id, 'refund')} className="border-red-300 text-red-700 hover:bg-red-50">Refund</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Scale className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">No Open Disputes</h3>
                <p className="text-gray-600">All disputes have been resolved.</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'analytics' && <AnalyticsView stats={stats} systemEvents={systemEvents} sensitiveEvents={sensitiveEvents} />}
      </div>
    </DashboardLayout>
  )
}
