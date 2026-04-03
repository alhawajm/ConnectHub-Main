# ConnectHub — Bahrain's Professional Network & Freelance Marketplace

A full-stack Next.js 14 web application combining job board, recruitment, and freelance marketplace features — powered by AI via Claude API.

---

## ⚡ Quick Start (5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Go to [supabase.com](https://supabase.com) → Create a new project
2. Go to **SQL Editor** → paste the entire contents of `supabase/schema.sql` → Run it
3. Go to **Settings → API** → copy your Project URL and anon key

### 3. Set up environment variables
```bash
# Copy the example file
copy .env.local.example .env.local
```

Then open `.env.local` and fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Get your Anthropic API key:** [console.anthropic.com](https://console.anthropic.com)

### 4. Run the app
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
connecthub/
├── app/
│   ├── (auth)/
│   │   ├── login/page.js          # Login page
│   │   └── register/page.js       # Registration with role selection
│   ├── (dashboard)/
│   │   ├── employer/page.js       # Employer dashboard
│   │   ├── seeker/page.js         # Job seeker dashboard
│   │   ├── freelancer/page.js     # Freelancer dashboard
│   │   └── admin/page.js          # Admin panel
│   ├── api/
│   │   ├── jobs/route.js          # Jobs CRUD API
│   │   ├── applications/route.js  # Applications API
│   │   ├── freelance/route.js     # Projects API
│   │   └── ai/
│   │       ├── match/route.js     # AI job matching & JD optimiser
│   │       ├── cv/route.js        # AI bio/CV generator
│   │       └── proposal/route.js  # AI proposal writer
│   ├── globals.css                # Design tokens & global styles
│   ├── layout.js                  # Root layout
│   └── page.js                    # Home/landing page
├── components/
│   ├── ui/
│   │   ├── Button.js              # Primary button component
│   │   ├── Input.js               # Input, select, textarea
│   │   └── Components.js          # Badge, Card, Avatar, Toast, Modal
│   └── layout/
│       └── DashboardLayout.js     # Sidebar + header + topbar
├── lib/
│   ├── supabase.js                # Browser Supabase client
│   ├── supabaseServer.js          # Server Supabase client
│   └── utils.js                   # Helpers: formatBD, timeAgo, cn, etc.
├── supabase/
│   └── schema.sql                 # Complete database schema + RLS + triggers
├── middleware.js                   # Auth protection + role-based routing
└── .env.local.example             # Environment variables template
```

---

## 🗄 Database Schema (Supabase)

| Table              | Purpose                                    |
|--------------------|--------------------------------------------|
| `profiles`         | All users — base profile with role & plan  |
| `employer_profiles`| Company info for employer accounts         |
| `seeker_profiles`  | CV, experience, availability for seekers   |
| `freelancer_profiles` | Rating, wallet, earnings for freelancers |
| `jobs`             | Job listings posted by employers           |
| `applications`     | Job applications with AI match score       |
| `saved_jobs`       | Bookmarked jobs by seekers                 |
| `projects`         | Freelance projects posted by clients       |
| `proposals`        | Freelancer bids on projects                |
| `contracts`        | Active contracts between client/freelancer |
| `milestones`       | Payment milestones per contract            |
| `escrow`           | Held funds with release/refund flow        |
| `disputes`         | Dispute filing and admin arbitration       |
| `messages`         | Real-time chat messages                    |
| `conversations`    | Chat threads between 2 users               |
| `reviews`          | Client/freelancer reviews after contracts  |
| `notifications`    | In-app notifications                       |
| `job_alerts`       | Saved search alerts for seekers            |

Row Level Security (RLS) is enabled on all tables — users can only access their own data.

---

## 🤖 AI Features (Claude API)

| Feature                | Endpoint              | Who uses it      |
|------------------------|-----------------------|------------------|
| Job Description Optimiser | `POST /api/ai/match` (type: job_description) | Employers |
| Candidate Match Scoring   | `POST /api/ai/match` (type: candidate_match) | Employers |
| AI Bio Generator          | `POST /api/ai/cv`    | Job Seekers      |
| AI Proposal Writer        | `POST /api/ai/proposal` | Freelancers   |

---

## 👤 User Roles

| Role       | Dashboard Path       | What they can do                           |
|------------|----------------------|--------------------------------------------|
| Employer   | `/dashboard/employer`| Post jobs, review candidates, analytics    |
| Job Seeker | `/dashboard/seeker`  | Search & apply for jobs, AI CV builder     |
| Freelancer | `/dashboard/freelancer` | Browse projects, submit proposals, earnings |
| Admin      | `/dashboard/admin`   | Manage users, resolve disputes, analytics  |

---

## 💳 Pricing (from Business Plan)

**Employer Subscriptions:**
- **Silver** — BD 18/month — Limited CV database, basic job posts
- **Gold** — BD 23/month — Full analytics, unrestricted freelancer access, AI matching
- **Platinum** — BD 28/month — All features + recruitment counselling + AI recommendations

**One-time:**
- Single job post: BD 2
- Bulk 10 posts: BD 15
- Professional portfolio: BD 5

---

## 🚀 Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# Project → Settings → Environment Variables
# Add all variables from .env.local
```

---

## 🔑 Tech Stack

| Layer       | Technology                     |
|-------------|--------------------------------|
| Frontend    | Next.js 14 (App Router)        |
| Styling     | Tailwind CSS                   |
| Database    | Supabase (PostgreSQL)          |
| Auth        | Supabase Auth                  |
| AI          | Anthropic Claude API           |
| Hosting     | Vercel (free tier)             |
| Payments    | Tap Payments / BenefitPay (add-on) |

---

## 📧 Support

Built for ConnectHub, Bahrain. For questions, contact the development team.
