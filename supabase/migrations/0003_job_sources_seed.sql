-- Registers the pluggable job sources implemented in
-- src/lib/jobs/sources/. The `name` column is the lookup key the app uses
-- (matches JobSource.id in code) - keep them in sync when adding a source.

insert into job_sources (name, type, is_active)
values ('remotive', 'api', true)
on conflict (name) do nothing;
