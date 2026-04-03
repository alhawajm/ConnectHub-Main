import Button from '@/components/ui/Button'

export default function TestPage() {
  return (
    <div className="page-wrapper min-h-screen px-4 py-12">
      <div className="container max-w-3xl">
        <div className="surface-card-strong p-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-[#0099cc]">System Check</p>
          <h1 className="mb-4 font-display text-4xl font-bold text-gray-900 dark:text-white">
            UI Test Page
          </h1>
          <p className="mb-6 text-sm leading-7 text-gray-500 dark:text-gray-400">
            This route exists only to confirm that the shared ConnectHub theme, cards, gradients, buttons, and typography are rendering correctly.
          </p>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {['Brand Gradient', 'Surface Card', 'Typography'].map(item => (
              <div key={item} className="soft-panel rounded-xl p-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                {item}
              </div>
            ))}
          </div>

          <div className="mb-6 rounded-xl border border-[#00cffd]/15 bg-white p-5 shadow-sm dark:bg-[#0e1a2b]">
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              If this page looks aligned with the rest of ConnectHub, the shared public theme and core UI primitives are loading correctly.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/">Back to Home</Button>
              <Button href="/login" variant="outline">Open Login</Button>
            </div>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-left dark:border-red-900/40 dark:bg-red-950/30">
            <p className="font-semibold text-red-700 dark:text-red-300">If styles look broken, check:</p>
            <ul className="mt-2 space-y-1 text-sm text-red-600 dark:text-red-200">
              <li>1. The page background should use the same soft blue-white gradient as the rest of the site.</li>
              <li>2. The heading should use the display font.</li>
              <li>3. Buttons should use the cyan ConnectHub system.</li>
              <li>4. Cards should have cyan-tinted borders, not default browser styling.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
