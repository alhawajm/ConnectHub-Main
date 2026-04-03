import InfoPageLayout from '@/components/marketing/InfoPageLayout'

export default function ContactPage() {
  return (
    <InfoPageLayout
      eyebrow="Contact"
      title="Contact ConnectHub"
      intro="Whether you are hiring, applying, freelancing, or evaluating the platform for a demo, the ConnectHub team should stay easy to reach."
    >
      <section className="surface-card-strong p-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="soft-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0099cc]">Email</p>
            <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">support@connecthub.bh</p>
          </div>
          <div className="soft-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0099cc]">Location</p>
            <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">Manama, Bahrain</p>
          </div>
          <div className="soft-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0099cc]">Availability</p>
            <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">Business Hours Support</p>
          </div>
        </div>
      </section>

      <section className="surface-card p-8">
        <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Suggested Reasons to Reach Out</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[
            'Employer onboarding and subscription help',
            'Job seeker profile and application support',
            'Freelance contract, escrow, or dispute questions',
            'Demo walkthrough or product presentation requests',
          ].map((item) => (
            <div key={item} className="soft-panel p-4 text-sm text-gray-600 dark:text-gray-300">
              {item}
            </div>
          ))}
        </div>
      </section>
    </InfoPageLayout>
  )
}
