'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'

const PROVIDERS = [
  {
    id: 'google',
    label: 'Google',
    badge: 'G',
    badgeClass: 'bg-white text-[#ea4335] border border-gray-200',
    queryParams: { access_type: 'offline', prompt: 'consent' },
  },
  {
    id: 'github',
    label: 'GitHub',
    badge: 'GH',
    badgeClass: 'bg-[#111827] text-white',
  },
  {
    id: 'azure',
    label: 'Microsoft',
    badge: 'M',
    badgeClass: 'bg-[#2563eb] text-white',
  },
]

export default function SocialAuthButtons({
  mode = 'login',
  role = '',
  nextPath = '',
  onError,
}) {
  const supabase = useMemo(() => createClient(), [])
  const [loadingProvider, setLoadingProvider] = useState('')

  const handleOAuth = async provider => {
    setLoadingProvider(provider.id)

    try {
      const redirectUrl = new URL('/auth/callback', window.location.origin)
      if (role) redirectUrl.searchParams.set('role', role)
      if (nextPath) redirectUrl.searchParams.set('next', nextPath)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider.id,
        options: {
          redirectTo: redirectUrl.toString(),
          queryParams: provider.queryParams,
        },
      })

      if (error) throw error
    } catch (error) {
      setLoadingProvider('')
      onError?.(error.message || `Could not continue with ${provider.label}.`)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3">
        {PROVIDERS.map(provider => {
          const isLoading = loadingProvider === provider.id
          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => handleOAuth(provider)}
              disabled={!!loadingProvider}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-[#00cffd]/10 bg-white text-sm font-semibold text-gray-800 transition-all hover:border-[#00cffd]/30 hover:bg-[#00cffd]/5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#0e1a2b] dark:text-gray-100 dark:hover:bg-[#102034]"
            >
              <span className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[11px] font-bold ${provider.badgeClass}`}>
                {provider.badge}
              </span>
              <span>
                {isLoading ? 'Redirecting...' : `Continue with ${provider.label}`}
              </span>
            </button>
          )
        })}
      </div>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#00cffd]/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:bg-[#0e1a2b] dark:text-gray-500">
            {mode === 'register' ? 'or sign up with email' : 'or continue with email'}
          </span>
        </div>
      </div>
    </div>
  )
}
