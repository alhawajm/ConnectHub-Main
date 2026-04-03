'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MessagesPanel   from '@/components/dashboard/MessagesPanel'
import ProfileEditor   from '@/components/dashboard/ProfileEditor'
import { SettingsPage, BillingPage } from '@/components/dashboard/SettingsBilling'
/* gradient: from-[#00cffd] to-[#0099cc] */
import { PageHeader, StatCard, DCard, DCardHeader, SectionTitle, TableCard, ListRow, EmptyPlaceholder, BarChart } from '@/components/dashboard/SharedComponents'
import { StatusBadge, Avatar, Spinner, useToast, Badge } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input  from '@/components/ui/Input'
import { formatBD, formatDate, timeAgo, cn } from '@/lib/utils'
import {
  LayoutDashboard, Briefcase, Users, Plus, BarChart2,
  MessageSquare, Settings, CreditCard, Zap, TrendingUp,
  CheckCircle2, Eye, Pencil, Trash2,
} from 'lucide-react'

const NAV = [
  { section: 'Overview', items: [
    { id: 'overview',   icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'jobs',       icon: Briefcase,       label: 'Job Posts', badge: '8' },
    { id: 'candidates', icon: Users,           label: 'Candidates', badge: '24', badgeVariant: 'yellow' },
    { id: 'post-job',   icon: Plus,            label: 'Post a Job' },
  ]},
  { section: 'Insights', items: [
    { id: 'analytics',  icon: BarChart2,     label: 'Analytics' },
    { id: 'messages',   icon: MessageSquare, label: 'Messages', badge: '5', badgeVariant: 'red' },
  ]},
]

