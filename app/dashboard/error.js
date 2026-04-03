'use client'

import Button from '@/components/ui/Button'

export default function DashboardError({ error, reset }) {
  return (
    <div className="dashboard-layout flex min-h-screen items-center justify-center px-4">
      <div className="surface-card-strong w-full max-w-lg p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0099cc]">Dashboard Error</p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">Your workspace needs a refresh</h1>
        <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
          We hit an issue while loading your dashboard data. Retrying usually restores the session immediately.
        </p>
        {error?.message && (
          <div className="soft-panel mt-5 p-4 text-left text-sm text-gray-600 dark:text-gray-300">
            {error.message}
          </div>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset}>Reload Dashboard</Button>
          <Button href="/login?switch=1" variant="outline">Switch Account</Button>
        </div>
      </div>
    </div>
  )
}
