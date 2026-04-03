'use client'
import { useState, useEffect, useMemo } from 'react'
import { Award, Briefcase, GraduationCap, Link2, MapPin, Phone, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Card, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'

const emptyExperience = () => ({
  role: '',
  company: '',
  period: '',
  description: '',
})

const emptyEducation = () => ({
  degree: '',
  institution: '',
  year: '',
  description: '',
})

const CATEGORIES = [
  { value: 'project', label: 'Project' },
  { value: 'design', label: 'Design Work' },
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
  { value: 'cert', label: 'Certification' },
  { value: 'other', label: 'Other' },
]

function parsePortfolioData(raw) {
  const empty = {
    items: [],
    tagline: '',
    website: '',
    linkedin: '',
    github: '',
    phone: '',
    location: '',
    certifications: '',
    experiences: [],
    education: [],
  }

  if (!raw) return empty

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return { ...empty, items: parsed }
    return {
      ...empty,
      ...parsed,
      items: parsed.items || [],
      experiences: parsed.experiences || [],
      education: parsed.education || [],
    }
  } catch {
    return empty
  }
}

export default function PortfolioBuilder({ profile }) {
  const supabase = useMemo(() => createClient(), [])
  const toast = useToast()
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile/${profile?.id}`

  const [portfolio, setPortfolio] = useState(() => parsePortfolioData(profile?.portfolio_items))
  const [showItemForm, setShowItemForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiBio, setAiBio] = useState('')
  const [itemForm, setItemForm] = useState({
    title: '',
    description: '',
    url: '',
    category: 'project',
    tags: '',
  })

  useEffect(() => {
    const parsed = parsePortfolioData(profile?.portfolio_items)
    setPortfolio({
      ...parsed,
      website: parsed.website || profile?.website || '',
      linkedin: parsed.linkedin || profile?.linkedin_url || '',
      phone: parsed.phone || profile?.phone || '',
      location: parsed.location || profile?.location || '',
    })
    setAiBio(profile?.bio || '')
  }, [profile])

  const updatePortfolio = updater => {
    setPortfolio(current => (typeof updater === 'function' ? updater(current) : updater))
  }

  const persistPortfolio = async nextPortfolio => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          portfolio_items: JSON.stringify(nextPortfolio),
          website: nextPortfolio.website || null,
          linkedin_url: nextPortfolio.linkedin || null,
          phone: nextPortfolio.phone || null,
          location: nextPortfolio.location || null,
        })
        .eq('id', profile.id)

      if (error) throw error
      toast.success('Portfolio saved successfully.')
    } catch (error) {
      toast.error(error.message || 'Unable to save portfolio.')
    } finally {
      setSaving(false)
    }
  }

  const quickSave = async () => {
    await persistPortfolio(portfolio)
  }

  const addPortfolioItem = async () => {
    if (!itemForm.title.trim()) {
      toast.error('Portfolio item title is required.')
      return
    }

    const nextPortfolio = {
      ...portfolio,
      items: [
        ...portfolio.items,
        {
          id: Date.now().toString(),
          title: itemForm.title.trim(),
          description: itemForm.description.trim(),
          url: itemForm.url.trim(),
          category: itemForm.category,
          tags: itemForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          created_at: new Date().toISOString(),
        },
      ],
    }

    setPortfolio(nextPortfolio)
    await persistPortfolio(nextPortfolio)
    setItemForm({ title: '', description: '', url: '', category: 'project', tags: '' })
    setShowItemForm(false)
  }

  const removePortfolioItem = async id => {
    const nextPortfolio = {
      ...portfolio,
      items: portfolio.items.filter(item => item.id !== id),
    }
    setPortfolio(nextPortfolio)
    await persistPortfolio(nextPortfolio)
  }

  const updateExperience = (index, key, value) => {
    updatePortfolio(current => {
      const next = [...current.experiences]
      next[index] = { ...next[index], [key]: value }
      return { ...current, experiences: next }
    })
  }

  const updateEducation = (index, key, value) => {
    updatePortfolio(current => {
      const next = [...current.education]
      next[index] = { ...next[index], [key]: value }
      return { ...current, education: next }
    })
  }

  const generateAiBio = async () => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills: profile?.skills || [],
          headline: profile?.headline || portfolio.tagline || '',
          experienceYears: Math.max(portfolio.experiences.length, 3),
        }),
      })
      const { data } = await res.json()
      if (data?.bio) {
        setAiBio(data.bio)
        toast.success('Profile summary draft generated.')
      }
    } catch {
      toast.error('Summary generation failed.')
    } finally {
      setAiLoading(false)
    }
  }

  const saveAiBio = async () => {
    const { error } = await supabase.from('profiles').update({ bio: aiBio }).eq('id', profile.id)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Bio saved to profile.')
  }

  return (
    <div className="max-w-4xl flex flex-col gap-5">
      <Card padding="md" className="border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/10">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-bold text-brand-700 dark:text-brand-300">Your public portfolio link</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono break-all">{publicUrl}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success('Link copied.') }}>
              Copy Link
            </Button>
            <Button size="sm" href={publicUrl} target="_blank">View</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col gap-5">
          <Card padding="md">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-gray-900 dark:text-white">Brand And Contact</h3>
                <p className="text-xs text-gray-400 mt-0.5">Shape the public-facing part of your portfolio.</p>
              </div>
              <Button size="sm" onClick={quickSave} loading={saving}>Save</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Tagline" value={portfolio.tagline} onChange={e => updatePortfolio(current => ({ ...current, tagline: e.target.value }))} placeholder="Product designer building useful systems" />
              <Input label="Location" value={portfolio.location} onChange={e => updatePortfolio(current => ({ ...current, location: e.target.value }))} placeholder="Manama, Bahrain" />
              <Input label="Website" value={portfolio.website} onChange={e => updatePortfolio(current => ({ ...current, website: e.target.value }))} placeholder="https://your-site.com" />
              <Input label="LinkedIn" value={portfolio.linkedin} onChange={e => updatePortfolio(current => ({ ...current, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/you" />
              <Input label="GitHub" value={portfolio.github} onChange={e => updatePortfolio(current => ({ ...current, github: e.target.value }))} placeholder="https://github.com/you" />
              <Input label="Phone" value={portfolio.phone} onChange={e => updatePortfolio(current => ({ ...current, phone: e.target.value }))} placeholder="+973 ..." />
            </div>
            <div className="mt-4">
              <Input label="Certifications" as="textarea" rows={3} value={portfolio.certifications} onChange={e => updatePortfolio(current => ({ ...current, certifications: e.target.value }))} placeholder="Google UX Certificate, AWS Cloud Practitioner, PMP..." />
            </div>
          </Card>

          <Card padding="md">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-gray-900 dark:text-white">Portfolio Items</h3>
                <p className="text-xs text-gray-400 mt-0.5">{portfolio.items.length} items ready for your public profile</p>
              </div>
              <Button size="sm" onClick={() => setShowItemForm(current => !current)}>
                {showItemForm ? 'Cancel' : '+ Add Item'}
              </Button>
            </div>

            {showItemForm && (
              <div className="border border-brand-200 dark:border-brand-800 rounded-xl p-4 mb-4 bg-brand-50 dark:bg-brand-900/10 flex flex-col gap-3">
                <Input label="Title *" value={itemForm.title} onChange={e => setItemForm(current => ({ ...current, title: e.target.value }))} placeholder="E-commerce redesign" />
                <Input label="Category" as="select" value={itemForm.category} onChange={e => setItemForm(current => ({ ...current, category: e.target.value }))}>
                  {CATEGORIES.map(category => <option key={category.value} value={category.value}>{category.label}</option>)}
                </Input>
                <Input label="Description" as="textarea" rows={3} value={itemForm.description} onChange={e => setItemForm(current => ({ ...current, description: e.target.value }))} placeholder="Describe the problem, what you built, and the result." />
                <Input label="URL" value={itemForm.url} onChange={e => setItemForm(current => ({ ...current, url: e.target.value }))} placeholder="https://github.com/you/project" />
                <Input label="Tags" value={itemForm.tags} onChange={e => setItemForm(current => ({ ...current, tags: e.target.value }))} placeholder="React, Supabase, UI" />
                <Button onClick={addPortfolioItem} loading={saving}>Add Portfolio Item</Button>
              </div>
            )}

            {portfolio.items.length === 0 && !showItemForm ? (
              <div className="text-center py-10">
                <p className="text-sm text-gray-500 dark:text-gray-400">No portfolio items yet.</p>
                <p className="text-xs text-gray-400 mt-1">Add project links, design work, articles, or certifications.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {portfolio.items.map(item => (
                  <div key={item.id} className="group border border-gray-100 dark:border-gray-800 rounded-xl p-4 hover:border-brand-200 dark:hover:border-brand-800 transition-colors">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      {CATEGORIES.find(category => category.value === item.category)?.label || item.category}
                    </span>
                    <h4 className="font-semibold text-gray-900 dark:text-white mt-2 mb-1">{item.title}</h4>
                    {item.description && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{item.description}</p>}
                    {item.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.tags.map(tag => (
                          <span key={tag} className="text-xs px-1.5 py-0.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">{formatDate(item.created_at)}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.url && <Button size="xs" variant="ghost" href={item.url} target="_blank">View</Button>}
                        <Button size="xs" variant="danger" onClick={() => removePortfolioItem(item.id)}>Remove</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card padding="md">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-[#00cffd]" />
                <div>
                  <h3 className="font-display font-bold text-gray-900 dark:text-white">Experience</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Add client work, jobs, or major engagements.</p>
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={() => updatePortfolio(current => ({ ...current, experiences: [...current.experiences, emptyExperience()] }))}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            <div className="space-y-4">
              {portfolio.experiences.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No experience entries yet.</p>}
              {portfolio.experiences.map((item, index) => (
                <div key={`experience-${index}`} className="rounded-xl border border-[#00cffd]/10 bg-[#00cffd]/5 dark:bg-[#0f2133] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Experience {index + 1}</p>
                    <button onClick={() => updatePortfolio(current => ({ ...current, experiences: current.experiences.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Role" value={item.role} onChange={e => updateExperience(index, 'role', e.target.value)} />
                    <Input label="Company" value={item.company} onChange={e => updateExperience(index, 'company', e.target.value)} />
                  </div>
                  <div className="mt-4">
                    <Input label="Period" value={item.period} onChange={e => updateExperience(index, 'period', e.target.value)} placeholder="2023 - Present" />
                  </div>
                  <div className="mt-4">
                    <Input label="Description" as="textarea" rows={4} value={item.description} onChange={e => updateExperience(index, 'description', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-[#00cffd]" />
                <div>
                  <h3 className="font-display font-bold text-gray-900 dark:text-white">Education</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Show academic background and training.</p>
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={() => updatePortfolio(current => ({ ...current, education: [...current.education, emptyEducation()] }))}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            <div className="space-y-4">
              {portfolio.education.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No education entries yet.</p>}
              {portfolio.education.map((item, index) => (
                <div key={`education-${index}`} className="rounded-xl border border-[#00cffd]/10 bg-white dark:bg-[#0e1a2b] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Education {index + 1}</p>
                    <button onClick={() => updatePortfolio(current => ({ ...current, education: current.education.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Degree" value={item.degree} onChange={e => updateEducation(index, 'degree', e.target.value)} />
                    <Input label="Institution" value={item.institution} onChange={e => updateEducation(index, 'institution', e.target.value)} />
                  </div>
                  <div className="mt-4">
                    <Input label="Year / Period" value={item.year} onChange={e => updateEducation(index, 'year', e.target.value)} />
                  </div>
                  <div className="mt-4">
                    <Input label="Description" as="textarea" rows={3} value={item.description} onChange={e => updateEducation(index, 'description', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card padding="md">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-display font-bold text-gray-900 dark:text-white">Profile Summary Generator</h3>
                <p className="text-xs text-gray-400 mt-0.5">Generate a polished first draft based on your work and skills, then refine it yourself.</p>
              </div>
              <Button size="sm" onClick={generateAiBio} loading={aiLoading}>Generate</Button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-2">
              <Input label="Profile Bio" as="textarea" rows={7} value={aiBio} onChange={e => setAiBio(e.target.value)} placeholder="Your public profile bio will appear here." />
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={saveAiBio}>Save To Profile</Button>
                <Button size="sm" variant="ghost" onClick={generateAiBio} loading={aiLoading}>Regenerate</Button>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-5 w-5 text-[#00cffd]" />
              <div>
                <h3 className="font-display font-bold text-gray-900 dark:text-white">Public Profile Preview</h3>
                <p className="text-xs text-gray-400 mt-0.5">Quick summary of what visitors will see.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-display text-xl font-bold text-gray-900 dark:text-white">{profile?.full_name || 'Your Name'}</p>
                <p className="text-sm text-[#0099cc]">{portfolio.tagline || profile?.headline || 'Add a tagline to sharpen your profile.'}</p>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {portfolio.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#00cffd]" />{portfolio.location}</p>}
                {portfolio.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#00cffd]" />{portfolio.phone}</p>}
                {(portfolio.website || portfolio.linkedin || portfolio.github) && (
                  <p className="flex items-center gap-2"><Link2 className="h-4 w-4 text-[#00cffd]" />{[portfolio.website, portfolio.linkedin, portfolio.github].filter(Boolean).length} links added</p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="soft-panel p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
                  <p className="mt-1 font-display text-2xl font-bold text-gray-900 dark:text-white">{portfolio.items.length}</p>
                </div>
                <div className="soft-panel p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Experience</p>
                  <p className="mt-1 font-display text-2xl font-bold text-gray-900 dark:text-white">{portfolio.experiences.length}</p>
                </div>
                <div className="soft-panel p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Education</p>
                  <p className="mt-1 font-display text-2xl font-bold text-gray-900 dark:text-white">{portfolio.education.length}</p>
                </div>
              </div>
              <Button fullWidth onClick={quickSave} loading={saving}>Save Full Portfolio</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
