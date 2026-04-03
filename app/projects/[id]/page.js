'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Briefcase, Calendar, Clock3, FolderOpen, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Badge, Spinner, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatBD, timeAgo } from '@/lib/utils'

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
          <div className="flex items-center gap-3">
            <Link href="/freelance" className="site-nav-link">Back To Marketplace</Link>
            <Link href="/chat" className="btn-outline">Open Chat</Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const toast = useToast()
  const [project, setProject] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [proposal, setProposal] = useState({
    coverLetter: '',
    budget: '',
    timeline: '',
  })

  useEffect(() => {
    async function load() {
      setLoading(true)

      const [{ data: projectData }, { data: sessionData }] = await Promise.all([
        supabase
          .from('projects')
          .select('*, profiles!projects_client_id_fkey(full_name)')
          .eq('id', params.id)
          .single(),
        supabase.auth.getSession(),
      ])

      setProject(projectData || null)

      const userId = sessionData?.session?.user?.id
      if (userId) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single()
        setProfile(profileData || null)
      }

      setLoading(false)
    }

    load()
  }, [params.id, supabase])

  const submitProposal = async () => {
    if (!profile) {
      router.push('/login')
      return
    }

    if (profile.role !== 'freelancer') {
      toast.error('Only freelancers can submit proposals for projects.')
      return
    }

    setSubmitting(true)
    const { error } = await supabase.from('proposals').insert({
      project_id: project.id,
      freelancer_id: profile.id,
      cover_letter: proposal.coverLetter,
      bid_amount: proposal.budget ? Number(proposal.budget) : null,
      delivery_days: proposal.timeline ? Number(proposal.timeline) : null,
      status: 'pending',
    })
    setSubmitting(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Proposal submitted successfully.')
    setProposal({ coverLetter: '', budget: '', timeline: '' })
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

  if (!project) {
    return (
      <div className="page-wrapper">
        <SiteHeader />
        <div className="container py-16">
          <div className="surface-card p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project not found</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">This project is unavailable or may have been removed.</p>
            <Link href="/freelance" className="btn-primary mt-6">Browse Projects</Link>
          </div>
        </div>
      </div>
    )
  }

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
                    <FolderOpen className="h-5 w-5 text-[#0099cc]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{project.profiles?.full_name || 'Client project'}</p>
                    <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="cyan">{project.category || 'Project'}</Badge>
                  <Badge variant="blue">{project.status || 'open'}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-bold text-[#0099cc]">
                  {project.budget_min || project.budget_max
                    ? `${project.budget_min ? formatBD(project.budget_min) : ''}${project.budget_max ? ` - ${formatBD(project.budget_max)}` : ''}`
                    : 'Budget on request'}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{timeAgo(project.created_at)}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-gray-600 dark:text-gray-300 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[#00cffd]" />
                {project.status || 'open'}
              </div>
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-[#00cffd]" />
                {project.timeline || 'Timeline flexible'}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#00cffd]" />
                Posted {timeAgo(project.created_at)}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Project Description</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {project.description || 'No project description provided.'}
              </p>
            </div>

            {!!project.skills_required?.length && (
              <div className="mt-8">
                <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Required Skills</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.skills_required.map(skill => (
                    <Badge key={skill} variant="blue">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="surface-card p-6">
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Send Proposal</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Quote your budget, delivery estimate, and a short note about your approach.
              </p>
              <div className="mt-4 space-y-4">
                <Input
                  label="Bid Amount"
                  type="number"
                  prefix="BHD"
                  value={proposal.budget}
                  onChange={e => setProposal(current => ({ ...current, budget: e.target.value }))}
                />
                <Input
                  label="Delivery Days"
                  type="number"
                  suffix="days"
                  value={proposal.timeline}
                  onChange={e => setProposal(current => ({ ...current, timeline: e.target.value }))}
                />
                <Input
                  label="Cover Letter"
                  as="textarea"
                  rows={6}
                  value={proposal.coverLetter}
                  onChange={e => setProposal(current => ({ ...current, coverLetter: e.target.value }))}
                  placeholder="Explain why you are the right freelancer for this project."
                />
              </div>
              <Button className="mt-4" fullWidth loading={submitting} onClick={submitProposal}>
                {profile ? 'Submit Proposal' : 'Sign In To Propose'}
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
