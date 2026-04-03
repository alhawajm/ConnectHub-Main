#!/usr/bin/env node
// ConnectHub - One-time demo journey setup
// Usage: node --env-file=.env.local scripts/setup.js

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''
const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || 'development'
const DEMO_SEED_ENABLED = process.env.ENABLE_DEMO_SEED === 'true'
const FORCE_DEMO_SEED = process.env.FORCE_DEMO_SEED === 'true'

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars. Run: node --env-file=.env.local scripts/setup.js')
  process.exit(1)
}

const isLocalTarget = /localhost|127\.0\.0\.1/i.test(APP_URL)

if (!DEMO_SEED_ENABLED && !FORCE_DEMO_SEED) {
  console.error('Demo seed is disabled. Set ENABLE_DEMO_SEED=true to run this script intentionally.')
  process.exit(1)
}

if ((APP_ENV === 'production' || !isLocalTarget) && !FORCE_DEMO_SEED) {
  console.error('Refusing to seed demo data against a non-local or production-like environment. Use FORCE_DEMO_SEED=true only if you intentionally want that behavior.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_USERS = [
  {
    email: 'hr@techmark.bh',
    password: 'TechMark2026!',
    role: 'employer',
    full_name: 'Sarah Al-Mahmoud',
    headline: 'HR Manager at TechMark Ltd.',
    location: 'Manama, Bahrain',
    skills: ['Hiring', 'Recruitment', 'People Operations', 'Employer Branding'],
    plan: 'gold',
    employer: { company_name: 'TechMark Ltd.', industry: 'Technology', company_size: '51-200' },
  },
  {
    email: 'yusuf@email.bh',
    password: 'Seeker2026!',
    role: 'seeker',
    full_name: 'Yusuf Al-Khalifa',
    headline: 'Senior React Developer',
    location: 'Riffa, Bahrain',
    skills: ['React', 'TypeScript', 'Node.js', 'Next.js', 'AWS', 'REST APIs'],
    plan: 'free',
    seeker: {
      experience_years: 5,
      availability: 'available',
      salary_expectation_min: 2000,
      salary_expectation_max: 2800,
      education: 'BSc Computer Science - University of Bahrain',
    },
  },
  {
    email: 'sara@designbh.com',
    password: 'Sara2026!',
    role: 'freelancer',
    full_name: 'Sara Hassan',
    headline: 'UI/UX Designer and Brand Consultant',
    location: 'Seef, Bahrain',
    skills: ['Figma', 'UI/UX', 'Branding', 'Adobe XD', 'Logo Design', 'Design Systems'],
    plan: 'platinum',
    freelancer: {
      hourly_rate: 25,
      categories: ['UI/UX Design', 'Graphic Design'],
      rating: 4.9,
      review_count: 47,
      completion_rate: 98,
      total_earned: 4240,
      wallet_balance: 1240,
      availability: 'available',
    },
  },
  {
    email: 'admin@connecthub.bh',
    password: 'Admin@2026!',
    role: 'admin',
    full_name: 'ConnectHub Admin',
    headline: 'Platform Administrator',
    location: 'Manama, Bahrain',
    skills: ['Operations', 'Moderation', 'Analytics'],
    plan: 'platinum',
  },
]

function canonicalParticipants(a, b) {
  return [a, b].sort()
}

function makeJobs(employerId) {
  return [
    {
      employer_id: employerId,
      title: 'Senior React Developer',
      description: 'Lead the frontend experience for enterprise products used across Bahrain and the GCC. Work closely with product, design, and platform teams on a modern Next.js stack.',
      requirements: '5+ years React experience. Strong TypeScript, Next.js, API integration, and cloud deployment understanding. Arabic is a plus.',
      job_type: 'full_time',
      work_model: 'hybrid',
      location: 'Manama, Bahrain',
      salary_min: 2200,
      salary_max: 2800,
      skills_required: ['React', 'TypeScript', 'Next.js', 'Node.js', 'AWS'],
      status: 'active',
      department: 'Engineering',
      experience_min: 5,
    },
    {
      employer_id: employerId,
      title: 'Frontend Engineer',
      description: 'Build scalable customer-facing interfaces for financial and digital commerce platforms with a strong focus on performance and accessibility.',
      requirements: '3+ years of React. Good JavaScript fundamentals. Experience with design systems and API-driven interfaces.',
      job_type: 'full_time',
      work_model: 'remote',
      location: 'Remote - Bahrain based',
      salary_min: 1800,
      salary_max: 2300,
      skills_required: ['React', 'JavaScript', 'CSS', 'REST APIs'],
      status: 'active',
      department: 'Engineering',
      experience_min: 3,
    },
    {
      employer_id: employerId,
      title: 'Product Designer (UI/UX)',
      description: 'Own the product design workflow from discovery to polished high-fidelity delivery across mobile and web products.',
      requirements: '3+ years product design. Strong Figma portfolio and UX thinking. Comfortable working with engineers.',
      job_type: 'full_time',
      work_model: 'hybrid',
      location: 'Seef, Bahrain',
      salary_min: 1500,
      salary_max: 2000,
      skills_required: ['Figma', 'UX Research', 'Prototyping', 'User Testing'],
      status: 'active',
      department: 'Design',
      experience_min: 3,
    },
    {
      employer_id: employerId,
      title: 'Data Analyst',
      description: 'Support leadership teams with dashboards, reporting, and business insight generation from product and commercial data.',
      requirements: 'Strong SQL and Power BI. Comfortable presenting findings and building executive-facing dashboards.',
      job_type: 'full_time',
      work_model: 'on_site',
      location: 'Manama, Bahrain',
      salary_min: 1400,
      salary_max: 1900,
      skills_required: ['SQL', 'Power BI', 'Excel', 'Data Visualization'],
      status: 'active',
      department: 'Data',
      experience_min: 2,
    },
    {
      employer_id: employerId,
      title: 'Marketing Manager',
      description: 'Drive digital campaigns, partnerships, and growth strategy for a fast-growing Bahrain-based platform.',
      requirements: '5+ years in digital marketing. SEO, content strategy, analytics, and campaign planning experience required.',
      job_type: 'full_time',
      work_model: 'on_site',
      location: 'Manama, Bahrain',
      salary_min: 1800,
      salary_max: 2400,
      skills_required: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'],
      status: 'active',
      department: 'Marketing',
      experience_min: 5,
    },
  ]
}

function makeProjects(clientId) {
  return [
    {
      client_id: clientId,
      title: 'E-Commerce Website Redesign',
      description: 'Redesign a Bahrain-focused e-commerce storefront with stronger mobile conversion, clearer product pages, and a more premium look and feel.',
      category: 'Design',
      skills_required: ['Figma', 'UI/UX', 'Design Systems', 'Prototyping'],
      budget_type: 'fixed',
      budget_min: 800,
      budget_max: 1200,
      duration: '4-6 weeks',
      experience_level: 'mid',
      status: 'in_progress',
    },
    {
      client_id: clientId,
      title: 'Brand Identity For Fintech Startup',
      description: 'Create a complete identity system for a new Bahrain fintech startup including logo, palette, typography, and launch assets.',
      category: 'Design',
      skills_required: ['Branding', 'Logo Design', 'Adobe Illustrator', 'Brand Guidelines'],
      budget_type: 'fixed',
      budget_min: 300,
      budget_max: 600,
      duration: '2-3 weeks',
      experience_level: 'mid',
      status: 'open',
    },
    {
      client_id: clientId,
      title: 'Arabic And English Website Copy',
      description: 'Write polished bilingual website copy for a premium real estate brand targeting high-value customers across Bahrain.',
      category: 'Writing',
      skills_required: ['Copywriting', 'Arabic', 'English', 'SEO'],
      budget_type: 'fixed',
      budget_min: 200,
      budget_max: 400,
      duration: '1-2 weeks',
      experience_level: 'entry',
      status: 'open',
    },
    {
      client_id: clientId,
      title: 'Restaurant Ordering iOS App',
      description: 'Build an iOS ordering experience for a Bahrain restaurant group with menu browsing, loyalty features, and payment integration.',
      category: 'Development',
      skills_required: ['Swift', 'iOS', 'REST API', 'Payment Integration'],
      budget_type: 'fixed',
      budget_min: 2000,
      budget_max: 4000,
      duration: '8-12 weeks',
      experience_level: 'senior',
      status: 'open',
    },
    {
      client_id: clientId,
      title: 'Social Media Management Retainer',
      description: 'Manage content planning, publishing, reporting, and community engagement for a Bahrain food brand over three months.',
      category: 'Marketing',
      skills_required: ['Social Media', 'Content Creation', 'Canva', 'Analytics'],
      budget_type: 'hourly',
      budget_min: 8,
      budget_max: 15,
      duration: '3 months',
      experience_level: 'mid',
      status: 'open',
    },
    {
      client_id: clientId,
      title: 'Completed Product Launch Visuals',
      description: 'Design launch visuals and social media motion assets for a successful digital product release.',
      category: 'Design',
      skills_required: ['Figma', 'Branding', 'Creative Direction'],
      budget_type: 'fixed',
      budget_min: 500,
      budget_max: 900,
      duration: '3 weeks',
      experience_level: 'mid',
      status: 'completed',
    },
  ]
}

async function ensureUsers() {
  const ids = {}

  for (const user of DEMO_USERS) {
    process.stdout.write(`Ensuring ${user.email} ... `)

    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { role: user.role, full_name: user.full_name },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already')) {
        const { data: list } = await supabase.auth.admin.listUsers()
        const existing = list?.users?.find(entry => entry.email === user.email)
        if (!existing) throw new Error(`Could not find existing auth user for ${user.email}`)
        ids[user.role] = existing.id
        console.log('already exists')
      } else {
        throw error
      }
    } else {
      ids[user.role] = data.user.id
      console.log('created')
    }
  }

  return ids
}

