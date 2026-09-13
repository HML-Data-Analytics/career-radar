-- Storage bucket for resume uploads (PDF/DOCX). Private bucket; access is
-- scoped per-user via the folder-prefix convention: <user_id>/<filename>.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  false,
  10485760, -- 10 MB
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

create policy "resumes_owner_select" on storage.objects
  for select using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "resumes_owner_insert" on storage.objects
  for insert with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "resumes_owner_update" on storage.objects
  for update using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "resumes_owner_delete" on storage.objects
  for delete using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);
