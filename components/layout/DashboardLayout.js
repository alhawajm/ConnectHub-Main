'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { cn, ROLE_LABELS } from '@/lib/utils'
import { ToastContainer } from '@/components/ui/Components'
import { useNotifications } from '@/hooks/useUser'
import {
  Bell, Moon, Sun, LogOut, Menu, X,
  Settings, CreditCard, LayoutGrid, CheckCircle,
} from 'lucide-react'

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
  const colors = [
    'from-[#00cffd] to-[#0099cc]', 'from-green-400 to-green-600',
    'from-purple-400 to-purple-600', 'from-yellow-400 to-orange-500',
    'from-blue-400 to-blue-600',
  ]
  const ci = name.charCodeAt(0) % colors.length || 0
  return (
    <div className={cn(
      `w-${size} h-${size} rounded-lg`,
      'flex items-center justify-center font-bold text-white flex-shrink-0',
      'bg-gradient-to-br text-xs',
      colors[ci]
    )}>
      {initials || '?'}
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
  const notifRef  = useRef(null)
  const bellRef   = useRef(null)

  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen,  setNotifOpen]  = useState(false)
  const [dark,       setDark]       = useState(false)

  const { notifications, unreadCount, markAllRead } = useNotifications(profile?.id)

  // Persist theme
  useEffect(() => {
    const saved = localStorage.getItem('ch-theme')
    if (saved === 'dark') { document.documentElement.classList.add('dark'); setDark(true) }
  }, [])

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
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleNavigate = (id) => {
    onNavigate(id)
    setMobileOpen(false)
  }

  // Plan badge
  const plan = profile?.plan
  const planLabel = plan === 'platinum' ? 'Platinum' : plan === 'gold' ? 'Gold' : plan === 'silver' ? 'Silver' : 'Free'
  const planClass = plan === 'platinum'
    ? 'bg-[rgba(0,207,253,0.1)] text-[#0099cc] border-[rgba(0,207,253,0.2)]'
    : plan === 'gold'
    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
    : plan === 'silver'
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : 'bg-gray-100 text-gray-500 border-gray-200'

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
          <a href="/" className="flex items-center gap-2.5">
            {/* Spec: w-10 h-10 gradient rounded-lg */}
            <div className="w-10 h-10 bg-gradient-to-br from-[#00cffd] via-[#0099cc] to-[#007799] rounded-lg shadow-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-[#00cffd] to-[#0099cc] bg-clip-text text-transparent">
              ConnectHub
            </span>
          </a>
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
            planClass
          )}>
            {planLabel}
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
            <NavItem icon={CreditCard} label="Billing" active={activePage === 'billing'} onClick={() => handleNavigate('billing')} />
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
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

