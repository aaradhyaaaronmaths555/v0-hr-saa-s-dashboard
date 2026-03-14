# PeopleDesk

PeopleDesk is an HR compliance SaaS for Australian SMBs. It is built with Next.js App Router, Supabase (Auth + Postgres), and TypeScript.

## Features

- Employee records and onboarding tracking
- Certificate tracking with expiry status
- Policy management and acknowledgement tracking
- Policy reminder scheduling and reminder events
- WHS incident lifecycle and timeline
- Right to Work tracking
- Fair Work checklist
- Compliance dashboard and audit export report

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Supabase Auth + Postgres
- Prisma schema for data model reference
- Shadcn UI components

## Project Structure

- `app/` - routes, pages, API handlers
- `app/api/` - API routes (writes + reads)
- `lib/supabase/` - Supabase clients and auth/org helpers
- `lib/compliance/` - compliance metrics utilities
- `prisma/schema.prisma` - canonical app data model
- `supabase/migrations/` - SQL migrations

## Prerequisites

- Node.js 20+
- npm
- A Supabase project

## Environment Variables

Create a `.env.local` file in project root:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-or-publishable-key>"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
```

Notes:

- Do not commit `.env.local`.
- `SUPABASE_SERVICE_ROLE_KEY` is required for server-side write fallback.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run database migration SQL in Supabase SQL Editor:

- `supabase/migrations/001_handle_new_user.sql`
- `supabase/migrations/002_au_compliance_modules.sql`
- `supabase/migrations/003_policy_reminder_scheduling.sql`
- `supabase/migrations/004_whs_incident_lifecycle.sql`

3. Start development server:

```bash
npm run dev
```

4. Open:

- `http://localhost:3000`

## Auth and Organisation Linking

All write APIs require:

- authenticated user
- linked organisation id

If you see `No organisation linked to user`, ensure:

- `001_handle_new_user.sql` trigger is applied
- existing users are backfilled into `public."User"` with an organisation id

## Key Routes

- `/dashboard`
- `/employees`, `/employees/new`, `/employees/[id]/edit`
- `/certificates`, `/certificates/new`, `/certificates/[id]/edit`
- `/policies`, `/policies/new`, `/policies/[policyId]/edit`
- `/whs`, `/whs/new`, `/whs/[id]/edit`
- `/right-to-work`, `/right-to-work/new`, `/right-to-work/[id]/edit`
- `/fair-work-checklist`
- `/reports`, `/reports/audit-export`

## API Routes (selected)

- `POST /api/employees`
- `POST /api/certificates`
- `POST /api/policies`
- `POST /api/whs-incidents`
- `POST /api/right-to-work`
- `POST /api/right-to-work-records`
- `POST /api/fair-work-checklist`

## Security

- Rotate keys immediately if they were ever exposed.
- Never commit secrets or tokens.
- Keep `.env.local` local only.

