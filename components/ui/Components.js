'use client'
import { useState, useEffect } from 'react'
import NextImage from 'next/image'
import { cn } from '@/lib/utils'
import {
  CheckCircle2, XCircle, Info, Loader2, X,
  TrendingUp, TrendingDown, Minus,
} from 'lucide-react'

/* ════════════════════════════════════════════════════════════════
   All components follow DEVELOPER-HANDOFF-SPEC.md exactly
   ════════════════════════════════════════════════════════════════ */

/* ── Badge ─────────────────────────────────────────────────────── */
/**
 * Spec:
 *  - Skill tag: px-3 py-1 rounded-full gradient-soft bg, cyan text, cyan/20 border
 *  - Status badge: variant-based bg/text
 */
export function Badge({ children, variant = 'gray', dot = true, className }) {
  const variants = {
    cyan:        'bg-[rgba(0,207,253,0.1)] text-[#0099cc] border-[rgba(0,207,253,0.2)]',
    green:       'bg-green-50  text-green-700  border-green-200',
    yellow:      'bg-yellow-50 text-yellow-700 border-yellow-200',
    red:         'bg-red-50    text-red-700    border-red-200',
    purple:      'bg-purple-50 text-purple-700 border-purple-200',
    blue:        'bg-blue-50   text-blue-700   border-blue-200',
    gray:        'bg-gray-100  text-gray-600   border-gray-200',
    destructive: 'bg-[#d4183d] text-white       border-transparent',
    primary:     'bg-gradient-to-r from-[#00cffd] to-[#0099cc] text-white border-transparent',
  }

  const dotColors = {
    cyan:'#00cffd', green:'#22c55e', yellow:'#f59e0b',
    red:'#ef4444', purple:'#8b5cf6', blue:'#3b82f6', gray:'#9ca3af',
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full',
      'text-xs font-medium border',
      variants[variant] || variants.gray,
      className
    )}>
      {dot && variant in dotColors && (
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dotColors[variant] }} />
      )}
      {children}
    </span>
  )
}

/* ── Skill Tag (spec: gradient-soft bg, cyan border) ─────────── */
export function SkillTag({ children }) {
  return (
    <span className={cn(
      'px-3 py-1 rounded-full text-sm font-medium',
      'bg-gradient-to-r from-[#00cffd]/10 to-[#0099cc]/10',
      'text-[#00cffd] border border-[#00cffd]/20',
    )}>
      {children}
    </span>
  )
}

/* ── Status Badge ───────────────────────────────────────────────── */
const STATUS_MAP = {
  pending:     { label: 'Pending',      v: 'gray'   },
  reviewed:    { label: 'Reviewed',     v: 'blue'   },
  shortlisted: { label: 'Shortlisted',  v: 'cyan'   },
  interview:   { label: 'Interview',    v: 'yellow' },
  offered:     { label: 'Offered',      v: 'purple' },
  hired:       { label: 'Hired',        v: 'green'  },
  rejected:    { label: 'Rejected',     v: 'red'    },
  active:      { label: 'Active',       v: 'green'  },
  draft:       { label: 'Draft',        v: 'gray'   },
  paused:      { label: 'Paused',       v: 'yellow' },
  closed:      { label: 'Closed',       v: 'red'    },
  open:        { label: 'Open',         v: 'green'  },
  in_progress: { label: 'In Progress',  v: 'cyan'   },
  completed:   { label: 'Completed',    v: 'blue'   },
  disputed:    { label: 'Disputed',     v: 'red'    },
  held:        { label: 'Held',         v: 'yellow' },
  released:    { label: 'Released',     v: 'green'  },
  resolved:    { label: 'Resolved',     v: 'blue'   },
  under_review:{ label: 'Under Review', v: 'yellow' },
}

export function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, v: 'gray' }
  return <Badge variant={s.v}>{s.label}</Badge>
}

