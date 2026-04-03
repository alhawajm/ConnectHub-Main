import { Syne } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-display',
})

export const metadata = {
  title: {
    default: 'ConnectHub - Bahrain\'s Professional Network',
    template: '%s | ConnectHub',
  },
  description: 'ConnectHub connects Bahrain\'s job seekers, employers, and freelancers through AI-powered matching, secure escrow payments, and professional tools.',
  keywords: ['jobs', 'freelance', 'Bahrain', 'recruitment', 'careers', 'ConnectHub'],
  icons: {
    icon: '/connecthub-icon.png',
    shortcut: '/connecthub-icon.png',
    apple: '/connecthub-icon.png',
  },
  openGraph: {
    title: 'ConnectHub',
    description: 'Bahrain\'s Professional Network and Freelance Marketplace',
    url: 'https://connecthub.bh',
    siteName: 'ConnectHub',
    locale: 'en_BH',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} font-sans bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100`}>
        {children}
      </body>
    </html>
  )
}
