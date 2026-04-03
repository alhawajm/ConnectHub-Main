'use client'

import { useEffect, useMemo, useState } from 'react'
import { Briefcase, Clock3, FolderPlus, Search, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Badge, Card, Modal, Spinner, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const categories = [
  'Design',
  'Development',
  'Marketing',
  'Writing',
  'Business',
  'Data',
]

export default function FreelancePage() {
  const supabase = createClient()
  const toast = useToast()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
  })
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Design',
    budgetMin: '',
    budgetMax: '',
    timeline: '',
    skills: '',
  })

  useEffect(() => {
    async function loadProjects() {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      setProjects(data || [])
      setLoading(false)
    }

    loadProjects()
  }, [supabase])

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const haystack = `${project.title || ''} ${project.description || ''}`.toLowerCase()
      const matchesSearch = !filters.search || haystack.includes(filters.search.toLowerCase())
      const matchesCategory = !filters.category || String(project.category || '') === filters.category
      return matchesSearch && matchesCategory
    })
  }, [filters, projects])

  const setField = (key, value) => setForm(current => ({ ...current, [key]: value }))

  const handleSubmit = async e => {
    e.preventDefault()

    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id

    if (!userId) {
      toast.error('Please sign in to post a project.')
      return
    }

    const payload = {
      client_id: userId,
      title: form.title,
      description: form.description,
      category: form.category,
      budget_min: form.budgetMin ? Number(form.budgetMin) : null,
      budget_max: form.budgetMax ? Number(form.budgetMax) : null,
      timeline: form.timeline,
      status: 'open',
      skills_required: form.skills.split(',').map(skill => skill.trim()).filter(Boolean),
    }

    const { error, data } = await supabase.from('projects').insert(payload).select().single()
    if (error) {
      toast.error(error.message)
      return
    }

    setProjects(current => [data, ...current])
    setOpen(false)
    setForm({
      title: '',
      description: '',
      category: 'Design',
      budgetMin: '',
      budgetMax: '',
      timeline: '',
      skills: '',
    })
    toast.success('Project posted successfully.')
  }

  return (
    <div className="page-wrapper">
      <section className="container py-16">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-[#00cffd]" />
              <h1 className="text-4xl font-bold">
                <span className="text-gradient">Freelance Marketplace</span>
              </h1>
            </div>
            <p className="max-w-3xl text-lg text-gray-600">
              Discover freelance projects, connect with clients, and post new opportunities using the current ConnectHub workflow.
            </p>
          </div>
          <Button size="lg" onClick={() => setOpen(true)}>
            <FolderPlus className="h-5 w-5" />
            Post A Project
          </Button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-[1fr_220px]">
          <Input label="Search Projects" value={filters.search} onChange={e => setFilters(current => ({ ...current, search: e.target.value }))} placeholder="Title, skill, or keyword" />
          <Input label="Category" as="select" value={filters.category} onChange={e => setFilters(current => ({ ...current, category: e.target.value }))}>
            <option value="">All categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Input>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setFilters(current => ({ ...current, category: current.category === category ? '' : category }))}
              className={`rounded-xl border px-4 py-4 text-left transition-all ${filters.category === category ? 'border-[#00cffd] bg-[#00cffd]/10 text-[#0099cc]' : 'border-[#00cffd]/10 bg-white text-gray-700 hover:border-[#00cffd]/30'}`}
            >
              <p className="font-semibold">{category}</p>
              <p className="mt-1 text-xs text-gray-500">Browse {category.toLowerCase()} work</p>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-5">
            {filteredProjects.map(project => (
              <Card key={project.id}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-gray-900">{project.title}</h2>
                      <Badge variant="cyan" dot={false}>{project.category || 'Project'}</Badge>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600">{project.description || 'No project description provided.'}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(project.skills_required || []).slice(0, 5).map(skill => (
                        <Badge key={skill} variant="blue">{skill}</Badge>
                      ))}
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-gray-500 md:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-[#00cffd]" />
                        {project.status || 'open'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-[#00cffd]" />
                        {project.timeline || 'Timeline flexible'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-[#00cffd]" />
                        {project.budget_min || project.budget_max ? `${project.budget_min || 0} - ${project.budget_max || 0} BHD` : 'Budget on request'}
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-3 lg:w-44">
                    <Button href={`/projects/${project.id}`}>View Details</Button>
                    <Button href="/chat" variant="outline">Open Chat</Button>
                  </div>
                </div>
              </Card>
            ))}

            {filteredProjects.length === 0 && (
              <Card className="text-center">
                <Briefcase className="mx-auto mb-4 h-12 w-12 text-[#00cffd]" />
                <h2 className="mb-2 text-xl font-semibold text-gray-900">No projects found</h2>
                <p className="text-sm text-gray-600">Adjust your filters or post a new project to get started.</p>
              </Card>
            )}
          </div>
        )}
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Post A Freelance Project" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Project Title" value={form.title} onChange={e => setField('title', e.target.value)} required />
          <Input label="Project Description" as="textarea" rows={5} value={form.description} onChange={e => setField('description', e.target.value)} required />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Category" as="select" value={form.category} onChange={e => setField('category', e.target.value)}>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Input>
            <Input label="Timeline" value={form.timeline} onChange={e => setField('timeline', e.target.value)} placeholder="2 weeks, 1 month" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Minimum Budget" type="number" value={form.budgetMin} onChange={e => setField('budgetMin', e.target.value)} prefix="BHD" />
            <Input label="Maximum Budget" type="number" value={form.budgetMax} onChange={e => setField('budgetMax', e.target.value)} prefix="BHD" />
          </div>
          <Input label="Required Skills" value={form.skills} onChange={e => setField('skills', e.target.value)} placeholder="React, Figma, Copywriting" />
          <Button type="submit" fullWidth>
            Publish Project
          </Button>
        </form>
      </Modal>
    </div>
  )
}