/* ── Card ───────────────────────────────────────────────────────── */
/**
 * Spec: rounded-xl, border border-[#00cffd]/10, bg-card, shadow-lg
 *       hover: border-[#00cffd]/30, shadow-xl
 */
export function Card({ children, className, padding = 'md', hoverable = false }) {
  const pads = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' }
  return (
    <div className={cn(
      'bg-white dark:bg-[#0e1a2b]',
      'rounded-xl border-2 shadow-md',
      'border-[#00cffd]/10',
      hoverable && 'transition-all duration-200 cursor-pointer hover:border-[#00cffd]/30 hover:shadow-xl hover:-translate-y-0.5',
      pads[padding],
      className
    )}>
      {children}
    </div>
  )
}

/* Card subcomponents (spec pattern) */
export function CardHeader({ children, gradient = false, className }) {
  return (
    <div className={cn(
      'px-6 pt-6',
      gradient && 'bg-gradient-to-r from-[#00cffd]/5 to-[#0099cc]/5',
      className
    )}>
      {children}
    </div>
  )
}
export function CardContent({ children, className }) {
  return <div className={cn('px-6 pb-6 pt-6', className)}>{children}</div>
}
export function CardFooter({ children, className }) {
  return <div className={cn('px-6 pb-6 flex items-center', className)}>{children}</div>
}

/* ── Stat Card ──────────────────────────────────────────────────── */
/**
 * Spec: icon-badge (gradient rounded-lg), large number, muted label,
 *       delta with arrow icon
 */
export function StatCard({ icon: Icon, label, value, delta, deltaUp, iconVariant = 'gradient' }) {
  const iconBg = {
    gradient: 'bg-gradient-to-r from-[#00cffd] to-[#0099cc]',
    cyan:     'bg-[rgba(0,207,253,0.1)]',
    green:    'bg-green-50',
    yellow:   'bg-yellow-50',
    blue:     'bg-blue-50',
    purple:   'bg-purple-50',
    red:      'bg-red-50',
  }[iconVariant] || 'bg-gradient-to-r from-[#00cffd] to-[#0099cc]'

  const iconColor = iconVariant === 'gradient' ? 'text-white' : 'text-[#00cffd]'

  return (
    <div className="stat-card">
      <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
        {Icon && <Icon className={cn('h-6 w-6', iconColor)} />}
      </div>
      <div>
        <p className="text-sm text-[#717182] mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
        {delta && (
          <p className={cn(
            'text-xs font-medium mt-1.5 flex items-center gap-1',
            deltaUp === true  && 'text-green-600',
            deltaUp === false && 'text-red-600',
            deltaUp === undefined && 'text-[#717182]',
          )}>
            {deltaUp === true  && <TrendingUp  className="h-3 w-3" />}
            {deltaUp === false && <TrendingDown className="h-3 w-3" />}
            {deltaUp === undefined && <Minus className="h-3 w-3" />}
            {delta}
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Avatar ─────────────────────────────────────────────────────── */
export function Avatar({ name, src, size = 'md', className }) {
  const sizes = { xs: 'w-7 h-7 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-sm', xl: 'w-16 h-16 text-base' }
  const initials = (name || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
  const colors = ['from-[#00cffd] to-[#0099cc]','from-green-400 to-green-600','from-purple-400 to-purple-600','from-yellow-400 to-orange-500','from-blue-400 to-blue-600']
  const ci = name ? name.charCodeAt(0) % colors.length : 0

  if (src) {
    return (
      <NextImage
        src={src}
        alt={name || 'Avatar'}
        width={64}
        height={64}
        className={cn('rounded-lg object-cover flex-shrink-0', sizes[size], className)}
      />
    )
  }

  return (
    <div className={cn(
      'rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0',
      'bg-gradient-to-br', colors[ci], sizes[size], className
    )}>
      {initials || '?'}
    </div>
  )
}

/* ── Icon Badge (spec patterns) ─────────────────────────────────── */
/* Filled gradient — for feature cards */
export function IconBadge({ icon: Icon, size = 'md' }) {
  const s = size === 'lg' ? 'w-16 h-16' : 'w-12 h-12'
  const i = size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'
  return (
    <div className={cn('rounded-lg flex items-center justify-center bg-gradient-to-r from-[#00cffd] to-[#0099cc]', s)}>
      {Icon && <Icon className={cn('text-white', i)} />}
    </div>
  )
}

/* Soft — light cyan bg, cyan icon */
export function IconBadgeSoft({ icon: Icon, size = 'md' }) {
  const s = size === 'lg' ? 'w-16 h-16' : 'w-12 h-12'
  const i = size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'
  return (
    <div className={cn('rounded-lg flex items-center justify-center bg-[rgba(0,207,253,0.1)]', s)}>
      {Icon && <Icon className={cn('text-[#00cffd]', i)} />}
    </div>
  )
}

/* ── Toast (using sonner-style, spec: shadow-2xl) ───────────────── */
let _showToast = null

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    _showToast = ({ message, type = 'success' }) => {
      const id = Date.now()
      setToasts(t => [...t, { id, message, type }])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
    }
  }, [])

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />,
    error:   <XCircle      className="h-4 w-4 text-[#d4183d] flex-shrink-0" />,
    info:    <Info          className="h-4 w-4 text-[#00cffd] flex-shrink-0" />,
  }

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl',
          'bg-white dark:bg-[#0e1a2b]',
          'border border-[rgba(0,207,253,0.15)]',
          'text-sm font-medium text-gray-900 dark:text-white',
          'animate-slide-up pointer-events-auto',
          'min-w-[260px] max-w-sm',
        )}>
          {icons[t.type]}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => setToasts(tt => tt.filter(x => x.id !== t.id))}
            className="text-[#717182] hover:text-gray-900 ml-1">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  return {
    success: (message) => _showToast?.({ message, type: 'success' }),
    error:   (message) => _showToast?.({ message, type: 'error'   }),
    info:    (message) => _showToast?.({ message, type: 'info'    }),
  }
}