async function upsertProfiles(ids) {
  console.log('\nUpdating profiles and role tables...')

  for (const user of DEMO_USERS) {
    const id = ids[user.role]
    if (!id) continue

    const { error: profileError } = await supabase.from('profiles').upsert({
      id,
      role: user.role,
      full_name: user.full_name,
      headline: user.headline,
      location: user.location,
      skills: user.skills || [],
      plan: user.plan || 'free',
      is_verified: true,
      is_active: true,
    })

    if (profileError) throw profileError

    if (user.employer) {
      const { error } = await supabase.from('employer_profiles').upsert({ id, ...user.employer })
      if (error) throw error
    }

    if (user.seeker) {
      const { error } = await supabase.from('seeker_profiles').upsert({ id, ...user.seeker })
      if (error) throw error
    }

    if (user.freelancer) {
      const { error } = await supabase.from('freelancer_profiles').upsert({ id, ...user.freelancer })
      if (error) throw error
    }
  }
}

async function resetDemoData(ids) {
  console.log('\nClearing previous demo journey data...')

  const participants = Object.values(ids)
  const employerId = ids.employer
  const seekerId = ids.seeker
  const freelancerId = ids.freelancer

  await supabase.from('reviews').delete().or(`reviewer_id.eq.${freelancerId},reviewee_id.eq.${freelancerId}`)
  await supabase.from('escrow').delete().or(`from_user_id.eq.${employerId},to_user_id.eq.${freelancerId}`)
  await supabase.from('milestones').delete().gte('created_at', '2000-01-01')
  await supabase.from('disputes').delete().or(`raised_by.eq.${freelancerId},against.eq.${freelancerId},raised_by.eq.${employerId},against.eq.${employerId}`)
  await supabase.from('contracts').delete().or(`client_id.eq.${employerId},freelancer_id.eq.${freelancerId}`)
  await supabase.from('proposals').delete().eq('freelancer_id', freelancerId)
  await supabase.from('applications').delete().eq('seeker_id', seekerId)
  await supabase.from('saved_jobs').delete().eq('seeker_id', seekerId)
  await supabase.from('notifications').delete().in('user_id', participants)
  await supabase.from('job_alerts').delete().eq('user_id', seekerId)

  const [seekerP1, seekerP2] = canonicalParticipants(employerId, seekerId)
  const [freelancerP1, freelancerP2] = canonicalParticipants(employerId, freelancerId)
  await supabase.from('conversations').delete().or(`and(participant_1.eq.${seekerP1},participant_2.eq.${seekerP2}),and(participant_1.eq.${freelancerP1},participant_2.eq.${freelancerP2})`)

  await supabase.from('jobs').delete().eq('employer_id', employerId)
  await supabase.from('projects').delete().eq('client_id', employerId)
}

