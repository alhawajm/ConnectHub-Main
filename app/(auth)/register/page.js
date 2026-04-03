'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Briefcase, Users, Laptop, ChevronRight, Check } from 'lucide-react'

const ROLES = [
  { id: 'employer',   icon: Briefcase, title: 'Employer',    description: 'Post jobs and hire talent for your company' },
  { id: 'seeker',     icon: Users,     title: 'Job Seeker',  description: 'Find your next career opportunity in Bahrain' },
  { id: 'freelancer', icon: Laptop,    title: 'Freelancer',  description: 'Offer your skills and win freelance projects' },
]

export default function RegisterPage() {
  const router   = useRouter()
  const supabase = createClient()
  const [step,     setStep]     = useState(1)
  const [role,     setRole]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleRegister = async e => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8)       { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email: form.email, password: form.password,
        options: { data: { full_name: form.full_name, role } },
      })
      if (err) throw err
      if (data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, full_name: form.full_name, role, email: form.email })
        router.push(`/dashboard/${role}`)
      }
    } catch (e) { setError(e.message) }
    finally     { setLoading(false) }
  }

  const inputCls = "flex h-9 w-full rounded-md px-3 py-2 bg-[#f3f3f5] border border-[rgba(0,207,253,0.1)] text-sm text-gray-900 outline-none transition-all duration-200 focus:border-[#00cffd] focus:ring-[3px] focus:ring-[#00cffd]/20 placeholder:text-[#717182]"

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, #eff6ff, #ffffff, #ecfeff)' }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg" style={{ background: 'linear-gradient(135deg, #00cffd, #0099cc)' }}>C</div>
          <span className="text-2xl font-bold text-gray-900">Connect<span style={{ color: '#00cffd' }}>Hub</span></span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {[1, 2].map(n => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${step >= n ? 'text-white' : 'bg-gray-100 text-gray-400'}`}
                style={step >= n ? { background: 'linear-gradient(135deg, #00cffd, #0099cc)' } : {}}>
                {step > n ? <Check className="h-3.5 w-3.5" /> : n}
              </div>
              <span className={`text-sm font-medium ${step >= n ? 'text-gray-900' : 'text-gray-400'}`}>
                {n === 1 ? 'Choose role' : 'Create account'}
              </span>
              {n < 2 && <ChevronRight className="h-4 w-4 text-gray-300" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[rgba(0,207,253,0.1)] shadow-lg p-8">

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
        </div>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account?{' '}
          <a href="/login" className="text-[#0099cc] font-semibold hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  )
}
