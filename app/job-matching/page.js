'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Briefcase, DollarSign, Filter, MapPin, Sparkles, Star, Target, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { getMatchTone, scoreJobForSeeker } from '@/lib/jobMatching'
import { Badge, Card, Spinner } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function JobMatchingPage() {
  const supabase = useMemo(() => createClient(), [])
  const [jobs, setJobs] = useState([])
  const [profile, setProfile] = useState(null)
  const [seekerProfile, setSeekerProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [savedJobs, setSavedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    jobType: '',
    workModel: '',
    location: '',
    minSalary: '',
  })

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user?.id

      const [jobsResponse, profileResponse, seekerProfileResponse, applicationsResponse, savedJobsResponse] = await Promise.all([
        supabase.from('jobs').select('*').order('created_at', { ascending: false }),
        userId ? supabase.from('profiles').select('*').eq('id', userId).single() : Promise.resolve({ data: null }),
        userId ? supabase.from('seeker_profiles').select('*').eq('id', userId).single() : Promise.resolve({ data: null }),
        userId ? supabase.from('applications').select('job_id').eq('seeker_id', userId) : Promise.resolve({ data: [] }),
        userId ? supabase.from('saved_jobs').select('job_id').eq('seeker_id', userId) : Promise.resolve({ data: [] }),
      ])

      setJobs(jobsResponse.data || [])
      setProfile(profileResponse?.data || null)
      setSeekerProfile(seekerProfileResponse?.data || null)
      setApplications(applicationsResponse?.data || [])
      setSavedJobs(savedJobsResponse?.data || [])
      setLoading(false)
    }

    loadData()
  }, [supabase])

  const appliedJobIds = useMemo(() => applications.map(application => application.job_id), [applications])
  const savedJobIds = useMemo(() => savedJobs.map(saved => saved.job_id), [savedJobs])

  const matchedJobs = useMemo(() => {
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
          matchBreakdown: recommendation.breakdown,
          hasApplied: appliedJobIds.includes(job.id),
        }
      })
      .sort((a, b) => b.matchScore - a.matchScore)
  }, [appliedJobIds, jobs, profile, savedJobIds, seekerProfile])

  const filteredJobs = useMemo(() => {
    return matchedJobs.filter(job => {
      const salaryFloor = Number(job.salary_min || job.salary_max || 0)
      const matchesSearch =
        !filters.search ||
        String(job.title || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        String(job.description || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        String(job.requirements || '').toLowerCase().includes(filters.search.toLowerCase())
      const matchesType = !filters.jobType || String(job.job_type || '') === filters.jobType
      const matchesWorkModel = !filters.workModel || String(job.work_model || '') === filters.workModel
      const matchesLocation = !filters.location || String(job.location || '').toLowerCase().includes(filters.location.toLowerCase())
      const matchesSalary = !filters.minSalary || salaryFloor >= Number(filters.minSalary)
      return matchesSearch && matchesType && matchesWorkModel && matchesLocation && matchesSalary
    })
  }, [filters, matchedJobs])

  const topMatches = filteredJobs.filter(job => job.matchScore >= 60)
  const averageScore = filteredJobs.length
    ? Math.round(filteredJobs.reduce((total, job) => total + job.matchScore, 0) / filteredJobs.length)
    : 0

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container flex min-h-[60vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <section className="container py-16">
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-[#00cffd]" />
            <h1 className="text-4xl font-bold">
              <span className="text-gradient">AI Job Matching</span>
            </h1>
          </div>
          <p className="max-w-3xl text-lg text-gray-600">
            Personalized job discovery powered by your profile, skills, and current opportunity data on ConnectHub.
          </p>
          {!profile && (
            <Card className="mt-6 bg-white/80">
              <p className="text-sm text-gray-600">
                Sign in for stronger matching using your real profile, skills, and location preferences.
              </p>
              <div className="mt-4 flex gap-3">
                <Button href="/login">Sign In</Button>
                <Button href="/register" variant="outline">Create Account</Button>
              </div>
            </Card>
          )}
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <Card>
            <div className="flex items-center gap-4">
              <div className="icon-badge">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{filteredJobs.length}</p>
                <p className="text-sm text-gray-500">Matched Jobs</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="icon-badge-soft">
                <TrendingUp className="h-6 w-6 text-[#00cffd]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{topMatches.length}</p>
                <p className="text-sm text-gray-500">High-Fit Matches</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="icon-badge-soft">
                <Star className="h-6 w-6 text-[#00cffd]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
                <p className="text-sm text-gray-500">Average Match Score</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#00cffd]" />
            <h2 className="text-lg font-semibold text-gray-900">Filter Matches</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Input label="Search" value={filters.search} onChange={e => setFilters(current => ({ ...current, search: e.target.value }))} placeholder="Role or keyword" />
            <Input label="Job Type" as="select" value={filters.jobType} onChange={e => setFilters(current => ({ ...current, jobType: e.target.value }))}>
              <option value="">All types</option>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </Input>
            <Input label="Work Model" as="select" value={filters.workModel} onChange={e => setFilters(current => ({ ...current, workModel: e.target.value }))}>
              <option value="">All models</option>
              <option value="on_site">On-site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </Input>
            <Input label="Location" value={filters.location} onChange={e => setFilters(current => ({ ...current, location: e.target.value }))} placeholder="Manama, Bahrain" />
          </div>
          <div className="mt-4 max-w-xs">
            <Input label="Minimum Salary" type="number" value={filters.minSalary} onChange={e => setFilters(current => ({ ...current, minSalary: e.target.value }))} prefix="BHD" />
          </div>
        </Card>

        <div className="space-y-5">
          {filteredJobs.map(job => {
            const match = getMatchTone(job.matchScore)

            return (
              <Card key={job.id}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                      <Badge variant={match.variant} dot={false}>{job.matchScore}% {match.label}</Badge>
                    </div>
                    <p className="mb-3 text-sm font-medium text-gray-500">{job.company || 'ConnectHub Employer'}</p>
                    <p className="text-sm leading-relaxed text-gray-600">{job.description || 'No description provided yet.'}</p>

                    <div className="mt-4 grid gap-3 text-sm text-gray-500 md:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#00cffd]" />
                        {job.location || 'Bahrain'}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-[#00cffd]" />
                        {job.salary_min || job.salary_max
                          ? `${job.salary_min || job.salary_max} - ${job.salary_max || job.salary_min} BHD`
                          : 'Salary not listed'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-[#00cffd]" />
                        {String(job.job_type || 'Open role').replace('_', ' ')}
                      </div>
                    </div>

                    {job.matchReasons?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.matchReasons.map(reason => (
                          <Badge key={reason} variant="blue">{reason}</Badge>
                        ))}
                      </div>
                    )}

                    {job.matchedSkills?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.matchedSkills.slice(0, 4).map(skill => (
                          <Badge key={skill} variant="cyan">{skill}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex w-full flex-col gap-3 lg:w-48">
                    <Button href={`/jobs/${job.id}`}>View Details</Button>
                    <Button href="/jobs" variant="outline">{job.hasApplied ? 'Already Applied' : 'Browse All Jobs'}</Button>
                  </div>
                </div>
              </Card>
            )
          })}

          {filteredJobs.length === 0 && (
            <Card className="text-center">
              <Target className="mx-auto mb-4 h-12 w-12 text-[#00cffd]" />
              <h2 className="mb-2 text-xl font-semibold text-gray-900">No matching jobs found</h2>
              <p className="text-sm text-gray-600">
                Try broadening your filters or visit the full jobs marketplace.
              </p>
              <div className="mt-4">
                <Link href="/jobs" className="btn-primary">Go To Jobs</Link>
              </div>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
