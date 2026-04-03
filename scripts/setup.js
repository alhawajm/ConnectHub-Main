#!/usr/bin/env node
// ConnectHub — One-time demo data setup
// Usage: node --env-file=.env.local scripts/setup.js

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  Missing env vars. Run: node --env-file=.env.local scripts/setup.js')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Demo users ────────────────────────────────────────────────────────────────
const DEMO_USERS = [
  {
    email: 'hr@techmark.bh',
    password: 'TechMark2026!',
    role: 'employer',
    full_name: 'Sarah Al-Mahmoud',
    headline: 'HR Manager at TechMark Ltd.',
    location: 'Manama, Bahrain',
    employer: { company_name: 'TechMark Ltd.', industry: 'Technology', company_size: '51-200' },
  },
  {
    email: 'yusuf@email.bh',
    password: 'Seeker2026!',
    role: 'seeker',
    full_name: 'Yusuf Al-Khalifa',
    headline: 'Senior React Developer',
    location: 'Riffa, Bahrain',
    skills: ['React', 'TypeScript', 'Node.js', 'Next.js', 'AWS'],
    seeker: { experience_years: 5, availability: 'available', salary_expectation_min: 2000, salary_expectation_max: 2800 },
  },
  {
    email: 'sara@designbh.com',
    password: 'Sara2026!',
    role: 'freelancer',
    full_name: 'Sara Hassan',
    headline: 'UI/UX Designer & Brand Consultant',
    location: 'Seef, Bahrain',
    skills: ['Figma', 'UI/UX', 'Branding', 'Adobe XD', 'Logo Design'],
    freelancer: { hourly_rate: 25, categories: ['UI/UX Design', 'Graphic Design'], rating: 4.9, review_count: 47, completion_rate: 98 },
  },
  {
    email: 'admin@connecthub.bh',
    password: 'Admin@2026!',
    role: 'admin',
    full_name: 'ConnectHub Admin',
    headline: 'Platform Administrator',
    location: 'Manama, Bahrain',
  },
]

// ── Sample jobs ───────────────────────────────────────────────────────────────
function makeJobs(employerId) {
  return [
    {
      employer_id: employerId,
      title: 'Senior React Developer',
      description: 'We are looking for a Senior React Developer to join TechMark Ltd. You will be responsible for building and maintaining high-quality web applications for our clients across Bahrain and the GCC region. You will work closely with our product and design teams to deliver exceptional user experiences.',
      requirements: 'Minimum 5 years of React experience. Strong TypeScript skills. Experience with Next.js, Node.js, and cloud platforms (AWS/GCP). Excellent communication skills in English and Arabic preferred.',
      job_type: 'full_time', work_model: 'hybrid', location: 'Manama, Bahrain',
      salary_min: 2200, salary_max: 2800,
      skills_required: ['React', 'TypeScript', 'Node.js', 'AWS', 'Next.js'],
      status: 'active', department: 'Engineering',
    },
    {
      employer_id: employerId,
      title: 'Product Designer (UI/UX)',
      description: 'TechMark Ltd. is seeking a talented Product Designer to create beautiful, intuitive digital experiences. You will own the design process from discovery to delivery, working with developers and stakeholders.',
      requirements: '3+ years of product design experience. Proficiency in Figma. Strong portfolio demonstrating UX thinking.',
      job_type: 'full_time', work_model: 'hybrid', location: 'Seef, Bahrain',
      salary_min: 1500, salary_max: 2000,
      skills_required: ['Figma', 'UX Research', 'Prototyping', 'Adobe XD', 'User Testing'],
      status: 'active', department: 'Design',
    },
    {
      employer_id: employerId,
      title: 'DevOps Engineer',
      description: 'We need a DevOps Engineer to manage our cloud infrastructure, CI/CD pipelines, and container orchestration. You will ensure 99.9% uptime for our production systems serving thousands of users.',
      requirements: '4+ years DevOps experience. Kubernetes, Docker, Terraform. AWS certified preferred.',
      job_type: 'full_time', work_model: 'remote', location: 'Remote — Bahrain based',
      salary_min: 2000, salary_max: 2500,
      skills_required: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Linux'],
      status: 'active', department: 'Infrastructure',
    },
    {
      employer_id: employerId,
      title: 'Data Analyst',
      description: 'Join our data team to transform raw business data into actionable insights. You will build dashboards, run analyses, and present findings to senior leadership.',
      requirements: 'Proficiency in Python, SQL, and Power BI. Experience with large datasets. Strong analytical and presentation skills.',
      job_type: 'full_time', work_model: 'on_site', location: 'Manama, Bahrain',
      salary_min: 1400, salary_max: 1900,
      skills_required: ['Python', 'SQL', 'Power BI', 'Excel', 'Data Visualization'],
      status: 'active', department: 'Data',
    },
    {
      employer_id: employerId,
      title: 'Marketing Manager',
      description: 'Lead our marketing function to build the ConnectHub brand across Bahrain and GCC. You will manage campaigns, partnerships, and growth strategy.',
      requirements: '5+ years marketing experience. Digital marketing, SEO, content strategy. B2B and B2C experience preferred.',
      job_type: 'full_time', work_model: 'on_site', location: 'Manama, Bahrain',
      salary_min: 1800, salary_max: 2400,
      skills_required: ['Digital Marketing', 'SEO', 'Content Strategy', 'Social Media', 'Analytics'],
      status: 'active', department: 'Marketing',
    },
  ]
}

