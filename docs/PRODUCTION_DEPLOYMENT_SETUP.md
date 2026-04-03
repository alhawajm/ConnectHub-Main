# ConnectHub Production Deployment Setup

This guide is the operational baseline for turning ConnectHub into a live company product.

## 1. Deployment Model

Recommended:

- frontend/app hosting on Vercel
- Supabase for database and auth
- Tap for payments
- Resend for transactional email

## 2. Required Production Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
ANTHROPIC_API_KEY=
TAP_SECRET_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

Optional / controlled:

```env
NEXT_PUBLIC_ENABLE_DEMO_GUIDE=false
ENABLE_DEMO_SEED=false
FORCE_DEMO_SEED=false
```

## 3. Supabase

- Apply schema and required migrations.
- Confirm RLS policies are active.
- Confirm production auth redirect URLs are correct.
- Confirm email templates and auth behavior align with production.

Required migrations:

- `supabase/migrations/20260403_auth_rls_indexes.sql`
- `supabase/migrations/20260403_monitoring_analytics.sql`

## 4. Payments

- Add production Tap secret key.
- Verify production return URL uses the real app domain.
- Verify production webhook endpoint is reachable.
- Test successful and failed payment flows in a controlled environment before opening billing.

## 5. Email

- Add `RESEND_API_KEY`
- Add a verified sender in `RESEND_FROM_EMAIL`
- Verify payment confirmation emails
- Verify milestone/payment/dispute notifications where enabled

## 6. Domain And Metadata

- Point the production domain to the deployment.
- Verify `NEXT_PUBLIC_APP_URL` matches the live domain exactly.
- Verify:
  - `/robots.txt`
  - `/sitemap.xml`
  - favicon / app icon
  - Open Graph metadata

## 7. Post-Deploy Verification

Run this immediately after deploy:

1. Open homepage
2. Open login
3. Open register
4. Open pricing
5. Open employer dashboard after login
6. Open seeker dashboard after login
7. Open freelancer dashboard after login
8. Open admin dashboard after login
9. Verify one application flow
10. Verify one escrow/dispute flow
11. Verify admin analytics/system signals

## 8. Rollback Rule

If any of these break in production:

- login
- protected route access
- billing
- dashboard role routing
- application submission
- dispute resolution

Then rollback to the previous working deployment first, investigate second.
