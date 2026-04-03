import Link from 'next/link'
import Logo from '@/components/branding/Logo'

export default function PublicHeader() {
  return (
    <header className="site-header">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-6">
          <Logo priority />

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
