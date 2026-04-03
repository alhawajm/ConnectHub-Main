import Link from 'next/link'
import { ArrowRight, Briefcase, CheckCircle2, Star } from 'lucide-react'
import {
  audienceCards,
  demoGuideEnabled,
  homeFeatures,
  homePlans,
  homeServices,
  homeTestimonials,
} from './homeData'

export function HeroSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00cffd]/20 bg-white/80 px-4 py-2 text-sm font-medium text-[#0099cc] shadow-sm dark:bg-[#0e1a2b]/80">
              <span className="h-2 w-2 rounded-full bg-[#00cffd]" />
              Bahrain&apos;s career, hiring, and freelance ecosystem
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-gray-900 dark:text-white md:text-6xl">
              Connect Talent, Hiring, and Freelance Growth in <span className="text-gradient">One Platform</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              ConnectHub brings together job search, employer hiring, freelance discovery, chat, portfolio tools, and advisory services in a unified experience designed for Bahrain.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary-lg">
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="btn-outline h-10 px-6 text-base">
                View Pricing
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ['10,000+', 'Active users'],
                ['5,000+', 'Jobs and projects'],
                ['4.9/5', 'Average satisfaction'],
              ].map(([value, label]) => (
                <div key={label} className="surface-card p-4">
                  <p className="font-display text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="surface-card-strong p-6">
              <div className="mb-5 flex items-center gap-4">
                <div className="icon-badge">
                  <Briefcase />
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-gray-900 dark:text-white">Employer Hiring Hub</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Post jobs, review candidates, and track funnel health.</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="soft-panel p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active posts</p>
                  <p className="mt-1 font-display text-3xl font-bold text-gray-900 dark:text-white">5</p>
                </div>
                <div className="soft-panel p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Candidates reviewed</p>
                  <p className="mt-1 font-display text-3xl font-bold text-gray-900 dark:text-white">24</p>
                </div>
              </div>
            </div>

            <div className="surface-card p-6">
              <p className="font-display text-lg font-bold text-gray-900 dark:text-white">Built Around Real Platform Needs</p>
              <div className="mt-4 space-y-3">
                {[
                  'Dashboard-first navigation for every role',
                  'Portfolio and CV workflows for candidates',
                  'Freelance listings, proposals, and messaging',
                  'Service pages for guidance, counselling, and continuity',
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#00cffd]" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function FeaturesSection() {
  return (
    <section id="features" className="section bg-white/70 dark:bg-[#0b1728]/40">
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0099cc]">Features</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Everything your network needs to <span className="text-gradient">work together</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            The baseline product, older implementation, and handoff docs all point to one thing: ConnectHub works best when core tools live in one consistent experience.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {homeFeatures.map(({ icon: Icon, title, description }) => (
            <div key={title} className="surface-card p-6 transition-all hover:-translate-y-0.5 hover:border-[#00cffd]/30 hover:shadow-lg">
              <div className="icon-badge-soft">
                <Icon />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function AudienceSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="grid gap-6 lg:grid-cols-2">
          {audienceCards.map(card => (
            <div key={card.title} className="surface-card-strong p-8">
              <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white">{card.title}</h2>
              <div className="mt-6 space-y-4">
                {card.points.map(point => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#00cffd]" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">{point}</p>
                  </div>
                ))}
              </div>
              <Link href={card.href} className="btn-outline mt-8 h-10 px-6">
                {card.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ServicesSection() {
  return (
    <section id="services" className="section bg-white/70 dark:bg-[#0b1728]/40">
      <div className="container">
        <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0099cc]">Services</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
              Advisory tools beyond the marketplace
            </h2>
          </div>
          <p className="max-w-xl text-gray-600 dark:text-gray-300">
            The project docs consistently position ConnectHub as more than a listing site, so these service paths stay visible from the homepage.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {homeServices.map(({ icon: Icon, title, description, href }) => (
            <div key={title} className="surface-card p-6">
              <div className="icon-badge">
                <Icon />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{description}</p>
              <Link href={href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0099cc] hover:text-[#00cffd]">
                Learn more
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PricingSection() {
  return (
    <section id="pricing" className="section">
      <div className="container">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0099cc]">Pricing</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Clear plans with <span className="text-gradient">documented pricing</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Employer subscriptions follow your documented business plan: Silver 18 BHD, Gold 23 BHD, and Platinum 28 BHD, while job seekers and freelancers stay free.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {homePlans.map((plan, index) => (
            <div key={plan.name} className={`surface-card p-6 ${index === 1 ? 'border-[#00cffd] shadow-xl' : ''}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                {index === 1 && (
                  <span className="rounded-full bg-gradient-to-r from-[#00cffd] to-[#0099cc] px-3 py-1 text-xs font-semibold text-white">
                    Popular
                  </span>
                )}
              </div>
              <p className="mt-4 font-display text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</p>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{plan.description}</p>
              <Link href="/pricing" className="btn-outline mt-6 h-10 px-6">
                See full plan
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TestimonialsSection() {
  return (
    <section className="section bg-white/70 dark:bg-[#0b1728]/40">
      <div className="container">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0099cc]">Testimonials</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Built for people actually using the platform
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {homeTestimonials.map(item => (
            <div key={item.name} className="surface-card p-6">
              <div className="mb-4 flex gap-1 text-[#00cffd]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-6 border-t border-[#00cffd]/10 pt-4">
                <p className="font-display text-lg font-bold text-gray-900 dark:text-white">{item.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ContactSection() {
  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="rounded-[28px] bg-gradient-to-r from-[#00cffd] to-[#0099cc] p-8 text-white shadow-2xl md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-bold md:text-5xl">Ready to build the full ConnectHub experience?</h2>
              <p className="mt-4 max-w-2xl text-lg text-white/85">
                Start with job search, explore freelance opportunities, or open the dashboards and services that support your users best.
              </p>
              <div className="mt-6 flex flex-wrap gap-5 text-sm text-white/90">
                <span>Contact Us</span>
                <span>support@connecthub.bh</span>
                <span>Manama, Bahrain</span>
              </div>
              {demoGuideEnabled && (
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Production Path</p>
                    <p className="mt-2 font-display text-xl font-bold">Standard product experience</p>
                    <p className="mt-2 text-sm text-white/85">
                      Best for real users who want the regular jobs, freelance, hiring, and services journey.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/25 bg-[#0b1728]/20 p-4 backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Demo Path</p>
                    <p className="mt-2 font-display text-xl font-bold">Guided walkthrough mode</p>
                    <p className="mt-2 text-sm text-white/85">
                      Best for presentations with short role-based journeys for employer, seeker, freelancer, and admin.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3 lg:flex-col">
              <Link href="/register" className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-base font-semibold text-[#0099cc] shadow-lg transition-all hover:bg-white/90">
                Create Account
              </Link>
              {demoGuideEnabled && (
                <Link href="/test-accounts" className="inline-flex h-11 items-center justify-center rounded-lg border border-white/40 px-6 text-base font-semibold text-white transition-all hover:bg-white/10">
                  Open Demo
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
