'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Button from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Components'
import { DCard } from '@/components/dashboard/SharedComponents'
import { AnalyticsView, AdminOverview, ContentView, DisputesView, EmptyAdminPanel, UsersView } from '@/components/dashboard/admin/views'
import { ADMIN_NAV } from '@/components/dashboard/admin/constants'
import { Shield, Briefcase, FolderOpen, DollarSign, Scale } from 'lucide-react'

export default function AdminDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])
  const [projects, setProjects] = useState([])
  const [disputes, setDisputes] = useState([])
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
        const [jobsResult, usersResult, applicationsResult, projectsResult, disputesResult] = await Promise.all([
          supabase.from('jobs').select('*'),
          supabase.from('profiles').select('*'),
          supabase.from('applications').select('*'),
          supabase.from('projects').select('*'),
          supabase.from('disputes').select('*, contracts(title, client_id, freelancer_id)'),
        ])

        const jobsData = jobsResult.data || []
        const usersData = usersResult.data || []
        const applicationsData = applicationsResult.data || []
        const projectsData = projectsResult.data || []
        const disputesData = disputesResult.data || []
        const openDisputes = disputesData.filter((item) => item.status === 'open')

        const usersByRole = {
          seeker: usersData.filter((item) => item.role === 'seeker').length,
          employer: usersData.filter((item) => item.role === 'employer').length,
          freelancer: usersData.filter((item) => item.role === 'freelancer').length,
          admin: usersData.filter((item) => item.role === 'admin').length,
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
        })

        setUsers(usersData)
        setJobs(jobsData)
        setProjects(projectsData)
        setDisputes(openDisputes)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-8 flex items-center justify-center dark:from-[#08111f] dark:via-[#0b1728] dark:to-[#0f2133]">
        <Spinner />
      </div>
    )
  }

  const filteredUsers = users.filter((item) => {
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
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00cffd] to-[#0099cc] flex items-center justify-center">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users, content, and analytics for ConnectHub.</p>
          </div>
        </div>

        {activeView === 'overview' && <AdminOverview stats={stats} onNavigate={setActiveView} />}

        {activeView === 'users' && <UsersView filteredUsers={filteredUsers} searchQuery={searchQuery} onSearchChange={setSearchQuery} />}

        {activeView === 'content' && <ContentView jobs={jobs} projects={projects} />}

        {activeView === 'jobs' && (
          <EmptyAdminPanel icon={Briefcase} title="Job Posts Management" description="Platform-wide job listings moderation and tooling can expand from here." />
        )}

        {activeView === 'projects' && (
          <EmptyAdminPanel icon={FolderOpen} title="Freelance Projects" description="All active freelance projects on the platform are available for review here." />
        )}

        {activeView === 'payments' && (
          <EmptyAdminPanel icon={DollarSign} title="Payments" description={`Payment volume is trending toward BD ${stats?.paymentVol?.toLocaleString() || '0'} over the current planning horizon.`} />
        )}

        {activeView === 'disputes' && (
          <div className="bg-white rounded-xl border-2 border-[#00cffd]/10 shadow-sm overflow-hidden dark:bg-[#0e1a2b]">
            <div className="p-6 border-b border-[#00cffd]/10">
              <h2 className="text-xl font-bold text-gray-900">Open Disputes</h2>
              <p className="text-sm text-gray-600 mt-1">Resolve platform disputes and manage held funds.</p>
            </div>
            {disputes.length > 0 ? (
              <div className="divide-y divide-[#00cffd]/5">
                {disputes.map((item) => (
                  <div key={item.id} className="p-6 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.reason || 'Dispute'}</p>
                      <p className="text-sm text-gray-500 mt-1">{item.details || 'Pending review'}</p>
                      <p className="text-xs text-gray-400 mt-2">{item.contracts?.title || 'Contract'}{item.amount_disputed ? ` · BD ${Number(item.amount_disputed).toLocaleString('en-BH')}` : ''}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" loading={disputeActionId === `${item.id}:release`} onClick={() => resolveDispute(item.id, 'release')}>Release Funds</Button>
                      <Button size="sm" variant="outline" loading={disputeActionId === `${item.id}:refund`} onClick={() => resolveDispute(item.id, 'refund')} className="text-red-700 border-red-300 hover:bg-red-50">Refund</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Scale className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Open Disputes</h3>
                <p className="text-gray-600">All disputes have been resolved.</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'analytics' && <AnalyticsView stats={stats} />}
      </div>
    </DashboardLayout>
  )
}


