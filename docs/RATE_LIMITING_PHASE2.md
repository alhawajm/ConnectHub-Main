# ConnectHub Rate Limiting Phase 2

The current limiter is intentionally lightweight and in-memory. That is appropriate for a single-instance deployment or controlled early launch, but it is not the final production strategy for a growing company product.

## Current State

The app now rate-limits sensitive routes such as:

- auth role completion
- logout
- application submission and status updates
- payment checkout creation
- freelance workflow mutations
- analytics ingestion

This protects the product from basic abuse and accidental request storms on a single app instance.

## Why Phase 2 Is Needed

An in-memory limiter has limits:

- counters reset on deploy or restart
- multiple app instances do not share state
- rate limits can be bypassed by hitting different instances
- there is no durable operator visibility into rate-limit abuse patterns

For a real company product, the next stage should use shared infrastructure.

## Recommended Production Strategy

### 1. Shared Store

Move rate-limit counters to a shared low-latency store:

- Upstash Redis
- Redis on your infrastructure
- another durable distributed key-value store

Recommended key pattern:

- `rl:<bucket>:<actor-or-ip>`

Recommended values:

- request count
- reset timestamp
- optional rolling failure count

### 2. Different Policies By Risk Level

Do not treat every endpoint the same.

Suggested policy groups:

- `auth_login_attempt`
  - strict
  - add progressive slowdown after repeated failures
- `auth_complete_profile`
  - moderate
- `payments_checkout`
  - strict
  - protect against repeated checkout creation
- `payments_webhook`
  - no classic user limiter
  - rely on signature verification, replay protection, and provider trust
- `applications_submit`
  - moderate
- `freelance_workflow_mutation`
  - moderate to strict depending on action
- `ai_generation`
  - strict cost-control limiter
- `messages_send`
  - strict anti-spam limiter

### 3. Distinguish Actor Types

Use different identifiers depending on context:

- authenticated user id
- IP address
- provider event id for webhooks
- optional session id for pre-auth flows

For login and other unauthenticated routes:

- use IP + email hash

For authenticated flows:

- use user id + IP

### 4. Abuse Telemetry

Rate limiting should feed the audit system too.

Track:

- limiter bucket
- actor role if known
- actor id if known
- IP hash or partial fingerprint
- route
- limit reached timestamp

This should appear in `analytics_events` with:

- `category = 'abuse_prevention'`
- `action = 'rate_limit_triggered'`

### 5. Operator Response

Admins should eventually be able to see:

- repeated login abuse
- repeated checkout attempts
- repeated message spam
- repeated generation endpoint abuse

Future admin tooling can add:

- abuse review queue
- temporary lockout visibility
- suspicious activity summaries

## Phase 2 Implementation Order

1. Add Redis-backed limiter utility
2. Migrate highest-risk buckets first:
   - login
   - payments checkout
   - messaging
   - AI generation
3. Add telemetry for limiter triggers
4. Add admin abuse-prevention dashboard widgets
5. Add temporary lockouts for repeated auth abuse

## Recommended Rule of Thumb

- single-instance early launch: current limiter is acceptable
- multi-instance or public growth stage: move to shared limiter before scale increases

## Decision Standard

Do not wait for an incident if:

- the app is exposed publicly
- paid acquisition starts
- marketing campaigns increase traffic
- AI endpoints begin generating noticeable cost
- messaging or auth abuse becomes visible
