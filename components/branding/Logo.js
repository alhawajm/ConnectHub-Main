import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function LogoMark({ size = 40, className, priority = false }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl shadow-md ring-1 ring-black/5',
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/connecthub-icon.png"
        alt="ConnectHub"
        width={size}
        height={size}
        priority={priority}
        className="h-full w-full object-cover"
      />
    </div>
  )
}

export default function Logo({
  href = '/',
  markSize = 40,
  wordmarkClassName,
  className,
  priority = false,
}) {
  return (
    <Link href={href} className={cn('flex items-center gap-3', className)}>
      <LogoMark size={markSize} priority={priority} />
      <span className={cn('font-display text-xl font-bold text-gray-900 dark:text-white', wordmarkClassName)}>
        Connect<span className="text-[#00cffd]">Hub</span>
      </span>
    </Link>
  )
}
