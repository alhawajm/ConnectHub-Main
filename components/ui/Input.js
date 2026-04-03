'use client'
import { cn } from '@/lib/utils'

/**
 * Input — matches DEVELOPER-HANDOFF-SPEC.md exactly
 *
 * Spec:
 *  - Height: 36px (h-9)
 *  - Padding: px-3 py-2
 *  - Border: 1px solid rgba(0,207,253,0.1)
 *  - Border radius: rounded-md (6px)
 *  - Background: #f3f3f5
 *  - Font size: text-base (16px)
 *  - Focus ring: 3px ring-[#00cffd]/50
 */
export default function Input({
  label,
  error,
  helper,
  as: Tag = 'input',
  className,
  id,
  children,
  prefix,
  suffix,
  required,
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  // Spec input classes
  const inputCls = cn(
    'flex h-9 w-full rounded-md px-3 py-2',
    'bg-[#f3f3f5] dark:bg-gray-800',
    'border border-[rgba(0,207,253,0.1)]',
    'text-base text-gray-900 dark:text-gray-100',
    'placeholder:text-[#717182]',
    'transition-all duration-200 outline-none',
    'focus:border-[#00cffd] focus:ring-[3px] focus:ring-[#00cffd]/20',
    'disabled:cursor-not-allowed disabled:opacity-50',
    error && 'border-[#d4183d] focus:ring-[#d4183d]/20',
    Tag === 'textarea' && 'h-auto resize-none py-2 leading-relaxed',
    className
  )

  const renderField = () => {
    if (Tag === 'select') return (
      <select id={inputId} className={inputCls} {...props}>{children}</select>
    )
    if (Tag === 'textarea') return (
      <textarea id={inputId} className={inputCls} {...props} />
    )
    return <input id={inputId} className={inputCls} {...props} />
  }

  return (
    <div className="space-y-2">
      {/* Label — spec: text-sm font-medium */}
      {label && (
        <label htmlFor={inputId} className="form-label block">
          {label}{required && <span className="text-[#d4183d] ml-1">*</span>}
        </label>
      )}

      {/* Input with optional prefix/suffix */}
      {(prefix || suffix) ? (
        <div className={cn(
          'flex rounded-md overflow-hidden',
          'border border-[rgba(0,207,253,0.1)] bg-[#f3f3f5]',
          'focus-within:border-[#00cffd] focus-within:ring-[3px] focus-within:ring-[#00cffd]/20'
        )}>
          {prefix && (
            <span className="flex items-center px-3 text-sm text-[#717182] bg-gray-50 border-r border-[rgba(0,207,253,0.1)] whitespace-nowrap">
              {prefix}
            </span>
          )}
          <input className={cn(inputCls, 'border-none focus:ring-0 rounded-none flex-1')} {...props} />
          {suffix && (
            <span className="flex items-center px-3 text-sm text-[#717182] bg-gray-50 border-l border-[rgba(0,207,253,0.1)] whitespace-nowrap">
              {suffix}
            </span>
          )}
        </div>
      ) : renderField()}

      {/* Error */}
      {error && (
        <p className="text-xs text-[#d4183d] flex items-center gap-1">
          <span>!</span>{error}
        </p>
      )}

      {/* Helper */}
      {helper && !error && (
        <p className="text-xs text-[#717182]">{helper}</p>
      )}
    </div>
  )
}
