import Link from 'next/link'
import { Check } from 'lucide-react'

const PLANS = [
  {
    name: 'Silver',
    price: '18',
    description: 'Perfect for getting started',
    features: [
      'Limited CV Database Access',
      'Limited Freelancer Portfolio Access',
      'Apply to 10 jobs/month',
      'Submit 5 proposals/month',
      'Portfolio builder',
      'Standard support',
    ],
  },
  {
    name: 'Gold',
    price: '23',
    popular: true,
    description: 'Most popular for professionals',
    features: [
      'Large Pool of CV Database',
      'Unrestricted Freelancer Portfolio Access',
      'Complete Job Application Analytics',
      'Apply to 30 jobs/month',
      'Submit 15 proposals/month',
      'AI-powered recommendations',
      'Portfolio & CV builder',
      'Featured in search results',
      'Priority support',
    ],
  },
  {
    name: 'Platinum',
    price: '28',
    description: 'Ultimate package for power users',
    features: [
      'Unrestricted Database Access',
      'AI-Recommended Candidates',
      'Job Matching (Skills, Experience, Location)',
      'Recruitment Counselling Sessions',
      'Complete Job Application Analytics',
      'Unlimited job applications',
      'Unlimited proposals',
      'Full AI suite access',
      'Portfolio & CV builder',
      'Top search placement',
      'Verified badge',
      '24/7 premium support',
    ],
  },
]

const SERVICES = [
  {
    title: 'Job Posting',
    badge: 'For Employers',
    badgeClass: 'from-[#00cffd] to-[#0099cc]',
    cards: [
      { name: 'Single Job Post', desc: 'One listing for 30 days', price: '2 BHD', emphasis: false },
      { name: 'Bulk Job Post', desc: '10 listings - Best Value!', price: '15 BHD', emphasis: true },
    ],
  },
  {
    title: 'Professional Portfolio Creation',
    badge: 'Popular',
    badgeClass: 'from-pink-500 to-purple-600',
    cards: [
      { name: 'Portfolio Package', desc: 'Custom design, up to 10 projects, PDF export', price: '5 BHD', emphasis: true },
    ],
  },
]

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-8">
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#00cffd] via-[#0099cc] to-[#007799] shadow-md">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-bold text-gradient">ConnectHub</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            {[['/', 'Home'], ['/jobs', 'Jobs'], ['/freelance', 'Freelance'], ['/pricing', 'Pricing']].map(([href, label]) => (
              <Link key={href} href={href} className="site-nav-link">{label}</Link>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="site-nav-link px-3 py-2 rounded-md hover:bg-[#00cffd]/10">Login</Link>
            <Link href="/register" className="inline-flex h-9 items-center px-4 rounded-md text-sm font-medium text-white bg-gradient-to-r from-[#00cffd] to-[#0099cc] hover:from-[#00b8e6] hover:to-[#007799] shadow-md transition-all">Sign Up</Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <SiteHeader />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#00cffd] to-[#0099cc] bg-clip-text text-transparent">Choose Your Plan</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Find the perfect plan for your career or business needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`relative rounded-xl flex flex-col gap-6 transition-all hover:shadow-2xl ${plan.popular ? 'surface-card border-2 border-[#00cffd] shadow-xl scale-105' : 'surface-card border-2 hover:border-[#00cffd]/30'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-gradient-to-r from-[#00cffd] to-[#0099cc] text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">Most Popular</span>
                </div>
              )}
              <div className="px-6 pt-6 text-center pb-2">
                <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-[#717182] dark:text-gray-400 text-sm">{plan.description}</p>
                <div className="mt-4"><span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span><span className="text-gray-600 dark:text-gray-400 ml-2">BHD/month</span></div>
              </div>
              <div className="px-6 pb-6">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-[#00cffd] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`flex w-full h-10 items-center justify-center rounded-md text-sm font-medium text-white shadow-md transition-all ${plan.popular ? 'bg-gradient-to-r from-[#00cffd] to-[#0099cc] hover:from-[#00b8e6] hover:to-[#007799]' : 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-gray-950'}`}>Get Started</Link>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-[#00cffd] to-[#0099cc] bg-clip-text text-transparent">Additional Services</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {SERVICES.map((service) => (
              <div key={service.title} className="surface-card p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{service.title}</h3>
                  <span className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white ${service.badgeClass}`}>{service.badge}</span>
                </div>
                <div className="space-y-4">
                  {service.cards.map((card) => (
                    <div key={card.name} className={`rounded-xl border p-4 ${card.emphasis ? 'bg-gradient-to-r from-[#00cffd]/5 to-[#0099cc]/5 border-[#00cffd]/20 dark:from-[#00cffd]/10 dark:to-[#0099cc]/10' : 'bg-gray-50 border-gray-200 dark:bg-gray-900/70 dark:border-gray-800'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{card.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{card.desc}</p>
                          {card.name === 'Portfolio Package' && (
                            <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                              <li className="flex items-center"><Check className="h-4 w-4 text-purple-600 mr-2" />Custom design</li>
                              <li className="flex items-center"><Check className="h-4 w-4 text-purple-600 mr-2" />Up to 10 projects</li>
                              <li className="flex items-center"><Check className="h-4 w-4 text-purple-600 mr-2" />PDF export</li>
                            </ul>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-[#00cffd] whitespace-nowrap">{card.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">All plans include secure payment processing and core ConnectHub features.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Prices are in Bahraini Dinar (BHD). Cancel anytime.</p>
        </div>
      </div>
    </div>
  )
}
