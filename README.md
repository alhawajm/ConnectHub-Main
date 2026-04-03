# ConnectHub

ConnectHub is a full-stack professional networking, hiring, and freelance marketplace platform built for the Bahrain market. It brings together employers, job seekers, freelancers, and administrators in one product, with role-based dashboards, smart decision-support workflows, messaging, portfolio tooling, escrow-aware freelance operations, and service-focused business pages.

The application is built with Next.js 14, Supabase, Tailwind CSS, and Anthropic-backed drafting and generation endpoints where appropriate.

## Overview

ConnectHub combines multiple product areas inside a single platform:

- Job discovery and hiring for employers and job seekers
- Freelance project discovery, proposals, and client delivery workflows
- Portfolio and CV building tools
- Real-time messaging and notifications
- Smart comparison, drafting, and profile support systems
- Admin tools for platform oversight, moderation, and analytics
- Service pages for career guidance, recruitment counselling, and business continuity
- Demo-mode journeys with role-specific walkthroughs
- Bahrain-ready payment planning with Tap, Apple Pay, and Benefit support

## Core Features

### Public Experience

- Landing page with platform overview, pricing, services, and conversion sections
- Separate production path and demo path from the landing experience
- Pricing page with subscription tiers and one-time add-on services
- Dedicated pages for:
  - Career Guidance
  - Recruitment Counselling
  - Business Continuity
- Portfolio builder, job details, and project details routes
- Authentication pages for sign in and registration

### Employer Features

- Employer dashboard with hiring overview and analytics
- Job posting and candidate review flows
- Application tracking and hiring funnel visibility
- Candidate comparison with fit scoring, match reasons, and side-by-side support
- Smart job description drafting support
- Employer-only subscriptions and billing flows
- Messaging with applicants and platform users

### Job Seeker Features

- Seeker dashboard for applications, saved jobs, and smart matches
- Job search and application workflow
- Portfolio and CV management
- Career guidance and summary drafting support
- Career guidance access
- Messaging and profile management

### Freelancer Features

- Freelancer dashboard for projects, proposals, and earnings
- Browse projects, submit proposals, and manage active work
- Portfolio builder and public profile support
- Contracts, milestones, escrow, disputes, and finance-related views
- Proposal drafting support and delivery workflow visibility
- Messaging and client communication

### Admin Features

- Admin dashboard with platform-wide overview
- User management and content moderation
- Oversight for job posts, freelance projects, disputes, and payments
- Platform analytics and operational monitoring
- Dispute resolution workflow for freelance escrow handling

### Smart System Features

- Candidate comparison instead of auto-selection
- Transparent fit scoring for jobs and applications
- Profile and CV summary drafting
- Proposal draft generation for freelancers
- Smart career guidance prompts and market-aware support
- Explainable role matching rather than black-box recommendations

### Payments and Billing

- Employer-only subscription model
- One-time paid services where applicable
- Tap checkout preparation with card, Apple Pay, and Benefit support
- Payment return handling, receipt preparation, and confirmation email support

### Demo and QA

- Guided role-based demo journeys for employer, seeker, freelancer, and admin
- Walkthrough progress tracking inside dashboards
- Demo seed flow with production guardrails
- Auth/session QA scripts for login, logout, refresh, and account switching

## User Roles

| Role | Main Dashboard | Primary Capabilities |
| --- | --- | --- |
| Employer | `/dashboard/employer` | Post jobs, compare candidates, manage hiring pipeline, view analytics, manage billing |
| Job Seeker | `/dashboard/seeker` | Search jobs, manage applications, build CV and portfolio, receive smart matches |
| Freelancer | `/dashboard/freelancer` | Browse projects, send proposals, manage contracts and escrow, track earnings |
| Admin | `/dashboard/admin` | Manage users, moderate content, review disputes, monitor platform health |

## Pricing Model

The project follows an employer-first paid model:

- Employers can subscribe to hiring plans
- Job seekers remain free users
- Freelancers remain free users
- One-time services are available where relevant

