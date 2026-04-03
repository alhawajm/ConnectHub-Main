'use client'

import { AlertTriangle } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function FreelancerDashboardError({ error, reset }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 dark:from-[#08111f] dark:via-[#0b1728] dark:to-[#102034]">
      <div className="w-full max-w-xl rounded-2xl border border-[#00cffd]/15 bg-white p-8 shadow-xl dark:bg-[#0e1a2b]">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-300">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Freelancer dashboard needs a quick reload</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
          We hit a rendering issue while opening the freelancer workspace. Your account and data are still intact.
        </p>
        {error?.message && (
          <div className="mt-5 rounded-xl border border-[#00cffd]/10 bg-[#00cffd]/5 px-4 py-3 text-sm text-gray-600 dark:bg-[#102034] dark:text-gray-300">
            {error.message}
          </div>
        )}
        <div className="mt-6 flex gap-3">
          <Button onClick={reset}>Reload Dashboard</Button>
          <Button href="/test-accounts" variant="outline">Back To Demo</Button>
        </div>
      </div>
    </div>
  )
}
