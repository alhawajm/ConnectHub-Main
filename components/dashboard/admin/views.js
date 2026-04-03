import Button from '@/components/ui/Button'
import { BarChart, DCard, ProgressBar, StatCard } from '@/components/dashboard/SharedComponents'
import { Briefcase, Eye, Flag, Scale, Search, TrendingUp, Users } from 'lucide-react'
import { ADMIN_GROWTH_BARS, ADMIN_ROLE_CARDS } from './constants'

export function AdminOverview({ stats, onNavigate }) {
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

export function AnalyticsView({ stats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="DAU" value="3,840" subtitle="+8% WoW" icon={Eye} />
        <StatCard label="AI Adoption" value="64%" subtitle="Target exceeded" icon={TrendingUp} iconColor="#22c55e" />
        <StatCard label="Retention" value={`${stats?.retention || 0}%`} subtitle="Monthly" icon={Users} />
        <StatCard label="Open Disputes" value={stats?.totalDisputes || 0} subtitle="Needs action" icon={Scale} iconColor="#f59e0b" />
      </div>
      <DCard>
        <h2 className="mb-4 text-xl font-bold text-gray-900">User Growth</h2>
        <BarChart data={ADMIN_GROWTH_BARS} height={140} />
      </DCard>
    </div>
  )
}
