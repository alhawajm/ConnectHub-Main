# ConnectHub

ConnectHub is a full-stack professional networking, hiring, and freelance marketplace platform built for the Bahrain market. It brings together employers, job seekers, freelancers, and administrators in one product, with role-based dashboards, AI-assisted workflows, messaging, portfolio tooling, and service-focused business pages.

The application is built with Next.js 14, Supabase, Tailwind CSS, and Anthropic-powered AI endpoints.

## Overview

ConnectHub combines multiple product areas inside a single platform:

- Job discovery and hiring for employers and job seekers
- Freelance project discovery, proposals, and client delivery workflows
- Portfolio and CV building tools
- Real-time messaging and notifications
- AI-assisted matching, proposal writing, and profile content generation
- Admin tools for platform oversight, moderation, and analytics
- Service pages for career guidance, recruitment counselling, and business continuity

## Core Features

### Public Experience

- Landing page with platform overview, pricing, services, and conversion sections
- Pricing page with subscription tiers and one-time add-on services
- Dedicated pages for:
  - Career Guidance
  - Recruitment Counselling
  - Business Continuity
- Authentication pages for sign in and registration

### Employer Features

- Employer dashboard with hiring overview and analytics
- Job posting and candidate review flows
- Application tracking and hiring funnel visibility
- AI-assisted candidate matching and job description support
- Messaging with applicants and platform users

### Job Seeker Features

- Seeker dashboard for applications, saved jobs, and AI matches
- Job search and application workflow
- Portfolio and CV management
- Career guidance access
- Messaging and profile management

### Freelancer Features

- Freelancer dashboard for projects, proposals, and earnings
- Browse projects, submit proposals, and manage active work
- Portfolio builder and public profile support
- Contracts, disputes, reviews, and finance-related views
- Messaging and client communication

### Admin Features

- Admin dashboard with platform-wide overview
- User management and content moderation
- Oversight for job posts, freelance projects, disputes, and payments
- Platform analytics and operational monitoring

### AI Features

- AI CV and profile content generation
- AI proposal drafting for freelancers
- AI job and candidate matching endpoints
- AI-assisted hiring and profile optimization workflows

## User Roles

| Role | Main Dashboard | Primary Capabilities |
| --- | --- | --- |
| Employer | `/dashboard/employer` | Post jobs, review applicants, manage hiring pipeline, view analytics |
| Job Seeker | `/dashboard/seeker` | Search jobs, manage applications, build CV and portfolio, receive AI matches |
| Freelancer | `/dashboard/freelancer` | Browse projects, send proposals, manage active work, track earnings |
| Admin | `/dashboard/admin` | Manage users, moderate content, review disputes, monitor platform health |

## Pricing Model

The project documents define the following pricing structure:

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
| AI | Anthropic SDK |
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

## Environment Variables

Copy `.env.local.example` to `.env.local` and provide the required values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ConnectHub
```

Optional email-related variables can be added later if notification delivery is expanded.

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

### 3. Configure AI access

Add your Anthropic API key to `.env.local`.

### 4. Start the development server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Deployment

The project is ready to deploy on Vercel.

Recommended deployment steps:

1. Create a new Vercel project connected to this repository.
2. Add all required environment variables from `.env.local`.
3. Ensure Supabase production credentials are configured correctly.
4. Run a production deployment from the `main` branch.

## Current Application Status

The codebase has recently been stabilized and cleaned up, including:

- dashboard navigation consistency improvements
- dark mode and shared theme repairs
- restored portfolio, project details, and job details routes
- cleaned malformed route artifacts
- successful production build verification

## Notes

- `.env.local` is intentionally ignored and must not be committed.
- Local runtime files such as logs and PID files are ignored.
- If you are setting this up on a fresh machine, always create your local environment file before running authenticated or AI-dependent flows.

## License

This project is currently maintained as a private product codebase for ConnectHub.
