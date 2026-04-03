-- ============================================================
-- ConnectHub — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ── PROFILES ─────────────────────────────────────────────────────
-- Extends Supabase auth.users with app-specific data
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          text not null check (role in ('employer', 'seeker', 'freelancer', 'admin')),
  full_name     text,
  avatar_url    text,
  headline      text,                    -- "Senior React Developer" / "TechMark Ltd."
  bio           text,
  location      text default 'Bahrain',
  phone         text,
  website       text,
  linkedin_url  text,
  skills        text[] default '{}',     -- array of skill tags
  plan          text default 'free' check (plan in ('free','silver','gold','platinum')),
  plan_expires_at timestamptz,
  is_verified   boolean default false,
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── EMPLOYER PROFILES ─────────────────────────────────────────────
create table if not exists employer_profiles (
  id             uuid primary key references profiles(id) on delete cascade,
  company_name   text not null,
  company_size   text,                   -- "1-10", "11-50", "51-200", "200+"
  industry       text,
  company_logo   text,
  cr_number      text,                   -- Commercial Registration number (Bahrain)
  created_at     timestamptz default now()
);

-- ── SEEKER PROFILES ───────────────────────────────────────────────
create table if not exists seeker_profiles (
  id                uuid primary key references profiles(id) on delete cascade,
  experience_years  int default 0,
  education         text,
  cv_url            text,
  portfolio_url     text,
  availability      text default 'available' check (availability in ('available','open','not_looking')),
  salary_expectation_min int,
  salary_expectation_max int,
  created_at        timestamptz default now()
);

-- ── FREELANCER PROFILES ───────────────────────────────────────────
create table if not exists freelancer_profiles (
  id              uuid primary key references profiles(id) on delete cascade,
  hourly_rate     decimal(10,3),         -- in BHD
  categories      text[] default '{}',
  rating          decimal(3,2) default 0,
  review_count    int default 0,
  completion_rate int default 100,       -- percentage
  total_earned    decimal(10,3) default 0,
  wallet_balance  decimal(10,3) default 0,
  availability    text default 'available',
  created_at      timestamptz default now()
);

