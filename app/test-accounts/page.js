'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Briefcase, Check, Copy, Lock, Shield, Sparkles, UserCog, Users } from 'lucide-react'
import { Badge, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import Logo from '@/components/branding/Logo'

const accounts = [
  {
    role: 'Admin',
    icon: UserCog,
    email: 'admin@connecthub.bh',
    password: 'Admin@2026!',
    path: '/dashboard/admin',
    features: ['Platform analytics', 'User management', 'Moderation tools', 'System overview'],
    focus: 'Governance and platform-wide visibility',
    journey: [
      'Open the admin overview to show platform counts and trends.',
      'Use disputes and notifications to show how admin closes issues quickly.',
    ],
    proofPoints: ['Open dispute ready for review', 'Platform notifications', 'Operational overview'],
  },
  {
    role: 'Employer',
    icon: Briefcase,
    email: 'hr@techmark.bh',
    password: 'TechMark2026!',
    path: '/dashboard/employer',
    features: ['Active jobs and freelance projects', 'Review applicants with fit scores and comparisons', 'Hiring pipeline and shortlist states', 'Chat with candidates and freelancers'],
    focus: 'Hiring pipeline and project-client activity',
    journey: [
      'Start on the employer dashboard to show active jobs and pipeline visibility.',
      'Open candidate review to highlight fit scoring and interview progression.',
    ],
    proofPoints: ['Active jobs', 'Shortlisted and interview candidates', 'Employer-to-candidate chat'],
  },
  {
    role: 'Job Seeker',
    icon: Users,
    email: 'yusuf@email.bh',
    password: 'Seeker2026!',
    path: '/dashboard/seeker',
    features: ['Saved jobs and live applications', 'Interview-stage application history', 'Smart job matches based on profile data', 'Message employer about interview flow'],
    focus: 'Personalized discovery and application progression',
    journey: [
      'Open the seeker dashboard to show saved jobs and interview activity.',
      'Use Smart Matches and applications to explain fit quality and progression.',
    ],
    proofPoints: ['Saved jobs', 'Interview-stage application', 'Fit-ranked opportunities'],
  },
  {
    role: 'Freelancer',
    icon: Sparkles,
    email: 'sara@designbh.com',
    password: 'Sara2026!',
    path: '/dashboard/freelancer',
    features: ['Open, pending, accepted, and rejected proposals', 'Active contract, escrow, and milestone story', 'Review history and earnings snapshot', 'Client conversation and project delivery flow'],
    focus: 'Proposal-to-delivery lifecycle',
    journey: [
      'Start with proposals to show pending, accepted, and rejected states.',
      'Open active work and earnings to explain milestones, escrow, and reviews.',
    ],
    proofPoints: ['Accepted proposal', 'Active contract and escrow', 'Completed review history'],
  },
]

const roadmap = [
  {
    step: 'Step 1',
    title: 'Employer Journey',
    account: 'hr@techmark.bh',
    path: '/dashboard/employer',
    outcomes: [
      'Show active roles and pipeline',
      'Highlight fit scores and interviews',
    ],
  },
  {
    step: 'Step 2',
    title: 'Job Seeker Journey',
    account: 'yusuf@email.bh',
    path: '/dashboard/seeker',
    outcomes: [
      'Show saved jobs and live applications',
      'Explain profile-based fit ranking',
    ],
  },
  {
    step: 'Step 3',
    title: 'Freelancer Journey',
    account: 'sara@designbh.com',
    path: '/dashboard/freelancer',
    outcomes: [
      'Show proposal states',
      'Open contract, escrow, and earnings',
    ],
  },
  {
    step: 'Step 4',
    title: 'Admin Journey',
    account: 'admin@connecthub.bh',
    path: '/dashboard/admin',
    outcomes: [
      'Review overview and notifications',
      'Inspect the open dispute story',
    ],
  },
]

function buildDemoLoginHref({ email, password, path, role }) {
  const params = new URLSearchParams({
    switch: '1',
    demo: '1',
    email,
    password,
    redirect: path,
    role,
  })

  return `/login?${params.toString()}`
}

function resetDemoGuideState(role) {
  if (typeof window === 'undefined') return

  const normalizedRole = String(role || '').toLowerCase()
  const allRoles = ['admin', 'employer', 'seeker', 'freelancer']

  window.sessionStorage.setItem('ch-demo-journey-active', '1')

  allRoles.forEach((roleKey) => {
    window.sessionStorage.removeItem(`ch-demo-guide:${roleKey}`)
    window.sessionStorage.removeItem(`ch-demo-guide-steps:${roleKey}`)
  })

  if (normalizedRole) {
    window.sessionStorage.removeItem(`ch-demo-guide:${normalizedRole}`)
    window.sessionStorage.removeItem(`ch-demo-guide-steps:${normalizedRole}`)
  }
}

function PublicHeader() {
  return (
    <header className="site-header">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-6">
          <Logo priority />

          <nav className="hidden items-center gap-6 lg:flex">
            <Link href="/jobs" className="site-nav-link">Jobs</Link>
            <Link href="/freelance" className="site-nav-link">Freelance</Link>
            <Link href="/pricing" className="site-nav-link">Pricing</Link>
            <Link href="/chat" className="site-nav-link">Chat</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="site-nav-link rounded-lg px-3 py-2 hover:bg-[#00cffd]/10">
              Login
            </Link>
            <Link href="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function TestAccountsPage() {
  const router = useRouter()
  const toast = useToast()
  const [copied, setCopied] = useState('')
  const demoGuideEnabled =
    process.env.NEXT_PUBLIC_ENABLE_DEMO_GUIDE === 'true' ||
    process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')

  const copyValue = async (value, label) => {
    await navigator.clipboard.writeText(value)
    setCopied(`${label}:${value}`)
    toast.success(`${label} copied to clipboard.`)
    setTimeout(() => setCopied(''), 1500)
  }

  const launchDemoJourney = (target) => {
    resetDemoGuideState(target.role)
    router.push(buildDemoLoginHref(target))
  }

  if (!demoGuideEnabled) {
    return (
      <div className="page-wrapper">
        <PublicHeader />
        <section className="section">
          <div className="container">
            <div className="mx-auto max-w-2xl">
              <div className="surface-card-strong p-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Demo Guide Disabled</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">This page is intentionally hidden unless demo mode is explicitly enabled.</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  To expose demo credentials and the presentation roadmap, set `NEXT_PUBLIC_ENABLE_DEMO_GUIDE=true` in the target environment.
                  This keeps the production site from publicly exposing test accounts by default.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <PublicHeader />

      <section className="section">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00cffd]/20 bg-white/80 px-4 py-2 text-sm font-medium text-[#0099cc] shadow-sm dark:bg-[#0e1a2b]/80">
              <Sparkles className="h-4 w-4" />
              Guided role-based demo mode
            </div>
            <h1 className="mb-4 font-display text-4xl font-bold md:text-5xl">
              <span className="text-gradient">Test Accounts</span>
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300">
              Use these demo credentials to move across admin, employer, seeker, and freelancer journeys while testing the platform. Each role below has its own guided storyline because each journey is different.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-5xl">
            <div className="surface-card-strong p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="icon-badge-soft">
                  <Users className="h-5 w-5 text-[#00cffd]" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Presentation Roadmap</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Follow this order to simulate a complete product journey from hiring to delivery and admin oversight.</p>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {roadmap.map(item => (
                  <div key={item.step} className="soft-panel p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <Badge variant="cyan" dot={false}>{item.step}</Badge>
                      <button
                        type="button"
                        onClick={() => launchDemoJourney({
                          role: item.title.replace(' Journey', ''),
                          email: item.account,
                          password: accounts.find(account => account.email === item.account)?.password || '',
                          path: item.path,
                        })}
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#0099cc] hover:underline"
                      >
                        Open
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.account}</p>
                    <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      {item.outcomes.map(outcome => (
                        <li key={outcome} className="flex items-start gap-2">
                          <Shield className="mt-0.5 h-4 w-4 text-[#00cffd]" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {accounts.map(account => (
              <div key={account.role} className="surface-card-strong p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="icon-badge-soft h-11 w-11 rounded-xl">
                      <account.icon className="h-5 w-5 text-[#00cffd]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{account.role}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{account.path}</p>
                    </div>
                  </div>
                  <Badge variant="cyan" dot={false}>{account.role}</Badge>
                </div>

                <div className="mb-4 rounded-xl border border-[#00cffd]/10 bg-white/70 p-4 dark:bg-[#102034]">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#0099cc]">Journey Focus</p>
                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-100">{account.focus}</p>
                </div>

                <div className="soft-panel space-y-3 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</p>
                      <p className="truncate font-mono text-sm text-gray-800 dark:text-gray-100">{account.email}</p>
                    </div>
                    <button onClick={() => copyValue(account.email, 'Email')} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white dark:hover:bg-[#0e1a2b]">
                      {copied === `Email:${account.email}` ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Password</p>
                      <p className="truncate font-mono text-sm text-gray-800 dark:text-gray-100">{account.password}</p>
                    </div>
                    <button onClick={() => copyValue(account.password, 'Password')} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white dark:hover:bg-[#0e1a2b]">
                      {copied === `Password:${account.password}` ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <ul className="my-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {account.features.map(feature => (
                    <li key={feature} className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#00cffd]" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="soft-panel mb-5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#0099cc]">Role-Specific Roadmap</p>
                  <ol className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {account.journey.map((step, index) => (
                      <li key={step} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#00cffd]/15 text-xs font-bold text-[#0099cc]">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mb-5 rounded-xl border border-[#00cffd]/10 p-4 dark:border-[#00cffd]/15">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Key Demo Proof Points</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {account.proofPoints.map(point => (
                      <Badge key={point} variant="blue" dot={false}>{point}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => launchDemoJourney(account)}>Use On Login Page</Button>
                  <Button onClick={() => launchDemoJourney(account)} variant="outline">Open Dashboard</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="surface-card p-6">
              <div className="mb-3 flex items-center gap-3">
                <div className="icon-badge-soft">
                  <Users className="h-5 w-5 text-[#00cffd]" />
                </div>
                <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">Suggested Test Flow</h2>
              </div>
              <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>1. Start as employer to establish the business side of the platform.</li>
                <li>2. Move to the seeker account to show matching and application progression.</li>
                <li>3. Switch to freelancer to show projects, contracts, and earnings.</li>
                <li>4. Finish in admin to show moderation, disputes, and platform visibility.</li>
              </ol>
            </div>

            <div className="surface-card p-6">
              <h2 className="mb-3 font-display text-xl font-bold text-gray-900 dark:text-white">Quick Links</h2>
              <div className="flex flex-wrap gap-3">
                <Link href="/login" className="btn-primary">Login</Link>
                <Link href="/jobs" className="btn-outline">Jobs</Link>
                <Link href="/freelance" className="btn-outline">Freelance</Link>
                <Link href="/chat" className="btn-outline">Chat</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