async function seedJobsAndProjects(ids) {
  console.log('\nSeeding jobs and projects...')

  const { data: jobs, error: jobError } = await supabase.from('jobs').insert(makeJobs(ids.employer)).select()
  if (jobError) throw jobError

  const { data: projects, error: projectError } = await supabase.from('projects').insert(makeProjects(ids.employer)).select()
  if (projectError) throw projectError

  return { jobs: jobs || [], projects: projects || [] }
}

async function seedSeekerJourney(ids, jobs) {
  console.log('\nSeeding seeker journey...')

  const jobByTitle = Object.fromEntries(jobs.map(job => [job.title, job]))

  const { error: appError } = await supabase.from('applications').insert([
    {
      job_id: jobByTitle['Senior React Developer'].id,
      seeker_id: ids.seeker,
      cover_letter: 'I have 5 years of React and Next.js experience delivering production applications for fintech and retail teams in Bahrain.',
      status: 'shortlisted',
      ai_match_score: 92,
      employer_notes: 'Strong technical fit. Move to interview.',
    },
    {
      job_id: jobByTitle['Frontend Engineer'].id,
      seeker_id: ids.seeker,
      cover_letter: 'Comfortable building API-driven interfaces and reusable UI systems with React and TypeScript.',
      status: 'interview',
      ai_match_score: 87,
      employer_notes: 'Interview scheduled for technical review.',
    },
    {
      job_id: jobByTitle['Data Analyst'].id,
      seeker_id: ids.seeker,
      cover_letter: 'Interested in using product thinking and reporting skills in a data-heavy environment.',
      status: 'reviewed',
      ai_match_score: 42,
      employer_notes: 'Limited analytics depth compared with frontend strengths.',
    },
  ])
  if (appError) throw appError

  const { error: savedError } = await supabase.from('saved_jobs').insert([
    { seeker_id: ids.seeker, job_id: jobByTitle['Product Designer (UI/UX)'].id },
    { seeker_id: ids.seeker, job_id: jobByTitle['Marketing Manager'].id },
  ])
  if (savedError) throw savedError

  const { error: alertError } = await supabase.from('job_alerts').insert({
    user_id: ids.seeker,
    keywords: 'React, Frontend, Next.js',
    location: 'Bahrain',
    job_type: 'full_time',
    salary_min: 1800,
    is_active: true,
  })
  if (alertError) throw alertError
}

