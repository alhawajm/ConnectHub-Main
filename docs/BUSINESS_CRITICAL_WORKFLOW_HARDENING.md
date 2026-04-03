# ConnectHub Business-Critical Workflow Hardening

This document defines the next hardening priorities for turning the platform into a dependable company product.

## Priority 1: Hiring Workflow

Goal: make employer-side hiring reliable and trusted.

### Must be rock-solid

- job creation
- application submission
- candidate comparison
- status changes
- interview / shortlist progression
- employer notes persistence

### Hardening actions

- add API-level tests for application status changes
- add explicit empty/loading/error states in candidate review surfaces
- add clearer audit visibility for status changes
- consider a dedicated hiring timeline per application

## Priority 2: Freelance Escrow Workflow

Goal: make project delivery and money movement unambiguous.

### Must be rock-solid

- proposal states
- contract visibility
- milestone submission
- milestone approval
- escrow release
- dispute opening
- dispute resolution

### Hardening actions

- add stronger state validation between milestone and escrow states
- add clearer user-facing status history
- add dedicated audit trail for disputes and fund actions
- verify no duplicate release/refund action can be triggered

## Priority 3: Billing And Receipts

Goal: make money-related flows company-safe.

### Must be rock-solid

- checkout initialization
- payment return state
- webhook handling
- receipt generation
- confirmation emails

### Hardening actions

- strengthen webhook verification
- confirm idempotent processing
- persist billing history in a dedicated admin-reviewable way
- add clearer failed-payment recovery flows

## Priority 4: Auth And Account Lifecycle

Goal: no confusion, no stale session surprises, no role leakage.

### Must be rock-solid

- login
- registration
- role selection
- logout
- account switching
- refresh-safe dashboard access

### Hardening actions

- add rate limiting
- add more auth-specific telemetry
- add a clearer account session indicator if multiple roles are tested often

## Priority 5: Admin Operations

Goal: let the business operate the platform confidently.

### Must be rock-solid

- platform overview
- dispute review
- user search
- system health visibility
- payment oversight

### Hardening actions

- expand `analytics_events` usage
- add admin audit trail for sensitive actions
- add triage views for repeated failures
- add operational filters by severity and category

## Recommended Build Order

1. rate limiting and webhook verification
2. admin audit trail for sensitive actions
3. stronger billing history and transaction visibility
4. workflow-specific API test coverage
5. refined user-facing histories/timelines
