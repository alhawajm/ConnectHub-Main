import InfoPageLayout from '@/components/marketing/InfoPageLayout'

function Section({ title, children }) {
  return (
    <section className="surface-card p-6 md:p-8">
      <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <InfoPageLayout
      eyebrow="Privacy"
      title="Privacy Policy"
      intro="ConnectHub is designed to handle hiring, freelance, and profile data responsibly. This summary explains what information we collect, why we use it, and how we protect it."
    >
      <Section title="Information We Collect">
        <p>We collect account details, profile information, job and project activity, portfolio content, application records, messaging data, and payment-related metadata needed to operate the platform.</p>
        <p>We also collect operational data such as notifications, support requests, and analytics events that help improve platform reliability and usability.</p>
      </Section>
      <Section title="How We Use Information">
        <p>We use your information to provide account access, role-based dashboards, job and project workflows, messaging, billing, dispute handling, and smart comparison or drafting support.</p>
        <p>ConnectHub&apos;s smart systems are designed to support decision-making, not replace human judgment in hiring or contracting outcomes.</p>
      </Section>
      <Section title="Data Protection">
        <p>We use role-aware authorization, secure session handling, row-level security in the database, and access controls to limit who can view or change protected information.</p>
        <p>Payment processing is handled through configured payment providers. ConnectHub stores transaction context and receipts, not raw card numbers.</p>
      </Section>
      <Section title="Contact">
        <p>If you need help with privacy-related questions, contact ConnectHub at <strong>support@connecthub.bh</strong>.</p>
      </Section>
    </InfoPageLayout>
  )
}
