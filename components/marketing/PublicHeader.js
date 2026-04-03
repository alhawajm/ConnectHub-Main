import Link from 'next/link'

export default function PublicHeader() {
  return (
    <header className="site-header">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00cffd] via-[#0099cc] to-[#007799] shadow-md">
              <span className="font-display text-lg font-bold text-white">C</span>
            </div>
            <span className="font-display text-xl font-bold text-gray-900 dark:text-white">
              Connect<span className="text-[#00cffd]">Hub</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            <a href="#features" className="site-nav-link">Features</a>
            <a href="#services" className="site-nav-link">Services</a>
            <a href="#pricing" className="site-nav-link">Pricing</a>
            <a href="#contact" className="site-nav-link">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="site-nav-link rounded-lg px-3 py-2 hover:bg-[#00cffd]/10">
              Login
            </Link>
            <Link href="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
