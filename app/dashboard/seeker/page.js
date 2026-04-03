'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import DashboardLayout    from '@/components/layout/DashboardLayout'
import MessagesPanel      from '@/components/dashboard/MessagesPanel'
import ProfileEditor      from '@/components/dashboard/ProfileEditor'
import PortfolioBuilder   from '@/components/dashboard/PortfolioBuilder'
import { SettingsPage, BillingPage } from '@/components/dashboard/SettingsBilling'
import { PageHeader, StatCard, DCard, DCardHeader, SectionTitle, ListRow, EmptyPlaceholder } from '@/components/dashboard/SharedComponents'
import { StatusBadge, Avatar, Badge, Spinner, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input  from '@/components/ui/Input'
import { formatBD, formatDate, timeAgo, cn } from '@/lib/utils'
import {
  LayoutDashboard, Search, FileText, Bookmark, Zap, User,
  FolderOpen, GraduationCap, MessageSquare, TrendingUp,
  Calendar, Briefcase, CheckCircle2,
} from 'lucide-react'

const NAV = [
  { section: 'My Space', items: [
    { id: 'overview',  icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'search',    icon: Search,          label: 'Job Search' },
    { id: 'apps',      icon: FileText,        label: 'Applications', badge: '6', badgeVariant: 'yellow' },
    { id: 'saved',     icon: Bookmark,        label: 'Saved Jobs', badge: '14' },
    { id: 'matches',   icon: Zap,             label: 'AI Matches', badge: '9' },
  ]},
  { section: 'Profile', items: [
    { id: 'profile',   icon: User,          label: 'My Profile' },
    { id: 'portfolio', icon: FolderOpen,    label: 'Portfolio & CV' },
    { id: 'messages',  icon: MessageSquare, label: 'Messages', badge: '2', badgeVariant: 'red' },
    { id: 'guidance',  icon: GraduationCap, label: 'Career Guidance' },
  ]},
]

/* ── Overview ──────────────────────────────────────────────────── */
function OverviewPage({ profile, applications, savedJobs, onNavigate }) {
  const completionFields = ['full_name', 'headline', 'bio', 'skills', 'location']
  const filled = completionFields.filter(f => profile?.[f]?.length > 0).length
  const completion = Math.round((filled / completionFields.length) * 100)

  return (
    <div>
      <PageHeader icon={LayoutDashboard} title="My Dashboard" subtitle="Track your applications, matches, and career progress" />

      {/* Profile completion */}
      {completion < 100 && (
        <div className="mb-6 p-5 rounded-xl border flex items-center justify-between gap-4"
          style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.25)' }}>
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">Complete your profile — {completion}% done</p>
            <div className="mt-2 h-1.5 bg-yellow-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${completion}%` }} />
            </div>
            <p className="text-xs text-yellow-600 mt-1">A complete profile gets 3× more employer views</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => onNavigate('profile')}>Complete →</Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Applications"  value={applications?.length || 0}                                     subtitle="All time"       icon={FileText}   />
        <StatCard label="Interviews"    value={applications?.filter(a => a.status === 'interview').length || 0} subtitle="Scheduled"    icon={Calendar}   iconColor="#f59e0b" />
        <StatCard label="Saved Jobs"    value={savedJobs?.length || 0}                                         subtitle="Bookmarked"   icon={Bookmark}   iconColor="#8b5cf6" />
        <StatCard label="AI Matches"    value={9}                                                              subtitle="9 new today"  icon={Zap}        iconColor="#22c55e" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DCard noPad>
            <DCardHeader
              title="My Applications"
              subtitle="Track your job application status"
              action={<button onClick={() => onNavigate('apps')} className="text-sm font-medium text-[#0099cc] hover:underline">View all →</button>}
            />
            {applications?.length > 0 ? (
              <div>
                {applications.slice(0, 5).map(app => (
                  <ListRow key={app.id}>
                    <Avatar name={app.jobs?.title} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{app.jobs?.title || 'Job'}</p>
                      <p className="text-xs text-gray-400">{timeAgo(app.created_at)}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </ListRow>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-400 mb-3">No applications yet</p>
                <Button size="sm" variant="outline" onClick={() => onNavigate('search')}>Find Jobs →</Button>
              </div>
            )}
          </DCard>
        </div>

        <div className="flex flex-col gap-5">
          {/* Upcoming interview */}
          <div className="p-5 rounded-xl border" style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.25)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">Upcoming Interview</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">NBB — Technical Round</p>
            <p className="text-xs text-gray-400 mt-0.5">Thu Apr 3 · 10:00am · Zoom</p>
          </div>
          <DCard>
            <SectionTitle>Quick Actions</SectionTitle>
            <div className="flex flex-col gap-2">
              <Button fullWidth onClick={() => onNavigate('search')}><Search className="h-4 w-4" /> Search Jobs</Button>
              <Button fullWidth variant="outline" onClick={() => onNavigate('matches')}><Zap className="h-4 w-4" /> AI Matches</Button>
              <Button fullWidth variant="ghost"   onClick={() => onNavigate('portfolio')}><FolderOpen className="h-4 w-4" /> Update CV</Button>
            </div>
          </DCard>
        </div>
      </div>
    </div>
  )
}

/* ── Job Search ────────────────────────────────────────────────── */
function SearchPage({ profile }) {
  const supabase = useMemo(() => createClient(), [])
  const toast    = useToast()
  const [jobs, setJobs]       = useState([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      let q = supabase.from('jobs').select('*, profiles!jobs_employer_id_fkey(full_name, employer_profiles(company_name))').eq('status', 'active').order('created_at', { ascending: false })
      if (search) q = q.ilike('title', `%${search}%`)
      const { data } = await q.limit(20)
      setJobs(data || [])
      setLoading(false)
    }
    fetch()
  }, [search, supabase])

  const apply = async jobId => {
    setApplying(jobId)
    try {
      const { error } = await supabase.from('applications').insert({ job_id: jobId, seeker_id: profile.id })
      if (error?.code === '23505') { toast.error('Already applied to this job'); return }
      if (error) throw error
      toast.success('Application submitted! 🎉')
    } catch (e) { toast.error(e.message) }
    finally     { setApplying(null) }
  }

  return (
    <div>
      <PageHeader icon={Search} title="Job Search" subtitle="Find your next opportunity in Bahrain and beyond" />
      <DCard className="mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input placeholder="Job title or keyword…" value={search} onChange={e => setSearch(e.target.value)} />
          <Input placeholder="Location (e.g. Manama)" />
          <Input as="select"><option>All Types</option><option>Full-Time</option><option>Part-Time</option><option>Remote</option></Input>
        </div>
      </DCard>
      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="flex flex-col gap-4">
          {jobs.map(job => (
            <DCard key={job.id} className="hover:border-[rgba(0,207,253,0.3)] hover:shadow-md transition-all duration-200 cursor-pointer">
              <div className="flex items-start gap-4">
                <Avatar name={job.profiles?.employer_profiles?.company_name || 'Co'} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{job.profiles?.employer_profiles?.company_name || 'Company'} · {job.location}</p>
                    </div>
                    {job.salary_min && (
                      <p className="text-sm font-bold text-[#00cffd] whitespace-nowrap">{formatBD(job.salary_min)}–{formatBD(job.salary_max)}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <Badge variant="cyan">{job.job_type?.replace('_', ' ')}</Badge>
                    <Badge variant="blue">{job.work_model?.replace('_', '-')}</Badge>
                    {(job.skills_required || []).slice(0, 3).map(s => (
                      <span key={s} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#00cffd]/10 to-[#0099cc]/10 text-[#0099cc] border border-[rgba(0,207,253,0.2)]">{s}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-gray-400">{timeAgo(job.created_at)}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost"><Bookmark className="h-4 w-4" /></Button>
                      <Button size="sm" loading={applying === job.id} onClick={() => apply(job.id)}>Apply Now</Button>
                    </div>
                  </div>
                </div>
              </div>
            </DCard>
          ))}
          {jobs.length === 0 && <EmptyPlaceholder icon={Search} title="No jobs found" description="Try different keywords or check back later." />}
        </div>
      )}
    </div>
  )
}

/* ── Career Guidance ───────────────────────────────────────────── */
function GuidancePage({ profile }) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice]   = useState('')

  const getAdvice = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/ai/cv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ skills: profile?.skills || [], headline: profile?.headline || '' }) })
      const { data } = await r.json()
      if (data?.bio) setAdvice(data.bio)
      toast.success('Career insights generated ✨')
    } catch { toast.error('Failed — try again') }
    finally   { setLoading(false) }
  }

  return (
    <div>
      <PageHeader icon={GraduationCap} title="Career Guidance" subtitle="AI-powered career coaching tailored for Bahrain's job market" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl">
        <DCard>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3"
            style={{ background: 'linear-gradient(135deg, rgba(0,207,253,0.12), rgba(0,153,204,0.08))', color: '#0099cc' }}>
            <Zap className="h-3 w-3" /> AI Career Coach
          </div>
          <p className="text-sm text-gray-500 mb-4">Get personalised advice based on your skills and Bahrain&apos;s market trends.</p>
          <Button variant="outline" fullWidth loading={loading} onClick={getAdvice}>Get Career Advice</Button>
          {advice && (
            <div className="mt-4 p-4 bg-[rgba(0,207,253,0.04)] border border-[rgba(0,207,253,0.15)] rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{advice}</p>
            </div>
          )}
        </DCard>
        <div className="flex flex-col gap-4">
          {[
            { icon: TrendingUp,  title: 'Trending Skills in Bahrain', desc: 'React, Python, Power BI, and Arabic/English bilingual communication are top-demanded skills in Q1 2026.' },
            { icon: GraduationCap, title: 'Upskilling Resources', desc: 'University of Bahrain, Tamkeen training programmes, and Coursera certificates are highly valued by Bahraini employers.' },
            { icon: Briefcase,   title: 'GCC Expansion', desc: 'Your profile qualifies you for roles in Saudi Arabia and UAE — ConnectHub will expand regionally in Phase 3.' },
            { icon: DollarSign,  title: 'Salary Benchmarks', desc: 'Mid-level developers in Bahrain earn BD 1,400–2,200/month. Seniors with 5+ years earn BD 2,000–3,000+.' },
          ].map(tip => (
            <DCard key={tip.title}>
              <div className="flex items-start gap-3">
                <tip.icon className="h-5 w-5 text-[#00cffd] mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{tip.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            </DCard>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Main ──────────────────────────────────────────────────────── */
export default function SeekerDashboard() {
  const supabase = useMemo(() => createClient(), [])
  const router   = useRouter()
  const [user, setUser]                   = useState(null)
  const [profile, setProfile]             = useState(null)
  const [seekerProfile, setSeekerProfile] = useState(null)
  const [applications, setApplications]   = useState([])
  const [savedJobs, setSavedJobs]         = useState([])
  const [activePage, setActivePage]       = useState('overview')
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(prof)
      const { data: sp }   = await supabase.from('seeker_profiles').select('*').eq('id', session.user.id).single()
      setSeekerProfile(sp)
      const { data: apps } = await supabase.from('applications').select('*, jobs(title)').eq('seeker_id', session.user.id).order('created_at', { ascending: false })
      setApplications(apps || [])
      const { data: saved } = await supabase.from('saved_jobs').select('*, jobs(*)').eq('seeker_id', session.user.id)
      setSavedJobs(saved || [])
      setLoading(false)
    })()
  }, [router, supabase])

  const PAGE_TITLES = { overview:'Dashboard', search:'Job Search', apps:'My Applications', saved:'Saved Jobs', matches:'AI Matches', profile:'My Profile', portfolio:'Portfolio & CV', messages:'Messages', guidance:'Career Guidance', settings:'Settings', billing:'Billing' }

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right,#eff6ff,#fff,#ecfeff)' }}><Spinner /></div>

  const renderPage = () => {
    switch (activePage) {
      case 'overview':  return <OverviewPage profile={profile} applications={applications} savedJobs={savedJobs} onNavigate={setActivePage} />
      case 'search':    return <SearchPage profile={profile} />
      case 'guidance':  return <GuidancePage profile={profile} />
      case 'profile':   return <ProfileEditor profile={profile} roleProfile={seekerProfile} onSaved={() => {}} />
      case 'portfolio': return <PortfolioBuilder profile={profile} />
      case 'messages':  return <MessagesPanel currentUserId={profile?.id} currentUserName={profile?.full_name} />
      case 'settings':  return <SettingsPage profile={{ ...profile, email: user?.email }} />
      case 'billing':   return <BillingPage profile={profile} />
      case 'apps': return (
        <div>
          <PageHeader icon={FileText} title="My Applications" subtitle="Track the status of every job you've applied to" />
          <DCard noPad>
            {applications.map(app => (
              <ListRow key={app.id}>
                <Avatar name={app.jobs?.title} size="sm" />
                <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-white">{app.jobs?.title}</p><p className="text-xs text-gray-400">{formatDate(app.created_at)}</p></div>
                <StatusBadge status={app.status} />
              </ListRow>
            ))}
            {applications.length === 0 && <EmptyPlaceholder icon={FileText} title="No applications yet" description="Apply to jobs to track them here." action={<Button size="sm" onClick={() => setActivePage('search')}>Find Jobs</Button>} />}
          </DCard>
        </div>
      )
      case 'saved':   return <EmptyPlaceholder icon={Bookmark} title="Saved Jobs" description="Jobs you bookmark will appear here." action={<Button size="sm" onClick={() => setActivePage('search')}>Browse Jobs</Button>} />
      case 'matches': return <EmptyPlaceholder icon={Zap} title="AI Matches" description="AI-matched jobs based on your profile and skills." action={<Button size="sm" onClick={() => setActivePage('profile')}>Update Profile</Button>} />
      default: return null
    }
  }

  return (
    <DashboardLayout user={user} profile={profile} navItems={NAV} activePage={activePage} onNavigate={setActivePage} pageTitle={PAGE_TITLES[activePage]} topbarRight={<Button size="sm" onClick={() => setActivePage('search')}><Search className="h-4 w-4" /> Find Jobs</Button>}>
      {renderPage()}
    </DashboardLayout>
  )
}



