'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { cn, getRolePlanMeta, ROLE_LABELS } from '@/lib/utils'
import { ToastContainer } from '@/components/ui/Components'
import { useNotifications } from '@/hooks/useUser'
import Logo from '@/components/branding/Logo'
import Button from '@/components/ui/Button'
import {
  Bell, Moon, Sun, LogOut, Menu, X,
  Settings, CreditCard, LayoutGrid, CheckCircle, User, Sparkles, ArrowRight,
} from 'lucide-react'

const DEMO_ACCOUNT_EMAILS = new Set([
  'admin@connecthub.bh',
  'hr@techmark.bh',
  'yusuf@email.bh',
  'sara@designbh.com',
])

const DEMO_GUIDES = {
  employer: {
    title: 'Employer walkthrough',
    focus: 'Hiring pipeline and candidate quality',
    steps: [
      { id: 'overview', label: 'Open the main dashboard and explain active roles and hiring visibility.' },
      { id: 'candidates', label: 'Move to candidates to highlight fit scores, comparisons, and interview progression.' },
    ],
  },
  seeker: {
    title: 'Job seeker walkthrough',
    focus: 'Saved jobs, applications, and smart matches',
    steps: [
      { id: 'overview', label: 'Start on the dashboard to show saved jobs and application activity.' },
      { id: 'matches', label: 'Open Smart Matches to explain why roles are ranked this way.' },
    ],
  },
  freelancer: {
    title: 'Freelancer walkthrough',
    focus: 'Proposal-to-delivery lifecycle',
    steps: [
      { id: 'proposals', label: 'Start with proposals to show pending, accepted, and rejected states.' },
      { id: 'earnings', label: 'Open earnings to explain milestones, escrow, and released balance.' },
    ],
  },
  admin: {
    title: 'Admin walkthrough',
    focus: 'Platform oversight and issue resolution',
    steps: [
      { id: 'overview', label: 'Start on overview to show platform totals and activity signals.' },
      { id: 'disputes', label: 'Open disputes to show the operational resolution workflow.' },
    ],
  },
}

function NavIcon({ icon, className }) {
  if (typeof icon === 'function') {
    const Comp = icon
    return <Comp className={cn('h-4 w-4', className)} />
  }

  if (typeof icon === 'string') {
    return <span className={cn('text-sm', className)}>{icon}</span>
  }

  return <LayoutGrid className={cn('h-4 w-4', className)} />
}

/* Nav item */
function NavItem({ icon, label, badge, badgeVariant = 'default', active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'nav-item',
        active && 'active',
        'w-full text-left'
      )}
    >
      <NavIcon icon={icon} className={active ? 'text-white' : 'text-[#717182]'} />
      <span className="flex-1 truncate text-sm">{label}</span>
      {badge && (
        <span className={cn(
          'text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0',
          badgeVariant === 'red'    ? 'bg-red-500 text-white' :
          badgeVariant === 'yellow' ? 'bg-yellow-400 text-yellow-900' :
          active ? 'bg-white/25 text-white' :
          'bg-gradient-to-r from-[#00cffd] to-[#0099cc] text-white'
        )}>
          {badge}
        </span>
      )}
    </button>
  )
}

/* Avatar */
function Avatar({ name = '', size = 8 }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
  const pixelSize = size * 4

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl border font-semibold flex-shrink-0 shadow-sm',
        'bg-[rgba(0,207,253,0.12)] text-[#0099cc] border-[rgba(0,207,253,0.18)]',
        'dark:bg-[rgba(0,207,253,0.14)] dark:text-[#5ee7ff] dark:border-[rgba(0,207,253,0.24)]'
      )}
      style={{
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
        fontSize: pixelSize >= 40 ? '0.95rem' : '0.8rem',
      }}
    >
      {initials ? initials : <User className="h-4 w-4" />}
    </div>
  )
}

