import Link from 'next/link'
import { Briefcase, Check, Sparkles, Users } from 'lucide-react'
import Logo from '@/components/branding/Logo'

const EMPLOYER_PLANS = [
  {
    name: 'Silver',
    price: '18',
    description: 'For smaller hiring teams starting to publish roles consistently.',
    features: [
      'Up to 5 active job posts',
      'Candidate pipeline visibility',
      'Limited CV and freelancer profile access',
      'Email alerts and core dashboard tools',
    ],
  },
  {
    name: 'Gold',
    price: '23',
    popular: true,
    description: 'For growing employers that want stronger hiring efficiency.',
    features: [
      'Unlimited job posts',
      'Full CV database access',
      'Application analytics and shortlist tools',
      'Candidate comparison support',
    ],
  },
  {
    name: 'Platinum',
    price: '28',
    description: 'For employers that want the full ConnectHub hiring stack.',
    features: [
      'Everything in Gold',
      'Smart recommendations and job-fit support',
      'Recruitment counselling access',
      'Priority support and advanced hiring visibility',
    ],
  },
]

const FREE_ACCESS = [
  {
    title: 'Job Seekers',
    icon: Users,
    badge: 'Always Free',
    description: 'Apply, build your profile, use smart matches, and manage your career journey without a subscription.',
    points: [
      'Job search and applications',
      'Smart matches and saved jobs',
      'CV builder, portfolio tools, and messaging',
    ],
  },
  {
    title: 'Freelancers',
    icon: Sparkles,
    badge: 'Always Free',
    description: 'Browse projects, send proposals, and manage contracts, escrow, and reviews without monthly billing.',
    points: [
      'Project browsing and proposals',
      'Escrow, contracts, and disputes',
      'Portfolio, reviews, and profile growth',
    ],
  },
]

const SERVICES = [
  {
    title: 'Employer Add-Ons',
    badge: 'For Employers',
    badgeClass: 'from-[#00cffd] to-[#0099cc]',
    cards: [
      { name: 'Single Job Post', desc: 'One listing for 30 days', price: '2 BHD', emphasis: false },
      { name: 'Bulk Job Posts', desc: '10 listings at a discounted rate', price: '15 BHD', emphasis: true },
    ],
  },
  {
    title: 'Portfolio Package',
    badge: 'Optional',
    badgeClass: 'from-pink-500 to-purple-600',
    cards: [
      { name: 'Professional Portfolio Creation', desc: 'Custom portfolio page with polished presentation support', price: '5 BHD', emphasis: true },
    ],
  },
]

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-8">
          <Logo wordmarkClassName="text-gradient text-xl font-bold" />
          <nav className="hidden items-center space-x-6 md:flex">
            {[['/', 'Home'], ['/jobs', 'Jobs'], ['/freelance', 'Freelance'], ['/pricing', 'Pricing']].map(([href, label]) => (
              <Link key={href} href={href} className="site-nav-link">{label}</Link>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="site-nav-link rounded-md px-3 py-2 hover:bg-[#00cffd]/10">Login</Link>
            <Link href="/register" className="inline-flex h-9 items-center rounded-md bg-gradient-to-r from-[#00cffd] to-[#0099cc] px-4 text-sm font-medium text-white shadow-md transition-all hover:from-[#00b8e6] hover:to-[#007799]">Sign Up</Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-[#08111f] dark:via-[#0b1728] dark:to-[#102034]">
      <SiteHeader />
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            <span className="bg-gradient-to-r from-[#00cffd] to-[#0099cc] bg-clip-text text-transparent">Employer plans, free talent access</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Employers subscribe for hiring tools. Job seekers and freelancers stay free so the platform remains accessible to talent.
          </p>
        </div>

        <div className="mb-8 max-w-6xl mx-auto rounded-2xl border border-[#00cffd]/15 bg-white/80 p-6 shadow-sm dark:bg-[#0e1a2b]/90">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00cffd]/10 text-[#0099cc]">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0099cc]">Employer Subscriptions</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">Built for hiring teams</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Silver, Gold, and Platinum are reserved for employers who need job posting, candidate visibility, hiring analytics, and AI-assisted hiring workflows.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16 grid max-w-6xl gap-8 mx-auto md:grid-cols-3">
          {EMPLOYER_PLANS.map((plan) => (
            <div key={plan.name} className={`relative flex flex-col gap-6 rounded-xl border-2 transition-all hover:shadow-2xl ${plan.popular ? 'surface-card border-[#00cffd] shadow-xl scale-105' : 'surface-card hover:border-[#00cffd]/30'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="rounded-full bg-gradient-to-r from-[#00cffd] to-[#0099cc] px-4 py-1 text-sm font-semibold text-white shadow-lg">Most Popular</span>
                </div>
              )}
              <div className="px-6 pb-2 pt-6 text-center">
                <h3 className="mb-2 text-2xl font-medium text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="text-sm text-[#717182] dark:text-gray-400">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">BHD/month</span>
                </div>
              </div>
              <div className="px-6 pb-6">
                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-[#00cffd]" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`flex h-10 w-full items-center justify-center rounded-md text-sm font-medium text-white shadow-md transition-all ${plan.popular ? 'bg-gradient-to-r from-[#00cffd] to-[#0099cc] hover:from-[#00b8e6] hover:to-[#007799]' : 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950'}`}>
                  Start as Employer
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-16 grid max-w-6xl gap-6 mx-auto md:grid-cols-2">
          {FREE_ACCESS.map(({ title, icon: Icon, badge, description, points }) => (
            <div key={title} className="surface-card p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Core platform access</p>
                  </div>
                </div>
                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">{badge}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
              <ul className="mt-5 space-y-3">
                {points.map((point) => (
                  <li key={point} className="flex items-start">
                    <Check className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-6xl">
          <h2 className="mb-8 text-center text-3xl font-bold">
            <span className="bg-gradient-to-r from-[#00cffd] to-[#0099cc] bg-clip-text text-transparent">Additional Services</span>
          </h2>

          <div className="mb-8 grid gap-6 md:grid-cols-2">
            {SERVICES.map((service) => (
              <div key={service.title} className="surface-card p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{service.title}</h3>
                  <span className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white ${service.badgeClass}`}>{service.badge}</span>
                </div>
                <div className="space-y-4">
                  {service.cards.map((card) => (
                    <div key={card.name} className={`rounded-xl border p-4 ${card.emphasis ? 'border-[#00cffd]/20 bg-gradient-to-r from-[#00cffd]/5 to-[#0099cc]/5 dark:from-[#00cffd]/10 dark:to-[#0099cc]/10' : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/70'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{card.name}</p>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{card.desc}</p>
                        </div>
                        <p className="whitespace-nowrap text-2xl font-bold text-[#00cffd]">{card.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="mb-4 text-gray-600 dark:text-gray-300">Employer subscriptions support hiring operations. Talent-facing access remains free by design.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Prices are in Bahraini Dinar (BHD). One-time services remain optional.</p>
        </div>
      </div>
    </div>
  )
}
