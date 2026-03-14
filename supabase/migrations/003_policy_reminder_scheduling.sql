create table if not exists public."PolicyReminderSchedule" (
  id text primary key default gen_random_uuid()::text,
  "organisationId" text not null references public."Organisation"(id) on delete cascade,
  "policyId" text not null unique references public."Policy"(id) on delete cascade,
  "autoRemindEnabled" boolean not null default false,
  "cadenceDays" integer not null default 3,
  "deadlineAt" timestamptz null,
  "nextRunAt" timestamptz null,
  "lastRunAt" timestamptz null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists idx_policy_reminder_schedule_next_run
  on public."PolicyReminderSchedule"("nextRunAt");

create table if not exists public."PolicyReminderEvent" (
  id text primary key default gen_random_uuid()::text,
  "organisationId" text not null references public."Organisation"(id) on delete cascade,
  "policyId" text not null references public."Policy"(id) on delete cascade,
  "employeeId" text not null references public."Employee"(id) on delete cascade,
  "sentAt" timestamptz not null default now(),
  "triggerType" text not null default 'manual',
  status text not null default 'sent',
  "errorMessage" text null,
  "createdAt" timestamptz not null default now()
);

create index if not exists idx_policy_reminder_event_policy_sent_at
  on public."PolicyReminderEvent"("policyId", "sentAt" desc);

create index if not exists idx_policy_reminder_event_org_sent_at
  on public."PolicyReminderEvent"("organisationId", "sentAt" desc);
