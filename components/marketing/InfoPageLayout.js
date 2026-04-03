import PublicHeader from '@/components/marketing/PublicHeader'
import PublicFooter from '@/components/marketing/PublicFooter'

export default function InfoPageLayout({ eyebrow, title, intro, children }) {
  return (
    <div className="page-wrapper">
      <PublicHeader />
      <main className="section">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="surface-card-strong p-8 md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0099cc]">{eyebrow}</p>
              <h1 className="mt-4 font-display text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">{title}</h1>
              <p className="mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300">{intro}</p>
            </div>

            <div className="mt-8 space-y-6">
              {children}
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
