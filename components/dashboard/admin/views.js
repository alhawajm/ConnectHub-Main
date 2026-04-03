import Button from '@/components/ui/Button'
import { BarChart, DCard, ProgressBar, StatCard } from '@/components/dashboard/SharedComponents'
import { AlertTriangle, Briefcase, CheckCircle2, CreditCard, Eye, Flag, Scale, Search, ShieldCheck, TrendingUp, Users } from 'lucide-react'
import { ADMIN_GROWTH_BARS, ADMIN_ROLE_CARDS } from './constants'

function formatTimestamp(value) {
  if (!value) return 'Unknown time'

  return new Date(value).toLocaleString('en-BH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function AdminOverview({ stats, systemEvents = [], onNavigate }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={stats?.totalUsers || 0} subtitle="Registered accounts" icon={Users} />
        <StatCard label="Total Jobs" value={stats?.totalJobs || 0} subtitle="Posted listings" icon={Briefcase} />
        <StatCard label="Total Projects" value={stats?.totalProjects || 0} subtitle="Freelance demand" icon={Flag} />
        <StatCard label="Applications" value={stats?.totalApplications || 0} subtitle="Platform activity" icon={TrendingUp} iconColor="#22c55e" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <DCard>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Users by Role</h2>
              <p className="mt-1 text-sm text-gray-500">Role distribution across the current platform membership.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {ADMIN_ROLE_CARDS.map(item => (
              <div key={item.key} className="rounded-xl border-2 border-[#00cffd]/10 bg-white p-5 transition-all hover:border-[#00cffd]/30 hover:shadow-lg dark:bg-gray-900">
                <div className="flex items-start justify-between pb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.label}</p>
                  <item.icon className="h-4 w-4 flex-shrink-0" style={{ color: item.iconColor }} />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.usersByRole?.[item.key] || 0}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </DCard>

        <DCard>
          <h2 className="mb-4 text-xl font-bold text-gray-900">Quick Actions</h2>
          <div className="space-y-3">
            <QuickAction title="Manage Users" description="Review accounts and role distribution." onClick={() => onNavigate('users')} />
            <QuickAction title="Content Moderation" description="Check jobs and projects that need review." onClick={() => onNavigate('content')} />
            <QuickAction title="View Analytics" description="See growth, retention, and adoption trends." onClick={() => onNavigate('analytics')} />
          </div>
        </DCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <DCard>
          <h2 className="mb-4 text-xl font-bold text-gray-900">System Health</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-xl border border-[#00cffd]/10 bg-[#00cffd]/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0099cc]">Errors In 24h</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.failedEvents24h || 0}</p>
              <p className="mt-1 text-sm text-gray-500">Admin-notified workflow failures.</p>
            </div>
            <div className="rounded-xl border border-[#00cffd]/10 bg-white p-4 dark:bg-gray-900">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0099cc]">Tracked Events In 7d</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats?.trackedEvents7d || 0}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Auth, applications, escrow, and payments.</p>
            </div>
          </div>
        </DCard>

        <DCard>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent System Signals</h2>
              <p className="mt-1 text-sm text-gray-500">Latest tracked actions and operational alerts.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => onNavigate('analytics')}>Open Analytics</Button>
          </div>
          <div className="space-y-3">
            {systemEvents.length ? systemEvents.map(event => (
              <div key={event.id} className="rounded-xl border border-[#00cffd]/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${event.level === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300' : 'bg-[#00cffd]/10 text-[#0099cc]'}`}>
                      {event.level === 'error' ? <AlertTriangle className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {(event.category || 'system').replace(/_/g, ' ')} · {(event.action || 'event').replace(/_/g, ' ')}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{event.message || 'Tracked platform activity event.'}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${event.level === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300' : 'bg-[#00cffd]/10 text-[#0099cc]'}`}>
                    {event.level || 'info'}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
                  <span>{formatTimestamp(event.created_at)}</span>
                  {event.actor_role && <span className="capitalize">{event.actor_role}</span>}
                  {event.route && <span>{event.route}</span>}
                </div>
              </div>
            )) : (
              <div className="rounded-xl border border-[#00cffd]/10 bg-[#00cffd]/5 p-5 text-sm text-gray-500">
                Monitoring is wired up. Apply the analytics migration to store live production events in Supabase.
              </div>
            )}
          </div>
        </DCard>
      </div>
    </div>
  )
}

function QuickAction({ title, description, onClick }) {
  return (
    <button onClick={onClick} className="w-full rounded-xl border border-[#00cffd]/15 p-4 text-left transition-all hover:border-[#00cffd]/35 hover:bg-[#00cffd]/5">
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </button>
  )
}

export function UsersView({ filteredUsers, searchQuery, onSearchChange }) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-[#00cffd]/10 bg-white shadow-sm dark:bg-[#0e1a2b]">
      <div className="flex items-center justify-between gap-4 border-b border-[#00cffd]/10 p-6">
        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={event => onSearchChange(event.target.value)}
            className="w-full rounded-lg border border-[#00cffd]/20 py-2 pl-10 pr-4 text-sm focus:border-[#00cffd]/50 focus:outline-none"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-[#00cffd]/10 bg-gray-50 dark:bg-gray-800/70">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(item => (
              <tr key={item.id} className="border-b border-[#00cffd]/5 transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.full_name || item.email}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{item.email}</td>
                <td className="px-6 py-3 text-sm capitalize text-[#0099cc]">{item.role || 'user'}</td>
                <td className="px-6 py-3 text-sm text-green-700">Active</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ContentView({ jobs, projects }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ModerationPanel
        icon={Briefcase}
        title="Job Posts Moderation"
        subtitle="Review current job publishing volume."
        progressLabel="Active jobs"
        progressValue={jobs.filter(item => item.status === 'active').length}
        progressMax={Math.max(jobs.length, 1)}
        summary="No flagged job posts in this snapshot. All listings are currently visible."
      />
      <ModerationPanel
        icon={Flag}
        title="Projects Moderation"
        subtitle="Keep marketplace content trustworthy."
        progressLabel="Open freelance projects"
        progressValue={projects.filter(item => item.status === 'open').length}
        progressMax={Math.max(projects.length, 1)}
        summary="No freelance projects are awaiting intervention right now."
      />
    </div>
  )
}

function ModerationPanel({ icon: Icon, title, subtitle, progressLabel, progressValue, progressMax, summary }) {
  return (
    <DCard>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00cffd]/10">
          <Icon className="h-5 w-5 text-[#0099cc]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <div className="mb-2 flex justify-between text-sm text-gray-600"><span>{progressLabel}</span><span>{progressValue}</span></div>
          <ProgressBar value={progressValue} max={progressMax} />
        </div>
        <div className="rounded-xl border border-[#00cffd]/10 bg-[#00cffd]/5 p-4">
          <p className="text-sm font-semibold text-gray-900">Moderation status</p>
          <p className="mt-1 text-sm text-gray-500">{summary}</p>
        </div>
      </div>
    </DCard>
  )
}

export function EmptyAdminPanel({ icon: Icon, title, description, children }) {
  return (
    <div className="rounded-xl border-2 border-[#00cffd]/10 bg-white p-6 py-12 text-center shadow-sm dark:bg-[#0e1a2b]">
      <Icon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
      {children}
    </div>
  )
}

export function PaymentAuditView({ stats, paymentWebhookEvents = [] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Payment Signals In 24h" value={stats?.paymentSignals24h || 0} subtitle="Checkout and webhook events" icon={CreditCard} />
        <StatCard label="Processed Webhooks In 7d" value={stats?.processedWebhooks7d || 0} subtitle="Stored replay-safe callbacks" icon={CheckCircle2} iconColor="#22c55e" />
        <StatCard label="Projected Volume" value={`BD ${Number(stats?.paymentVol || 0).toLocaleString('en-BH')}`} subtitle="Planning horizon only" icon={ShieldCheck} />
      </div>

      <DCard>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Payment Webhook Audit</h2>
            <p className="mt-1 text-sm text-gray-500">Verified webhook callbacks stored for replay protection and operator review.</p>
          </div>
          <span className="rounded-full bg-[#00cffd]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#0099cc]">
            {paymentWebhookEvents.length} stored
          </span>
        </div>

        {paymentWebhookEvents.length ? (
          <div className="space-y-3">
            {paymentWebhookEvents.map(event => (
              <div key={`${event.provider}-${event.event_id}`} className="rounded-xl border border-[#00cffd]/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{event.event_id}</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {event.provider} · {event.event_type || 'charge'} · {event.status || 'unknown'}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#00cffd]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0099cc]">
                    stored
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
                  <span>{formatTimestamp(event.created_at)}</span>
                  {event.payload?.metadata?.itemType && <span>{event.payload.metadata.itemType}</span>}
                  {event.payload?.metadata?.paymentMethod && <span>{event.payload.metadata.paymentMethod}</span>}
                  {event.payload?.amount && <span>BD {Number(event.payload.amount).toLocaleString('en-BH')}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#00cffd]/10 bg-[#00cffd]/5 p-5 text-sm text-gray-500">
            No payment webhooks have been stored yet. Once Tap test or live callbacks start arriving, they will appear here.
          </div>
        )}
      </DCard>
    </div>
  )
}

export function DisputesView({ disputes, disputeActionId, onResolveDispute }) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-[#00cffd]/10 bg-white shadow-sm dark:bg-[#0e1a2b]">
      <div className="border-b border-[#00cffd]/10 p-6">
        <h2 className="text-xl font-bold text-gray-900">Open Disputes</h2>
        <p className="mt-1 text-sm text-gray-600">Resolve platform disputes and manage held funds.</p>
      </div>
      {disputes.length > 0 ? (
        <div className="divide-y divide-[#00cffd]/5">
          {disputes.map(item => (
            <div key={item.id} className="flex items-start justify-between gap-4 p-6">
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.reason || 'Dispute'}</p>
                <p className="mt-1 text-sm text-gray-500">{item.details || 'Pending review'}</p>
                <p className="mt-2 text-xs text-gray-400">
                  {item.contracts?.title || 'Contract'}
                  {item.amount_disputed ? ` · BD ${Number(item.amount_disputed).toLocaleString('en-BH')}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" loading={disputeActionId === `${item.id}:release`} onClick={() => onResolveDispute(item.id, 'release')}>Release Funds</Button>
                <Button size="sm" variant="outline" loading={disputeActionId === `${item.id}:refund`} onClick={() => onResolveDispute(item.id, 'refund')} className="border-red-300 text-red-700 hover:bg-red-50">Refund</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <Scale className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No Open Disputes</h3>
          <p className="text-gray-600">All disputes have been resolved.</p>
        </div>
      )}
    </div>
  )
}

export function AnalyticsView({ stats, systemEvents = [], sensitiveEvents = [] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="DAU" value="3,840" subtitle="+8% WoW" icon={Eye} />
        <StatCard label="Smart Tool Adoption" value="64%" subtitle="Target exceeded" icon={TrendingUp} iconColor="#22c55e" />
        <StatCard label="Retention" value={`${stats?.retention || 0}%`} subtitle="Monthly" icon={Users} />
        <StatCard label="Open Disputes" value={stats?.totalDisputes || 0} subtitle="Needs action" icon={Scale} iconColor="#f59e0b" />
      </div>
      <DCard>
        <h2 className="mb-4 text-xl font-bold text-gray-900">User Growth</h2>
        <BarChart data={ADMIN_GROWTH_BARS} height={140} />
      </DCard>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <DCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Operational Signals</h2>
            <span className="text-sm text-gray-500">{systemEvents.length} recent events</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-xl border border-[#00cffd]/10 bg-[#00cffd]/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0099cc]">Errors In 24h</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats?.failedEvents24h || 0}</p>
            </div>
            <div className="rounded-xl border border-[#00cffd]/10 bg-white p-4 dark:bg-gray-900">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0099cc]">Events In 7d</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats?.trackedEvents7d || 0}</p>
            </div>
            <div className="space-y-3">
              {systemEvents.length ? systemEvents.slice(0, 4).map(event => (
                <div key={event.id} className="rounded-xl border border-[#00cffd]/10 p-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {(event.category || 'system').replace(/_/g, ' ')} · {(event.action || 'event').replace(/_/g, ' ')}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{event.message || 'Tracked platform activity event.'}</p>
                  <p className="mt-2 text-xs text-gray-400">{formatTimestamp(event.created_at)}</p>
                </div>
              )) : (
                <div className="rounded-xl border border-[#00cffd]/10 bg-[#00cffd]/5 p-5 text-sm text-gray-500">
                  No operational signals have been stored yet.
                </div>
              )}
            </div>
          </div>
        </DCard>

        <DCard>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sensitive Actions Audit</h2>
              <p className="mt-1 text-sm text-gray-500">Role changes, payment actions, application decisions, and dispute handling.</p>
            </div>
            <span className="rounded-full bg-[#00cffd]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#0099cc]">
              {sensitiveEvents.length} tracked
            </span>
          </div>
          <div className="space-y-3">
            {sensitiveEvents.length ? sensitiveEvents.map(event => (
              <div key={event.id} className="rounded-xl border border-[#00cffd]/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${event.level === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300' : 'bg-[#00cffd]/10 text-[#0099cc]'}`}>
                      {event.level === 'error' ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {(event.category || 'system').replace(/_/g, ' ')} · {(event.action || 'event').replace(/_/g, ' ')}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{event.message || 'Sensitive platform action recorded.'}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${event.level === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300' : 'bg-[#00cffd]/10 text-[#0099cc]'}`}>
                    {event.level || 'info'}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
                  <span>{formatTimestamp(event.created_at)}</span>
                  {event.actor_role && <span className="capitalize">{event.actor_role}</span>}
                  {event.route && <span>{event.route}</span>}
                </div>
              </div>
            )) : (
              <div className="rounded-xl border border-[#00cffd]/10 bg-[#00cffd]/5 p-5 text-sm text-gray-500">
                Sensitive action logs will appear here as operators and users perform trust-critical workflows.
              </div>
            )}
          </div>
        </DCard>
      </div>
    </div>
  )
}
