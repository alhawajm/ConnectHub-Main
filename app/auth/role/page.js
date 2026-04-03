'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Briefcase, Check, ChevronLeft, Laptop, ShieldCheck, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Badge, Card } from '@/components/ui/Components'
import Button from '@/components/ui/Button'

const ROLE_OPTIONS = [
  {
    id: 'employer',
    icon: Briefcase,
    title: 'Employer',
    description: 'Post jobs, review applicants, and manage your hiring pipeline.',
  },
  {
    id: 'seeker',
    icon: Users,
    title: 'Job Seeker',
    description: 'Get AI job matches, track applications, and grow your career profile.',
  },
  {
    id: 'freelancer',
    icon: Laptop,
    title: 'Freelancer',
    description: 'Browse projects, send proposals, and manage contracts in one place.',
  },
  {
    id: 'admin',
    icon: ShieldCheck,
    title: 'Admin',
    description: 'Oversee moderation, disputes, analytics, and platform operations.',
  },
]

export default function AuthRolePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])
  const requestedRole = searchParams.get('role') || ''
  const nextPath = searchParams.get('next') || ''

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedRole, setSelectedRole] = useState(requestedRole)
  const [existingRole, setExistingRole] = useState('')
  const [error, setError] = useState('')

  const visibleRoles = useMemo(() => {
    if (requestedRole === 'admin' || existingRole === 'admin') return ROLE_OPTIONS
    return ROLE_OPTIONS.filter(role => role.id !== 'admin')
  }, [existingRole, requestedRole])

  useEffect(() => {
    let active = true

    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!active) return

      const profileRole = profile?.role || ''
      setExistingRole(profileRole)
      setSelectedRole(requestedRole || profileRole || 'seeker')
      setLoading(false)
    }

    loadUser()
    return () => {
      active = false
    }
  }, [requestedRole, router, supabase])

  const handleContinue = async () => {
    if (!selectedRole) {
      setError('Choose the role you want to continue with.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'Could not finish setting up your account.')
      }

      const destination = nextPath && !nextPath.startsWith('/dashboard/')
        ? nextPath
        : `/dashboard/${selectedRole}`
      router.push(destination)
      router.refresh()
    } catch (err) {
      setError(err.message || 'Could not finish setting up your account.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-wrapper flex min-h-screen items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_460px]">
        <div className="hidden rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#12344a_100%)] p-10 text-white lg:block">
          <Badge variant="cyan" dot={false} className="mb-6">Complete Your Access</Badge>
          <h1 className="max-w-xl text-4xl font-bold leading-tight">
            Choose the ConnectHub experience that matches how you want to use the platform.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/75">
            This keeps social sign-in and email onboarding in sync, and makes sure your dashboard, tools, and recommendations are assigned correctly from the start.
          </p>
          <div className="mt-10 grid gap-4">
            {[
              'Employer: hiring, candidate review, and analytics',
              'Job Seeker: AI matching, saved jobs, and applications',
              'Freelancer: projects, proposals, contracts, and escrow',
            ].map(item => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/80">
                {item}
              </div>
            ))}
          </div>
        </div>

        <Card className="mx-auto w-full max-w-[460px]">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#00cffd] to-[#0099cc] text-xl font-bold text-white">
              C
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Pick your role</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {existingRole
                ? 'Your social account is connected. Confirm or change your role to continue.'
                : 'One final step before we open your dashboard.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {visibleRoles.map(role => {
              const Icon = role.icon
              const isSelected = selectedRole === role.id
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-[#00cffd] bg-[#00cffd]/5 shadow-sm'
                      : 'border-[#00cffd]/10 bg-white hover:border-[#00cffd]/30 hover:bg-[#00cffd]/5 dark:bg-[#0e1a2b]'
                  }`}
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${isSelected ? 'bg-gradient-to-r from-[#00cffd] to-[#0099cc] text-white' : 'bg-[#00cffd]/10 text-[#0099cc]'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{role.title}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{role.description}</p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-[#00cffd]" />}
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button type="button" fullWidth onClick={handleContinue} loading={saving}>
              Continue to {selectedRole ? visibleRoles.find(item => item.id === selectedRole)?.title : 'dashboard'}
            </Button>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#0099cc] hover:underline">
              <ChevronLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
