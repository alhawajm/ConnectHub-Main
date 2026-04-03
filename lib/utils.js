import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ── CSS class merging ─────────────────────────────────────────────
/**
 * Merge Tailwind classes cleanly, handling conditionals
 * cn('base', condition && 'conditional', 'always')
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// ── Formatting ────────────────────────────────────────────────────
/**
 * Format a number as Bahraini Dinar
 * formatBD(1200) → "BD 1,200"
 */
export function formatBD(amount) {
  if (amount === null || amount === undefined) return '—'
  return `BD ${Number(amount).toLocaleString('en-BH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })}`
}

/**
 * Format a date relative to now
 * timeAgo(date) → "2 hours ago"
 */
export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  const intervals = [
    { label: 'year',   seconds: 31536000 },
    { label: 'month',  seconds: 2592000 },
    { label: 'week',   seconds: 604800 },
    { label: 'day',    seconds: 86400 },
    { label: 'hour',   seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ]
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

/**
 * Format a date as "26 Mar 2026"
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ── String helpers ─────────────────────────────────────────────────
/**
 * Get initials from a name
 * initials('Yusuf Al-Ahmed') → 'YA'
 */
export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

/**
 * Truncate text to a max length
 */
export function truncate(str, max = 80) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max).trim() + '…' : str
}

// ── Role helpers ───────────────────────────────────────────────────
/** Map role slug to human-readable label */
export const ROLE_LABELS = {
  employer:   'Employer',
  seeker:     'Job Seeker',
  freelancer: 'Freelancer',
  admin:      'Admin',
}

/** Map role to dashboard path */
export function dashboardPath(role) {
  return `/dashboard/${role}`
}

// ── Subscription helpers ───────────────────────────────────────────
export const PLANS = {
  free:     { label: 'Free',     color: 'gray',   price: 0  },
  silver:   { label: 'Silver',   color: 'blue',   price: 18 },
  gold:     { label: 'Gold',     color: 'yellow', price: 23 },
  platinum: { label: 'Platinum', color: 'cyan',   price: 28 },
}

// ── API response helpers ───────────────────────────────────────────
/**
 * Build a standard JSON success response
 */
export function ok(data, status = 200) {
  const { NextResponse } = require('next/server')
  return NextResponse.json({ success: true, data }, { status })
}

/**
 * Build a standard JSON error response
 */
export function err(message, status = 400) {
  const { NextResponse } = require('next/server')
  return NextResponse.json({ success: false, error: message }, { status })
}
