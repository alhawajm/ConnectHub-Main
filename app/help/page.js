import Link from 'next/link'
import InfoPageLayout from '@/components/marketing/InfoPageLayout'

function Card({ title, description, href, cta }) {
  return (
    <div className="surface-card p-6">
      <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{description}</p>
      <Link href={href} className="btn-outline mt-6 h-10 px-6">
        {cta}
      </Link>
    </div>
  )
}

export default function HelpPage() {
  return (
    <InfoPageLayout
      eyebrow="Support"
      title="Help Center"
      intro="Use these quick paths when maintaining, testing, or using ConnectHub. This page keeps support entry points visible without taking users away from the main product journey."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Account Access" description="Get help with login, social sign-in, role assignment, switching accounts, or dashboard access." href="/login" cta="Open Login" />
        <Card title="Pricing and Billing" description="Review employer subscriptions, one-time services, payment confirmations, and receipt expectations." href="/pricing" cta="View Pricing" />
        <Card title="Demo and Testing" description="Use guided demo accounts for employer, seeker, freelancer, and admin walkthroughs." href="/test-accounts" cta="Open Demo" />
        <Card title="Contact Support" description="Reach the ConnectHub team for project questions, onboarding support, or issue escalation." href="/contact" cta="Contact Us" />
      </div>
    </InfoPageLayout>
  )
}
