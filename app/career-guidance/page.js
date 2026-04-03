'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Briefcase, Calendar, GraduationCap, Lightbulb, Target, TrendingUp, Users } from 'lucide-react'
import { Card, Modal, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const services = [
  {
    icon: GraduationCap,
    title: 'Career Planning',
    description: 'Build a practical roadmap around your strengths, goals, and Bahrain market demand.',
    features: ['Skills assessment', 'Career path planning', 'Goal setting', 'Industry insights'],
  },
  {
    icon: BookOpen,
    title: 'Resume And Interview Prep',
    description: 'Sharpen your CV, interview responses, and overall professional positioning.',
    features: ['CV review', 'Mock interviews', 'Storytelling guidance', 'Confidence coaching'],
  },
  {
    icon: TrendingUp,
    title: 'Skill Development',
    description: 'Identify gaps and get focused recommendations for upskilling and certifications.',
    features: ['Gap analysis', 'Course suggestions', 'Certification guidance', 'Learning plan'],
  },
  {
    icon: Target,
    title: 'Market Insights',
    description: 'Understand salary ranges, hiring trends, and where your profile fits best.',
    features: ['Salary benchmarks', 'Demand signals', 'Growth sectors', 'Opportunity mapping'],
  },
]

const audiences = [
  { icon: GraduationCap, title: 'Students And Graduates', description: 'Launch with a clear plan and stronger applications.' },
  { icon: Users, title: 'Career Switchers', description: 'Navigate transitions with structure and confidence.' },
  { icon: Briefcase, title: 'Mid-Career Professionals', description: 'Move toward leadership, specialization, or better-fit roles.' },
  { icon: Lightbulb, title: 'Active Job Seekers', description: 'Improve targeting, positioning, and interview readiness.' },
]

const workshops = [
  { title: 'University Career Workshops', duration: '2 to 3 hours', audience: 'Students', description: 'Interactive sessions on career planning and employer readiness.' },
  { title: 'Career Fair Readiness', duration: 'Half day', audience: 'Graduates', description: 'Practical guidance before networking and employer meetings.' },
  { title: 'Industry Skills Bootcamp', duration: '1 week', audience: 'All levels', description: 'Focused sessions on in-demand workplace and technical skills.' },
]

export default function CareerGuidancePage() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    stage: '',
    goals: '',
    preferredDate: '',
    preferredTime: '',
  })

  const setField = (key, value) => setForm(current => ({ ...current, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success('Career guidance request submitted successfully.')
    setOpen(false)
    setForm({
      name: '',
      email: '',
      phone: '',
      stage: '',
      goals: '',
      preferredDate: '',
      preferredTime: '',
    })
  }

  return (
    <div className="page-wrapper">
      <section className="container py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#00cffd]/20 to-[#0099cc]/20">
            <GraduationCap className="h-10 w-10 text-[#00cffd]" />
          </div>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            <span className="text-gradient">Career Guidance And Counselling</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Expert career support for students, graduates, and professionals navigating Bahrain&apos;s evolving job market.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={() => setOpen(true)}>
              <Calendar className="h-5 w-5" />
              Book A Session
            </Button>
            <Button href="/pricing" variant="outline" size="lg">
              View Pricing
            </Button>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map(service => {
            const Icon = service.icon
            return (
              <Card key={service.title} className="h-full">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#00cffd] to-[#0099cc]">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h2 className="mb-2 text-lg font-semibold text-gray-900">{service.title}</h2>
                <p className="mb-4 text-sm leading-relaxed text-gray-600">{service.description}</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  {service.features.map(feature => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00cffd]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            )
          })}
        </div>

        <div className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold">
            <span className="text-gradient">Who Can Benefit</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {audiences.map(item => {
              const Icon = item.icon
              return (
                <Card key={item.title} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#00cffd] to-[#0099cc]">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold">
            <span className="text-gradient">Workshops And Events</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {workshops.map(workshop => (
              <Card key={workshop.title}>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{workshop.title}</h3>
                <p className="mb-4 text-sm text-gray-600">{workshop.description}</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>Duration: <span className="font-medium text-gray-700">{workshop.duration}</span></p>
                  <p>Audience: <span className="font-medium text-gray-700">{workshop.audience}</span></p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="mt-16 border-none bg-gradient-to-r from-[#00cffd] to-[#0099cc] text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">Ready To Move Forward</h2>
          <p className="mx-auto mb-8 max-w-2xl text-white/85">
            Book a guidance session and get a focused plan for your next career step.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" variant="secondary" onClick={() => setOpen(true)}>
              Schedule Consultation
            </Button>
            <Link href="/jobs" className="text-sm font-semibold text-white underline-offset-4 hover:underline">
              Browse opportunities
            </Link>
          </div>
        </Card>
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Book Career Guidance Session" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Full Name" value={form.name} onChange={e => setField('name', e.target.value)} required />
            <Input label="Email" type="email" value={form.email} onChange={e => setField('email', e.target.value)} required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Phone" value={form.phone} onChange={e => setField('phone', e.target.value)} required />
            <Input label="Career Stage" value={form.stage} onChange={e => setField('stage', e.target.value)} placeholder="Student, graduate, mid-career" required />
          </div>
          <Input label="Career Goals" as="textarea" rows={4} value={form.goals} onChange={e => setField('goals', e.target.value)} placeholder="Tell us what you want to achieve and any current blockers." required />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Preferred Date" type="date" value={form.preferredDate} onChange={e => setField('preferredDate', e.target.value)} required />
            <Input label="Preferred Time" value={form.preferredTime} onChange={e => setField('preferredTime', e.target.value)} placeholder="Morning, afternoon, evening" required />
          </div>
          <Button type="submit" fullWidth>
            Submit Request
          </Button>
        </form>
      </Modal>
    </div>
  )
}