import {
  Bookmark,
  FileText,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Search,
  User,
  Zap,
} from 'lucide-react'

export const SEEKER_DASHBOARD_NAV = [
  { section: 'My Space', items: [
    { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'search', icon: Search, label: 'Job Search' },
    { id: 'apps', icon: FileText, label: 'Applications', badge: '6', badgeVariant: 'yellow' },
    { id: 'saved', icon: Bookmark, label: 'Saved Jobs', badge: '14' },
    { id: 'matches', icon: Zap, label: 'Smart Matches', badge: '9' },
  ]},
  { section: 'Profile', items: [
    { id: 'profile', icon: User, label: 'My Profile' },
    { id: 'portfolio', icon: FolderOpen, label: 'Portfolio & CV' },
    { id: 'messages', icon: MessageSquare, label: 'Messages', badge: '2', badgeVariant: 'red' },
    { id: 'guidance', icon: GraduationCap, label: 'Career Guidance' },
  ]},
]

export const SEEKER_PAGE_TITLES = {
  overview: 'Dashboard',
  search: 'Job Search',
  apps: 'My Applications',
  saved: 'Saved Jobs',
  matches: 'Smart Matches',
  profile: 'My Profile',
  portfolio: 'Portfolio & CV',
  messages: 'Messages',
  guidance: 'Career Guidance',
  settings: 'Settings',
  billing: 'Billing',
}
