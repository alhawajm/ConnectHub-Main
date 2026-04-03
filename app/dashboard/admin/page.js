'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Button from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Components'
import { BarChart, DCard, ProgressBar, StatCard } from '@/components/dashboard/SharedComponents'
import { Shield, Users, Briefcase, TrendingUp, Search, FolderOpen, DollarSign, Scale, Flag, Eye } from 'lucide-react'

const NAV = [
  { section: 'Admin', items: [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'content', label: 'Content Moderation', icon: Flag },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ]},
  { section: 'Operations', items: [
    { id: 'jobs', label: 'Job Posts', icon: Briefcase },
    { id: 'projects', label: 'Freelance Projects', icon: FolderOpen },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'disputes', label: 'Disputes', icon: Scale },
  ]},
]

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

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileData?.role !== 'admin') {
        router.push(`/dashboard/${profileData?.role || 'seeker'}`)
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
          supabase.from('disputes').select('*'),
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

  const growthBars = [
    { value: 120, label: 'Jan' },
    { value: 180 },
    { value: 210 },
    { value: 240 },
    { value: 290 },
    { value: 310 },
    { value: 380 },
    { value: 420 },
    { value: 480 },
    { value: 520 },
    { value: 600 },
    { value: 680, active: true, label: 'Dec' },
  ]

  return (
    <DashboardLayout
      user={user}
      profile={profile}
      navItems={NAV}
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

        {activeView === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total Users" value={stats?.totalUsers || 0} subtitle="Registered accounts" icon={Users} />
              <StatCard label="Total Jobs" value={stats?.totalJobs || 0} subtitle="Posted listings" icon={Briefcase} />
              <StatCard label="Total Projects" value={stats?.totalProjects || 0} subtitle="Freelance demand" icon={FolderOpen} />
              <StatCard label="Applications" value={stats?.totalApplications || 0} subtitle="Platform activity" icon={TrendingUp} iconColor="#22c55e" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <DCard>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Users by Role</h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    ['Job Seekers', stats?.usersByRole?.seeker || 0, 'bg-blue-50 text-blue-600 border-blue-200'],
                    ['Employers', stats?.usersByRole?.employer || 0, 'bg-green-50 text-green-600 border-green-200'],
                    ['Freelancers', stats?.usersByRole?.freelancer || 0, 'bg-purple-50 text-purple-600 border-purple-200'],
                    ['Admins', stats?.usersByRole?.admin || 0, 'bg-gray-50 text-gray-600 border-gray-200'],
                  ].map(([label, value, style]) => (
                    <div key={label} className={`rounded-xl border p-5 text-center ${style}`}>
                      <p className="text-3xl font-bold mb-2">{value}</p>
                      <p className="text-sm font-semibold">{label}</p>
                    </div>
                  ))}
                </div>
              </DCard>

              <DCard>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button onClick={() => setActiveView('users')} className="w-full rounded-xl border border-[#00cffd]/15 p-4 text-left hover:border-[#00cffd]/35 hover:bg-[#00cffd]/5 transition-all">
                    <p className="font-semibold text-gray-900">Manage Users</p>
                    <p className="text-sm text-gray-500 mt-1">Review accounts and role distribution.</p>
                  </button>
                  <button onClick={() => setActiveView('content')} className="w-full rounded-xl border border-[#00cffd]/15 p-4 text-left hover:border-[#00cffd]/35 hover:bg-[#00cffd]/5 transition-all">
                    <p className="font-semibold text-gray-900">Content Moderation</p>
                    <p className="text-sm text-gray-500 mt-1">Check jobs and projects that need review.</p>
                  </button>
                  <button onClick={() => setActiveView('analytics')} className="w-full rounded-xl border border-[#00cffd]/15 p-4 text-left hover:border-[#00cffd]/35 hover:bg-[#00cffd]/5 transition-all">
                    <p className="font-semibold text-gray-900">View Analytics</p>
                    <p className="text-sm text-gray-500 mt-1">See growth, retention, and adoption trends.</p>
                  </button>
                </div>
              </DCard>
            </div>
          </div>
        )}

        {activeView === 'users' && (
          <div className="bg-white rounded-xl border-2 border-[#00cffd]/10 shadow-sm overflow-hidden dark:bg-[#0e1a2b]">
            <div className="p-6 border-b border-[#00cffd]/10 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900">User Management</h2>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#00cffd]/20 rounded-lg text-sm focus:outline-none focus:border-[#00cffd]/50"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-[#00cffd]/10 dark:bg-gray-800/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((item) => (
                    <tr key={item.id} className="border-b border-[#00cffd]/5 hover:bg-gray-50/50 transition-colors dark:hover:bg-white/5">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.full_name || item.email}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{item.email}</td>
                      <td className="px-6 py-3 text-sm text-[#0099cc] capitalize">{item.role || 'user'}</td>
                      <td className="px-6 py-3 text-sm text-green-700">Active</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'content' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <DCard>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#00cffd]/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-[#0099cc]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Job Posts Moderation</h2>
                  <p className="text-sm text-gray-500">Review current job publishing volume.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2"><span>Active jobs</span><span>{jobs.filter((item) => item.status === 'active').length}</span></div>
                  <ProgressBar value={jobs.filter((item) => item.status === 'active').length} max={Math.max(jobs.length, 1)} />
                </div>
                <div className="rounded-xl border border-[#00cffd]/10 bg-[#00cffd]/5 p-4">
                  <p className="text-sm font-semibold text-gray-900">Moderation status</p>
                  <p className="text-sm text-gray-500 mt-1">No flagged job posts in this snapshot. All listings are currently visible.</p>
                </div>
              </div>
            </DCard>

            <DCard>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#00cffd]/10 flex items-center justify-center">
                  <Flag className="h-5 w-5 text-[#0099cc]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Projects Moderation</h2>
                  <p className="text-sm text-gray-500">Keep marketplace content trustworthy.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2"><span>Open freelance projects</span><span>{projects.filter((item) => item.status === 'open').length}</span></div>
                  <ProgressBar value={projects.filter((item) => item.status === 'open').length} max={Math.max(projects.length, 1)} />
                </div>
                <div className="rounded-xl border border-[#00cffd]/10 bg-[#00cffd]/5 p-4">
                  <p className="text-sm font-semibold text-gray-900">Moderation status</p>
                  <p className="text-sm text-gray-500 mt-1">No freelance projects are awaiting intervention right now.</p>
                </div>
              </div>
            </DCard>
          </div>
        )}

        {activeView === 'jobs' && (
          <div className="bg-white rounded-xl border-2 border-[#00cffd]/10 p-6 shadow-sm text-center py-12 dark:bg-[#0e1a2b]">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Posts Management</h3>
            <p className="text-gray-600">Platform-wide job listings moderation and tooling can expand from here.</p>
          </div>
        )}

        {activeView === 'projects' && (
          <div className="bg-white rounded-xl border-2 border-[#00cffd]/10 p-6 shadow-sm text-center py-12 dark:bg-[#0e1a2b]">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Freelance Projects</h3>
            <p className="text-gray-600">All active freelance projects on the platform are available for review here.</p>
          </div>
        )}

        {activeView === 'payments' && (
          <div className="bg-white rounded-xl border-2 border-[#00cffd]/10 p-6 shadow-sm text-center py-12 dark:bg-[#0e1a2b]">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payments</h3>
            <p className="text-gray-600">Payment volume is trending toward BD {stats?.paymentVol?.toLocaleString() || '0'} over the current planning horizon.</p>
          </div>
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
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Release Funds</Button>
                      <Button size="sm" variant="outline" className="text-red-700 border-red-300 hover:bg-red-50">Refund</Button>
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

        {activeView === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="DAU" value="3,840" subtitle="+8% WoW" icon={Eye} />
              <StatCard label="AI Adoption" value="64%" subtitle="Target exceeded" icon={TrendingUp} iconColor="#22c55e" />
              <StatCard label="Retention" value={`${stats?.retention || 0}%`} subtitle="Monthly" icon={Users} />
              <StatCard label="Open Disputes" value={stats?.totalDisputes || 0} subtitle="Needs action" icon={Scale} iconColor="#f59e0b" />
            </div>
            <DCard>
              <h2 className="text-xl font-bold text-gray-900 mb-4">User Growth</h2>
              <BarChart data={growthBars} height={140} />
            </DCard>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}


