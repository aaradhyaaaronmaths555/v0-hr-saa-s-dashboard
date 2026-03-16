# PeopleDesk Project Notes (Future Reference)

This file is your long-term reference for maintaining and extending PeopleDesk.

## 1) Product Intent

PeopleDesk is an HR compliance SaaS for Australian SMBs with focus on:

- Simple workflows for teams under 50 employees
- AU compliance (Fair Work, WHS, Right to Work)
- Actionable dashboard and audit-ready reporting

## 2) Current Stack

- Next.js App Router
- TypeScript
- Supabase Auth + Postgres
- Prisma schema as model reference
- Shadcn UI components

## 3) Core Data Model (Expected by app)

Primary tables:

- `Organisation`
- `User`
- `Employee`
- `Certificate`
- `Policy`
- `PolicyAcknowledgement`
- `WHSIncident`
- `RightToWork`
- `FairWorkChecklist`
- `WHSIncidentTimeline`
- `PolicyReminderSchedule`
- `PolicyReminderEvent`

Important note:

- App now supports mixed DB naming where possible (`organisationId` and `organisation_id`, etc.) for compatibility.

## 4) Auth + Organisation Guard Pattern

All write endpoints follow this rule:

1. Authenticate user
2. Resolve organisation id
3. Validate input
4. Write to DB
5. Return consistent JSON response

Key helper files:

- `lib/supabase/auth-context.ts`
- `lib/supabase/live-data.ts`
- `lib/api/responses.ts`

## 5) Write Reliability Strategy

To avoid create/update failures due to RLS/schema differences:

- `lib/supabase/admin.ts` creates service-role Supabase client
- `lib/supabase/write-client.ts` picks admin client when available
- Write routes use this fallback after auth succeeds

This keeps secure user checks while improving DB write reliability.

## 6) Critical Environment Variables

Required in `.env.local`:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional (if feature enabled):

- `OPENAI_API_KEY` (AI assistant currently removed from app)

## 7) Security Rules (Non-Negotiable)

- Never commit `.env.local`
- Never commit service role keys, secret API keys, or passwords
- Rotate keys immediately if exposed
- Keep `.next/` and build artifacts out of git

## 8) Routes and Flows Implemented

Main CRUD pages:

- Employees: `/employees/new`, `/employees/[id]/edit`
- Certificates: `/certificates/new`, `/certificates/[id]/edit`
- Policies: `/policies/new`, `/policies/[policyId]/edit`
- WHS: `/whs/new`, `/whs/[id]/edit`
- Right to Work: `/right-to-work/new`, `/right-to-work/[id]/edit`

Other key pages:

- Dashboard: `/dashboard`
- Reports: `/reports`, `/reports/audit-export`
- Policy detail: `/policies/[policyId]`

## 9) Feature Highlights Completed

- Live data wiring from Supabase across core modules
- Policy reminder system (manual + scheduled) and activity events
- WHS lifecycle with timeline and risk flags
- Audit export upgraded for evidence and risk reporting
- Chatbot/AI assistant removed from UI + backend routes
- API writer standardization (auth/org/error handling)

## 10) Supabase SQL/Migration Guidance

Run migrations in order:

1. `supabase/migrations/001_handle_new_user.sql`
2. `supabase/migrations/002_au_compliance_modules.sql`
3. `supabase/migrations/003_policy_reminder_scheduling.sql`
4. `supabase/migrations/004_whs_incident_lifecycle.sql`

If users were created before trigger setup:

- backfill `public."User"` linked to `Organisation`
- ensure `auth.users.id` uuid is cast to text when joining to `public."User".id`

## 11) Common Failure Modes and Fixes

### A) "No organisation linked to user"

Likely causes:

- missing trigger/backfill
- missing `User` row for auth user
- schema mismatch between auth trigger and `User` columns

Fix:

- ensure trigger exists and inserts compatible columns
- run backfill with `au.id::text`

### B) Create routes return 403/500

Likely causes:

- RLS policy restrictions on tables
- required legacy columns not supplied
- mixed column naming mismatch

Fix:

- keep service-role write fallback configured
- keep compatibility payloads

### C) Next.js App Router `searchParams` error

Cause:

- accessing `searchParams` synchronously in async server page

Fix:

- await/resolve `searchParams` before property access

## 12) Release Checklist (Use Every Time)

Before pushing:

1. `npx tsc --noEmit`
2. Check key routes manually:
   - create + edit employee/policy/certificate
   - right-to-work + whs create/update
3. Verify dashboard and reports load
4. Confirm audit export renders
5. `git status` and ensure no secrets staged
6. Push only safe files

## 13) Future Project Preferences (Reusable)

Use these standards in all future projects:

- Start with auth/org guard helper before writing APIs
- Centralize response helpers for consistent status/error JSON
- Add compatibility layer only when schema is uncertain
- Use migration-first approach to avoid runtime patching
- Keep one `PROJECT_NOTES.md` and update after each major sprint
- Treat secret management as first-class work, not cleanup

## 14) Recommended Next Improvements

- Normalize DB schema to one naming style (prefer snake_case or camelCase, not both)
- Remove temporary compatibility fallback branches after schema is clean
- Add explicit Zod schemas for all API payloads
- Add integration tests for create/update API routes
- Add CI checks for `tsc` and lint on pull requests

---

Owner note:

When in doubt, prioritize:

1. Data integrity (correct org scoping)
2. Security (no secret leaks)
3. Simplicity (clear forms, clear errors)
4. Reliability (stable write path first, polish second)
