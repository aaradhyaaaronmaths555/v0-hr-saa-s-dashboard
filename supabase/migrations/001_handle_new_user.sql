-- Run this in Supabase SQL Editor after running `prisma db push` or `prisma migrate deploy`
-- Creates Organisation and User when a new auth.users row is inserted (sign-up)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  org_id text;
  org_name text;
  full_name text;
begin
  org_name := coalesce(
    (new.raw_user_meta_data->>'organisation_name')::text,
    'My Organisation'
  );
  full_name := coalesce(
    (new.raw_user_meta_data->>'full_name')::text,
    new.email
  );

  insert into "Organisation" (id, name)
  values (gen_random_uuid()::text, org_name)
  returning id into org_id;

  insert into "User" (id, email, "fullName", "organisationId")
  values (new.id, new.email, full_name, org_id);

  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
