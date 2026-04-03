-- ConnectHub auth/database hardening
-- Adds missing RLS policies for role-specific/private tables
-- and creates indexes for common dashboard/auth query paths.

create policy "Users manage own employer profile"
  on employer_profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users manage own seeker profile"
  on seeker_profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users manage own freelancer profile"
  on freelancer_profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Seekers manage own saved jobs"
  on saved_jobs for all
  using (seeker_id = auth.uid())
  with check (seeker_id = auth.uid());

create policy "Participants manage own conversations"
  on conversations for all
  using (participant_1 = auth.uid() or participant_2 = auth.uid())
  with check (participant_1 = auth.uid() or participant_2 = auth.uid());

create policy "Participants view own contracts"
  on contracts for select
  using (client_id = auth.uid() or freelancer_id = auth.uid());

create policy "Clients manage own contracts"
  on contracts for insert
  with check (client_id = auth.uid());

create policy "Participants view own milestones"
  on milestones for select
  using (
    exists (
      select 1 from contracts
      where contracts.id = milestones.contract_id
      and (contracts.client_id = auth.uid() or contracts.freelancer_id = auth.uid())
    )
  );

create policy "Clients manage milestones on own contracts"
  on milestones for all
  using (
    exists (
      select 1 from contracts
      where contracts.id = milestones.contract_id
      and contracts.client_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from contracts
      where contracts.id = milestones.contract_id
      and contracts.client_id = auth.uid()
    )
  );

create policy "Participants view own escrow rows"
  on escrow for select
  using (from_user_id = auth.uid() or to_user_id = auth.uid());

create policy "Clients manage own escrow rows"
  on escrow for all
  using (from_user_id = auth.uid())
  with check (from_user_id = auth.uid());

create policy "Participants view own disputes"
  on disputes for select
  using (
    raised_by = auth.uid()
    or against = auth.uid()
    or exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Participants create own disputes"
  on disputes for insert
  with check (raised_by = auth.uid());

create policy "Review participants view own reviews"
  on reviews for select
  using (reviewer_id = auth.uid() or reviewee_id = auth.uid());

create policy "Reviewers manage own reviews"
  on reviews for all
  using (reviewer_id = auth.uid())
  with check (reviewer_id = auth.uid());

create policy "Users manage own job alerts"
  on job_alerts for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists idx_jobs_employer_status_created
  on jobs (employer_id, status, created_at desc);

create index if not exists idx_jobs_status_created
  on jobs (status, created_at desc);

create index if not exists idx_applications_seeker_status_created
  on applications (seeker_id, status, created_at desc);

create index if not exists idx_applications_job_status_created
  on applications (job_id, status, created_at desc);

create index if not exists idx_saved_jobs_seeker_created
  on saved_jobs (seeker_id, created_at desc);

create index if not exists idx_projects_client_status_created
  on projects (client_id, status, created_at desc);

create index if not exists idx_projects_status_created
  on projects (status, created_at desc);

create index if not exists idx_proposals_freelancer_status_created
  on proposals (freelancer_id, status, created_at desc);

create index if not exists idx_proposals_project_status_created
  on proposals (project_id, status, created_at desc);

create index if not exists idx_contracts_client_status_created
  on contracts (client_id, status, created_at desc);

create index if not exists idx_contracts_freelancer_status_created
  on contracts (freelancer_id, status, created_at desc);

create index if not exists idx_milestones_contract_status_created
  on milestones (contract_id, status, created_at);

create index if not exists idx_escrow_contract_status_created
  on escrow (contract_id, status, created_at desc);

create index if not exists idx_disputes_contract_status_updated
  on disputes (contract_id, status, updated_at desc);

create index if not exists idx_notifications_user_unread_created
  on notifications (user_id, is_read, created_at desc);

create index if not exists idx_messages_conversation_created
  on messages (conversation_id, created_at desc);

create index if not exists idx_conversations_participant_1_updated
  on conversations (participant_1, last_message_at desc);

create index if not exists idx_conversations_participant_2_updated
  on conversations (participant_2, last_message_at desc);
