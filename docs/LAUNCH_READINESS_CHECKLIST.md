# ConnectHub Launch Readiness Checklist

Use this checklist before treating ConnectHub as a live business platform.

## 1. Product Readiness

- Confirm the public homepage, pricing, help, contact, privacy, and terms pages are current.
- Review copy for accuracy across employer, seeker, freelancer, and admin flows.
- Confirm employer subscriptions are the only paid recurring plans.
- Confirm seekers and freelancers remain free where intended.
- Verify demo guidance is hidden or intentionally controlled in production.

## 2. Environment Readiness

- Verify `NEXT_PUBLIC_SUPABASE_URL`
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verify `SUPABASE_SERVICE_ROLE_KEY`
- Verify `NEXT_PUBLIC_APP_URL`
- Verify `TAP_SECRET_KEY` if payments are enabled
- Verify `RESEND_API_KEY` and `RESEND_FROM_EMAIL` if emails are enabled
- Verify `ANTHROPIC_API_KEY` if smart drafting/generation is enabled
- Disable demo-only flags in production unless intentionally needed

## 3. Database Readiness

- Apply `supabase/migrations/20260403_auth_rls_indexes.sql`
- Apply `supabase/migrations/20260403_monitoring_analytics.sql`
- Confirm RLS is enabled on sensitive tables
- Confirm admin-only visibility for `analytics_events`
- Confirm indexes exist for dashboard-heavy tables
- Take and verify a database backup plan

## 4. Payments And Billing

- Verify Tap production credentials
- Verify payment return URLs
- Verify webhook endpoint availability
- Verify receipt generation
- Verify successful payment confirmation emails
- Verify failed checkout behavior does not leave users stuck
- Verify employer-only subscription enforcement from both UI and API

## 5. Auth And Session

- Test login
- Test register
- Test logout
- Test refresh on every dashboard
- Test account switching with `?switch=1`
- Test protected route redirects
- Test wrong-role dashboard redirects
- Verify incomplete-role accounts go to `/auth/role`

## 6. Business-Critical Role Flows

### Employer

- Post a job
- Review applications
- Update application statuses
- Add employer notes
- Review smart comparison output
- Review analytics and pipeline visibility

### Job Seeker

- Search jobs
- Save jobs
- Apply to jobs
- Review application history
- Review smart matches
- Edit profile/CV/portfolio

### Freelancer

- Browse projects
- Submit proposal
- Review proposal states
- Open active contract
- Submit milestone
- Review escrow and released earnings
- Raise dispute

### Admin

- Review overview metrics
- Search users
- Review content moderation panels
- Review disputes
- Review analytics/system health

## 7. Monitoring And Reliability

- Confirm `analytics_events` receives new records
- Confirm admin dashboard shows recent system signals
- Confirm payment failures create telemetry
- Confirm workflow failures create telemetry
- Review server logs for unexpected errors
- Define who checks platform health daily

## 8. Legal And Trust

- Review privacy page for real legal accuracy
- Review terms page for real legal accuracy
- Review support email and contact details
- Verify pricing language matches actual business model
- Verify no placeholder/demo credentials are exposed publicly

## 9. Final Verification Commands

Run these before a release:

```bash
npm run lint
npm run build
node scripts/qa-auth-journeys.js
node scripts/qa-auth-session-lifecycle.js
```

## 10. Go / No-Go Rule

Do not launch if any of the following are unresolved:

- login/logout/refresh instability
- broken dashboard routing by role
- incorrect payment handling
- missing receipt or confirmation behavior
- unresolved RLS/security gaps
- unclear dispute/escrow outcomes
- visible demo-only behavior in production