/* ── Modal (spec: shadow-2xl, rounded-xl) ───────────────────────── */
export function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  if (!open) return null

  const maxW = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size] || 'max-w-lg'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Dialog — spec: shadow-2xl, rounded-xl */}
      <div className={cn(
        'relative w-full bg-white dark:bg-[#0e1a2b]',
        'rounded-xl shadow-2xl border border-[rgba(0,207,253,0.15)]',
        'animate-fade-in',
        maxW
      )}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,207,253,0.1)]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#717182] hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

/* ── Empty State ─────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#00cffd]/10 to-[#0099cc]/10 flex items-center justify-center mb-4">
        {Icon && <Icon className="h-8 w-8 text-[#00cffd]" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      {description && <p className="text-sm text-[#717182] max-w-xs leading-relaxed mb-5">{description}</p>}
      {action}
    </div>
  )
}

/* ── Spinner (spec: Loader2 animate-spin) ───────────────────────── */
export function Spinner({ size = 'md' }) {
  const s = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }[size] || 'h-6 w-6'
  return <Loader2 className={cn(s, 'animate-spin text-[#00cffd]')} />
}

/* ── Section Header (common landing page pattern) ───────────────── */
export function SectionHeader({ badge, title, titleHighlight, description }) {
  return (
    <div className="text-center mb-16">
      {badge && (
        <div className="inline-flex items-center gap-2 bg-[rgba(0,207,253,0.1)] border border-[rgba(0,207,253,0.2)] rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#00cffd] animate-pulse" />
          <span className="text-sm font-medium text-[#0099cc]">{badge}</span>
        </div>
      )}
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {title}{' '}
          {titleHighlight && (
            <span className="bg-gradient-to-r from-[#00cffd] to-[#0099cc] bg-clip-text text-transparent">
              {titleHighlight}
            </span>
          )}
        </h2>
      )}
      {description && (
        <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">{description}</p>
      )}
    </div>
  )
}
