-- Registers the JSearch job source (src/lib/jobs/sources/jsearch.ts).
-- The `name` column is the lookup key the app uses (matches JobSource.id
-- in code) - keep them in sync when adding a source.

insert into job_sources (name, type, is_active)
values ('jsearch', 'api', true)
on conflict (name) do nothing;
