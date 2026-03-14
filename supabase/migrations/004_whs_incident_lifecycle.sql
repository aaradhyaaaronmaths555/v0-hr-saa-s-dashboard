alter table public."WHSIncident"
  alter column "status" set default 'New';

update public."WHSIncident"
set "status" = case
  when "status" = 'Open' then 'New'
  when "status" = 'Investigating' then 'In review'
  else "status"
end;

alter table public."WHSIncident"
  add column if not exists "preventionSteps" text null,
  add column if not exists "assignedTo" text null,
  add column if not exists "dateClosed" timestamptz null;

create table if not exists public."WHSIncidentTimeline" (
  id text primary key default gen_random_uuid()::text,
  "organisationId" text not null references public."Organisation"(id) on delete cascade,
  "incidentId" text not null references public."WHSIncident"(id) on delete cascade,
  "eventType" text not null,
  "statusFrom" text null,
  "statusTo" text null,
  comment text null,
  "assignedTo" text null,
  "createdAt" timestamptz not null default now()
);

create index if not exists idx_whs_timeline_incident_created
  on public."WHSIncidentTimeline"("incidentId", "createdAt" desc);

create index if not exists idx_whs_timeline_org_created
  on public."WHSIncidentTimeline"("organisationId", "createdAt" desc);