async function seedFreelancerJourney(ids, projects) {
  console.log('\nSeeding freelancer journey...')

  const projectByTitle = Object.fromEntries(projects.map(project => [project.title, project]))

  const { data: proposals, error: proposalError } = await supabase.from('proposals').insert([
    {
      project_id: projectByTitle['E-Commerce Website Redesign'].id,
      freelancer_id: ids.freelancer,
      cover_letter: 'I specialize in high-conversion ecommerce UX and can deliver an actionable design system alongside polished Figma files.',
      bid_amount: 1100,
      delivery_days: 28,
      status: 'accepted',
      ai_generated: true,
    },
    {
      project_id: projectByTitle['Brand Identity For Fintech Startup'].id,
      freelancer_id: ids.freelancer,
      cover_letter: 'I can build a premium launch-ready identity system with social kits and brand documentation.',
      bid_amount: 540,
      delivery_days: 16,
      status: 'pending',
      ai_generated: false,
    },
    {
      project_id: projectByTitle['Social Media Management Retainer'].id,
      freelancer_id: ids.freelancer,
      cover_letter: 'I can lead the visual content and campaign templates for the first quarter of engagement.',
      bid_amount: 12,
      delivery_days: 90,
      status: 'rejected',
      ai_generated: false,
    },
    {
      project_id: projectByTitle['Completed Product Launch Visuals'].id,
      freelancer_id: ids.freelancer,
      cover_letter: 'I can deliver polished launch assets, motion variations, and reusable templates for your team.',
      bid_amount: 820,
      delivery_days: 21,
      status: 'accepted',
      ai_generated: false,
    },
  ]).select()
  if (proposalError) throw proposalError

  const proposalByProjectId = Object.fromEntries(proposals.map(proposal => [proposal.project_id, proposal]))

  const { data: contracts, error: contractError } = await supabase.from('contracts').insert([
    {
      project_id: projectByTitle['E-Commerce Website Redesign'].id,
      proposal_id: proposalByProjectId[projectByTitle['E-Commerce Website Redesign'].id].id,
      client_id: ids.employer,
      freelancer_id: ids.freelancer,
      title: 'TechMark Ecommerce Redesign',
      amount: 1100,
      status: 'active',
    },
    {
      project_id: projectByTitle['Completed Product Launch Visuals'].id,
      proposal_id: proposalByProjectId[projectByTitle['Completed Product Launch Visuals'].id].id,
      client_id: ids.employer,
      freelancer_id: ids.freelancer,
      title: 'Launch Visuals Delivery',
      amount: 820,
      status: 'completed',
    },
  ]).select()
  if (contractError) throw contractError

  const contractByTitle = Object.fromEntries(contracts.map(contract => [contract.title, contract]))

  const { data: milestones, error: milestoneError } = await supabase.from('milestones').insert([
    {
      contract_id: contractByTitle['TechMark Ecommerce Redesign'].id,
      title: 'Wireframes and Information Architecture',
      description: 'Initial UX structure, user journeys, and responsive wireframes.',
      amount: 400,
      status: 'approved',
    },
    {
      contract_id: contractByTitle['TechMark Ecommerce Redesign'].id,
      title: 'High-Fidelity UI Design System',
      description: 'Core visual language, reusable components, and page mockups.',
      amount: 700,
      status: 'in_progress',
    },
  ]).select()
  if (milestoneError) throw milestoneError

  const milestoneByTitle = Object.fromEntries(milestones.map(milestone => [milestone.title, milestone]))

  const { error: escrowError } = await supabase.from('escrow').insert([
    {
      contract_id: contractByTitle['TechMark Ecommerce Redesign'].id,
      milestone_id: milestoneByTitle['Wireframes and Information Architecture'].id,
      from_user_id: ids.employer,
      to_user_id: ids.freelancer,
      amount: 400,
      status: 'released',
      released_at: new Date().toISOString(),
    },
    {
      contract_id: contractByTitle['TechMark Ecommerce Redesign'].id,
      milestone_id: milestoneByTitle['High-Fidelity UI Design System'].id,
      from_user_id: ids.employer,
      to_user_id: ids.freelancer,
      amount: 700,
      status: 'held',
    },
  ])
  if (escrowError) throw escrowError

  const { error: reviewError } = await supabase.from('reviews').insert({
    contract_id: contractByTitle['Launch Visuals Delivery'].id,
    reviewer_id: ids.employer,
    reviewee_id: ids.freelancer,
    rating: 5,
    comment: 'Excellent quality, clear communication, and on-time delivery throughout the launch cycle.',
  })
  if (reviewError) throw reviewError

  const { error: disputeError } = await supabase.from('disputes').insert({
    contract_id: contractByTitle['TechMark Ecommerce Redesign'].id,
    raised_by: ids.freelancer,
    against: ids.employer,
    reason: 'Clarification on milestone scope',
    details: 'The second milestone expanded beyond the original design system scope and is awaiting admin clarification.',
    status: 'open',
    amount_disputed: 250,
  })
  if (disputeError) throw disputeError
}

