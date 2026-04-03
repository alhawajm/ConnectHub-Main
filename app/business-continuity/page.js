'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Shield, Users, Activity, TrendingUp, Clock, FileText, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Modal, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#00cffd] via-[#0099cc] to-[#007799] shadow-md"><span className="text-white font-bold text-xl">C</span></div>
            <span className="text-xl font-bold text-gradient">ConnectHub</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/jobs" className="site-nav-link">Jobs</Link>
            <Link href="/freelance" className="site-nav-link">Freelance</Link>
            <Link href="/pricing" className="site-nav-link">Pricing</Link>
            <Link href="/login" className="site-nav-link px-3 py-2 rounded-md">Login</Link>
            <Link href="/register" className="inline-flex h-9 items-center px-4 rounded-md text-sm font-medium text-white bg-gradient-to-r from-[#00cffd] to-[#0099cc] shadow-md transition-all">Sign Up</Link>
          </div>
        </div>
      </div>
    </header>
  )
}

const USE_CASES = [
  { icon: AlertTriangle, title: 'Unexpected Departures', desc: 'Keep critical teams covered when key employees leave suddenly.' },
  { icon: TrendingUp, title: 'Business Growth', desc: 'Build a proactive talent pipeline before expansion creates bottlenecks.' },
  { icon: Activity, title: 'Seasonal Demand', desc: 'Scale your workforce up and down without losing operational momentum.' },
  { icon: Shield, title: 'Crisis Response', desc: 'Prepare staffing contingency plans before a disruption becomes a business risk.' },
]

const SERVICES = [
  { icon: Shield, title: 'Talent Continuity Planning', desc: 'Identify critical roles, succession risk, and backup talent strategies.' },
  { icon: Users, title: 'Rapid Replacement Services', desc: 'Accelerate replacement hiring with pre-vetted shortlists and emergency response.' },
  { icon: FileText, title: 'Workforce Planning', desc: 'Map skills coverage, role dependencies, and hiring readiness across the business.' },
  { icon: Activity, title: 'Recovery Support', desc: 'Deploy temporary or flexible staffing support during recovery phases.' },
]

const PLANS = [
  { name: 'Essential Protection', price: '250', period: 'per month', features: ['Critical role coverage for up to 5 roles', 'Quarterly talent pipeline review', 'Priority candidate database access', '48-hour emergency response'] },
  { name: 'Business Shield', price: '500', period: 'per month', popular: true, features: ['Coverage for up to 15 critical roles', 'Monthly continuity review', 'Dedicated account manager', '24-hour emergency response', 'Workforce planning consultation'] },
  { name: 'Enterprise Continuity', price: 'Custom', period: 'tailored solution', features: ['Unlimited critical role coverage', 'Weekly monitoring', 'Dedicated continuity team', 'Custom SLA support', 'Crisis recruitment planning'] },
]

export default function BusinessContinuityPage() {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    companyName: '', contactPerson: '', email: '', phone: '', industry: '', serviceType: '', urgency: '', currentChallenges: '',
  })

  const submit = () => {
    if (!form.companyName || !form.contactPerson || !form.email || !form.currentChallenges) {
      toast.error('Please complete the required fields')
      return
    }
    toast.success('Business continuity request submitted')
    setOpen(false)
    setForm({ companyName: '', contactPerson: '', email: '', phone: '', industry: '', serviceType: '', urgency: '', currentChallenges: '' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <SiteHeader />
      <Modal open={open} onClose={() => setOpen(false)} title="Request Business Continuity Planning" size="lg">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Company Name" value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} />
            <Input label="Contact Person" value={form.contactPerson} onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Industry" value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} placeholder="Finance, Tech, Healthcare" />
            <Input label="Service Type" value={form.serviceType} onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))} placeholder="Rapid replacement, workforce planning" />
          </div>
          <Input label="Urgency" value={form.urgency} onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value }))} placeholder="Planning ahead, urgent, emergency" />
          <Input label="Current Challenges" as="textarea" rows={4} value={form.currentChallenges} onChange={(e) => setForm((f) => ({ ...f, currentChallenges: e.target.value }))} placeholder="Describe your staffing risk, continuity concerns, or operational challenge..." />
          <Button fullWidth onClick={submit}>Submit Request</Button>
        </div>
      </Modal>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#00cffd]/20 to-[#0099cc]/20 rounded-full flex items-center justify-center mb-6"><Shield className="h-10 w-10 text-[#00cffd]" /></div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4"><span className="bg-gradient-to-r from-[#00cffd] to-[#0099cc] bg-clip-text text-transparent">Business Continuity</span></h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Protect business operations with proactive talent continuity planning and emergency staffing support.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button onClick={() => setOpen(true)}>Get Protected Today</Button>
            <Link href="/pricing" className="inline-flex h-10 items-center px-6 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 border-2 border-[#00cffd]/20 hover:border-[#00cffd] hover:bg-[#00cffd]/5 transition-all">View Pricing</Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {USE_CASES.map((item) => (
            <div key={item.title} className="surface-card p-6 transition-all hover:border-[#00cffd]/30 hover:shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00cffd]/20 to-[#0099cc]/20 rounded-full flex items-center justify-center mb-4"><item.icon className="h-6 w-6 text-[#00cffd]" /></div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {SERVICES.map((service) => (
            <div key={service.title} className="surface-card p-6 transition-all hover:border-[#00cffd]/30 hover:shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-[#00cffd] to-[#0099cc] rounded-lg flex items-center justify-center mb-4"><service.icon className="h-6 w-6 text-white" /></div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{service.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`relative rounded-xl border-2 p-6 shadow-sm ${plan.popular ? 'surface-card border-[#00cffd] shadow-xl scale-105' : 'surface-card hover:border-[#00cffd]/30'}`}>
              {plan.popular && <div className="absolute -top-4 left-0 right-0 flex justify-center"><span className="bg-gradient-to-r from-[#00cffd] to-[#0099cc] text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">Recommended</span></div>}
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}{plan.price !== 'Custom' && <span className="text-base text-gray-600 dark:text-gray-400 ml-2">BHD</span>}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">{plan.period}</p>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start text-sm text-gray-700 dark:text-gray-300"><CheckCircle2 className="h-5 w-5 text-[#00cffd] mr-3 flex-shrink-0 mt-0.5" />{feature}</li>
                ))}
              </ul>
              <Button fullWidth onClick={() => setOpen(true)}>Get Started</Button>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-[#00cffd] to-[#0099cc] rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Protect Your Business Today</h2>
          <p className="text-lg mb-8 text-white/80">Build a resilient talent strategy before disruption becomes a business risk.</p>
          <button onClick={() => setOpen(true)} className="inline-flex h-11 items-center px-8 rounded-md text-base font-medium bg-white text-[#0099cc] hover:bg-white/90 shadow-lg transition-all font-semibold">Start Your Continuity Plan</button>
        </div>
      </div>
    </div>
  )
}
