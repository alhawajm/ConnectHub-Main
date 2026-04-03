import {
  Briefcase,
  FileText,
  GraduationCap,
  MessageSquare,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'

export const demoGuideEnabled =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_GUIDE === 'true' ||
  process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')

export const homeFeatures = [
  {
    icon: Briefcase,
    title: 'Job Marketplace',
    description: 'Discover full-time, part-time, and contract opportunities with Bahrain-first filtering and AI-assisted matching.',
  },
  {
    icon: Users,
    title: 'Freelance Platform',
    description: 'Connect clients and freelancers with proposal workflows, project discovery, and profile-driven trust signals.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Tools',
    description: 'Strengthen applications with guided CV building, portfolio support, and smarter recommendations.',
  },
  {
    icon: Wallet,
    title: 'Secure Payments',
    description: 'Support milestone-based freelance work with transparent one-time services and platform billing options.',
  },
  {
    icon: TrendingUp,
    title: 'Analytics Dashboard',
    description: 'Track applications, hiring funnel movement, and marketplace activity through role-specific dashboards.',
  },
  {
    icon: MessageSquare,
    title: 'Real-Time Chat',
    description: 'Keep employers, job seekers, freelancers, and admins connected through one messaging experience.',
  },
]

export const audienceCards = [
  {
    title: 'For Job Seekers',
    points: [
      'Job search with role, location, and job-type filters',
      'Saved applications, tracking, and recommendations',
      'Profile, CV, and portfolio building tools',
      'Career guidance and recruitment counselling services',
    ],
    href: '/jobs',
    cta: 'Explore Jobs',
  },
  {
    title: 'For Employers',
    points: [
      'Job posting and candidate pipeline management',
      'Role-based dashboards with hiring analytics',
      'Smarter candidate review workflows',
      'Business continuity and recruitment support',
    ],
    href: '/dashboard/employer',
    cta: 'Open Employer Tools',
  },
]

export const homeServices = [
  {
    icon: GraduationCap,
    title: 'Career Guidance',
    description: 'Structured coaching, readiness planning, and support for professionals entering or advancing in the market.',
    href: '/career-guidance',
  },
  {
    icon: Shield,
    title: 'Business Continuity',
    description: 'Protect critical staffing coverage with continuity planning and rapid talent response services.',
    href: '/business-continuity',
  },
  {
    icon: FileText,
    title: 'Recruitment Counselling',
    description: 'Advisory support for companies and teams refining hiring strategy, process, and role planning.',
    href: '/recruitment-counselling',
  },
]

export const homePlans = [
  { name: 'Silver', price: '18 BHD', description: 'Employer plan for smaller hiring teams starting to post consistently.' },
  { name: 'Gold', price: '23 BHD', description: 'Employer plan for stronger analytics, hiring visibility, and AI support.' },
  { name: 'Platinum', price: '28 BHD', description: 'Employer plan for the full ConnectHub hiring and advisory stack.' },
]

export const homeTestimonials = [
  {
    name: 'Fatima Al-Mansoori',
    role: 'HR Manager, TechMark',
    quote: 'ConnectHub gave our hiring team a clearer funnel, stronger candidate visibility, and a much smoother review process.',
  },
  {
    name: 'Yusuf Al-Ahmed',
    role: 'Software Engineer',
    quote: 'The mix of job search, profile tools, and guided CV support made the platform feel genuinely useful instead of just another job board.',
  },
  {
    name: 'Sara Al-Khalifa',
    role: 'Freelance Designer',
    quote: 'I could showcase work, find freelance opportunities, and keep conversations in one place without juggling multiple tools.',
  },
]
