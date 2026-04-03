'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { getMatchTone, scoreJobForSeeker } from '@/lib/jobMatching'
import { formatDate, timeAgo } from '@/lib/utils'
import { PageHeader, StatCard, DCard, DCardHeader, SectionTitle, ListRow, EmptyPlaceholder } from '@/components/dashboard/SharedComponents'
import { StatusBadge, Avatar, Badge, Spinner, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import {
  LayoutDashboard,
  Search,
  FileText,
  Bookmark,
  Zap,
  FolderOpen,
  GraduationCap,
  TrendingUp,
  Calendar,
  Briefcase,
  CheckCircle2,
} from 'lucide-react'

export function buildSeekerRecommendations({ applications, jobs, profile, savedJobs, seekerProfile }) {
  const appliedJobIds = applications.map(application => application.job_id)
  const savedJobIds = savedJobs.map(savedJob => savedJob.job_id)

  return jobs
    .map(job => {
      const recommendation = scoreJobForSeeker(job, {
        profile,
        seekerProfile,
        appliedJobIds,
        savedJobIds,
      })

      return {
        ...job,
        matchScore: recommendation.score,
        matchedSkills: recommendation.matchedSkills,
        matchReasons: recommendation.reasons,
      }
    })
    .filter(job => !appliedJobIds.includes(job.id))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 8)
}

