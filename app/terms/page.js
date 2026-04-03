import InfoPageLayout from '@/components/marketing/InfoPageLayout'

function Section({ title, children }) {
  return (
    <section className="surface-card p-6 md:p-8">
      <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <InfoPageLayout
      eyebrow="Legal"
      title="Terms of Service"
      intro="These terms describe the expectations for using ConnectHub as a job seeker, freelancer, employer, or platform administrator."
    >
      <Section title="Accounts and Roles">
        <p>Users are responsible for choosing the correct role, keeping account credentials secure, and providing accurate profile, portfolio, and payment information.</p>
        <p>Employers may purchase subscription plans. Job seekers and freelancers use the core platform for free, subject to the platform rules and acceptable use standards.</p>
      </Section>
      <Section title="Platform Conduct">
        <p>Users must not post fraudulent jobs, misleading projects, abusive content, spam, or discriminatory hiring material. ConnectHub may moderate content and suspend accounts that violate platform standards.</p>
      </Section>
      <Section title="Payments and Escrow">
        <p>Payments, receipts, subscriptions, and escrow workflows depend on configured providers and platform rules. Escrow can be held, released, refunded, or disputed according to the active contract workflow.</p>
      </Section>
      <Section title="Service Availability">
        <p>ConnectHub aims to provide a reliable experience, but features may evolve over time. Smart drafting, ranking, and comparison systems are assistive tools and do not make final hiring or contracting decisions.</p>
      </Section>
    </InfoPageLayout>
  )
}
