'use client'

import { useState } from 'react'
import { Award, Calendar, CheckCircle2, Clock, Target, TrendingUp, Users } from 'lucide-react'
import { Badge, Card, Modal, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const services = [
  {
    icon: Target,
    title: 'Strategic Hiring Planning',
    description: 'Align your hiring roadmap with business goals, timelines, and team structure.',
    features: ['Workforce planning', 'Role design', 'Hiring roadmap', 'Talent pipeline support'],
  },
  {
    icon: Users,
    title: 'Candidate Sourcing',
    description: 'Improve candidate quality with sharper targeting and better-fit shortlists.',
    features: ['Targeted sourcing', 'Passive outreach', 'Skills matching', 'Culture fit guidance'],
  },
  {
    icon: TrendingUp,
    title: 'Market Insights',
    description: 'Use live market signals to benchmark salaries and adjust your hiring strategy.',
    features: ['Salary benchmarking', 'Demand trends', 'Talent availability', 'Competitive insights'],
  },
  {
    icon: CheckCircle2,
    title: 'Selection Optimization',
    description: 'Refine interview design, evaluation criteria, and offer decisions.',
    features: ['Interview design', 'Assessments', 'Decision frameworks', 'Offer strategy'],
  },
]

const packages = [
  {
    name: 'Single Session',
    price: 'Free',
    detail: '1 hour',
    badge: 'Platinum',
    features: ['One consultation', 'Hiring review', 'Market guidance', 'Action plan'],
  },
  {
    name: 'Monthly Partnership',
    price: '150 BHD',
    detail: '4 sessions per month',
    popular: true,
    features: ['Dedicated support', 'Talent reports', 'Priority matching', 'Process optimization'],
  },
  {
    name: 'Enterprise Solution',
    price: 'Custom',
    detail: 'Ongoing',
    features: ['Embedded recruitment support', 'Employer branding help', 'Workshops', 'Analytics reviews'],
  },
]

const benefits = [
  { icon: Clock, title: 'Save Time', description: 'Reduce time-to-hire with clearer structure and stronger shortlisting.' },
  { icon: Target, title: 'Improve Match Quality', description: 'Hire people who better fit the role, team, and growth plan.' },
  { icon: TrendingUp, title: 'Reduce Cost', description: 'Avoid wasted cycles and expensive mis-hires with better process design.' },
  { icon: Award, title: 'Expert Support', description: 'Work with specialists who understand Bahrain hiring dynamics.' },
]

export default function RecruitmentCounsellingPage() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    industry: '',
    companySize: '',
    hiringNeeds: '',
    challenges: '',
    preferredDate: '',
    preferredTime: '',
  })

  const setField = (key, value) => setForm(current => ({ ...current, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success('Recruitment counselling request submitted successfully.')
    setOpen(false)
    setForm({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      industry: '',
      companySize: '',
      hiringNeeds: '',
      challenges: '',
      preferredDate: '',
      preferredTime: '',
    })
  }

  return (
    <div className="page-wrapper">
      <section className="container py-16">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="blue" className="mb-4" dot={false}>B2B Service</Badge>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            <span className="text-gradient">Recruitment Counselling</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Strategic support for Bahrain businesses hiring faster, smarter, and with better long-term fit.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" onClick={() => setOpen(true)}>
              <Calendar className="h-5 w-5" />
              Schedule Consultation
            </Button>
            <Button href="/pricing" variant="outline" size="lg">
              View Packages
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
            <span className="text-gradient">Counselling Packages</span>
          </h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {packages.map(item => (
              <Card key={item.name} className={item.popular ? 'scale-[1.02] border-[#00cffd]/40 shadow-xl' : ''}>
                {item.badge && <Badge variant="purple" className="mb-4" dot={false}>{item.badge}</Badge>}
                {item.popular && <Badge variant="primary" className="mb-4" dot={false}>Most Popular</Badge>}
                <h3 className="text-2xl font-bold text-gray-900">{item.name}</h3>
                <p className="mt-2 text-3xl font-bold text-[#0099cc]">{item.price}</p>
                <p className="mt-1 text-sm text-gray-500">{item.detail}</p>
                <ul className="my-6 space-y-3 text-sm text-gray-600">
                  {item.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#00cffd]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button fullWidth onClick={() => setOpen(true)} variant={item.popular ? 'default' : 'outline'}>
                  Get Started
                </Button>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold">
            <span className="text-gradient">Why Businesses Use It</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map(item => {
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
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Book Recruitment Counselling" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Company Name" value={form.companyName} onChange={e => setField('companyName', e.target.value)} required />
            <Input label="Contact Person" value={form.contactPerson} onChange={e => setField('contactPerson', e.target.value)} required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Email" type="email" value={form.email} onChange={e => setField('email', e.target.value)} required />
            <Input label="Phone" value={form.phone} onChange={e => setField('phone', e.target.value)} required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Industry" value={form.industry} onChange={e => setField('industry', e.target.value)} placeholder="Technology, banking, healthcare" required />
            <Input label="Company Size" value={form.companySize} onChange={e => setField('companySize', e.target.value)} placeholder="1-10, 11-50, 51-200" required />
          </div>
          <Input label="Current Hiring Needs" as="textarea" rows={3} value={form.hiringNeeds} onChange={e => setField('hiringNeeds', e.target.value)} required />
          <Input label="Recruitment Challenges" as="textarea" rows={3} value={form.challenges} onChange={e => setField('challenges', e.target.value)} />
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