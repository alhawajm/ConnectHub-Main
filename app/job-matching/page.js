'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Briefcase, DollarSign, Filter, MapPin, Sparkles, Star, Target, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Badge, Card, Spinner } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

function normalizeSkills(value) {
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean)
  if (typeof value === 'string') return value.split(',').map(item => item.trim()).filter(Boolean)
  return []
}

function scoreJob(job, profile) {
  const text = `${job.title || ''} ${job.description || ''} ${job.requirements || ''}`.toLowerCase()
  const location = String(job.location || '').toLowerCase()
  const skills = normalizeSkills(profile?.skills).map(skill => skill.toLowerCase())
  let score = 20

  skills.forEach(skill => {
    if (text.includes(skill)) score += 12
  })

  if (profile?.headline && text.includes(String(profile.headline).toLowerCase())) score += 15
  if (profile?.location && location.includes(String(profile.location).toLowerCase())) score += 20
  if (job.type && profile?.job_type_preference && job.type === profile.job_type_preference) score += 10

  return Math.min(score, 100)
}

export default function JobMatchingPage() {
  const supabase = createClient()
  const [jobs, setJobs] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    location: '',
    minSalary: '',
  })

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user?.id

      const [jobsResponse, profileResponse] = await Promise.all([
        supabase.from('jobs').select('*').order('created_at', { ascending: false }),
        userId ? supabase.from('profiles').select('*').eq('id', userId).single() : Promise.resolve({ data: null }),
      ])

      setJobs(jobsResponse.data || [])
      setProfile(profileResponse?.data || null)
      setLoading(false)
    }

    loadData()
  }, [supabase])

  const matchedJobs = useMemo(() => {
    return jobs
      .map(job => ({ ...job, matchScore: scoreJob(job, profile) }))
      .sort((a, b) => b.matchScore - a.matchScore)
  }, [jobs, profile])

  const filteredJobs = useMemo(() => {
    return matchedJobs.filter(job => {
      const matchesSearch =
        !filters.search ||
        String(job.title || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        String(job.description || '').toLowerCase().includes(filters.search.toLowerCase())
      const matchesType = !filters.type || String(job.type || '') === filters.type
      const matchesLocation = !filters.location || String(job.location || '').toLowerCase().includes(filters.location.toLowerCase())
      const matchesSalary = !filters.minSalary || Number(job.salary || 0) >= Number(filters.minSalary)
      return matchesSearch && matchesType && matchesLocation && matchesSalary
    })
  }, [filters, matchedJobs])

  const topMatches = filteredJobs.filter(job => job.matchScore >= 60)
  const averageScore = filteredJobs.length
    ? Math.round(filteredJobs.reduce((total, job) => total + job.matchScore, 0) / filteredJobs.length)
    : 0

  const getMatchTone = score => {
    if (score >= 75) return { label: 'Excellent Match', variant: 'green' }
    if (score >= 50) return { label: 'Good Match', variant: 'blue' }
    return { label: 'Potential Match', variant: 'yellow' }
  }

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
            <Input label="Job Type" as="select" value={filters.type} onChange={e => setFilters(current => ({ ...current, type: e.target.value }))}>
              <option value="">All types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </Input>
            <Input label="Location" value={filters.location} onChange={e => setFilters(current => ({ ...current, location: e.target.value }))} placeholder="Manama, Bahrain" />
            <Input label="Minimum Salary" type="number" value={filters.minSalary} onChange={e => setFilters(current => ({ ...current, minSalary: e.target.value }))} prefix="BHD" />
          </div>
        </Card>

        <div className="space-y-5">
          {filteredJobs.map(job => {
            const match = getMatchTone(job.matchScore)
            const matchedSkills = normalizeSkills(profile?.skills).filter(skill =>
              `${job.title || ''} ${job.description || ''} ${job.requirements || ''}`.toLowerCase().includes(skill.toLowerCase())
            )

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
                        {job.salary ? `${job.salary} BHD` : 'Salary not listed'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-[#00cffd]" />
                        {job.type || 'Open role'}
                      </div>
                    </div>

                    {matchedSkills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {matchedSkills.slice(0, 4).map(skill => (
                          <Badge key={skill} variant="cyan">{skill}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex w-full flex-col gap-3 lg:w-48">
                    <Button href={`/jobs/${job.id}`}>View Details</Button>
                    <Button href="/jobs" variant="outline">Browse All Jobs</Button>
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