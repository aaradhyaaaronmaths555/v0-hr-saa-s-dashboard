-- AU-specific compliance modules:
-- 1) WHS Incident Reports
-- 2) Right to Work tracker
-- 3) Fair Work checklist

create table if not exists "WHSIncident" (
  id text primary key default gen_random_uuid()::text,
  "organisationId" text not null references "Organisation"(id) on delete cascade,
  "incidentType" text not null,
  "incidentDate" timestamptz not null,
  "employeesInvolved" text not null,
  "correctiveAction" text not null,
  status text not null default 'Open',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "RightToWork" (
  id text primary key default gen_random_uuid()::text,
  "employeeId" text not null unique references "Employee"(id) on delete cascade,
  "visaType" text not null,
  "visaExpiryDate" timestamptz not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "FairWorkChecklist" (
  id text primary key default gen_random_uuid()::text,
  "employeeId" text not null unique references "Employee"(id) on delete cascade,
  "taxFileDeclaration" boolean not null default false,
  "superChoiceForm" boolean not null default false,
  "fairWorkInfoStatement" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
