'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.4-.2-2H12Z" />
      <path fill="#34A853" d="M12 21c2.6 0 4.8-.9 6.4-2.5l-3.1-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.6-1.7-5.4-4l-3.2 2.5C5 18.8 8.2 21 12 21Z" />
      <path fill="#4A90E2" d="M6.6 13c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2L3.4 6.5C2.5 8 2 9.4 2 11s.5 3 1.4 4.5L6.6 13Z" />
      <path fill="#FBBC05" d="M12 5c1.4 0 2.7.5 3.7 1.4l2.8-2.8C16.8 2 14.6 1 12 1 8.2 1 5 3.2 3.4 6.5L6.6 9c.8-2.3 2.9-4 5.4-4Z" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
      <path d="M15.1 3.2c.8-1 1.3-2.3 1.1-3.2-1.2.1-2.5.8-3.3 1.8-.7.9-1.3 2.2-1.1 3.4 1.3.1 2.5-.6 3.3-2ZM19.1 17.7c-.5 1.1-.8 1.6-1.5 2.7-.9 1.4-2.2 3.1-3.8 3.1-1.4 0-1.8-.9-3.7-.9-1.9 0-2.4.9-3.8 1-1.6 0-2.8-1.5-3.7-2.9-2.5-3.7-2.8-8-1.2-10.4 1.1-1.7 2.9-2.7 4.6-2.7 1.8 0 2.9 1 4.4 1 1.4 0 2.3-1 4.4-1 .6 0 2.7.2 4 2.1-3.5 1.9-2.9 6.9.3 8Z" />
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <rect x="3" y="3" width="8" height="8" fill="#F25022" />
      <rect x="13" y="3" width="8" height="8" fill="#7FBA00" />
      <rect x="3" y="13" width="8" height="8" fill="#00A4EF" />
      <rect x="13" y="13" width="8" height="8" fill="#FFB900" />
    </svg>
  )
}

const PROVIDERS = [
  {
    id: 'google',
    label: 'Google',
    Icon: GoogleIcon,
    iconClassName: 'bg-white text-[#202124] border border-gray-200',
    queryParams: { access_type: 'offline', prompt: 'consent' },
  },
  {
    id: 'apple',
    label: 'Apple',
    Icon: AppleIcon,
    iconClassName: 'bg-[#111827] text-white',
  },
  {
    id: 'azure',
    label: 'Microsoft',
    Icon: MicrosoftIcon,
    iconClassName: 'bg-white text-[#2563eb] border border-gray-200',
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
          const Icon = provider.Icon
          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => handleOAuth(provider)}
              disabled={!!loadingProvider}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-[#00cffd]/10 bg-white text-sm font-semibold text-gray-800 transition-all hover:border-[#00cffd]/30 hover:bg-[#00cffd]/5 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#0e1a2b] dark:text-gray-100 dark:hover:bg-[#102034]"
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full ${provider.iconClassName}`}>
                <Icon />
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
