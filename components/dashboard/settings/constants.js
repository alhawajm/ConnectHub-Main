import { CreditCard, Landmark, Wallet } from 'lucide-react'

export const SETTINGS_NOTIFICATION_DEFAULTS = {
  newApplications: true,
  aiMatches: true,
  messages: true,
  interviewReminders: true,
  weeklyDigest: false,
  marketingEmails: false,
}

export const SETTINGS_NOTIFICATION_FIELDS = [
  {
    key: 'newApplications',
    label: 'New applications',
    description: 'When someone applies to your job post',
  },
  {
    key: 'aiMatches',
    label: 'Smart candidate comparisons',
    description: 'When the system identifies strong fit signals for your role',
  },
  {
    key: 'messages',
    label: 'New messages',
    description: 'Direct messages from candidates or employers',
  },
  {
    key: 'interviewReminders',
    label: 'Interview reminders',
    description: '24hr and 1hr reminders before scheduled interviews',
  },
  {
    key: 'weeklyDigest',
    label: 'Weekly digest',
    description: 'Weekly summary of platform activity',
  },
  {
    key: 'marketingEmails',
    label: 'Product updates',
    description: 'ConnectHub news and new feature announcements',
  },
]

export const PLAN_FEATURES = {
  free: {
    color: 'gray',
    features: ['Browse jobs (limited)', 'Apply to 5 jobs/month', 'Basic profile'],
  },
  silver: {
    color: 'blue',
    features: ['Limited CV database', 'Up to 5 job posts/month', 'Freelancer portfolio access (limited)', 'Email alerts'],
  },
  gold: {
    color: 'yellow',
    features: ['Full CV database', 'Unlimited job posts', 'Application analytics', 'Freelancer portfolios (unlimited)', 'Candidate comparison tools'],
  },
  platinum: {
    color: 'cyan',
    features: ['Unrestricted database access', 'Smart hiring support', 'Recruitment counselling sessions', 'Job fit comparisons', 'Priority support', 'Job description drafting support'],
  },
}

export const PAYMENT_METHOD_ICONS = {
  card: CreditCard,
  apple_pay: Wallet,
  benefit_pay: Landmark,
}

export const SAMPLE_INVOICES = [
  { date: '2026-03-01', amount: 28, plan: 'Platinum', status: 'Paid' },
  { date: '2026-02-01', amount: 28, plan: 'Platinum', status: 'Paid' },
  { date: '2026-01-01', amount: 23, plan: 'Gold', status: 'Paid' },
]
