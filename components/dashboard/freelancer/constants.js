import {
  Bell,
  DollarSign,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Scale,
  Search,
  Send,
  Star,
  User,
} from 'lucide-react'

export const FREELANCER_DASHBOARD_NAV = [
  {
    section: 'Work',
    items: [
      { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'browse', icon: Search, label: 'Browse Projects' },
      { id: 'proposals', icon: Send, label: 'Proposals' },
      { id: 'projects', icon: FolderOpen, label: 'Active Projects' },
      { id: 'alerts', icon: Bell, label: 'Project Alerts' },
    ],
  },
  {
    section: 'Finance',
    items: [
      { id: 'earnings', icon: DollarSign, label: 'Earnings & Escrow' },
      { id: 'contracts', icon: FileText, label: 'Contracts' },
      { id: 'disputes', icon: Scale, label: 'Disputes' },
    ],
  },
  {
    section: 'Profile',
    items: [
      { id: 'portfolio', icon: ImageIcon, label: 'Portfolio' },
      { id: 'profile', icon: User, label: 'My Profile' },
      { id: 'reviews', icon: Star, label: 'Reviews' },
      { id: 'messages', icon: MessageSquare, label: 'Messages' },
    ],
  },
]

export const FREELANCER_PAGE_TITLES = {
  overview: 'Dashboard',
  browse: 'Browse Projects',
  proposals: 'My Proposals',
  projects: 'Active Projects',
  alerts: 'Project Alerts',
  earnings: 'Earnings & Escrow',
  contracts: 'Contracts',
  disputes: 'Disputes',
  portfolio: 'Portfolio',
  profile: 'My Profile',
  reviews: 'Reviews',
  messages: 'Messages',
  settings: 'Settings',
  billing: 'Billing',
}

export const FREELANCER_REVIEWS = [
  {
    name: 'Ahmed Al-Farsi',
    project: 'E-Commerce Redesign',
    date: 'Mar 2026',
    rating: 5,
    comment: 'Sara delivered exceptional UI work. Clean, modern, and on time. Highly recommend!',
  },
  {
    name: 'Gulf Air Digital',
    project: 'Brand Identity',
    date: 'Feb 2026',
    rating: 5,
    comment: 'Professional and creative. The brand identity perfectly captures our vision.',
  },
  {
    name: 'StartupHub BH',
    project: 'App Prototype',
    date: 'Jan 2026',
    rating: 5,
    comment: 'Outstanding Figma work and a smooth project handoff.',
  },
]
