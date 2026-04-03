'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Briefcase, DollarSign, Building2, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { formatBD, timeAgo } from '@/lib/utils'
import { Spinner, Badge } from '@/components/ui/Components'
import Button from '@/components/ui/Button'

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#00cffd] via-[#0099cc] to-[#007799] shadow-md">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-bold text-gradient">ConnectHub</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/jobs" className="site-nav-link">Jobs</Link>
            <Link href="/freelance" className="site-nav-link">Freelance</Link>
            <Link href="/pricing" className="site-nav-link">Pricing</Link>
            <Link href="/login" className="site-nav-link rounded-md px-3 py-2 hover:bg-[#00cffd]/10">Login</Link>
            <Link href="/register" className="inline-flex h-9 items-center px-4 rounded-md text-sm font-medium text-white bg-gradient-to-r from-[#00cffd] to-[#0099cc] hover:from-[#00b8e6] hover:to-[#007799] shadow-md transition-all">Sign Up</Link>
          </div>
        </div>
      </div>
    </header>
  )
}

const JOB_TYPES = [
  ['all', 'All Types'],
  ['full_time', 'Full-Time'],
  ['part_time', 'Part-Time'],
  ['contract', 'Contract'],
  ['internship', 'Internship'],
]

const WORK_MODELS = [
  ['all', 'All Models'],
  ['on_site', 'On-Site'],
  ['remote', 'Remote'],
  ['hybrid', 'Hybrid'],
]

const SORT_OPTIONS = [
  ['newest', 'Newest First'],
  ['oldest', 'Oldest First'],
  ['salary_high', 'Highest Salary'],
  ['salary_low', 'Lowest Salary'],
  ['title', 'Title A-Z'],
]

export default function JobSearchPage() {
  const supabase = useMemo(() => createClient(), [])
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [workModelFilter, setWorkModelFilter] = useState('all')
  const [minSalary, setMinSalary] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)

      const { data } = await supabase
        .from('jobs')
        .select('*, profiles!jobs_employer_id_fkey(full_name, employer_profiles(company_name, company_logo))')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(60)

      setJobs(data || [])
      setLoading(false)
    }

    fetchJobs()
  }, [supabase])

  const filteredJobs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const normalizedLocation = location.trim().toLowerCase()
    const minimumSalary = Number(minSalary || 0)

    const filtered = jobs.filter(job => {
      const companyName = job.profiles?.employer_profiles?.company_name || job.profiles?.full_name || ''
      const haystack = `${job.title || ''} ${job.description || ''} ${job.requirements || ''} ${companyName}`.toLowerCase()
      const jobLocation = String(job.location || '').toLowerCase()
      const salaryFloor = Number(job.salary_min || job.salary_max || 0)

      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch)
      const matchesLocation = !normalizedLocation || jobLocation.includes(normalizedLocation)
      const matchesType = typeFilter === 'all' || job.job_type === typeFilter
      const matchesWorkModel = workModelFilter === 'all' || job.work_model === workModelFilter
      const matchesSalary = !minimumSalary || salaryFloor >= minimumSalary

      return matchesSearch && matchesLocation && matchesType && matchesWorkModel && matchesSalary
    })

    return filtered.sort((a, b) => {
      const aSalary = Number(a.salary_max || a.salary_min || 0)
      const bSalary = Number(b.salary_max || b.salary_min || 0)

      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'salary_high':
          return bSalary - aSalary
        case 'salary_low':
          return aSalary - bSalary
        case 'title':
          return String(a.title || '').localeCompare(String(b.title || ''))
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at)
      }
    })
  }, [jobs, location, minSalary, search, sortBy, typeFilter, workModelFilter])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-[#00cffd] to-[#0099cc] bg-clip-text text-transparent">Find Your Dream Job</span>
            </h1>
            <p className="text-gray-600">Discover opportunities that match your skills and aspirations</p>
          </div>

          <div className="soft-panel px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00cffd] to-[#0099cc] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Smart Matching Ready</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Search by keyword, role type, and location.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card-strong p-6 mb-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#00cffd]" />
              <input
                placeholder="Search jobs by title, company, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="public-input pl-10"
              />
            </div>
            <input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="public-input"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="public-input"
            >
              {JOB_TYPES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={workModelFilter}
              onChange={(e) => setWorkModelFilter(e.target.value)}
              className="public-input"
            >
              {WORK_MODELS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <input
              placeholder="Minimum salary (BHD)"
              type="number"
              min="0"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              className="public-input"
            />
          </div>
          <div className="mt-4 flex flex-col gap-3 border-t border-[rgba(0,207,253,0.1)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">{filteredJobs.length} job{filteredJobs.length === 1 ? '' : 's'} found</p>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Sort by</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="public-input min-w-[180px]">
                {SORT_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className="surface-card p-6 transition-all hover:border-[#00cffd]/30 hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00cffd]/15 to-[#0099cc]/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-[#0099cc]" />
                      </div>
                      <div>
                        <Link href={`/jobs/${job.id}`} className="text-lg font-semibold text-gray-900 dark:text-white hover:text-[#00cffd] transition-colors">
                          {job.title}
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5">
                          {job.profiles?.employer_profiles?.company_name || job.profiles?.full_name || 'Company'}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">{job.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {job.location && (
                        <span className="inline-flex items-center gap-1 text-xs bg-[#00cffd]/10 text-[#0099cc] px-2.5 py-1 rounded-full border border-[#00cffd]/20">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                      )}
                      {job.job_type && (
                        <span className="inline-flex items-center gap-1 text-xs bg-[#00cffd]/10 text-[#0099cc] px-2.5 py-1 rounded-full border border-[#00cffd]/20">
                          <Briefcase className="h-3 w-3" />
                          {job.job_type.replace('_', '-')}
                        </span>
                      )}
                      {job.salary_min && (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
                          <DollarSign className="h-3 w-3" />
                          {formatBD(job.salary_min)}-{formatBD(job.salary_max)}
                        </span>
                      )}
                      {job.work_model && (
                        <Badge variant="blue">{job.work_model.replace('_', '-')}</Badge>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">{timeAgo(job.created_at)}</p>
                  </div>

                  <div className="shrink-0">
                    <Button asChild>
                      <Link href={`/jobs/${job.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredJobs.length === 0 && (
              <div className="surface-card text-center py-16">
                <Search className="h-12 w-12 text-[#00cffd]/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No jobs found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
