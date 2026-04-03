create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  source text not null default 'server',
  category text not null,
  action text not null,
  level text not null default 'info',
  actor_id uuid null references public.profiles(id) on delete set null,
  actor_role text null,
  route text null,
  message text null,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.analytics_events enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'analytics_events'
      and policyname = 'Admins can view analytics events'
  ) then
    create policy "Admins can view analytics events"
      on public.analytics_events
      for select
      using (
        exists (
          select 1
          from public.profiles
          where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
      );
  end if;
end $$;

create index if not exists idx_analytics_events_created_at
  on public.analytics_events (created_at desc);

create index if not exists idx_analytics_events_level_created_at
  on public.analytics_events (level, created_at desc);

create index if not exists idx_analytics_events_category_created_at
  on public.analytics_events (category, created_at desc);