// ── Sample projects ───────────────────────────────────────────────────────────
function makeProjects(clientId) {
  return [
    {
      client_id: clientId,
      title: 'E-Commerce Website Redesign',
      description: 'Full redesign of our Bahrain e-commerce platform. Mobile-first UX, new checkout flow, improved product pages. We want a modern, fast, and accessible experience for our customers.',
      category: 'Web Development',
      skills_required: ['React', 'Figma', 'Next.js', 'Tailwind CSS', 'UI/UX'],
      budget_type: 'fixed', budget_min: 800, budget_max: 1200,
      duration: '4-6 weeks', experience_level: 'mid', status: 'open',
    },
    {
      client_id: clientId,
      title: 'Brand Identity Design — Startup',
      description: 'We need a complete brand identity for a new fintech startup launching in Bahrain. Logo, color palette, typography, brand guidelines document, and social media templates.',
      category: 'Graphic Design',
      skills_required: ['Logo Design', 'Branding', 'Adobe Illustrator', 'Brand Guidelines'],
      budget_type: 'fixed', budget_min: 300, budget_max: 600,
      duration: '2-3 weeks', experience_level: 'mid', status: 'open',
    },
    {
      client_id: clientId,
      title: 'Arabic + English Copywriting — Real Estate',
      description: 'Website copywriting for a luxury real estate company. 10 pages of bilingual content (Arabic & English). Professional, persuasive tone targeting high-net-worth individuals.',
      category: 'Content Writing',
      skills_required: ['Copywriting', 'Arabic', 'English', 'Real Estate', 'SEO'],
      budget_type: 'fixed', budget_min: 200, budget_max: 400,
      duration: '1-2 weeks', experience_level: 'junior', status: 'open',
    },
    {
      client_id: clientId,
      title: 'iOS App — Restaurant Ordering',
      description: 'Native iOS app for a restaurant chain in Bahrain. Features: menu browsing, ordering, BenefitPay integration, loyalty points, order tracking. We have designs ready.',
      category: 'Mobile Development',
      skills_required: ['Swift', 'iOS', 'SwiftUI', 'REST API', 'BenefitPay'],
      budget_type: 'fixed', budget_min: 2000, budget_max: 4000,
      duration: '8-12 weeks', experience_level: 'senior', status: 'open',
    },
    {
      client_id: clientId,
      title: 'Social Media Management — 3 Months',
      description: 'Manage Instagram, LinkedIn, and X for a growing Bahraini F&B brand. Content creation (Arabic + English), scheduling, community management, monthly performance reports.',
      category: 'Digital Marketing',
      skills_required: ['Social Media', 'Content Creation', 'Arabic', 'Canva', 'Analytics'],
      budget_type: 'hourly', budget_min: 8, budget_max: 15,
      duration: '3 months (ongoing)', experience_level: 'mid', status: 'open',
    },
  ]
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀  ConnectHub — setting up demo data\n')

  const ids = {}

  // 1. Create / find auth users
  for (const u of DEMO_USERS) {
    process.stdout.write(`Creating ${u.email} ... `)
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { role: u.role, full_name: u.full_name },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already')) {
        // user exists — look up their id
        const { data: list } = await supabase.auth.admin.listUsers()
        const existing = list?.users?.find(x => x.email === u.email)
        if (existing) {
          ids[u.role] = existing.id
          console.log('already exists ✓')
        } else {
          console.log(`❌  ${error.message}`)
        }
      } else {
        console.log(`❌  ${error.message}`)
      }
    } else {
      ids[u.role] = data.user.id
      console.log(`✓  (${data.user.id})`)
    }
  }

  // 2. Upsert profiles + role-specific tables
  console.log('\nUpdating profiles...')
  for (const u of DEMO_USERS) {
    const id = ids[u.role]
    if (!id) { console.log(`  ⚠️  Skipping profile for ${u.email} (no id)`); continue }

    const { error: pe } = await supabase.from('profiles').upsert({
      id,
      role: u.role,
      full_name: u.full_name,
      headline: u.headline,
      location: u.location,
      skills: u.skills ?? [],
      is_verified: true,
      is_active: true,
    })
    if (pe) console.log(`  ⚠️  profiles upsert: ${pe.message}`)

    if (u.employer) {
      const { error } = await supabase.from('employer_profiles').upsert({ id, ...u.employer })
      if (error) console.log(`  ⚠️  employer_profiles: ${error.message}`)
    }
    if (u.seeker) {
      const { error } = await supabase.from('seeker_profiles').upsert({ id, ...u.seeker })
      if (error) console.log(`  ⚠️  seeker_profiles: ${error.message}`)
    }
    if (u.freelancer) {
      const { error } = await supabase.from('freelancer_profiles').upsert({ id, ...u.freelancer })
      if (error) console.log(`  ⚠️  freelancer_profiles: ${error.message}`)
    }

    console.log(`  ✓  ${u.email}`)
  }

  // 3. Seed jobs
  const employerId = ids['employer']
  if (employerId) {
    console.log('\nSeeding jobs...')
    // Delete existing jobs by this employer first to avoid dupes on re-run
    await supabase.from('jobs').delete().eq('employer_id', employerId)
    const { error } = await supabase.from('jobs').insert(makeJobs(employerId))
    if (error) console.log(`  ⚠️  jobs: ${error.message}`)
    else console.log(`  ✓  5 jobs inserted`)
  }

  // 4. Seed freelance projects
  const clientId = ids['employer'] // employer also acts as project client
  if (clientId) {
    console.log('\nSeeding freelance projects...')
    await supabase.from('projects').delete().eq('client_id', clientId)
    const { error } = await supabase.from('projects').insert(makeProjects(clientId))
    if (error) console.log(`  ⚠️  projects: ${error.message}`)
    else console.log(`  ✓  5 projects inserted`)
  }

  console.log('\n✅  Done!\n')
  console.log('Demo accounts:')
  console.log('  hr@techmark.bh        / TechMark2026!   → Employer')
  console.log('  yusuf@email.bh        / Seeker2026!     → Job Seeker')
  console.log('  sara@designbh.com     / Sara2026!       → Freelancer')
  console.log('  admin@connecthub.bh   / Admin@2026!     → Admin')
}

main().catch(err => { console.error(err); process.exit(1) })
