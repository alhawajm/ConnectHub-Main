'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, Shield, UserCog, Users } from 'lucide-react'
import { Badge, Card, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'

const accounts = [
  {
    role: 'Admin',
    email: 'admin@connecthub.bh',
    password: 'Admin@2026!',
    path: '/dashboard/admin',
    color: 'from-red-500 to-rose-600',
    features: ['Platform analytics', 'User management', 'Moderation tools', 'System overview'],
  },
  {
    role: 'Employer',
    email: 'hr@techmark.bh',
    password: 'TechMark2026!',
    path: '/dashboard/employer',
    color: 'from-blue-500 to-cyan-600',
    features: ['Post jobs', 'Review applicants', 'Manage hiring pipeline', 'Chat with candidates'],
  },
  {
    role: 'Job Seeker',
    email: 'yusuf@email.bh',
    password: 'Seeker2026!',
    path: '/dashboard/seeker',
    color: 'from-green-500 to-emerald-600',
    features: ['Browse jobs', 'Track applications', 'Build CV and profile', 'Message employers'],
  },
  {
    role: 'Freelancer',
    email: 'sara@designbh.com',
    password: 'Sara2026!',
    path: '/dashboard/freelancer',
    color: 'from-violet-500 to-purple-600',
    features: ['Browse projects', 'Send proposals', 'Track earnings', 'Manage portfolio'],
  },
]

export default function TestAccountsPage() {
  const toast = useToast()
  const [copied, setCopied] = useState('')

  const copyValue = async (value, label) => {
    await navigator.clipboard.writeText(value)
    setCopied(`${label}:${value}`)
    toast.success(`${label} copied to clipboard.`)
    setTimeout(() => setCopied(''), 1500)
  }

  return (
    <div className="page-wrapper">
      <section className="container py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#00cffd]/20 to-[#0099cc]/20">
            <UserCog className="h-10 w-10 text-[#00cffd]" />
          </div>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            <span className="text-gradient">Test Accounts</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Use these demo credentials to move across admin, employer, seeker, and freelancer journeys while testing the platform.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {accounts.map(account => (
            <Card key={account.role}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r text-sm font-bold text-white ${account.color}`}>
                    {account.role.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{account.role}</h2>
                    <p className="text-sm text-gray-500">{account.path}</p>
                  </div>
                </div>
                <Badge variant="cyan" dot={false}>{account.role}</Badge>
              </div>

              <div className="space-y-3 rounded-xl border border-[#00cffd]/10 bg-[#00cffd]/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</p>
                    <p className="truncate font-mono text-sm text-gray-800">{account.email}</p>
                  </div>
                  <button onClick={() => copyValue(account.email, 'Email')} className="rounded-lg p-2 text-gray-500 hover:bg-white">
                    {copied === `Email:${account.email}` ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Password</p>
                    <p className="truncate font-mono text-sm text-gray-800">{account.password}</p>
                  </div>
                  <button onClick={() => copyValue(account.password, 'Password')} className="rounded-lg p-2 text-gray-500 hover:bg-white">
                    {copied === `Password:${account.password}` ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <ul className="my-5 space-y-2 text-sm text-gray-600">
                {account.features.map(feature => (
                  <li key={feature} className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#00cffd]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                <Button href="/login">Use On Login Page</Button>
                <Button href={account.path} variant="outline">Open Dashboard</Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card>
            <div className="mb-3 flex items-center gap-3">
              <Users className="h-6 w-6 text-[#00cffd]" />
              <h2 className="text-xl font-semibold text-gray-900">Suggested Test Flow</h2>
            </div>
            <ol className="space-y-2 text-sm text-gray-600">
              <li>1. Log in as employer and review posted jobs or projects.</li>
              <li>2. Switch to seeker or freelancer and validate application or proposal flows.</li>
              <li>3. Use admin to confirm moderation, analytics, and user visibility.</li>
            </ol>
          </Card>

          <Card>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">Quick Links</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="btn-primary">Login</Link>
              <Link href="/jobs" className="btn-outline">Jobs</Link>
              <Link href="/freelance" className="btn-outline">Freelance</Link>
              <Link href="/chat" className="btn-outline">Chat</Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}