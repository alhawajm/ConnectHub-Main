'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FolderOpen, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import PortfolioBuilder from '@/components/dashboard/PortfolioBuilder'
import { Spinner } from '@/components/ui/Components'

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#00cffd] via-[#0099cc] to-[#007799] shadow-md">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-bold text-gradient">ConnectHub</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/cv-builder" className="site-nav-link">CV Builder</Link>
            <Link href="/dashboard/seeker" className="btn-outline">Dashboard</Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function PortfolioBuilderPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user?.id

      if (!userId) {
        router.push('/login')
        return
      }

      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      setProfile(data || null)
      setLoading(false)
    }

    load()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="page-wrapper">
        <SiteHeader />
        <div className="container py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <SiteHeader />
      <section className="container py-16">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-[#00cffd]" />
              <h1 className="text-4xl font-bold">
                <span className="text-gradient">Portfolio Builder</span>
              </h1>
            </div>
            <p className="max-w-3xl text-lg text-gray-600 dark:text-gray-300">
              Build a public-facing portfolio, generate an AI bio, and keep your work ready for employers and freelance clients.
            </p>
          </div>
          <div className="soft-panel flex items-center gap-3 px-4 py-3">
            <div className="icon-badge-soft">
              <FolderOpen />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Public profile ready</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Your portfolio updates can be shared through your ConnectHub profile link.</p>
            </div>
          </div>
        </div>

        {profile ? <PortfolioBuilder profile={profile} /> : null}
      </section>
    </div>
  )
}