The current documented pricing structure is:

### Subscription Plans

- Silver: `BD 18/month`
- Gold: `BD 23/month`
- Platinum: `BD 28/month`

### One-Time Services

- Single Job Post: `BD 2`
- 10 Job Posts: `BD 15`
- Professional Portfolio: `BD 5`

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 14 App Router, React 18 |
| Styling | Tailwind CSS |
| UI Icons | Lucide React |
| Backend | Next.js route handlers |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Smart Drafting / Generation | Anthropic SDK |
| Charts / Visualization | Recharts |
| PDF / Export Utilities | jsPDF, html2canvas |

## Project Structure

```text
connecthub/
+-- app/
¦   +-- (auth)/
¦   ¦   +-- login/page.js
¦   ¦   +-- register/page.js
¦   +-- api/
¦   ¦   +-- ai/
¦   ¦   +-- applications/
¦   ¦   +-- freelance/
¦   ¦   +-- jobs/
¦   ¦   +-- messages/
¦   ¦   +-- notifications/
¦   ¦   +-- users/
¦   +-- business-continuity/
¦   +-- career-guidance/
¦   +-- chat/
¦   +-- cv-builder/
¦   +-- dashboard/
¦   ¦   +-- admin/
¦   ¦   +-- employer/
¦   ¦   +-- freelancer/
¦   ¦   +-- seeker/
¦   +-- freelance/
¦   +-- job-matching/
¦   +-- jobs/
¦   +-- portfolio-builder/
¦   +-- pricing/
¦   +-- profile/
¦   +-- projects/
¦   +-- recruitment-counselling/
+-- components/
¦   +-- dashboard/
¦   ¦   +-- admin/
¦   ¦   +-- employer/
¦   ¦   +-- freelancer/
¦   ¦   +-- seeker/
¦   ¦   +-- settings/
¦   +-- layout/
¦   +-- ui/
+-- hooks/
+-- lib/
+-- scripts/
+-- supabase/
```

## Database Scope

The Supabase schema covers the main platform entities required for hiring, freelance work, messaging, and billing-related flows, including:

- `profiles`
- `employer_profiles`
- `seeker_profiles`
- `freelancer_profiles`
- `jobs`
- `applications`
- `saved_jobs`
- `projects`
- `proposals`
- `contracts`
- `milestones`
- `escrow`
- `disputes`
- `conversations`
- `messages`
- `reviews`
- `notifications`
- `job_alerts`

Row Level Security is enabled to support role-aware data access patterns.

Additional hardening is included in:

- `supabase/migrations/20260403_auth_rls_indexes.sql`

That migration adds missing RLS policies and performance indexes for protected dashboard and auth query paths.

## Environment Variables

Copy `.env.local.example` to `.env.local` and provide the required values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ConnectHub
NEXT_PUBLIC_ENABLE_DEMO_GUIDE=
ENABLE_DEMO_SEED=
FORCE_DEMO_SEED=
TAP_SECRET_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

Not every variable is required for every feature. For example:

