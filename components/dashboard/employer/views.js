'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { compareApplicationsForJob, getMatchTone } from '@/lib/jobMatching'
import { formatDate, timeAgo, cn } from '@/lib/utils'
import { PageHeader, StatCard, DCard, DCardHeader, SectionTitle, EmptyPlaceholder, BarChart } from '@/components/dashboard/SharedComponents'
import { StatusBadge, Avatar, useToast, Badge } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import {
  BarChart2,
  Briefcase,
  CheckCircle2,
  Eye,
  LayoutDashboard,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

export function EmployerOverviewPage({ jobs, applications, onNavigate }) {
  const active = jobs.filter(job => job.status === 'active')
  const shortlisted = applications.filter(application => application.status === 'shortlisted')
  const hired = applications.filter(application => application.status === 'hired')

  return (
    <div>
      <PageHeader icon={LayoutDashboard} title="Employer Dashboard" subtitle="Manage your job posts, candidates, and hiring pipeline" />

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Active Job Posts" value={active.length} subtitle="Currently live" icon={Briefcase} />
        <StatCard label="Total Applications" value={applications.length} subtitle="All time" icon={Users} iconColor="#8b5cf6" />
        <StatCard label="Shortlisted" value={shortlisted.length} subtitle="Last 30 days" icon={CheckCircle2} iconColor="#f59e0b" />
        <StatCard label="Hires This Month" value={hired.length} subtitle="Confirmed offers" icon={TrendingUp} iconColor="#22c55e" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DCard noPad>
            <DCardHeader
              title="Recent Applications"
              subtitle="Fit scoring compares applications against the role requirements"
              action={<button onClick={() => onNavigate('candidates')} className="text-sm font-medium text-[#0099cc] hover:underline">View all →</button>}
            />
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Role</th>
                  <th className="hidden md:table-cell">Fit Score</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 5).map(application => (
                  <tr key={application.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={application.profiles?.full_name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{application.profiles?.full_name || 'Applicant'}</p>
                          <p className="text-xs text-gray-400">{timeAgo(application.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-gray-500">{application.jobs?.title || 'Role'}</td>
                    <td className="hidden md:table-cell">
                      <span className="text-sm font-bold text-[#00cffd]">{application.comparisonScore ?? application.ai_match_score ?? '—'}%</span>
                    </td>
                    <td><StatusBadge status={application.status} /></td>
                    <td>
                      <Button size="sm" variant="outline" onClick={() => onNavigate('candidates')}>Review</Button>
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-gray-400">No applications yet — post a job to get started.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </DCard>
        </div>

        <div className="flex flex-col gap-5">
          <DCard>
            <SectionTitle>Hiring Funnel</SectionTitle>
            {[
              { label: 'Applied', n: applications.length, pct: 100 },
              { label: 'Screened', n: Math.round(applications.length * 0.72), pct: 72 },
              { label: 'Shortlisted', n: shortlisted.length, pct: 43 },
              { label: 'Interviewed', n: Math.round(applications.length * 0.22), pct: 22 },
              { label: 'Hired', n: hired.length, pct: 5 },
            ].map(step => (
              <div key={step.label} className="mb-3 flex items-center gap-3 last:mb-0">
                <span className="w-20 flex-shrink-0 text-right text-xs text-gray-400">{step.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className="h-full rounded-full" style={{ width: `${step.pct}%`, background: 'linear-gradient(to right, #00cffd, #0099cc)' }} />
                </div>
                <span className="w-8 text-xs font-semibold text-gray-700 dark:text-gray-300">{step.n}</span>
              </div>
            ))}
          </DCard>

          <DCard>
            <SectionTitle>Quick Actions</SectionTitle>
            <div className="flex flex-col gap-2">
              <Button fullWidth onClick={() => onNavigate('post-job')}><Plus className="h-4 w-4" /> Post a Job</Button>
              <Button fullWidth variant="outline" onClick={() => onNavigate('candidates')}><Users className="h-4 w-4" /> Compare Candidates</Button>
              <Button fullWidth variant="ghost" onClick={() => onNavigate('analytics')}><BarChart2 className="h-4 w-4" /> View Analytics</Button>
            </div>
          </DCard>
        </div>
      </div>
    </div>
  )
}

export function EmployerJobsPage({ jobs, onNavigate, onJobsChanged }) {
  const toast = useToast()
  const supabase = createClient()
  const [filter, setFilter] = useState('all')

  const filteredJobs = filter === 'all' ? jobs : jobs.filter(job => job.status === filter)

  const closeJob = async id => {
    const { error } = await supabase.from('jobs').update({ status: 'closed' }).eq('id', id)
    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Job post closed')
    onJobsChanged?.()
  }

  return (
    <div>
      <PageHeader icon={Briefcase} title="Job Posts" subtitle="Manage your active, draft, and closed job listings" />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {['all', 'active', 'draft', 'closed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-all duration-200',
                filter === status
                  ? 'text-white'
                  : 'border border-[rgba(0,207,253,0.15)] bg-white text-gray-500 hover:border-[rgba(0,207,253,0.3)]'
              )}
              style={filter === status ? { background: 'linear-gradient(135deg, #00cffd, #0099cc)' } : {}}
            >
              {status}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => onNavigate('post-job')}><Plus className="h-4 w-4" /> New Post</Button>
      </div>
      <DCard noPad>
        <table className="data-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Type</th>
              <th>Applications</th>
              <th>Views</th>
              <th>Posted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map(job => (
              <tr key={job.id}>
                <td className="font-medium text-gray-900 dark:text-white">{job.title}</td>
                <td className="text-sm capitalize text-gray-500">{String(job.job_type || '').replace('_', '-')}</td>
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
            {filteredJobs.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-sm text-gray-400">
                  No {filter !== 'all' ? filter : ''} job posts.
                  <button onClick={() => onNavigate('post-job')} className="ml-1 font-medium text-[#0099cc]">Post one →</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </DCard>
    </div>
  )
}

export function EmployerPostJobPage({ profile, onCreated }) {
  const toast = useToast()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    job_type: 'full_time',
    work_model: 'on_site',
    location: 'Manama, Bahrain',
    department: '',
    salary_min: '',
    salary_max: '',
    skills_required: '',
  })

  const setField = (key, value) => setForm(current => ({ ...current, [key]: value }))

  const generateDraft = async () => {
    if (!form.title) {
      toast.error('Enter a job title first')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'job_description', title: form.title, description: form.description }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Could not generate draft')
      if (payload.data?.description) setField('description', payload.data.description)
      toast.success('Smart draft generated')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setGenerating(false)
    }
  }

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      requirements: '',
      job_type: 'full_time',
      work_model: 'on_site',
      location: 'Manama, Bahrain',
      department: '',
      salary_min: '',
      salary_max: '',
      skills_required: '',
    })
  }

  const submit = async (status = 'active') => {
    if (!form.title || !form.description) {
      toast.error('Title and description are required')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('jobs').insert({
        employer_id: profile.id,
        title: form.title,
        description: form.description,
        requirements: form.requirements,
        job_type: form.job_type,
        work_model: form.work_model,
        location: form.location,
        department: form.department,
        salary_min: form.salary_min ? parseInt(form.salary_min, 10) : null,
        salary_max: form.salary_max ? parseInt(form.salary_max, 10) : null,
        skills_required: form.skills_required.split(',').map(skill => skill.trim()).filter(Boolean),
        status,
      })
      if (error) throw error

      toast.success(status === 'active' ? 'Job published successfully' : 'Draft saved')
      resetForm()
      onCreated?.()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader icon={Plus} title="Post a Job" subtitle="Create a new job listing and use smart drafting support without losing control of the final wording" />
      <div className="grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DCard>
            <SectionTitle>Job Details</SectionTitle>
            <div className="space-y-4">
              <Input label="Job Title" value={form.title} onChange={event => setField('title', event.target.value)} placeholder="e.g. Senior React Developer" required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Employment Type" as="select" value={form.job_type} onChange={event => setField('job_type', event.target.value)}>
                  <option value="full_time">Full-Time</option>
                  <option value="part_time">Part-Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </Input>
                <Input label="Work Model" as="select" value={form.work_model} onChange={event => setField('work_model', event.target.value)}>
                  <option value="on_site">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </Input>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Location" value={form.location} onChange={event => setField('location', event.target.value)} />
                <Input label="Department" value={form.department} onChange={event => setField('department', event.target.value)} placeholder="Engineering" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Min Salary" type="number" prefix="BD" value={form.salary_min} onChange={event => setField('salary_min', event.target.value)} placeholder="1800" />
                <Input label="Max Salary" type="number" prefix="BD" value={form.salary_max} onChange={event => setField('salary_max', event.target.value)} placeholder="2400" />
              </div>
              <Input label="Job Description" as="textarea" rows={6} value={form.description} onChange={event => setField('description', event.target.value)} placeholder="Describe the role and responsibilities..." required />
              <Input label="Requirements" as="textarea" rows={3} value={form.requirements} onChange={event => setField('requirements', event.target.value)} placeholder="Years of experience, qualifications..." />
              <Input label="Required Skills (comma-separated)" value={form.skills_required} onChange={event => setField('skills_required', event.target.value)} placeholder="React, TypeScript, Node.js" />
              <div className="flex gap-3 pt-2">
                <Button loading={loading} onClick={() => submit('active')} fullWidth>Publish Job Post</Button>
                <Button variant="ghost" loading={loading} onClick={() => submit('draft')}>Save Draft</Button>
              </div>
            </div>
          </DCard>
        </div>
        <div className="flex flex-col gap-5">
          <DCard>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: 'linear-gradient(135deg, rgba(0,207,253,0.12), rgba(0,153,204,0.08))', color: '#0099cc' }}>
              <Zap className="h-3 w-3" /> Smart Drafting
            </div>
            <p className="mb-4 text-sm text-gray-500">Generate a clearer job draft while you stay in control of the final requirements and hiring decision.</p>
            <Button variant="outline" fullWidth loading={generating} onClick={generateDraft}>Generate Draft</Button>
          </DCard>
          <DCard>
            <p className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">What the system does</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Writing support</span><span className="font-semibold text-green-600">Included</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Candidate comparison</span><span className="font-semibold text-green-600">Included</span></div>
              <div className="border-t border-[rgba(0,207,253,0.1)] pt-2 text-xs text-gray-500">
                The system explains fit and differences between applicants, but it does not auto-select who to hire.
              </div>
            </div>
          </DCard>
        </div>
      </div>
    </div>
  )
}

export function EmployerCandidatesPage({ jobs, applications, onUpdateStatus }) {
  const [selectedJobId, setSelectedJobId] = useState('')

  useEffect(() => {
    if (!selectedJobId && jobs.length > 0) {
      setSelectedJobId(jobs[0].id)
    }
  }, [jobs, selectedJobId])

  const selectedJob = useMemo(
    () => jobs.find(job => job.id === selectedJobId) || jobs[0],
    [jobs, selectedJobId]
  )

  const comparedApplications = useMemo(() => {
    const relevantApplications = applications.filter(application => application.job_id === selectedJob?.id)
    return compareApplicationsForJob(relevantApplications, selectedJob)
  }, [applications, selectedJob])

  const averageScore = comparedApplications.length
    ? Math.round(comparedApplications.reduce((sum, application) => sum + application.comparisonScore, 0) / comparedApplications.length)
    : 0

  const strongFits = comparedApplications.filter(application => application.comparisonScore >= 60).length
  const needsReview = comparedApplications.filter(application => application.comparisonScore < 40).length

  return (
    <div>
      <PageHeader icon={Users} title="Candidate Comparison" subtitle="Compare applicants against the role criteria without the system choosing the hire for you" />

      <DCard className="mb-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Decision support, not auto-selection</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Scores, matched skills, and notes help you compare applications consistently while keeping the hiring decision human-led.</p>
          </div>
          <Input as="select" value={selectedJobId} onChange={event => setSelectedJobId(event.target.value)}>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </Input>
        </div>
      </DCard>

      <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Applicants" value={comparedApplications.length} subtitle="For this role" icon={Users} />
        <StatCard label="Average Fit" value={`${averageScore}%`} subtitle="Across applicants" icon={TrendingUp} iconColor="#8b5cf6" />
        <StatCard label="Strong Alignment" value={strongFits} subtitle="60% and above" icon={CheckCircle2} iconColor="#22c55e" />
        <StatCard label="Needs Review" value={needsReview} subtitle="Below 40%" icon={Eye} iconColor="#f59e0b" />
      </div>

      {comparedApplications.length > 0 ? (
        <div className="flex flex-col gap-4">
          {comparedApplications.map(application => {
            const tone = getMatchTone(application.comparisonScore)

            return (
              <DCard key={application.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={application.profiles?.full_name} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{application.profiles?.full_name || 'Applicant'}</p>
                          <p className="text-xs text-gray-400">{application.profiles?.headline || 'Applicant profile'}</p>
                        </div>
                      </div>
                      <Badge variant={tone.variant} dot={false}>{application.comparisonScore}% {application.comparisonTier}</Badge>
                      <Badge variant="cyan" dot={false}>Rank #{application.comparisonRank}</Badge>
                      <StatusBadge status={application.status} />
                    </div>

                    {application.comparisonReasons?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {application.comparisonReasons.map(reason => (
                          <Badge key={reason} variant="blue" dot={false}>{reason}</Badge>
                        ))}
                      </div>
                    )}

                    {application.comparisonMatchedSkills?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {application.comparisonMatchedSkills.map(skill => (
                          <Badge key={skill} variant="cyan" dot={false}>{skill}</Badge>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                      <div className="soft-panel p-3">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Skill fit</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{application.comparisonBreakdown?.skillScore ?? 0}/52</p>
                      </div>
                      <div className="soft-panel p-3">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Role alignment</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{application.comparisonBreakdown?.headlineScore ?? 0}/18</p>
                      </div>
                      <div className="soft-panel p-3">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Cover letter</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{application.comparisonBreakdown?.coverLetterScore ?? 0}/10</p>
                      </div>
                      <div className="soft-panel p-3">
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Location</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{application.comparisonBreakdown?.locationScore ?? 0}/10</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-2 lg:w-44">
                    <Button size="sm" variant="outline" onClick={() => onUpdateStatus(application.id, 'shortlisted')}>Shortlist</Button>
                    <Button size="sm" variant="ghost" onClick={() => onUpdateStatus(application.id, 'interview')}>Move to Interview</Button>
                  </div>
                </div>
              </DCard>
            )
          })}
        </div>
      ) : (
        <EmptyPlaceholder icon={Users} title="No applicants yet" description="Once candidates apply, this comparison view will rate applications against the role criteria and explain the fit." />
      )}
    </div>
  )
}

export function EmployerAnalyticsPage() {
  const bars = [
    { value: 28, label: 'Jan' },
    { value: 36 },
    { value: 44 },
    { value: 34 },
    { value: 52 },
    { value: 46 },
    { value: 64 },
    { value: 56 },
    { value: 70 },
    { value: 60 },
    { value: 78 },
    { value: 88, active: true, label: 'Mar' },
  ]

  return (
    <div>
      <PageHeader icon={BarChart2} title="Analytics" subtitle="Track your hiring performance and comparison quality signals" />
      <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard label="Profile Views" value="3.2K" subtitle="18% up this week" icon={Eye} iconColor="#00cffd" />
        <StatCard label="Apply Rate" value="14%" subtitle="3% above last month" icon={TrendingUp} iconColor="#22c55e" />
        <StatCard label="Time to Hire" value="12d" subtitle="Down 4d this month" icon={CheckCircle2} iconColor="#f59e0b" />
        <StatCard label="Cost per Hire" value="BD 28" subtitle="40% below agency benchmark" icon={BarChart2} iconColor="#8b5cf6" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DCard>
          <SectionTitle>Applications per Week</SectionTitle>
          <BarChart data={bars} height={120} />
        </DCard>
        <DCard>
          <SectionTitle>Application Sources</SectionTitle>
          <div className="mt-2 flex items-center gap-6">
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'conic-gradient(#00cffd 0% 45%, #22c55e 45% 70%, #f59e0b 70% 85%, #ececf0 85% 100%)' }}>
              <div className="h-14 w-14 rounded-full bg-white dark:bg-gray-900" />
            </div>
            <div className="space-y-2.5">
              {[['#00cffd', 'Direct Search — 45%'], ['#22c55e', 'Smart Matches — 25%'], ['#f59e0b', 'Job Alerts — 15%'], ['#ececf0', 'Other — 15%']].map(([color, label]) => (
                <div key={label} className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-sm" style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </DCard>
      </div>
    </div>
  )
}
