'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge, Card } from '@/components/ui/Components'
import { createClient } from '@/lib/supabase'
import { Briefcase, Check, ChevronRight, Laptop, Users } from 'lucide-react'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons'
import { LogoMark } from '@/components/branding/Logo'

const ROLES = [
  { id: 'employer', icon: Briefcase, title: 'Employer', description: 'Post jobs and hire talent for your company.' },
  { id: 'seeker', icon: Users, title: 'Job Seeker', description: 'Find your next career opportunity in Bahrain.' },
  { id: 'freelancer', icon: Laptop, title: 'Freelancer', description: 'Offer your skills and win freelance projects.' },
]

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })

  useEffect(() => {
    if (searchParams.get('switch') === '1') {
      void supabase.auth.signOut({ scope: 'local' })
    }
  }, [searchParams, supabase])

  const handleRegister = async event => {
    event.preventDefault()
    setError('')
    if (!role) { setError('Choose the role you want to register as.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.full_name, role } },
      })
      if (authError) throw authError
      if (data.session?.user) {
        router.push(`/auth/role?role=${role}`)
      } else {
        router.push('/login?registered=1')
      }
      router.refresh()
    } catch (err) { setError(err.message || 'Could not create your account.') }
    finally { setLoading(false) }
  }

  const inputCls = 'flex h-9 w-full rounded-md px-3 py-2 bg-[#f3f3f5] border border-[rgba(0,207,253,0.1)] text-sm text-gray-900 outline-none transition-all duration-200 focus:border-[#00cffd] focus:ring-[3px] focus:ring-[#00cffd]/20 placeholder:text-[#717182]'

  return (
    <div className="page-wrapper flex min-h-screen items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_460px]">
        <div className="hidden rounded-[28px] bg-[linear-gradient(135deg,#0f172a_0%,#12344a_100%)] p-10 text-white lg:block">
          <Badge variant="cyan" dot={false} className="mb-6">Join ConnectHub</Badge>
          <h1 className="max-w-xl text-4xl font-bold leading-tight">
            Build the right account once and step into the right workflow from day one.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/75">
            Employers hire, job seekers discover opportunities, and freelancers manage projects, contracts, and escrow in one connected platform.
          </p>
          <div className="mt-10 grid gap-4">
            {[
              'Employer dashboards for hiring, job posts, and candidate tracking',
              'Job seeker tools for AI matching, applications, and profile growth',
              'Freelancer workflows for proposals, contracts, and payments',
            ].map(item => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/80">
                {item}
              </div>
            ))}
          </div>
        </div>

        <Card className="mx-auto w-full max-w-[460px]">
          <div className="mb-8 text-center">
            <LogoMark size={48} className="mx-auto mb-4" priority />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create your account</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Choose your role, then finish your ConnectHub account setup.
            </p>
          </div>

          <div className="mb-8 flex items-center justify-center gap-3">
            {[1, 2].map(number => {
              const active = step >= number
              return (
                <div key={number} className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${active ? 'bg-gradient-to-r from-[#00cffd] to-[#0099cc] text-white' : 'bg-gray-100 text-gray-400 dark:bg-[#102034] dark:text-gray-500'}`}>
                    {step > number ? <Check className="h-4 w-4" /> : number}
                  </div>
                  <span className={`text-sm font-medium ${active ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                    {number === 1 ? 'Choose role' : 'Create account'}
                  </span>
                  {number < 2 && <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600" />}
                </div>
              )
            })}
          </div>

          {/* Step 1 — Role */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">I want to…</h2>
              <p className="text-sm text-gray-400 mb-6">Choose your role on ConnectHub</p>
              <div className="flex flex-col gap-3">
                {ROLES.map(r => (
                  <button key={r.id} onClick={() => setRole(r.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${role === r.id ? 'border-[#00cffd] bg-[rgba(0,207,253,0.04)]' : 'border-[rgba(0,207,253,0.1)] hover:border-[rgba(0,207,253,0.3)]'}`}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: role === r.id ? 'linear-gradient(135deg, #00cffd, #0099cc)' : 'rgba(0,207,253,0.08)' }}>
                      <r.icon className={`h-5 w-5 ${role === r.id ? 'text-white' : 'text-[#00cffd]'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${role === r.id ? 'text-[#0099cc]' : 'text-gray-900'}`}>{r.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.description}</p>
                    </div>
                    {role === r.id && <Check className="h-4 w-4 text-[#00cffd] flex-shrink-0" />}
                  </button>
                ))}
              </div>
              <button disabled={!role} onClick={() => setStep(2)}
                className="mt-6 w-full h-10 rounded-lg text-sm font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #00cffd, #0099cc)' }}>
                Continue →
              </button>
            </div>
          )}

          {/* Step 2 — Account */}
          {step === 2 && (
            <div>
              <button onClick={() => setStep(1)} className="text-sm text-[#0099cc] font-medium mb-4 flex items-center gap-1 hover:underline">
                ← Back
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Create your account</h2>
              <p className="text-sm text-gray-400 mb-6">Registering as <span className="font-semibold text-[#0099cc] capitalize">{role}</span></p>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
              )}

              <div className="mb-5">
                <SocialAuthButtons mode="register" role={role} nextPath={`/dashboard/${role}`} onError={setError} />
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" required placeholder="Ahmed Al-Mansoori" value={form.full_name} onChange={e => set('full_name', e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" required placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <input type="password" required placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <input type="password" required placeholder="Repeat password" value={form.confirm} onChange={e => set('confirm', e.target.value)} className={inputCls} />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full h-10 rounded-lg text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 mt-2"
                  style={{ background: 'linear-gradient(135deg, #00cffd, #0099cc)' }}>
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
            </div>
          )}
        </Card>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-[#0099cc] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
