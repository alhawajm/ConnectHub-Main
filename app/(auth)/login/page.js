'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Badge, Card } from '@/components/ui/Components'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const demoAccounts = [
  { role: 'Employer', email: 'hr@techmark.bh', password: 'TechMark2026!' },
  { role: 'Job Seeker', email: 'yusuf@email.bh', password: 'Seeker2026!' },
  { role: 'Freelancer', email: 'sara@designbh.com', password: 'Sara2026!' },
  { role: 'Admin', email: 'admin@connecthub.bh', password: 'Admin@2026!' },
]

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      router.push(profile?.role ? `/dashboard/${profile.role}` : '/auth/role')
      router.refresh()
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-wrapper flex min-h-screen items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_420px]">
        <div className="hidden rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#12344a_100%)] p-10 text-white lg:block">
          <Badge variant="cyan" dot={false} className="mb-6">ConnectHub Access</Badge>
          <h1 className="max-w-xl text-4xl font-bold leading-tight">
            Bahrain&apos;s professional network for jobs, freelance work, and hiring.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/75">
            Sign in to continue with your dashboard, applications, proposals, chats, and AI-powered profile tools.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { value: '10K+', label: 'Active users' },
              { value: '5K+', label: 'Jobs posted' },
              { value: '4.9/5', label: 'Platform rating' },
            ].map(item => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold text-[#00cffd]">{item.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-white/60">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="mx-auto w-full max-w-[420px]">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#00cffd] to-[#0099cc] text-xl font-bold text-white">
              C
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-500">Sign in to your ConnectHub account.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-5">
            <SocialAuthButtons mode="login" onError={setError} />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 text-gray-400" />
              <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 text-gray-400" />
              <Input label="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="pl-10 pr-10" required />
              <button type="button" onClick={() => setShowPassword(current => !current)} className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button type="submit" fullWidth loading={loading}>Sign In</Button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Don&apos;t have an account? <Link href="/register" className="font-semibold text-[#0099cc]">Create one</Link>
          </p>

          <div className="mt-8 border-t border-[#00cffd]/10 pt-6">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Demo Accounts</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {demoAccounts.map(account => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => {
                    setEmail(account.email)
                    setPassword(account.password)
                  }}
                  className="rounded-xl border border-[#00cffd]/10 bg-[#00cffd]/5 px-3 py-3 text-left transition-colors hover:border-[#00cffd]/30 hover:bg-white"
                >
                  <p className="text-sm font-semibold text-gray-900">{account.role}</p>
                  <p className="mt-1 truncate text-xs text-gray-500">{account.email}</p>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
