'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, FileText, Plus, Save, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Card, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const emptyExperience = () => ({
  role: '',
  company: '',
  period: '',
  highlights: '',
})

const emptyEducation = () => ({
  degree: '',
  institution: '',
  year: '',
})

export default function CVBuilderPage() {
  const supabase = createClient()
  const toast = useToast()
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: '',
    experience: [emptyExperience()],
    education: [emptyEducation()],
  })

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession()
      const sessionUser = sessionData?.session?.user
      if (!sessionUser) {
        setLoading(false)
        return
      }

      setUserId(sessionUser.id)
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', sessionUser.id).single()
      const local = window.localStorage.getItem(`connecthub-cv-${sessionUser.id}`)

      if (local) {
        setData(JSON.parse(local))
      } else {
        setData(current => ({
          ...current,
          fullName: profile?.full_name || '',
          title: profile?.headline || '',
          email: sessionUser.email || '',
          phone: profile?.phone || '',
          location: profile?.location || '',
          skills: Array.isArray(profile?.skills) ? profile.skills.join(', ') : profile?.skills || '',
          summary: profile?.bio || '',
        }))
      }

      setLoading(false)
    }

    load()
  }, [supabase])

  const setField = (key, value) => setData(current => ({ ...current, [key]: value }))

  const saveDraft = () => {
    if (!userId) {
      toast.info('Sign in to save your CV draft locally.')
      return
    }

    window.localStorage.setItem(`connecthub-cv-${userId}`, JSON.stringify(data))
    toast.success('CV draft saved.')
  }

  const exportHtml = useMemo(() => {
    const experience = data.experience
      .filter(item => item.role || item.company || item.highlights)
      .map(item => `
        <section style="margin-bottom:16px">
          <h3 style="margin:0;font-size:16px;color:#111827">${item.role || 'Role'}</h3>
          <p style="margin:4px 0 6px;color:#0891b2;font-weight:600">${item.company || 'Company'}${item.period ? ` | ${item.period}` : ''}</p>
          <p style="margin:0;color:#4b5563;white-space:pre-line">${item.highlights || ''}</p>
        </section>
      `)
      .join('')

    const education = data.education
      .filter(item => item.degree || item.institution)
      .map(item => `
        <section style="margin-bottom:12px">
          <h3 style="margin:0;font-size:16px;color:#111827">${item.degree || 'Degree'}</h3>
          <p style="margin:4px 0 0;color:#4b5563">${item.institution || 'Institution'}${item.year ? ` | ${item.year}` : ''}</p>
        </section>
      `)
      .join('')

    return `
      <html>
        <head>
          <title>${data.fullName || 'ConnectHub CV'}</title>
        </head>
        <body style="font-family:Arial,sans-serif;margin:40px;color:#111827">
          <h1 style="margin:0 0 8px;font-size:32px">${data.fullName || 'Your Name'}</h1>
          <p style="margin:0 0 4px;color:#0891b2;font-size:18px">${data.title || 'Professional Title'}</p>
          <p style="margin:0 0 24px;color:#4b5563">${[data.email, data.phone, data.location].filter(Boolean).join(' | ')}</p>
          <h2 style="border-bottom:2px solid #00cffd;padding-bottom:6px">Summary</h2>
          <p style="color:#4b5563;white-space:pre-line">${data.summary || ''}</p>
          <h2 style="border-bottom:2px solid #00cffd;padding-bottom:6px">Skills</h2>
          <p style="color:#4b5563">${data.skills || ''}</p>
          <h2 style="border-bottom:2px solid #00cffd;padding-bottom:6px">Experience</h2>
          ${experience || '<p style="color:#6b7280">No experience added.</p>'}
          <h2 style="border-bottom:2px solid #00cffd;padding-bottom:6px">Education</h2>
          ${education || '<p style="color:#6b7280">No education added.</p>'}
        </body>
      </html>
    `
  }, [data])

  const downloadCv = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Unable to open print preview.')
      return
    }

    printWindow.document.write(exportHtml)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const updateExperience = (index, key, value) => {
    setData(current => {
      const next = [...current.experience]
      next[index] = { ...next[index], [key]: value }
      return { ...current, experience: next }
    })
  }

  const updateEducation = (index, key, value) => {
    setData(current => {
      const next = [...current.education]
      next[index] = { ...next[index], [key]: value }
      return { ...current, education: next }
    })
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container py-16">
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading CV builder...</p>
        </div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="page-wrapper">
        <section className="container py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#00cffd]/20 to-[#0099cc]/20">
              <FileText className="h-10 w-10 text-[#00cffd]" />
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              <span className="text-gradient">CV Builder</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Sign in to build, save, and export a structured CV using your ConnectHub profile as the starting point.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button href="/login" size="lg">Sign In</Button>
              <Button href="/register" variant="outline" size="lg">Create Account</Button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <section className="container py-16">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              <span className="text-gradient">CV Builder</span>
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Build a polished CV, save drafts locally, and export through print-ready preview.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={saveDraft}>
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={downloadCv}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card>
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Full Name" value={data.fullName} onChange={e => setField('fullName', e.target.value)} />
                <Input label="Professional Title" value={data.title} onChange={e => setField('title', e.target.value)} />
                <Input label="Email" type="email" value={data.email} onChange={e => setField('email', e.target.value)} />
                <Input label="Phone" value={data.phone} onChange={e => setField('phone', e.target.value)} />
              </div>
              <div className="mt-4">
                <Input label="Location" value={data.location} onChange={e => setField('location', e.target.value)} />
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Summary And Skills</h2>
              <div className="space-y-4">
                <Input label="Professional Summary" as="textarea" rows={5} value={data.summary} onChange={e => setField('summary', e.target.value)} />
                <Input label="Skills" as="textarea" rows={3} value={data.skills} onChange={e => setField('skills', e.target.value)} placeholder="React, Product Design, Project Management" />
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Experience</h2>
                <Button size="sm" onClick={() => setData(current => ({ ...current, experience: [...current.experience, emptyExperience()] }))}>
                  <Plus className="h-4 w-4" />
                  Add Experience
                </Button>
              </div>
              <div className="space-y-4">
                {data.experience.map((item, index) => (
                  <div key={`experience-${index}`} className="rounded-xl border border-[#00cffd]/10 bg-[#00cffd]/5 dark:bg-[#0f2133] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Role {index + 1}</p>
                      {data.experience.length > 1 && (
                        <button onClick={() => setData(current => ({ ...current, experience: current.experience.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input label="Role" value={item.role} onChange={e => updateExperience(index, 'role', e.target.value)} />
                      <Input label="Company" value={item.company} onChange={e => updateExperience(index, 'company', e.target.value)} />
                    </div>
                    <div className="mt-4">
                      <Input label="Period" value={item.period} onChange={e => updateExperience(index, 'period', e.target.value)} placeholder="2023 to Present" />
                    </div>
                    <div className="mt-4">
                      <Input label="Highlights" as="textarea" rows={4} value={item.highlights} onChange={e => updateExperience(index, 'highlights', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Education</h2>
                <Button size="sm" onClick={() => setData(current => ({ ...current, education: [...current.education, emptyEducation()] }))}>
                  <Plus className="h-4 w-4" />
                  Add Education
                </Button>
              </div>
              <div className="space-y-4">
                {data.education.map((item, index) => (
                  <div key={`education-${index}`} className="rounded-xl border border-[#00cffd]/10 bg-white dark:bg-[#0e1a2b] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Education {index + 1}</p>
                      {data.education.length > 1 && (
                        <button onClick={() => setData(current => ({ ...current, education: current.education.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input label="Degree" value={item.degree} onChange={e => updateEducation(index, 'degree', e.target.value)} />
                      <Input label="Institution" value={item.institution} onChange={e => updateEducation(index, 'institution', e.target.value)} />
                    </div>
                    <div className="mt-4">
                      <Input label="Year" value={item.year} onChange={e => updateEducation(index, 'year', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="h-fit xl:sticky xl:top-24">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Live Preview</h2>
            <div className="rounded-xl border border-[#00cffd]/10 bg-white dark:bg-[#0e1a2b] p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{data.fullName || 'Your Name'}</h3>
              <p className="mt-1 text-base font-medium text-[#0099cc]">{data.title || 'Professional Title'}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{[data.email, data.phone, data.location].filter(Boolean).join(' | ')}</p>

              <div className="mt-6 space-y-5">
                <div>
                  <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">Summary</h4>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{data.summary || 'Add a summary to preview it here.'}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">Skills</h4>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{data.skills || 'Add your skills to preview them here.'}</p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">Experience</h4>
                  <div className="space-y-3">
                    {data.experience.filter(item => item.role || item.company || item.highlights).map((item, index) => (
                      <div key={`preview-exp-${index}`}>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.role || 'Role'}</p>
                        <p className="text-sm text-[#0099cc]">{item.company || 'Company'}{item.period ? ` | ${item.period}` : ''}</p>
                        <p className="mt-1 whitespace-pre-line text-sm text-gray-600 dark:text-gray-300">{item.highlights}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">Education</h4>
                  <div className="space-y-3">
                    {data.education.filter(item => item.degree || item.institution).map((item, index) => (
                      <div key={`preview-edu-${index}`}>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.degree || 'Degree'}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.institution || 'Institution'}{item.year ? ` | ${item.year}` : ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
