-- ============================================================
-- ConnectHub — Seed Data for Development / Demo
-- Run AFTER schema.sql
-- ============================================================
-- NOTE: This seed creates demo DATA only.
-- Demo user accounts must be created via Supabase Auth UI or
-- the /register page — Supabase Auth passwords cannot be
-- seeded via SQL. Use these emails with the /register page:
--
--   hr@techmark.bh        → role: employer
--   yusuf@email.bh        → role: seeker
--   sara@designbh.com     → role: freelancer
--   admin@connecthub.bh   → role: admin
-- ============================================================

-- ── SAMPLE JOB LISTINGS ─────────────────────────────────────────
-- These will be created by the employer account after signing up.
-- Example insert (replace <employer_profile_id> with actual UUID):

/*
insert into jobs (employer_id, title, description, requirements, job_type, work_model, location,
                  salary_min, salary_max, skills_required, status, department)
values
  ('<employer_profile_id>',
   'Senior React Developer',
   'We are looking for a Senior React Developer to join TechMark Ltd. You will be responsible for building and maintaining high-quality web applications for our clients across Bahrain and the GCC region. You will work closely with our product and design teams to deliver exceptional user experiences.',
   'Minimum 5 years of React experience. Strong TypeScript skills. Experience with Next.js, Node.js, and cloud platforms (AWS/GCP). Excellent communication skills in English and Arabic preferred.',
   'full_time', 'hybrid', 'Manama, Bahrain',
   2200, 2800,
   ARRAY['React', 'TypeScript', 'Node.js', 'AWS', 'Next.js'],
   'active', 'Engineering'),

  ('<employer_profile_id>',
   'Product Designer (UI/UX)',
   'TechMark Ltd. is seeking a talented Product Designer to create beautiful, intuitive digital experiences. You will own the design process from discovery to delivery, working with developers and stakeholders.',
   '3+ years of product design experience. Proficiency in Figma. Strong portfolio demonstrating UX thinking.',
   'full_time', 'hybrid', 'Seef, Bahrain',
   1500, 2000,
   ARRAY['Figma', 'UX Research', 'Prototyping', 'Adobe XD', 'User Testing'],
   'active', 'Design'),

  ('<employer_profile_id>',
   'DevOps Engineer',
   'We need a DevOps Engineer to manage our cloud infrastructure, CI/CD pipelines, and container orchestration. You will ensure 99.9% uptime for our production systems serving thousands of users.',
   '4+ years DevOps experience. Kubernetes, Docker, Terraform. AWS certified preferred.',
   'full_time', 'remote', 'Remote — Bahrain based',
   2000, 2500,
   ARRAY['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Linux'],
   'active', 'Infrastructure'),

  ('<employer_profile_id>',
   'Data Analyst',
   'Join our data team to transform raw business data into actionable insights. You will build dashboards, run analyses, and present findings to senior leadership.',
   'Proficiency in Python, SQL, and Power BI. Experience with large datasets. Strong analytical and presentation skills.',
   'full_time', 'on_site', 'Manama, Bahrain',
   1400, 1900,
   ARRAY['Python', 'SQL', 'Power BI', 'Excel', 'Data Visualization'],
   'active', 'Data'),

  ('<employer_profile_id>',
   'Marketing Manager',
   'Lead our marketing function to build the ConnectHub brand across Bahrain and GCC. You will manage campaigns, partnerships, and growth strategy.',
   '5+ years marketing experience. Digital marketing, SEO, content strategy. B2B and B2C experience preferred.',
   'full_time', 'on_site', 'Manama, Bahrain',
   1800, 2400,
   ARRAY['Digital Marketing', 'SEO', 'Content Strategy', 'Social Media', 'Analytics'],
   'active', 'Marketing');
*/

-- ── SAMPLE FREELANCE PROJECTS ────────────────────────────────────
/*
insert into projects (client_id, title, description, category, skills_required,
                      budget_type, budget_min, budget_max, duration, experience_level, status)
values
  ('<client_profile_id>',
   'E-Commerce Website Redesign',
   'Full redesign of our Bahrain e-commerce platform. Mobile-first UX, new checkout flow, improved product pages. We want a modern, fast, and accessible experience for our customers.',
   'Web Development',
   ARRAY['React', 'Figma', 'Next.js', 'Tailwind CSS', 'UI/UX'],
   'fixed', 800, 1200, '4-6 weeks', 'mid', 'open'),

  ('<client_profile_id>',
   'Brand Identity Design — Startup',
   'We need a complete brand identity for a new fintech startup launching in Bahrain. Logo, color palette, typography, brand guidelines document, and social media templates.',
   'Graphic Design',
   ARRAY['Logo Design', 'Branding', 'Adobe Illustrator', 'Brand Guidelines'],
   'fixed', 300, 600, '2-3 weeks', 'mid', 'open'),

  ('<client_profile_id>',
   'Arabic + English Copywriting — Real Estate',
   'Website copywriting for a luxury real estate company. 10 pages of bilingual content (Arabic & English). Professional, persuasive tone targeting high-net-worth individuals.',
   'Content Writing',
   ARRAY['Copywriting', 'Arabic', 'English', 'Real Estate', 'SEO'],
   'fixed', 200, 400, '1-2 weeks', 'junior', 'open'),

  ('<client_profile_id>',
   'iOS App — Restaurant Ordering',
   'Native iOS app for a restaurant chain in Bahrain. Features: menu browsing, ordering, BenefitPay integration, loyalty points, order tracking. We have designs ready.',
   'Mobile Development',
   ARRAY['Swift', 'iOS', 'SwiftUI', 'REST API', 'BenefitPay'],
   'fixed', 2000, 4000, '8-12 weeks', 'senior', 'open'),

  ('<client_profile_id>',
   'Social Media Management — 3 Months',
   'Manage Instagram, LinkedIn, and X for a growing Bahraini F&B brand. Content creation (Arabic + English), scheduling, community management, monthly performance reports.',
   'Digital Marketing',
   ARRAY['Social Media', 'Content Creation', 'Arabic', 'Canva', 'Analytics'],
   'hourly', 8, 15, '3 months (ongoing)', 'mid', 'open');
*/

-- ── QUICK REFERENCE ──────────────────────────────────────────────
-- Freelance categories used in the platform:
-- 'Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design',
-- 'Digital Marketing', 'Content Writing', 'Data & Analytics', 'Video Production',
-- 'Photography', 'Translation (Arabic/English)', 'Business Consulting',
-- 'Accounting & Finance', 'Legal', 'Architecture', 'Engineering', 'Other'
