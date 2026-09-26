-- Row-Level Security for every tenant-owned table.
-- Matches Section 10.2 of the requirements document: RLS is defence-in-depth
-- alongside application-level checks, not a substitute for them.
--
-- The application MUST connect as a non-owner role (campusos_app below) so that
-- FORCE ROW LEVEL SECURITY actually applies -- table owners and superusers
-- bypass RLS unless forced, and even then a superuser role still bypasses it.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'campusos_app') then
    create role campusos_app with login password 'campusos_app_dev' noinherit;
  end if;
end
$$;

grant connect on database campusos to campusos_app;
grant usage on schema public to campusos_app;
grant select, insert, update, delete on all tables in schema public to campusos_app;
alter default privileges in schema public grant select, insert, update, delete on tables to campusos_app;

-- Reassign ownership so the app role is not the table owner (avoids RLS bypass by owner).
-- In production this is done by a dedicated migration/owner role, never by campusos_app itself.

alter table programme enable row level security;
alter table programme force row level security;
drop policy if exists tenant_isolation on programme;
create policy tenant_isolation on programme
  using (tenant_id = current_setting('app.tenant_id', true)::uuid)
  with check (tenant_id = current_setting('app.tenant_id', true)::uuid);

alter table batch enable row level security;
alter table batch force row level security;
drop policy if exists tenant_isolation on batch;
create policy tenant_isolation on batch
  using (tenant_id = current_setting('app.tenant_id', true)::uuid)
  with check (tenant_id = current_setting('app.tenant_id', true)::uuid);

alter table section enable row level security;
alter table section force row level security;
drop policy if exists tenant_isolation on section;
create policy tenant_isolation on section
  using (tenant_id = current_setting('app.tenant_id', true)::uuid)
  with check (tenant_id = current_setting('app.tenant_id', true)::uuid);

alter table student enable row level security;
alter table student force row level security;
drop policy if exists tenant_isolation on student;
create policy tenant_isolation on student
  using (tenant_id = current_setting('app.tenant_id', true)::uuid)
  with check (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- tenant table itself is platform-level and intentionally has no RLS policy --
-- it is only ever queried by the platform-admin service, never per-request.

create index if not exists student_tenant_section_idx on student (tenant_id, section_id);
create index if not exists student_tenant_custom_gin_idx on student using gin (custom jsonb_path_ops);
