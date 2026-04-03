import {
  BarChart2,
  Briefcase,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Users,
} from 'lucide-react'

export const EMPLOYER_DASHBOARD_NAV = [
  {
    section: 'Overview',
    items: [
      { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'jobs', icon: Briefcase, label: 'Job Posts' },
      { id: 'candidates', icon: Users, label: 'Candidate Comparison' },
      { id: 'post-job', icon: Plus, label: 'Post a Job' },
    ],
  },
  {
    section: 'Insights',
    items: [
      { id: 'analytics', icon: BarChart2, label: 'Analytics' },
      { id: 'messages', icon: MessageSquare, label: 'Messages', badge: '5', badgeVariant: 'red' },
    ],
  },
]

export const EMPLOYER_PAGE_TITLES = {
  overview: 'Dashboard Overview',
  jobs: 'Job Posts',
  candidates: 'Candidate Comparison',
  'post-job': 'Post a Job',
  analytics: 'Analytics',
  messages: 'Messages',
  settings: 'Settings',
  billing: 'Billing',
}
