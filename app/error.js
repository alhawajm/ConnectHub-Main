'use client'

import Button from '@/components/ui/Button'

export default function GlobalError({ error, reset }) {
  return (
    <div className="page-wrapper flex min-h-screen items-center justify-center px-4">
      <div className="surface-card-strong w-full max-w-lg p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0099cc]">Application Error</p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">Something went wrong</h1>
        <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
          The page could not be completed. You can retry the last action or return to the homepage.
        </p>
        {error?.message && (
          <div className="soft-panel mt-5 p-4 text-left text-sm text-gray-600 dark:text-gray-300">
            {error.message}
          </div>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset}>Try Again</Button>
          <Button href="/" variant="outline">Back To Home</Button>
        </div>
      </div>
    </div>
  )
}