/* Notification panel */
function NotifPanel({ notifications = [], onMarkAll, onClose }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#0e1a2b] rounded-xl border border-[rgba(0,207,253,0.15)] shadow-2xl z-50 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(0,207,253,0.1)]">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</span>
        <div className="flex gap-2">
          {notifications.some(n => !n.is_read) && (
            <button onClick={onMarkAll} className="text-xs text-[#0099cc] font-medium hover:underline">
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-[#717182] hover:text-gray-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <CheckCircle className="h-8 w-8 text-[#00cffd] mx-auto mb-2" />
            <p className="text-sm text-[#717182]">All caught up!</p>
          </div>
        ) : notifications.map(n => (
          <div key={n.id} className={cn(
            'flex gap-3 px-4 py-3 border-b border-[rgba(0,207,253,0.05)] cursor-pointer',
            'hover:bg-[rgba(0,207,253,0.05)] transition-colors',
            !n.is_read && 'bg-[rgba(0,207,253,0.03)]'
          )}>
            <div className="w-8 h-8 rounded-lg bg-[rgba(0,207,253,0.1)] flex items-center justify-center flex-shrink-0">
              <Bell className="h-4 w-4 text-[#00cffd]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white leading-snug">{n.body || n.title}</p>
              <p className="text-xs text-[#717182] mt-0.5">just now</p>
            </div>
            {!n.is_read && <span className="w-2 h-2 rounded-full bg-[#00cffd] flex-shrink-0 mt-1" />}
          </div>
        ))}
      </div>
    </div>
  )
}

