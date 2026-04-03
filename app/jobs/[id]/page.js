'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Briefcase, Building2, Calendar, DollarSign, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Badge, Spinner, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatBD, timeAgo } from '@/lib/utils'
import Logo from '@/components/branding/Logo'

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Logo wordmarkClassName="text-xl font-bold text-gradient" />
          <div className="flex items-center gap-3">
            <Link href="/jobs" className="site-nav-link">Back To Jobs</Link>
            <Link href="/chat" className="btn-outline">Open Chat</Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const toast = useToast()
  const [job, setJob] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)

      const [{ data: jobData }, { data: sessionData }] = await Promise.all([
        supabase
          .from('jobs')
          .select('*, profiles!jobs_employer_id_fkey(full_name, employer_profiles(company_name, company_logo))')
          .eq('id', params.id)
          .single(),
        supabase.auth.getSession(),
      ])

      setJob(jobData || null)

      const userId = sessionData?.session?.user?.id
      if (userId) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single()
        setProfile(profileData || null)
      }

      setLoading(false)
    }

    load()
  }, [params.id, supabase])

  const applyToJob = async () => {
    if (!profile) {
      router.push('/login')
      return
    }

    if (profile.role !== 'seeker') {
      toast.error('Only job seekers can apply for job postings.')
      return
    }

    setSubmitting(true)
    const { error } = await supabase.from('applications').insert({
      job_id: job.id,
      seeker_id: profile.id,
      cover_letter: coverLetter || null,
      status: 'pending',
    })

    setSubmitting(false)

    if (error?.code === '23505') {
      toast.error('You have already applied to this job.')
      return
    }
    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Application submitted successfully.')
    setCoverLetter('')
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <SiteHeader />
        <div className="container py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="page-wrapper">
        <SiteHeader />
        <div className="container py-16">
          <div className="surface-card p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job not found</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">This opportunity is unavailable or may have been removed.</p>
            <Link href="/jobs" className="btn-primary mt-6">Browse Jobs</Link>
          </div>
        </div>
      </div>
    )
  }

  const companyName = job.profiles?.employer_profiles?.company_name || job.profiles?.full_name || 'Company'

  return (
    <div className="page-wrapper">
      <SiteHeader />
      <section className="container py-16">
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="surface-card-strong p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#00cffd]/15 to-[#0099cc]/10">
                    <Building2 className="h-5 w-5 text-[#0099cc]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{companyName}</p>
                    <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.job_type && <Badge variant="cyan">{job.job_type.replace('_', '-')}</Badge>}
                  {job.work_model && <Badge variant="blue">{job.work_model.replace('_', '-')}</Badge>}
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-bold text-[#0099cc]">
                  {job.salary_min ? `${formatBD(job.salary_min)}${job.salary_max ? ` - ${formatBD(job.salary_max)}` : ''}` : 'Salary not specified'}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{timeAgo(job.created_at)}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-gray-600 dark:text-gray-300 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#00cffd]" />
                {job.location || 'Location flexible'}
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[#00cffd]" />
                {job.status || 'active'}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#00cffd]" />
                Posted {timeAgo(job.created_at)}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Job Description</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {job.description || 'No description provided.'}
              </p>
            </div>

            {job.requirements && (
              <div className="mt-8">
                <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Requirements</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {job.requirements}
                </p>
              </div>
            )}

            {!!job.skills_required?.length && (
              <div className="mt-8">
                <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Skills</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skills_required.map(skill => (
                    <Badge key={skill} variant="blue">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="surface-card p-6">
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Apply Now</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Send a short introduction and we&apos;ll store your application in the ConnectHub flow.
              </p>
              <div className="mt-4">
                <Input
                  label="Cover Letter"
                  as="textarea"
                  rows={6}
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  placeholder="Share why you are a strong fit for this role."
                />
              </div>
              <Button className="mt-4" fullWidth loading={submitting} onClick={applyToJob}>
                {profile ? 'Submit Application' : 'Sign In To Apply'}
              </Button>
            </div>

            <div className="surface-card p-6">
              <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">Opportunity Snapshot</h2>
              <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-between gap-3">
                  <span>Company</span>
                  <span className="font-medium text-gray-900 dark:text-white">{companyName}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Location</span>
                  <span className="font-medium text-gray-900 dark:text-white">{job.location || 'Flexible'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Type</span>
                  <span className="font-medium text-gray-900 dark:text-white">{job.job_type?.replace('_', '-') || 'Not specified'}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Compensation</span>
                  <span className="font-medium text-gray-900 dark:text-white">{job.salary_min ? formatBD(job.salary_min) : 'Not listed'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