export function SeekerOverviewPage({ profile, applications, savedJobs, matchCount, onNavigate }) {
  const completionFields = ['full_name', 'headline', 'bio', 'skills', 'location']
  const filled = completionFields.filter(field => profile?.[field]?.length > 0).length
  const completion = Math.round((filled / completionFields.length) * 100)

  return (
    <div>
      <PageHeader icon={LayoutDashboard} title="My Dashboard" subtitle="Track your applications, matches, and career progress" />

      {completion < 100 && (
        <div
          className="mb-6 flex items-center justify-between gap-4 rounded-xl border p-5"
          style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.25)' }}
        >
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">Complete your profile - {completion}% done</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-yellow-100">
              <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${completion}%` }} />
            </div>
            <p className="mt-1 text-xs text-yellow-600">A complete profile gets more employer views and stronger recommendations.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => onNavigate('profile')}>Complete</Button>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Applications" value={applications?.length || 0} subtitle="All time" icon={FileText} />
        <StatCard label="Interviews" value={applications?.filter(application => application.status === 'interview').length || 0} subtitle="Scheduled" icon={Calendar} iconColor="#f59e0b" />
        <StatCard label="Saved Jobs" value={savedJobs?.length || 0} subtitle="Bookmarked" icon={Bookmark} iconColor="#8b5cf6" />
        <StatCard label="Smart Matches" value={matchCount} subtitle="Fit-based opportunities" icon={Zap} iconColor="#22c55e" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DCard noPad>
            <DCardHeader
              title="My Applications"
              subtitle="Track your job application status"
              action={<button onClick={() => onNavigate('apps')} className="text-sm font-medium text-[#0099cc] hover:underline">View all →</button>}
            />
            {applications?.length > 0 ? (
              <div>
                {applications.slice(0, 5).map(application => (
                  <ListRow key={application.id}>
                    <Avatar name={application.jobs?.title} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{application.jobs?.title || 'Job'}</p>
                      <p className="text-xs text-gray-400">{timeAgo(application.created_at)}</p>
                    </div>
                    <StatusBadge status={application.status} />
                  </ListRow>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="mb-3 text-sm text-gray-400">No applications yet</p>
                <Button size="sm" variant="outline" onClick={() => onNavigate('search')}>Find Jobs</Button>
              </div>
            )}
          </DCard>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-xl border p-5" style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.25)' }}>
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">Upcoming Interview</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">NBB - Technical Round</p>
            <p className="mt-0.5 text-xs text-gray-400">Thu Apr 3 · 10:00am · Zoom</p>
          </div>

          <DCard>
            <SectionTitle>Quick Actions</SectionTitle>
            <div className="flex flex-col gap-2">
              <Button fullWidth onClick={() => onNavigate('search')}><Search className="h-4 w-4" /> Search Jobs</Button>
              <Button fullWidth variant="outline" onClick={() => onNavigate('matches')}><Zap className="h-4 w-4" /> Smart Matches</Button>
              <Button fullWidth variant="ghost" onClick={() => onNavigate('portfolio')}><FolderOpen className="h-4 w-4" /> Update CV</Button>
            </div>
          </DCard>
        </div>
      </div>
    </div>
  )
}

export function SeekerSearchPage({ onApplied }) {
  const supabase = useMemo(() => createClient(), [])
  const toast = useToast()
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      let query = supabase
        .from('jobs')
        .select('*, profiles!jobs_employer_id_fkey(full_name, employer_profiles(company_name))')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (search) query = query.ilike('title', `%${search}%`)

      const { data } = await query.limit(20)
      setJobs(data || [])
      setLoading(false)
    }

    fetchJobs()
  }, [search, supabase])

  const apply = async jobId => {
    setApplying(jobId)
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to apply')
      toast.success(`Application submitted. Fit score: ${result.data?.ai_match_score ?? '-'}%`)
      onApplied?.()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setApplying(null)
    }
  }

  return (
    <div>
      <PageHeader icon={Search} title="Job Search" subtitle="Find your next opportunity in Bahrain and beyond" />
      <DCard className="mb-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input placeholder="Job title or keyword..." value={search} onChange={event => setSearch(event.target.value)} />
          <Input placeholder="Location (e.g. Manama)" />
          <Input as="select"><option>All Types</option><option>Full-Time</option><option>Part-Time</option><option>Remote</option></Input>
        </div>
      </DCard>
      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="flex flex-col gap-4">
          {jobs.map(job => (
            <DCard key={job.id} className="cursor-pointer transition-all duration-200 hover:border-[rgba(0,207,253,0.3)] hover:shadow-md">
              <div className="flex items-start gap-4">
                <Avatar name={job.profiles?.employer_profiles?.company_name || 'Co'} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                      <p className="mt-0.5 text-sm text-gray-500">{job.profiles?.employer_profiles?.company_name || 'Company'} · {job.location}</p>
                    </div>
                    {job.salary_min && (
                      <p className="whitespace-nowrap text-sm font-bold text-[#00cffd]">{job.salary_min}-{job.salary_max} BHD</p>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant="cyan">{job.job_type?.replace('_', ' ')}</Badge>
                    <Badge variant="blue">{job.work_model?.replace('_', '-')}</Badge>
                    {(job.skills_required || []).slice(0, 3).map(skill => (
                      <span key={skill} className="rounded-full border border-[rgba(0,207,253,0.2)] bg-gradient-to-r from-[#00cffd]/10 to-[#0099cc]/10 px-2.5 py-0.5 text-xs font-medium text-[#0099cc]">{skill}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
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

export function SeekerMatchesPage({ recommendations, onNavigate }) {
  return (
    <div>
      <PageHeader icon={Zap} title="Smart Matches" subtitle="Transparent role-fit comparisons based on your profile, preferences, and job details" />
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard label="Compared Roles" value={recommendations.length} subtitle="Active opportunities" icon={Zap} iconColor="#22c55e" />
        <StatCard label="Strong Alignment" value={recommendations.filter(job => job.matchScore >= 60).length} subtitle="60% and above" icon={TrendingUp} />
        <StatCard label="Average Fit" value={recommendations.length ? Math.round(recommendations.reduce((sum, job) => sum + job.matchScore, 0) / recommendations.length) : 0} subtitle="Across compared roles" icon={CheckCircle2} iconColor="#8b5cf6" />
      </div>

      {recommendations.length > 0 ? (
        <div className="flex flex-col gap-4">
          {recommendations.map(job => {
            const match = getMatchTone(job.matchScore)
            return (
              <DCard key={job.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                      <Badge variant={match.variant} dot={false}>{job.matchScore}% {match.label}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {job.location || 'Bahrain'} · {String(job.job_type || 'open_role').replace(/_/g, ' ')} · {String(job.work_model || 'on_site').replace(/_/g, ' ')}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{job.description || 'No description provided yet.'}</p>
                    {job.matchReasons?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.matchReasons.map(reason => <Badge key={reason} variant="blue">{reason}</Badge>)}
                      </div>
                    )}
                    {job.matchedSkills?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.matchedSkills.slice(0, 5).map(skill => <Badge key={skill} variant="cyan">{skill}</Badge>)}
                      </div>
                    )}
                  </div>
                  <div className="flex w-full flex-col gap-2 lg:w-44">
                    <Button href={`/jobs/${job.id}`}>View Job</Button>
                    <Button variant="outline" onClick={() => onNavigate('search')}>Search More</Button>
                  </div>
                </div>
              </DCard>
            )
          })}
        </div>
      ) : (
        <EmptyPlaceholder icon={Zap} title="No strong matches yet" description="Complete your profile and skills to improve recommendations." action={<Button size="sm" onClick={() => onNavigate('profile')}>Update Profile</Button>} />
      )}
    </div>
  )
}

export function SeekerGuidancePage({ profile }) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState('')

  const getAdvice = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills: profile?.skills || [], headline: profile?.headline || '' }),
      })
      const { data } = await response.json()
      if (data?.bio) setAdvice(data.bio)
      toast.success('Career insights generated')
    } catch {
      toast.error('Failed - try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader icon={GraduationCap} title="Career Guidance" subtitle="Smart career guidance tailored to your current skills and Bahrain's market context" />
      <div className="grid max-w-3xl grid-cols-1 gap-6 lg:grid-cols-2">
        <DCard>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: 'linear-gradient(135deg, rgba(0,207,253,0.12), rgba(0,153,204,0.08))', color: '#0099cc' }}>
            <Zap className="h-3 w-3" /> Smart Career Coach
          </div>
          <p className="mb-4 text-sm text-gray-500">Get personalised advice based on your skills and Bahrain&apos;s market trends.</p>
          <Button variant="outline" fullWidth loading={loading} onClick={getAdvice}>Get Career Advice</Button>
          {advice && (
            <div className="mt-4 rounded-lg border border-[rgba(0,207,253,0.15)] bg-[rgba(0,207,253,0.04)] p-4">
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{advice}</p>
            </div>
          )}
        </DCard>
        <div className="flex flex-col gap-4">
          {[
            { icon: TrendingUp, title: 'Trending Skills in Bahrain', desc: 'React, Python, Power BI, and Arabic/English bilingual communication remain in strong demand.' },
            { icon: GraduationCap, title: 'Upskilling Resources', desc: 'Tamkeen programmes, local universities, and respected online certificates strengthen application quality.' },
            { icon: Briefcase, title: 'Regional Mobility', desc: 'Profiles with strong digital skills often qualify for Bahrain, Saudi Arabia, and UAE opportunities.' },
          ].map(tip => (
            <DCard key={tip.title}>
              <div className="flex items-start gap-3">
                <tip.icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#00cffd]" />
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">{tip.title}</h3>
                  <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{tip.desc}</p>
                </div>
              </div>
            </DCard>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SeekerApplicationsPage({ applications, onNavigate }) {
  return (
    <div>
      <PageHeader icon={FileText} title="My Applications" subtitle="Track the status of every job you've applied to" />
      <DCard noPad>
        {applications.map(application => (
          <ListRow key={application.id}>
            <Avatar name={application.jobs?.title} size="sm" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{application.jobs?.title}</p>
              <p className="text-xs text-gray-400">{formatDate(application.created_at)}</p>
            </div>
            <StatusBadge status={application.status} />
          </ListRow>
        ))}
        {applications.length === 0 && <EmptyPlaceholder icon={FileText} title="No applications yet" description="Apply to jobs to track them here." action={<Button size="sm" onClick={() => onNavigate('search')}>Find Jobs</Button>} />}
      </DCard>
    </div>
  )
}

export function SeekerSavedJobsPage({ savedJobs, onNavigate }) {
  return (
    <div>
      <PageHeader icon={Bookmark} title="Saved Jobs" subtitle="Keep shortlisted opportunities in one place and jump back into active applications quickly" />
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard label="Saved Roles" value={savedJobs.length} subtitle="Bookmarked opportunities" icon={Bookmark} iconColor="#8b5cf6" />
        <StatCard label="Ready to Review" value={savedJobs.filter((item) => item.jobs?.status === 'active').length} subtitle="Still actively hiring" icon={CheckCircle2} iconColor="#22c55e" />
        <StatCard label="Locations" value={new Set(savedJobs.map((item) => item.jobs?.location).filter(Boolean)).size} subtitle="Across your bookmarks" icon={Briefcase} iconColor="#00cffd" />
      </div>

      <DCard noPad>
        {savedJobs.length > 0 ? (
          savedJobs.map((savedJob) => (
            <ListRow key={savedJob.id}>
              <Avatar name={savedJob.jobs?.title} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{savedJob.jobs?.title || 'Saved role'}</p>
                <p className="text-xs text-gray-400">
                  {savedJob.jobs?.location || 'Bahrain'} · Saved {savedJob.created_at ? timeAgo(savedJob.created_at) : 'recently'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={savedJob.jobs?.status || 'saved'} />
                <Button size="sm" variant="outline" href={savedJob.jobs?.id ? `/jobs/${savedJob.jobs.id}` : undefined} onClick={!savedJob.jobs?.id ? () => onNavigate('search') : undefined}>
                  View
                </Button>
              </div>
            </ListRow>
          ))
        ) : (
          <EmptyPlaceholder
            icon={Bookmark}
            title="No saved jobs yet"
            description="Bookmark roles from Job Search to keep your shortlist organized here."
            action={<Button size="sm" onClick={() => onNavigate('search')}>Browse Jobs</Button>}
          />
        )}
      </DCard>
    </div>
  )
}