- `TAP_SECRET_KEY` is required for payment checkout flows
- `RESEND_*` variables are required for payment emails
- demo flags control whether guided demo mode is exposed

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql`.
3. Optionally seed demo data from `supabase/seed.sql`.
4. Add your Supabase credentials to `.env.local`.

### 3. Configure smart drafting access

Add your Anthropic API key to `.env.local`.

### 4. Start the development server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Available Scripts

```bash
npm run clean
npm run dev
npm run dev:fresh
npm run build
npm run rebuild
npm run start
npm run start:fresh
npm run lint
npm run demo:seed
```

## Developer Tips

Use this as a quick maintenance cheat sheet when working on the site.

### Daily Workflow

For normal development:

```bash
npm run dev
```

For a clean production-style local run:

```bash
npm run start
```

Before pushing important changes:

```bash
npm run lint
npm run build
```

### Fast Recovery Commands

If the UI loads as raw HTML, styles disappear, or Next assets seem stale:

```bash
npm run dev:fresh
```

If you want a totally fresh production-style rebuild:

```bash
npm run start:fresh
```

If you only want to clear build output:

```bash
npm run clean
```

### Health Checks

Use these as the default project health commands:

```bash
npm run lint
npm run build
```

What they confirm:

- `npm run lint`: code quality, hook usage, import mistakes, common React/Next issues
- `npm run build`: route compilation, server/client bundle health, production readiness

### Demo and Seed Data

To seed the demo journey accounts and records:

```bash
npm run demo:seed
```

Important:

- make sure `.env.local` is configured first
- demo seed is guarded, so use the required demo env flags when needed

### Auth and Session QA

Reusable QA scripts already exist in `scripts/`:

```bash
node scripts/qa-auth-journeys.js
node scripts/qa-auth-session-lifecycle.js
```

Use them after changes to:

- login/register/social auth
- logout and account switching
- role redirects
- dashboard session persistence on refresh

### Recommended Manual Checks

After major UI or auth work, quickly verify:

1. `/`
2. `/login`
3. `/register`
4. `/dashboard`
5. `/dashboard/admin`
6. `/dashboard/employer`
7. `/dashboard/seeker`
8. `/dashboard/freelancer`
9. `/jobs`
10. `/freelance`

Also test:

- login
- logout
- refresh on dashboards
- switching between demo accounts
- back button behavior after auth redirects

### When Working on Sensitive Areas

Use extra care and always run `lint` + `build` after editing:

- `middleware.js`
- `app/(auth)/*`
- `app/dashboard/*`
- `components/layout/DashboardLayout.js`
- `lib/jobMatching.js`
- payment or auth API routes

### Good Maintenance Habit

Use this command sequence as the safe default before commits or deployments:

```bash
npm run lint
npm run build
```

If both pass, the app is usually in a healthy state.

## Avoiding Broken UI During Local Work

If the site ever loads as raw HTML, loses styling, or starts returning missing asset errors, the usual cause is stale Next.js build output in `.next` or an older server process still serving outdated files.

Use these commands to recover quickly:

```bash
npm run dev:fresh
```

This now automatically:

1. stops stale Next.js processes for this project
2. removes the old `.next` folder
3. starts a fresh development server

For a clean production-style local check, use:

```bash
npm run start:fresh
```

This will:

1. remove old `.next` output
2. rebuild the app
3. start the server from the new build

Recommended workflow:

- use `npm run dev` for normal development
- use `npm run start` for a production-style local run
- both commands now automatically stop stale project Next.js processes and clear old `.next` output first
- use `npm run dev:fresh` or `npm run start:fresh` if you want to explicitly use the guarded startup commands yourself
- avoid leaving multiple Next.js servers running on different ports at the same time

## Deployment

The project is ready to deploy on Vercel.

Recommended deployment steps:

1. Create a new Vercel project connected to this repository.
2. Add all required environment variables from `.env.local`.
3. Ensure Supabase production credentials are configured correctly.
4. Configure payment, email, and demo variables only if those features are needed in production.
5. Run a production deployment from the `main` branch.

## Current Application Status

The codebase has recently been stabilized and cleaned up, including:

- dashboard navigation consistency improvements
- dark mode and shared theme repairs
- safe dashboard and auth redirects
- employer and seeker dashboard modular refactors
- settings and billing modular refactor
- restored portfolio, project details, and job details routes
- freelance escrow and dispute workflow support
- demo journey and walkthrough support
- employer-only subscription enforcement
- payment method preparation and receipt/email support
- auth hardening and session lifecycle improvements
- Supabase RLS and index hardening migration
- cleaned malformed route artifacts
- successful production build verification

## Notes

- `.env.local` is intentionally ignored and must not be committed.
- Local runtime files such as logs and PID files are ignored.
- If you are setting this up on a fresh machine, always create your local environment file before running authenticated or AI-dependent flows.

## License

This project is currently maintained as a private product codebase for ConnectHub.

