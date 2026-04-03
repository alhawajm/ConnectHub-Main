'use client'
import { cn } from '@/lib/utils'

/**
 * Button — matches DEVELOPER-HANDOFF-SPEC.md exactly
 *
 * Variants: default | outline | ghost | destructive | secondary | link
 * Sizes:    sm (h-8) | default (h-9) | lg (h-10) | icon (36x36)
 *
 * Primary uses gradient: from-[#00cffd] to-[#0099cc]
 * Hover:                  from-[#00b8e6] to-[#007799]
 */
import { Loader2 } from 'lucide-react'

const variants = {
  default: [
    'bg-gradient-to-r from-[#00cffd] to-[#0099cc]',
    'hover:from-[#00b8e6] hover:to-[#007799]',
    'text-white shadow-md hover:shadow-lg',
    'border-transparent',
  ].join(' '),

  outline: [
    'border border-[#00cffd]/30 bg-transparent',
    'text-[#0099cc] hover:bg-[#00cffd]/5 hover:border-[#00cffd]/50',
  ].join(' '),

  ghost: [
    'bg-transparent border-transparent',
    'hover:bg-gray-100 dark:hover:bg-gray-800',
    'text-gray-700 dark:text-gray-300',
  ].join(' '),

  secondary: [
    'bg-gray-100 dark:bg-gray-800',
    'text-gray-700 dark:text-gray-300',
    'hover:bg-gray-200 dark:hover:bg-gray-700',
    'border-transparent',
  ].join(' '),

  destructive: [
    'bg-[#d4183d] text-white',
    'hover:bg-[#b81232]',
    'shadow-md border-transparent',
  ].join(' '),

  danger: [
    'bg-[#d4183d] text-white',
    'hover:bg-[#b81232]',
    'shadow-md border-transparent',
  ].join(' '),

  link: [
    'bg-transparent border-transparent underline-offset-4',
    'hover:underline text-[#0099cc]',
    'p-0 h-auto',
  ].join(' '),
}

const sizes = {
  xs:      'h-7 px-2.5 text-xs gap-1 rounded-md',
  sm:      'h-8 px-3 text-sm gap-1.5 rounded-md',
  default: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg:      'h-10 px-6 text-base gap-2 rounded-lg',
  icon:    'size-9 rounded-lg',
}

export default function Button({
  children,
  variant = 'default',
  size = 'default',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  href,
  className,
  ...props
}) {
  const base = cn(
    // Base (spec)
    'inline-flex items-center justify-center font-medium',
    'transition-all duration-200',
    'disabled:opacity-50 disabled:pointer-events-none',
    'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#00cffd]/50',
    // SVG icon sizing (spec: [&_svg]:h-4 [&_svg]:w-4)
    '[&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0',
    // Border always present (transparent on some variants)
    'border',
    variants[variant] || variants.default,
    sizes[size] || sizes.default,
    fullWidth && 'w-full',
    className
  )

  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </>
  )

  if (href) {
    return <a href={href} className={base} {...props}>{content}</a>
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={base}
      {...props}
    >
      {content}
    </button>
  )
}