/* ── Overview ──────────────────────────────────────────────────── */
function OverviewPage({ profile, jobs, applications, onNavigate }) {
  const active = jobs?.filter(j => j.status === 'active') || []
  const shortlisted = applications?.filter(a => a.status === 'shortlisted') || []
  const hired = applications?.filter(a => a.status === 'hired') || []

  return (
    <div>
      <PageHeader icon={LayoutDashboard} title="Employer Dashboard" subtitle="Manage your job posts, candidates, and hiring pipeline" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Active Job Posts"   value={active.length}        subtitle="Currently live"         icon={Briefcase}   />
        <StatCard label="Total Applications" value={applications?.length || 0} subtitle="All time"         icon={Users}       iconColor="#8b5cf6" />
        <StatCard label="Shortlisted"        value={shortlisted.length}   subtitle="Last 30 days"           icon={CheckCircle2} iconColor="#f59e0b" />
        <StatCard label="Hires This Month"   value={hired.length}         subtitle="Confirmed offers"       icon={TrendingUp}  iconColor="#22c55e" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent applications */}
        <div className="lg:col-span-2">
          <DCard noPad>
            <DCardHeader
              title="Recent Applications"
              subtitle="Latest candidate activity"
              action={<button onClick={() => onNavigate('candidates')} className="text-sm font-medium text-[#0099cc] hover:underline">View all →</button>}
            />
            <table className="data-table">
              <thead><tr>
                <th>Candidate</th>
                <th>Role</th>
                <th className="hidden md:table-cell">AI Match</th>
                <th>Status</th>
                <th>Actions</th>
              </tr></thead>
              <tbody>
                {(applications || []).slice(0, 5).map(app => (
                  <tr key={app.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={app.profiles?.full_name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{app.profiles?.full_name || 'Applicant'}</p>
                          <p className="text-xs text-gray-400">{timeAgo(app.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-gray-500">{app.jobs?.title}</td>
                    <td className="hidden md:table-cell">
                      <span className="text-sm font-bold text-[#00cffd]">{app.ai_match_score ?? '—'}%</span>
                    </td>
                    <td><StatusBadge status={app.status} /></td>
                    <td>
                      <Button size="sm" variant="outline">Schedule</Button>
                    </td>
                  </tr>
                ))}
                {(!applications || applications.length === 0) && (
                  <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">No applications yet — post a job to get started</td></tr>
                )}
              </tbody>
            </table>
          </DCard>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          {/* Hiring funnel */}
          <DCard>
            <SectionTitle>Hiring Funnel</SectionTitle>
            {[
              { label: 'Applied',      n: applications?.length || 0,                      pct: 100 },
              { label: 'Screened',     n: Math.round((applications?.length || 0) * 0.72), pct: 72  },
              { label: 'Shortlisted',  n: shortlisted.length,                             pct: 43  },
              { label: 'Interviewed',  n: Math.round((applications?.length || 0) * 0.08), pct: 22  },
              { label: 'Hired',        n: hired.length,                                   pct: 5   },
            ].map(step => (
              <div key={step.label} className="flex items-center gap-3 mb-3 last:mb-0">
                <span className="text-xs text-gray-400 w-20 text-right flex-shrink-0">{step.label}</span>
                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${step.pct}%`, background: 'linear-gradient(to right, #00cffd, #0099cc)' }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-8">{step.n}</span>
              </div>
            ))}
          </DCard>

          {/* Quick actions */}
          <DCard>
            <SectionTitle>Quick Actions</SectionTitle>
            <div className="flex flex-col gap-2">
              <Button fullWidth onClick={() => onNavigate('post-job')}><Plus className="h-4 w-4" /> Post a Job</Button>
              <Button fullWidth variant="outline" onClick={() => onNavigate('candidates')}><Users className="h-4 w-4" /> Browse Candidates</Button>
              <Button fullWidth variant="ghost"   onClick={() => onNavigate('analytics')}><BarChart2 className="h-4 w-4" /> View Analytics</Button>
            </div>
          </DCard>
        </div>
      </div>
    </div>
  )
}

/* ── Job Posts ─────────────────────────────────────────────────── */
function JobsPage({ jobs, onNavigate }) {
  const toast    = useToast()
  const supabase = createClient()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? jobs : jobs?.filter(j => j.status === filter)

  const closeJob = async id => {
    await supabase.from('jobs').update({ status: 'closed' }).eq('id', id)
    toast.success('Job post closed')
  }

  return (
    <div>
      <PageHeader icon={Briefcase} title="Job Posts" subtitle="Manage your active, draft, and closed job listings" />
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex gap-2">
          {['all', 'active', 'draft', 'closed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn('px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-200',
                filter === s
                  ? 'text-white' : 'bg-white text-gray-500 border border-[rgba(0,207,253,0.15)] hover:border-[rgba(0,207,253,0.3)]'
              )}
              style={filter === s ? { background: 'linear-gradient(135deg, #00cffd, #0099cc)' } : {}}>
              {s}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => onNavigate('post-job')}><Plus className="h-4 w-4" /> New Post</Button>
      </div>
      <DCard noPad>
        <table className="data-table">
          <thead><tr><th>Job Title</th><th>Type</th><th>Applications</th><th>Views</th><th>Posted</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {(filtered || []).map(job => (
              <tr key={job.id}>
                <td className="font-medium text-gray-900 dark:text-white">{job.title}</td>
                <td className="text-gray-500 capitalize text-sm">{job.job_type?.replace('_', '-')}</td>
                <td><span className="font-bold text-[#00cffd]">{job.applications_count || 0}</span></td>
                <td className="text-gray-400">{job.views_count || 0}</td>
                <td className="text-sm text-gray-400">{formatDate(job.created_at)}</td>
                <td><StatusBadge status={job.status} /></td>
                <td>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => closeJob(job.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {(!filtered || filtered.length === 0) && (
              <tr><td colSpan={7} className="py-10 text-center text-sm text-gray-400">
                No {filter !== 'all' ? filter : ''} job posts.
                <button onClick={() => onNavigate('post-job')} className="text-[#0099cc] font-medium ml-1">Post one →</button>
              </td></tr>
            )}
          </tbody>
        </table>
      </DCard>
    </div>
  )
}

/* ── Post Job ──────────────────────────────────────────────────── */
function PostJobPage({ profile }) {
  const toast    = useToast()
  const supabase = createClient()
  const [loading, setLoading]     = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', requirements: '',
    job_type: 'full_time', work_model: 'on_site',
    location: 'Manama, Bahrain', department: '',
    salary_min: '', salary_max: '', skills_required: '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const optimise = async () => {
    if (!form.title) { toast.error('Enter a job title first'); return }
    setAiLoading(true)
    try {
      const r = await fetch('/api/ai/match', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'job_description', title: form.title, description: form.description }),
      })
      const { data } = await r.json()
      if (data?.description) set('description', data.description)
      toast.success('AI optimised your job post ✨')
    } catch { toast.error('AI failed — try again') }
    finally   { setAiLoading(false) }
  }

  const submit = async (status = 'active') => {
    if (!form.title || !form.description) { toast.error('Title and description are required'); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('jobs').insert({
        employer_id: profile.id, title: form.title, description: form.description,
        requirements: form.requirements, job_type: form.job_type, work_model: form.work_model,
        location: form.location, department: form.department,
        salary_min: form.salary_min ? parseInt(form.salary_min) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max) : null,
        skills_required: form.skills_required.split(',').map(s => s.trim()).filter(Boolean),
        status,
      })
      if (error) throw error
      toast.success(status === 'active' ? 'Job published! 🎉' : 'Draft saved ✓')
      setForm({ title:'',description:'',requirements:'',job_type:'full_time',work_model:'on_site',location:'Manama, Bahrain',department:'',salary_min:'',salary_max:'',skills_required:'' })
    } catch (e) { toast.error(e.message) }
    finally     { setLoading(false) }
  }

  return (
    <div>
      <PageHeader icon={Plus} title="Post a Job" subtitle="Create a new job listing to attract top talent" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
        <div className="lg:col-span-2">
          <DCard>
            <SectionTitle>Job Details</SectionTitle>
            <div className="space-y-4">
              <Input label="Job Title" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Senior React Developer" required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Employment Type" as="select" value={form.job_type} onChange={e => set('job_type', e.target.value)}>
                  <option value="full_time">Full-Time</option><option value="part_time">Part-Time</option>
                  <option value="contract">Contract</option><option value="internship">Internship</option>
                </Input>
                <Input label="Work Model" as="select" value={form.work_model} onChange={e => set('work_model', e.target.value)}>
                  <option value="on_site">On-site</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option>
                </Input>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Location"   value={form.location}   onChange={e => set('location', e.target.value)} />
                <Input label="Department" value={form.department} onChange={e => set('department', e.target.value)} placeholder="Engineering" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Min Salary" type="number" prefix="BD" value={form.salary_min} onChange={e => set('salary_min', e.target.value)} placeholder="1,800" />
                <Input label="Max Salary" type="number" prefix="BD" value={form.salary_max} onChange={e => set('salary_max', e.target.value)} placeholder="2,400" />
              </div>
              <Input label="Job Description" as="textarea" rows={6} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the role and responsibilities…" required />
              <Input label="Requirements"    as="textarea" rows={3} value={form.requirements} onChange={e => set('requirements', e.target.value)} placeholder="Years of experience, qualifications…" />
              <Input label="Required Skills (comma-separated)" value={form.skills_required} onChange={e => set('skills_required', e.target.value)} placeholder="React, TypeScript, Node.js" />
              <div className="flex gap-3 pt-2">
                <Button loading={loading} onClick={() => submit('active')} fullWidth>Publish Job Post</Button>
                <Button variant="ghost"   loading={loading} onClick={() => submit('draft')}>Save Draft</Button>
              </div>
            </div>
          </DCard>
        </div>
        <div className="flex flex-col gap-5">
          <DCard>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3"
              style={{ background: 'linear-gradient(135deg, rgba(0,207,253,0.12), rgba(0,153,204,0.08))', color: '#0099cc' }}>
              <Zap className="h-3 w-3" /> AI Optimiser
            </div>
            <p className="text-sm text-gray-500 mb-4">Let AI improve your job description to attract better quality candidates.</p>
            <Button variant="outline" fullWidth loading={aiLoading} onClick={optimise}>Optimise with AI</Button>
          </DCard>
          <DCard>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Posting Cost</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Job Post</span><span className="font-semibold text-green-600">Included</span></div>
              <div className="flex justify-between"><span className="text-gray-500">AI Matching</span><span className="font-semibold text-green-600">Included</span></div>
              <div className="border-t border-[rgba(0,207,253,0.1)] pt-2 flex justify-between font-bold text-[#00cffd]">
                <span>Total</span><span>BD 0.00</span>
              </div>
            </div>
          </DCard>
        </div>
      </div>
    </div>
  )
}

/* ── Analytics ─────────────────────────────────────────────────── */
function AnalyticsPage() {
  const bars = [
    {value:28,label:'Jan'},{value:36},{value:44},{value:34},{value:52},{value:46},
    {value:64},{value:56},{value:70},{value:60},{value:78},{value:88,active:true,label:'Mar'},
  ]
  return (
    <div>
      <PageHeader icon={BarChart2} title="Analytics" subtitle="Track your hiring performance and candidate engagement" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard label="Profile Views"   value="3.2K"  subtitle="+18% this week"      icon={Eye}        iconColor="#00cffd" />
        <StatCard label="Apply Rate"      value="14%"   subtitle="+3% vs last month"   icon={TrendingUp} iconColor="#22c55e" />
        <StatCard label="Time to Hire"    value="12d"   subtitle="↓ 4d improvement"    icon={CheckCircle2} iconColor="#f59e0b" />
        <StatCard label="Cost per Hire"   value="BD 28" subtitle="↓ 40% vs agency"     icon={BarChart2}  iconColor="#8b5cf6" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DCard>
          <SectionTitle>Applications per Week</SectionTitle>
          <BarChart data={bars} height={120} />
        </DCard>
        <DCard>
          <SectionTitle>Applications by Source</SectionTitle>
          <div className="flex items-center gap-6 mt-2">
            <div className="w-24 h-24 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: 'conic-gradient(#00cffd 0% 45%, #22c55e 45% 70%, #f59e0b 70% 85%, #ececf0 85% 100%)' }}>
              <div className="w-14 h-14 bg-white dark:bg-gray-900 rounded-full" />
            </div>
            <div className="space-y-2.5">
              {[['#00cffd','Direct Search — 45%'],['#22c55e','AI Recommended — 25%'],['#f59e0b','Job Alerts — 15%'],['#ececf0','Other — 15%']].map(([c,l]) => (
                <div key={l} className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: c }} />{l}
                </div>
              ))}
            </div>
          </div>
        </DCard>
      </div>
    </div>
  )
}

/* ── Main ──────────────────────────────────────────────────────── */
export default function EmployerDashboard() {
  const supabase = useMemo(() => createClient(), [])
  const router   = useRouter()
  const [user, setUser]                 = useState(null)
  const [profile, setProfile]           = useState(null)
  const [jobs, setJobs]                 = useState([])
  const [applications, setApplications] = useState([])
  const [activePage, setActivePage]     = useState('overview')
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(prof)
      const { data: jobData } = await supabase.from('jobs').select('*').eq('employer_id', session.user.id).order('created_at', { ascending: false })
      setJobs(jobData || [])
      if (jobData?.length) {
        const { data: apps } = await supabase.from('applications').select('*, profiles(full_name, avatar_url), jobs(title)').in('job_id', jobData.map(j => j.id)).order('created_at', { ascending: false })
        setApplications(apps || [])
      }
      setLoading(false)
    })()
  }, [router, supabase])

  const PAGE_TITLES = { overview:'Dashboard Overview', jobs:'Job Posts', candidates:'Candidates', 'post-job':'Post a Job', analytics:'Analytics', messages:'Messages', settings:'Settings', billing:'Billing' }

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right,#eff6ff,#fff,#ecfeff)' }}><Spinner /></div>

  const renderPage = () => {
    switch (activePage) {
      case 'overview':   return <OverviewPage profile={profile} jobs={jobs} applications={applications} onNavigate={setActivePage} />
      case 'jobs':       return <JobsPage jobs={jobs} onNavigate={setActivePage} />
      case 'post-job':   return <PostJobPage profile={profile} />
      case 'analytics':  return <AnalyticsPage />
      case 'candidates': return <EmptyPlaceholder icon={Users} title="Candidates" description="AI-ranked candidates for your open roles appear here once applications come in." action={<Button onClick={() => setActivePage('post-job')}>Post a Job</Button>} />
      case 'messages':   return <MessagesPanel currentUserId={profile?.id} currentUserName={profile?.full_name} />
      case 'settings':   return <SettingsPage profile={{ ...profile, email: user?.email }} />
      case 'billing':    return <BillingPage profile={profile} />
      default: return null
    }
  }

  return (
    <DashboardLayout user={user} profile={profile} navItems={NAV} activePage={activePage} onNavigate={setActivePage} pageTitle={PAGE_TITLES[activePage]} topbarRight={activePage === 'overview' && <Button size="sm" onClick={() => setActivePage('post-job')}><Plus className="h-4 w-4" /> Post Job</Button>}>
      {renderPage()}
    </DashboardLayout>
  )
}

