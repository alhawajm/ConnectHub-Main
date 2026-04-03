'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import MessagesPanel from '@/components/dashboard/MessagesPanel'
import { Spinner } from '@/components/ui/Components'
import Logo from '@/components/branding/Logo'

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Logo wordmarkClassName="text-xl font-bold text-gradient" />
          <Link href="/dashboard/seeker" className="inline-flex h-9 items-center px-4 rounded-md text-sm font-medium text-white bg-gradient-to-r from-[#00cffd] to-[#0099cc]">Dashboard</Link>
        </div>
      </div>
    </header>
  )
}

export default function ChatPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setUser(session.user)
      setProfile(profileData)
      setLoading(false)
    }

    loadSession()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <SiteHeader />
        <div className="flex justify-center py-20"><Spinner /></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <SiteHeader />
        <div className="container mx-auto px-4 py-16">
          <div className="surface-card-strong max-w-xl mx-auto p-10 text-center">
            <MessageCircle className="h-12 w-12 text-[#00cffd]/40 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Messages unavailable</h1>
            <p className="text-gray-500 dark:text-gray-400">We couldn&apos;t load your profile information for chat right now.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Messages</h1>
          <p className="text-gray-600 dark:text-gray-300">Chat with employers, clients, and freelancers in real time.</p>
        </div>
        <MessagesPanel currentUserId={profile.id} currentUserName={profile.full_name || user?.email} />
      </div>
    </div>
  )
}
