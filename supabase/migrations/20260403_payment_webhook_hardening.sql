create table if not exists public.payment_webhook_events (
  provider text not null,
  event_id text not null,
  created_at timestamptz not null default timezone('utc', now()),
  event_type text null,
  status text null,
  payload jsonb not null default '{}'::jsonb,
  primary key (provider, event_id)
);

alter table public.payment_webhook_events enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'payment_webhook_events'
      and policyname = 'Admins can view payment webhook events'
  ) then
    create policy "Admins can view payment webhook events"
      on public.payment_webhook_events
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

create index if not exists idx_payment_webhook_events_created_at
  on public.payment_webhook_events (created_at desc);

create index if not exists idx_payment_webhook_events_status_created_at
  on public.payment_webhook_events (status, created_at desc);