-- ── JOBS ─────────────────────────────────────────────────────────
create table if not exists jobs (
  id              uuid primary key default uuid_generate_v4(),
  employer_id     uuid not null references profiles(id) on delete cascade,
  title           text not null,
  description     text not null,
  requirements    text,
  skills_required text[] default '{}',
  job_type        text default 'full_time' check (job_type in ('full_time','part_time','contract','internship')),
  work_model      text default 'on_site' check (work_model in ('on_site','remote','hybrid')),
  location        text default 'Manama, Bahrain',
  salary_min      int,
  salary_max      int,
  currency        text default 'BHD',
  department      text,
  experience_min  int default 0,
  status          text default 'active' check (status in ('draft','active','paused','closed')),
  views_count     int default 0,
  applications_count int default 0,
  closes_at       timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── JOB APPLICATIONS ─────────────────────────────────────────────
create table if not exists applications (
  id           uuid primary key default uuid_generate_v4(),
  job_id       uuid not null references jobs(id) on delete cascade,
  seeker_id    uuid not null references profiles(id) on delete cascade,
  cover_letter text,
  cv_url       text,
  status       text default 'pending' check (status in ('pending','reviewed','shortlisted','interview','offered','hired','rejected')),
  ai_match_score int,                    -- 0-100 AI compatibility score
  employer_notes text,                   -- private notes by employer
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique(job_id, seeker_id)             -- one application per job per seeker
);

-- ── SAVED JOBS ────────────────────────────────────────────────────
create table if not exists saved_jobs (
  id         uuid primary key default uuid_generate_v4(),
  seeker_id  uuid not null references profiles(id) on delete cascade,
  job_id     uuid not null references jobs(id) on delete cascade,
  created_at timestamptz default now(),
  unique(seeker_id, job_id)
);

-- ── FREELANCE PROJECTS ────────────────────────────────────────────
create table if not exists projects (
  id              uuid primary key default uuid_generate_v4(),
  client_id       uuid not null references profiles(id) on delete cascade,
  title           text not null,
  description     text not null,
  category        text not null,
  skills_required text[] default '{}',
  budget_type     text default 'fixed' check (budget_type in ('fixed','hourly')),
  budget_min      decimal(10,3),
  budget_max      decimal(10,3),
  currency        text default 'BHD',
  duration        text,                  -- "1 week", "1 month", etc.
  experience_level text default 'mid',
  status          text default 'open' check (status in ('open','in_progress','completed','cancelled','disputed')),
  proposals_count int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── FREELANCE PROPOSALS ───────────────────────────────────────────
create table if not exists proposals (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references projects(id) on delete cascade,
  freelancer_id   uuid not null references profiles(id) on delete cascade,
  cover_letter    text not null,
  bid_amount      decimal(10,3) not null,
  bid_type        text default 'fixed',
  delivery_days   int not null,
  status          text default 'pending' check (status in ('pending','accepted','rejected','withdrawn')),
  ai_generated    boolean default false, -- track if AI-assisted
  created_at      timestamptz default now(),
  unique(project_id, freelancer_id)
);

-- ── CONTRACTS ─────────────────────────────────────────────────────
create table if not exists contracts (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references projects(id),
  proposal_id     uuid not null references proposals(id),
  client_id       uuid not null references profiles(id),
  freelancer_id   uuid not null references profiles(id),
  title           text not null,
  amount          decimal(10,3) not null,
  status          text default 'active' check (status in ('active','completed','cancelled','disputed')),
  starts_at       timestamptz default now(),
  ends_at         timestamptz,
  created_at      timestamptz default now()
);

-- ── MILESTONES ────────────────────────────────────────────────────
create table if not exists milestones (
  id            uuid primary key default uuid_generate_v4(),
  contract_id   uuid not null references contracts(id) on delete cascade,
  title         text not null,
  description   text,
  amount        decimal(10,3) not null,
  status        text default 'pending' check (status in ('pending','in_progress','submitted','approved','released')),
  due_date      date,
  created_at    timestamptz default now()
);

-- ── ESCROW ────────────────────────────────────────────────────────
create table if not exists escrow (
  id              uuid primary key default uuid_generate_v4(),
  contract_id     uuid not null references contracts(id),
  milestone_id    uuid references milestones(id),
  from_user_id    uuid not null references profiles(id),
  to_user_id      uuid not null references profiles(id),
  amount          decimal(10,3) not null,
  status          text default 'held' check (status in ('held','released','refunded','disputed')),
  released_at     timestamptz,
  created_at      timestamptz default now()
);

-- ── DISPUTES ──────────────────────────────────────────────────────
create table if not exists disputes (
  id              uuid primary key default uuid_generate_v4(),
  contract_id     uuid not null references contracts(id),
  raised_by       uuid not null references profiles(id),
  against         uuid not null references profiles(id),
  reason          text not null,
  details         text,
  status          text default 'open' check (status in ('open','under_review','resolved','closed')),
  resolution      text,
  resolved_by     uuid references profiles(id),
  amount_disputed decimal(10,3),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── MESSAGES ──────────────────────────────────────────────────────
create table if not exists conversations (
  id              uuid primary key default uuid_generate_v4(),
  participant_1   uuid not null references profiles(id),
  participant_2   uuid not null references profiles(id),
  last_message    text,
  last_message_at timestamptz,
  created_at      timestamptz default now(),
  unique(participant_1, participant_2)
);

create table if not exists messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references profiles(id),
  content         text not null,
  is_read         boolean default false,
  created_at      timestamptz default now()
);

-- ── REVIEWS ───────────────────────────────────────────────────────
create table if not exists reviews (
  id              uuid primary key default uuid_generate_v4(),
  contract_id     uuid not null references contracts(id),
  reviewer_id     uuid not null references profiles(id),
  reviewee_id     uuid not null references profiles(id),
  rating          int not null check (rating between 1 and 5),
  comment         text,
  created_at      timestamptz default now(),
  unique(contract_id, reviewer_id)
);

-- ── NOTIFICATIONS ─────────────────────────────────────────────────
create table if not exists notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        text not null,             -- 'application', 'message', 'offer', 'milestone', etc.
  title       text not null,
  body        text,
  link        text,                      -- deep link in the app
  is_read     boolean default false,
  created_at  timestamptz default now()
);

-- ── JOB ALERTS ────────────────────────────────────────────────────
create table if not exists job_alerts (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  keywords    text,
  location    text,
  job_type    text,
  salary_min  int,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Ensures users can only access their own data
-- ============================================================

alter table profiles          enable row level security;
alter table employer_profiles enable row level security;
alter table seeker_profiles   enable row level security;
alter table freelancer_profiles enable row level security;
alter table jobs              enable row level security;
alter table applications      enable row level security;
alter table saved_jobs        enable row level security;
alter table projects          enable row level security;
alter table proposals         enable row level security;
alter table contracts         enable row level security;
alter table milestones        enable row level security;
alter table escrow            enable row level security;
alter table disputes          enable row level security;
alter table messages          enable row level security;
alter table conversations     enable row level security;
alter table reviews           enable row level security;
alter table notifications     enable row level security;
alter table job_alerts        enable row level security;

-- Profiles: users can read all, but only update their own
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Jobs: anyone can read active jobs, employers manage their own
create policy "Active jobs are public"
  on jobs for select using (status = 'active' or employer_id = auth.uid());

create policy "Employers can manage their jobs"
  on jobs for all using (employer_id = auth.uid());

-- Applications: seekers see their own, employers see apps to their jobs
create policy "Seekers can manage own applications"
  on applications for all using (seeker_id = auth.uid());

create policy "Employers can view applications to their jobs"
  on applications for select
  using (exists (select 1 from jobs where jobs.id = applications.job_id and jobs.employer_id = auth.uid()));

-- Projects: open projects are public, clients manage their own
create policy "Open projects are public"
  on projects for select using (status = 'open' or client_id = auth.uid());

create policy "Clients manage own projects"
  on projects for all using (client_id = auth.uid());

-- Proposals: freelancers see their own, clients see proposals to their projects
create policy "Freelancers manage own proposals"
  on proposals for all using (freelancer_id = auth.uid());

create policy "Clients view proposals to their projects"
  on proposals for select
  using (exists (select 1 from projects where projects.id = proposals.project_id and projects.client_id = auth.uid()));

-- Notifications: users see only their own
create policy "Users see own notifications"
  on notifications for all using (user_id = auth.uid());

-- Messages: participants see only their conversations
create policy "Participants see their messages"
  on messages for all
  using (exists (
    select 1 from conversations c
    where c.id = messages.conversation_id
    and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
  ));

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'seeker'),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at timestamps
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger jobs_updated_at        before update on jobs        for each row execute procedure update_updated_at();
create trigger applications_updated_at before update on applications for each row execute procedure update_updated_at();
create trigger projects_updated_at    before update on projects    for each row execute procedure update_updated_at();
create trigger profiles_updated_at    before update on profiles    for each row execute procedure update_updated_at();
create trigger disputes_updated_at    before update on disputes    for each row execute procedure update_updated_at();