/* Main dashboard layout */
export default function DashboardLayout({
  user, profile, navItems = [],
  activePage, onNavigate,
  topbarRight, pageTitle, children,
}) {
  const supabase  = createClient()
  const router    = useRouter()
  const pathname  = usePathname()
  const searchParams = useSearchParams()
  const notifRef  = useRef(null)
  const bellRef   = useRef(null)

  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen,  setNotifOpen]  = useState(false)
  const [dark,       setDark]       = useState(false)
  const [guideDismissed, setGuideDismissed] = useState(false)
  const [demoJourneyActive, setDemoJourneyActive] = useState(false)
  const [completedGuideSteps, setCompletedGuideSteps] = useState([])

  const { notifications, unreadCount, markAllRead } = useNotifications(profile?.id)

  // Persist theme
  useEffect(() => {
    const saved = localStorage.getItem('ch-theme')
    if (saved === 'dark') { document.documentElement.classList.add('dark'); setDark(true) }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    setDemoJourneyActive(window.sessionStorage.getItem('ch-demo-journey-active') === '1')
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const roleKey = (profile?.role || searchParams.get('role') || '').toLowerCase()
    if (!roleKey) return

    setGuideDismissed(window.sessionStorage.getItem(`ch-demo-guide:${roleKey}`) === 'dismissed')
    try {
      const stored = JSON.parse(window.sessionStorage.getItem(`ch-demo-guide-steps:${roleKey}`) || '[]')
      setCompletedGuideSteps(Array.isArray(stored) ? stored : [])
    } catch {
      setCompletedGuideSteps([])
    }
  }, [profile?.role, searchParams])

  // Close notif on outside click
  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target) &&
          bellRef.current  && !bellRef.current.contains(e.target))
        setNotifOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const toggleTheme = () => {
    const next = !dark; setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('ch-theme', next ? 'dark' : 'light')
  }

  const signOut = async () => {
    const email = (user?.email || '').toLowerCase()
    const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
    const demoGuideEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_GUIDE === 'true'
    const isDemoUser = DEMO_ACCOUNT_EMAILS.has(email)
    const shouldReturnToDemo = isDemoUser && (demoGuideEnabled || isLocalhost || pathname?.startsWith('/dashboard'))

    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      await supabase.auth.signOut({ scope: 'global' })
    } finally {
      router.replace(shouldReturnToDemo ? '/test-accounts' : '/login?switch=1')
      router.refresh()
    }
  }

  const handleNavigate = (id) => {
    onNavigate(id)
    setMobileOpen(false)
  }

  const planMeta = getRolePlanMeta(profile)
  const guideRole = (profile?.role || searchParams.get('role') || '').toLowerCase()
  const demoGuide = searchParams.get('demo') === '1' && demoJourneyActive ? DEMO_GUIDES[guideRole] : null
  const showDemoGuide = Boolean(demoGuide && !guideDismissed)
  const currentGuideStep = demoGuide?.steps.find(step => !completedGuideSteps.includes(step.id)) || null
  const guideProgress = demoGuide?.steps?.length
    ? Math.round((completedGuideSteps.length / demoGuide.steps.length) * 100)
    : 0

  useEffect(() => {
    if (!showDemoGuide || !activePage || !demoGuide || typeof window === 'undefined') return

    const matchingStep = demoGuide.steps.find(step => step.id === activePage)
    if (!matchingStep || completedGuideSteps.includes(matchingStep.id)) return

    const nextCompleted = [...completedGuideSteps, matchingStep.id]
    setCompletedGuideSteps(nextCompleted)
    window.sessionStorage.setItem(`ch-demo-guide-steps:${guideRole}`, JSON.stringify(nextCompleted))
  }, [activePage, completedGuideSteps, demoGuide, guideRole, showDemoGuide])

  const dismissGuide = () => {
    setGuideDismissed(true)
    if (typeof window !== 'undefined' && guideRole) {
      window.sessionStorage.setItem(`ch-demo-guide:${guideRole}`, 'dismissed')
    }
  }

  return (
    <div className="dashboard-layout">
      <ToastContainer />

      {/* App Header */}
      <header className="sticky top-0 z-50 flex h-16 w-full flex-shrink-0 items-center justify-between border-b bg-white/95 px-4 shadow-sm backdrop-blur dark:bg-[#0b1728]/95 md:px-6">

        {/* Left: menu + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="lg:hidden w-9 h-9 rounded-lg border border-[rgba(0,207,253,0.1)] flex items-center justify-center text-[#717182] hover:bg-[rgba(0,207,253,0.05)] transition-colors dark:text-[#94a3b8]"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <Logo className="gap-2.5" markSize={40} wordmarkClassName="hidden bg-gradient-to-r from-[#00cffd] to-[#0099cc] bg-clip-text text-xl font-bold text-transparent sm:block" />
        </div>

        {/* Centre: user */}
        <div className="hidden md:flex items-center gap-3">
          <Avatar name={profile?.full_name || user?.email || 'User'} size={8} />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-[#717182] mt-0.5 capitalize">
              {ROLE_LABELS[profile?.role] || 'Member'}
            </p>
          </div>
          <span className={cn(
            'text-xs font-semibold px-2.5 py-0.5 rounded-full border',
            planMeta.className
          )}>
            {planMeta.label}
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg border border-[rgba(0,207,253,0.1)] flex items-center justify-center text-[#717182] hover:bg-[rgba(0,207,253,0.05)] hover:text-[#00cffd] transition-colors dark:text-[#94a3b8]"
            title="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              ref={bellRef}
              onClick={() => setNotifOpen(v => !v)}
              className="relative w-9 h-9 rounded-lg border border-[rgba(0,207,253,0.1)] flex items-center justify-center text-[#717182] hover:bg-[rgba(0,207,253,0.05)] hover:text-[#00cffd] transition-colors dark:text-[#94a3b8]"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#d4183d] border-2 border-white dark:border-[#0b1728]" />
              )}
            </button>
            {notifOpen && (
              <div ref={notifRef}>
                <NotifPanel
                  notifications={notifications}
                  onMarkAll={markAllRead}
                  onClose={() => setNotifOpen(false)}
                />
              </div>
            )}
          </div>

          {/* Sign out */}
          <button
            onClick={signOut}
            className={cn(
              'hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg',
              'border border-red-100 bg-red-50 text-red-600',
              'text-sm font-medium hover:bg-red-100 transition-colors dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60'
            )}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Shell */}
      <div className="dashboard-shell">

        {/* Sidebar */}
        <aside className={cn(
          'dashboard-sidebar',
          // Mobile: slide in
          'hidden lg:flex',
          mobileOpen && '!flex fixed inset-y-0 left-0 z-40 shadow-2xl'
        )}>
          {/* Profile mini-card */}
          <div className="px-4 pt-5 pb-4 border-b border-[rgba(0,207,253,0.08)] flex flex-col items-center gap-3">
            <Avatar name={profile?.full_name || user?.email || 'User'} size={12} />
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                {profile?.full_name || 'Your Name'}
              </p>
              <p className="text-xs text-[#717182] mt-0.5 max-w-[160px] truncate">
                {profile?.headline || 'Complete your profile'}
              </p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-2 py-3 overflow-y-auto">
            {navItems.map((group, gi) => (
              <div key={gi}>
                {group.section && (
                  <p className="text-xs font-semibold text-[#717182] uppercase tracking-wider px-3 pt-4 pb-1.5">
                    {group.section}
                  </p>
                )}
                {group.items.map(item => (
                  <NavItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    badge={item.badge}
                    badgeVariant={item.badgeVariant}
                    active={activePage === item.id}
                    onClick={() => handleNavigate(item.id)}
                  />
                ))}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-2 pb-3 border-t border-[rgba(0,207,253,0.08)] pt-2">
            <NavItem icon={Settings} label="Settings" active={activePage === 'settings'} onClick={() => handleNavigate('settings')} />
            {planMeta.showBilling && (
              <NavItem icon={CreditCard} label="Billing" active={activePage === 'billing'} onClick={() => handleNavigate('billing')} />
            )}
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* Main */}
        <main className="dashboard-main">
          {/* Inner topbar */}
          <div className="dashboard-topbar">
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">{pageTitle}</h1>
            {topbarRight && (
              <div className="flex items-center gap-2">{topbarRight}</div>
            )}
          </div>

          {/* Content */}
          <div className="dashboard-content">
            {showDemoGuide && (
              <div className="surface-card-strong mb-5 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="icon-badge-soft h-11 w-11 rounded-xl">
                      <Sparkles className="h-5 w-5 text-[#00cffd]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0099cc]">Guided Demo</p>
                      <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{demoGuide.title}</h2>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{demoGuide.focus}</p>
                      <p className="mt-2 text-xs font-medium text-[#0099cc]">{completedGuideSteps.length} of {demoGuide.steps.length} steps completed</p>
                    </div>
                  </div>
                  <button
                    onClick={dismissGuide}
                    className="text-sm font-medium text-[#0099cc] transition-colors hover:text-[#007799]"
                  >
                    Hide guide
                  </button>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(0,207,253,0.08)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00cffd] to-[#0099cc] transition-all duration-300"
                    style={{ width: `${guideProgress}%` }}
                  />
                </div>

                {currentGuideStep && (
                  <div className="soft-panel mt-4 flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0099cc]">Next Step</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{currentGuideStep.label}</p>
                    </div>
                    <Button size="sm" onClick={() => handleNavigate(currentGuideStep.id)}>
                      Open Step
                    </Button>
                  </div>
                )}

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {demoGuide.steps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => handleNavigate(step.id)}
                      className={cn(
                        'soft-panel flex items-start justify-between gap-3 p-4 text-left transition-all hover:border-[#00cffd]/30',
                        completedGuideSteps.includes(step.id) && 'border-green-200 bg-green-50/80 dark:border-green-900/40 dark:bg-green-950/20'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className={cn(
                          'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
                          completedGuideSteps.includes(step.id)
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                            : 'bg-[#00cffd]/15 text-[#0099cc]'
                        )}>
                          {completedGuideSteps.includes(step.id) ? <CheckCircle className="h-4 w-4" /> : index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Step {index + 1}</p>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{step.label}</p>
                        </div>
                      </div>
                      {completedGuideSteps.includes(step.id) ? (
                        <span className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-green-600 dark:text-green-300">Done</span>
                      ) : (
                        <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-[#0099cc]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

