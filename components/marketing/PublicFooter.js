import Link from 'next/link'
import Logo from '@/components/branding/Logo'

const footerLinks = {
  Product: [
    { label: 'Jobs', href: '/jobs' },
    { label: 'Freelance', href: '/freelance' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Chat', href: '/chat' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Demo Accounts', href: '/test-accounts' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

export default function PublicFooter() {
  return (
    <footer className="border-t border-[#00cffd]/10 bg-white/70 py-12 dark:bg-[#0b1728]/60">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              ConnectHub brings together hiring, job discovery, freelance delivery, and advisory services in one Bahrain-focused experience.
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>support@connecthub.bh</span>
              <span>Manama, Bahrain</span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0099cc]">{title}</p>
              <div className="mt-4 flex flex-col gap-3">
                {links.map((link) => (
                  <Link key={link.href} href={link.href} className="text-sm text-gray-600 transition-colors hover:text-[#0099cc] dark:text-gray-300 dark:hover:text-[#5ee7ff]">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-[#00cffd]/10 pt-5 text-sm text-gray-500 dark:text-gray-400">
          © 2026 ConnectHub. Built for smarter hiring, career growth, and freelance delivery.
        </div>
      </div>
    </footer>
  )
}