async function seedConversations(ids) {
  console.log('\nSeeding conversations and messages...')

  const [seekerP1, seekerP2] = canonicalParticipants(ids.employer, ids.seeker)
  const [freelancerP1, freelancerP2] = canonicalParticipants(ids.employer, ids.freelancer)

  const { data: seekerConversation, error: seekerConversationError } = await supabase
    .from('conversations')
    .insert({
      participant_1: seekerP1,
      participant_2: seekerP2,
      last_message: 'Please confirm your availability for Thursday at 10:00am.',
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (seekerConversationError) throw seekerConversationError

  const { data: freelancerConversation, error: freelancerConversationError } = await supabase
    .from('conversations')
    .insert({
      participant_1: freelancerP1,
      participant_2: freelancerP2,
      last_message: 'The approved wireframes are uploaded. Next, I will move into the design system screens.',
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (freelancerConversationError) throw freelancerConversationError

  const { error: messageError } = await supabase.from('messages').insert([
    {
      conversation_id: seekerConversation.id,
      sender_id: ids.employer,
      content: 'Thanks for applying. Your profile is a strong fit for our frontend role.',
    },
    {
      conversation_id: seekerConversation.id,
      sender_id: ids.seeker,
      content: 'Appreciate it. I am available for the technical interview this week.',
    },
    {
      conversation_id: seekerConversation.id,
      sender_id: ids.employer,
      content: 'Please confirm your availability for Thursday at 10:00am.',
    },
    {
      conversation_id: freelancerConversation.id,
      sender_id: ids.employer,
      content: 'We are happy with the first milestone and have released the payment.',
    },
    {
      conversation_id: freelancerConversation.id,
      sender_id: ids.freelancer,
      content: 'The approved wireframes are uploaded. Next, I will move into the design system screens.',
    },
  ])
  if (messageError) throw messageError
}

async function seedNotifications(ids) {
  console.log('\nSeeding notifications...')

  const notifications = [
    {
      user_id: ids.employer,
      type: 'application',
      title: 'New shortlisted application',
      body: 'Yusuf Al-Khalifa moved to shortlisted for Senior React Developer.',
      link: '/dashboard/employer',
    },
    {
      user_id: ids.employer,
      type: 'proposal',
      title: 'Milestone update received',
      body: 'Sara Hassan submitted the updated ecommerce design system milestone.',
      link: '/dashboard/freelancer',
    },
    {
      user_id: ids.seeker,
      type: 'application',
      title: 'Interview scheduled',
      body: 'Your Frontend Engineer application has moved to interview stage.',
      link: '/dashboard/seeker',
    },
    {
      user_id: ids.seeker,
      type: 'match',
      title: 'Strong AI match available',
      body: 'Senior React Developer is a high-fit role based on your skills and salary preference.',
      link: '/job-matching',
    },
    {
      user_id: ids.freelancer,
      type: 'proposal',
      title: 'Proposal accepted',
      body: 'Your proposal for E-Commerce Website Redesign has been accepted.',
      link: '/dashboard/freelancer',
    },
    {
      user_id: ids.freelancer,
      type: 'payment',
      title: 'Escrow funded',
      body: 'A new escrow payment is being held for your active milestone.',
      link: '/dashboard/freelancer',
    },
    {
      user_id: ids.admin,
      type: 'dispute',
      title: 'Open dispute requires review',
      body: 'A milestone scope clarification dispute is awaiting admin review.',
      link: '/dashboard/admin',
    },
  ]

  const { error } = await supabase.from('notifications').insert(notifications)
  if (error) throw error
}

async function main() {
  console.log('ConnectHub - preparing complete demo journey data\n')

  const ids = await ensureUsers()
  await upsertProfiles(ids)
  await resetDemoData(ids)
  const { jobs, projects } = await seedJobsAndProjects(ids)
  await seedSeekerJourney(ids, jobs)
  await seedFreelancerJourney(ids, projects)
  await seedConversations(ids)
  await seedNotifications(ids)

  console.log('\nDemo data ready.\n')
  console.log('Accounts:')
  console.log('  hr@techmark.bh      / TechMark2026!  -> Employer and project client')
  console.log('  yusuf@email.bh      / Seeker2026!    -> Job seeker with applications, saved jobs, and matches')
  console.log('  sara@designbh.com   / Sara2026!      -> Freelancer with proposals, contract, review, and escrow')
  console.log('  admin@connecthub.bh / Admin@2026!    -> Admin with notifications and dispute visibility')
  console.log('\nSeeded journey highlights:')
  console.log('  - employer job posts and candidate pipeline')
  console.log('  - seeker applications, interview stage, and saved jobs')
  console.log('  - freelancer proposals, accepted contract, milestones, escrow, and review')
  console.log('  - employer-seeker and employer-freelancer messages')
  console.log('  - notifications and one open dispute for admin review')
}

main().catch(error => {
  console.error('\nSetup failed:', error.message || error)
  process.exit(1)
})
