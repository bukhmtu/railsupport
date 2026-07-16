-- ============================================================================
-- RailSupport — Storage bucket va fayl uchun RLS
-- Ishlatish: SQL Editor'da 0001_init.sql dan keyin ishga tushiring
-- ============================================================================

-- Private bucket (public emas — hech kim to'g'ridan-to'g'ri URL bilan ochib bo'lmaydi,
-- faqat signed URL yoki RLS orqali ruxsat etilgan authenticated so'rov bilan)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attachments',
  'attachments',
  false,
  10485760, -- 10 MB
  array[
    'image/jpeg','image/png','image/gif','image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do nothing;

-- Fayl yo'li shakli: attachments/{ticket_id}/{uuid}.{ext}
-- storage.foldername(name) qism-qismga ajratadi: [1] = ticket_id

create policy attachments_storage_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'attachments'
    and public.can_view_ticket_id((storage.foldername(name))[1]::bigint)
  );

create policy attachments_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'attachments'
    and public.can_view_ticket_id((storage.foldername(name))[1]::bigint)
  );

create policy attachments_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'attachments'
    and public.current_role_name() in ('admin','dispatcher')
  );
