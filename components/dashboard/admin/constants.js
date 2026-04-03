import {
  Briefcase,
  DollarSign,
  Flag,
  FolderOpen,
  Scale,
  Shield,
  TrendingUp,
  UserCheck,
  UserCog,
  Users,
} from 'lucide-react'

export const ADMIN_NAV = [
  {
    section: 'Admin',
    items: [
      { id: 'overview', label: 'Overview', icon: Shield },
      { id: 'users', label: 'User Management', icon: Users },
      { id: 'content', label: 'Content Moderation', icon: Flag },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    ],
  },
  {
    section: 'Operations',
    items: [
      { id: 'jobs', label: 'Job Posts', icon: Briefcase },
      { id: 'projects', label: 'Freelance Projects', icon: FolderOpen },
      { id: 'payments', label: 'Payments', icon: DollarSign },
      { id: 'disputes', label: 'Disputes', icon: Scale },
    ],
  },
]

export const ADMIN_ROLE_CARDS = [
  { key: 'seeker', label: 'Job Seekers', icon: Users, iconColor: '#2563eb', subtitle: 'Candidates and professionals' },
  { key: 'employer', label: 'Employers', icon: Briefcase, iconColor: '#16a34a', subtitle: 'Hiring organizations' },
  { key: 'freelancer', label: 'Freelancers', icon: UserCheck, iconColor: '#9333ea', subtitle: 'Project-based talent' },
  { key: 'admin', label: 'Admins', icon: UserCog, iconColor: '#6b7280', subtitle: 'Platform operations' },
]

export const ADMIN_GROWTH_BARS = [
  { value: 120, label: 'Jan' },
  { value: 180 },
  { value: 210 },
  { value: 240 },
  { value: 290 },
  { value: 310 },
  { value: 380 },
  { value: 420 },
  { value: 480 },
  { value: 520 },
  { value: 600 },
  { value: 680, active: true, label: 'Dec' },
]
