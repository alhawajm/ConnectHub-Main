/**
 * SharedComponents.js
 * 
 * Reusable Figma-matched components used across ALL dashboards.
 * Single source of truth — edit here, all dashboards update.
 */
'use client'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────────
   PAGE HEADER
   Figma: gradient icon box (w-14 h-14) + large H1 + subtitle
   Used at top of every dashboard page
───────────────────────────────────────────────────────────────── */
export function PageHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #00cffd 0%, #0099cc 100%)' }}>
        <Icon className="h-7 w-7 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">{title}</h1>
        <p className="text-base text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   STAT CARD
   Figma: label top-left | icon top-right (cyan, no box) |
          large bold number | muted subtitle text
───────────────────────────────────────────────────────────────── */
export function StatCard({ label, value, subtitle, icon: Icon, iconColor = '#00cffd' }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-[#00cffd]/10 hover:border-[#00cffd]/30 transition-all hover:shadow-lg p-6">
      {/* Top row — Figma: flex flex-row items-center justify-between pb-2 */}
      <div className="flex flex-row items-center justify-between pb-2">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
        {Icon && <Icon className="h-4 w-4 flex-shrink-0" style={{ color: iconColor }} />}
      </div>
      {/* Number — Figma: text-2xl font-bold */}
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      {/* Subtitle */}
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   DASHBOARD CARD
   Figma: white bg, subtle cyan border, rounded-xl
   Used for all content sections
───────────────────────────────────────────────────────────────── */
export function DCard({ children, className, noPad = false }) {
  return (
    <div className={cn(
      'bg-white dark:bg-gray-900 rounded-xl border-2 border-[#00cffd]/10 overflow-hidden',
      !noPad && 'p-6',
      className
    )}>
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   CARD HEADER (with gradient bg like Figma Quick Actions)
───────────────────────────────────────────────────────────────── */
export function DCardHeader({ title, subtitle, action }) {
  return (
    <div className="px-6 py-4 flex items-center justify-between"
      style={{ background: 'linear-gradient(135deg, rgba(0,207,253,0.06) 0%, rgba(0,153,204,0.04) 100%)' }}>
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   SECTION TITLE
   Simple heading used within pages (not page-level header)
───────────────────────────────────────────────────────────────── */
export function SectionTitle({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white">{children}</h2>
      {action}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   TABLE WRAPPER
───────────────────────────────────────────────────────────────── */
export function TableCard({ children }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-[rgba(0,207,253,0.1)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">{children}</table>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   PROGRESS BAR
───────────────────────────────────────────────────────────────── */
export function ProgressBar({ value, max = 100, showLabel = false }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>{value.toLocaleString()}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'linear-gradient(to right, #00cffd, #0099cc)' }}
        />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   LIST ROW — used in recent activity / application lists
───────────────────────────────────────────────────────────────── */
export function ListRow({ children, onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-5 py-3.5',
        'border-b border-[rgba(0,207,253,0.06)] last:border-0',
        onClick && 'cursor-pointer hover:bg-[rgba(0,207,253,0.02)] transition-colors'
      )}
    >
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   EMPTY STATE (consistent across all dashboards)
───────────────────────────────────────────────────────────────── */
export function EmptyPlaceholder({ icon: Icon, title, description, action }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-[rgba(0,207,253,0.1)] p-16 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'linear-gradient(135deg, rgba(0,207,253,0.1), rgba(0,153,204,0.08))' }}>
        {Icon && <Icon className="h-8 w-8 text-[#00cffd]" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-5">{description}</p>}
      {action}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   BAR CHART (simple CSS bars, consistent across dashboards)
───────────────────────────────────────────────────────────────── */
export function BarChart({ data, height = 100 }) {
  const max = Math.max(...data.map(d => d.value))
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="flex-1 rounded-t-sm transition-all duration-300"
            style={{
              height: `${Math.round((d.value / max) * 100)}%`,
              background: d.active
                ? 'linear-gradient(to top, #00cffd, #0099cc)'
                : '#ececf0',
            }}
          />
        ))}
      </div>
      {data[0]?.label && (
        <div className="flex justify-between mt-2">
          {[data[0], data[Math.floor(data.length / 2)], data[data.length - 1]].map((d, i) => (
            <span key={i} className="text-xs text-gray-400">{d?.label}</span>
          ))}
        </div>
      )}
    </div>
  )
}
