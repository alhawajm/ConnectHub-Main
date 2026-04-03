'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import MessagesPanel from '@/components/dashboard/MessagesPanel'
import ProfileEditor from '@/components/dashboard/ProfileEditor'
import PortfolioBuilder from '@/components/dashboard/PortfolioBuilder'
import { SettingsPage, BillingPage } from '@/components/dashboard/SettingsBilling'
import { EmptyPlaceholder } from '@/components/dashboard/SharedComponents'
import { Spinner, useToast } from '@/components/ui/Components'
import Button from '@/components/ui/Button'
import { SEEKER_DASHBOARD_NAV, SEEKER_PAGE_TITLES } from '@/components/dashboard/seeker/constants'
import {
  buildSeekerRecommendations,
  SeekerApplicationsPage,
  SeekerGuidancePage,
  SeekerMatchesPage,
  SeekerOverviewPage,
  SeekerSavedJobsPage,
  SeekerSearchPage,
} from '@/components/dashboard/seeker/views'
import { Search } from 'lucide-react'

export default function SeekerDashboard() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const toast = useToast()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [seekerProfile, setSeekerProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [savedJobs, setSavedJobs] = useState([])
  const [jobs, setJobs] = useState([])
  const [activePage, setActivePage] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const loadDashboardData = useCallback(async sessionUser => {
    if (!sessionUser?.id) return

    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch('/api/seeker-data', {
      cache: 'no-store',
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : undefined,
    })
    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.error || 'Could not load seeker dashboard.')
    }

    setLoadError('')
    setProfile(payload.data?.profile || null)
    setSeekerProfile(payload.data?.seekerProfile || null)
    setApplications(payload.data?.applications || [])
    setSavedJobs(payload.data?.savedJobs || [])
    setJobs(payload.data?.jobs || [])
  }, [supabase])

  useEffect(() => {
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }

      setUser(session.user)
      try {
        await loadDashboardData(session.user)
      } catch (error) {
        setLoadError(error.message || 'Could not load seeker dashboard.')
      } finally {
        setLoading(false)
      }
    })()
  }, [loadDashboardData, router, supabase])

  const recommendations = useMemo(
    () => buildSeekerRecommendations({ applications, jobs, profile, savedJobs, seekerProfile }),
    [applications, jobs, profile, savedJobs, seekerProfile]
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(to bottom right,#eff6ff,#fff,#ecfeff)' }}>
        <Spinner />
      </div>
    )
  }

  if (loadError) {
    return (
      <DashboardLayout
        user={user}
        profile={profile}
        navItems={SEEKER_DASHBOARD_NAV}
        activePage={activePage}
        onNavigate={setActivePage}
        pageTitle="Job Seeker Dashboard"
        topbarRight={<Button size="sm" onClick={async () => {
          try {
            await loadDashboardData(user)
          } catch (error) {
            toast.error(error.message || 'Could not reload dashboard.')
          }
        }}><Search className="h-4 w-4" /> Retry</Button>}
      >
        <EmptyPlaceholder
          icon={Search}
          title="Could not load seeker workspace"
          description={loadError}
          action={<Button size="sm" onClick={async () => {
            try {
              await loadDashboardData(user)
            } catch (error) {
              toast.error(error.message || 'Could not reload dashboard.')
            }
          }}>Reload Dashboard</Button>}
        />
      </DashboardLayout>
    )
  }

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <SeekerOverviewPage profile={profile} applications={applications} savedJobs={savedJobs} matchCount={recommendations.length} onNavigate={setActivePage} />
      case 'search':
        return <SeekerSearchPage onApplied={() => loadDashboardData(user)} />
      case 'guidance':
        return <SeekerGuidancePage profile={profile} />
      case 'profile':
        return <ProfileEditor profile={profile} roleProfile={seekerProfile} onSaved={() => loadDashboardData(user)} />
      case 'portfolio':
        return <PortfolioBuilder profile={profile} />
      case 'messages':
        return <MessagesPanel currentUserId={profile?.id} currentUserName={profile?.full_name} />
      case 'settings':
        return <SettingsPage profile={{ ...profile, email: user?.email }} />
      case 'billing':
        return <BillingPage profile={profile} />
      case 'apps':
        return <SeekerApplicationsPage applications={applications} onNavigate={setActivePage} />
      case 'saved':
        return <SeekerSavedJobsPage savedJobs={savedJobs} onNavigate={setActivePage} />
      case 'matches':
        return <SeekerMatchesPage recommendations={recommendations} onNavigate={setActivePage} />
      default:
        return null
    }
  }

  return (
    <DashboardLayout
      user={user}
      profile={profile}
      navItems={SEEKER_DASHBOARD_NAV}
      activePage={activePage}
      onNavigate={setActivePage}
      pageTitle={SEEKER_PAGE_TITLES[activePage]}
      topbarRight={<Button size="sm" onClick={() => setActivePage('search')}><Search className="h-4 w-4" /> Find Jobs</Button>}
    >
      {renderPage()}
    </DashboardLayout>
  )
}
