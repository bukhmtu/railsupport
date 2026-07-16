-- ============================================================================
-- RailSupport — Supabase boshlang'ich sxema
-- Ishlatish: Supabase Dashboard → SQL Editor → shu faylni to'liq joylashtirib Run
-- ============================================================================

-- ─── PROFILES (auth.users kengaytmasi) ─────────────────────────────────────

create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  fullname   text not null,
  username   text not null unique,
  role       text not null check (role in ('admin','dispatcher','technician','employee')),
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── DEPARTMENTS (admin boshqaradigan bo'limlar ro'yxati) ──────────────────

create table public.departments (
  id         bigint generated always as identity primary key,
  name       text not null unique,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── TICKETS ────────────────────────────────────────────────────────────────

create table public.tickets (
  id            bigint generated always as identity primary key,
  fullname      text not null,
  department_id bigint not null references public.departments(id),
  phone         text not null,
  problem_type  text not null,
  description   text not null,
  priority      text not null default 'orta'  check (priority in ('yuqori','orta','past')),
  status        text not null default 'yangi' check (status in ('yangi','qabul','jarayon','tugallandi','bekor')),
  created_by    uuid not null references public.profiles(id),
  assigned_to   uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  assigned_at   timestamptz,
  resolved_at   timestamptz
);

create index tickets_created_by_idx  on public.tickets(created_by);
create index tickets_assigned_to_idx on public.tickets(assigned_to);
create index tickets_status_idx     on public.tickets(status);

-- Realtime UPDATE eventlarida to'liq "old" qatorni olish uchun kerak
-- (masalan assigned_to o'zgarishini frontendda aniqlash uchun)
alter table public.tickets replica identity full;

-- ─── ATTACHMENTS ────────────────────────────────────────────────────────────

create table public.attachments (
  id           bigint generated always as identity primary key,
  ticket_id    bigint not null references public.tickets(id) on delete cascade,
  uploaded_by  uuid not null references public.profiles(id),
  storage_path text not null,
  original     text not null,
  mime_type    text not null,
  size_bytes   integer not null,
  uploaded_at  timestamptz not null default now()
);

-- ─── LOGS ───────────────────────────────────────────────────────────────────

create table public.logs (
  id        bigint generated always as identity primary key,
  action    text not null,
  user_id   uuid references public.profiles(id),
  ticket_id bigint references public.tickets(id),
  time      timestamptz not null default now()
);

-- ============================================================================
-- HELPER FUNKSIYALAR
-- ============================================================================

create function public.current_role_name()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.can_view_ticket(t public.tickets)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select case public.current_role_name()
    when 'admin'      then true
    when 'dispatcher' then true
    when 'employee'   then t.created_by = auth.uid()
    when 'technician' then t.assigned_to = auth.uid()
    else false
  end;
$$;

create function public.can_view_ticket_id(tid bigint)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.can_view_ticket(t) from public.tickets t where t.id = tid;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles    enable row level security;
alter table public.departments enable row level security;
alter table public.tickets     enable row level security;
alter table public.attachments enable row level security;
alter table public.logs        enable row level security;

-- profiles: hamma authenticated user ismlarni ko'radi (avatar/biriktirilgan texnik uchun kerak)
create policy profiles_select on public.profiles
  for select to authenticated using (true);

-- profiles: faqat admin yangilay/o'chira oladi (fullname/role/is_active)
create policy profiles_update_admin on public.profiles
  for update to authenticated
  using (public.current_role_name() = 'admin');

create policy profiles_delete_admin on public.profiles
  for delete to authenticated
  using (public.current_role_name() = 'admin');

-- departments: hamma o'qiydi, faqat admin yozadi
create policy departments_select on public.departments
  for select to authenticated using (true);

create policy departments_write_admin on public.departments
  for all to authenticated
  using (public.current_role_name() = 'admin')
  with check (public.current_role_name() = 'admin');

-- tickets: ko'rish — rolga qarab
create policy tickets_select on public.tickets
  for select to authenticated
  using (public.can_view_ticket(tickets));

-- tickets: yaratish — har qanday authenticated user, faqat o'z nomidan
create policy tickets_insert on public.tickets
  for insert to authenticated
  with check (created_by = auth.uid());

-- tickets: yangilash — dispatcher/admin har doim, technician faqat o'ziga biriktirilgan bo'lsa
-- (ustun darajasidagi cheklov quyidagi trigger orqali ta'minlanadi)
create policy tickets_update on public.tickets
  for update to authenticated
  using (
    public.current_role_name() in ('admin','dispatcher')
    or (public.current_role_name() = 'technician' and assigned_to = auth.uid())
  );

-- attachments: ko'rish/yuklash — ticketni ko'ra oladigan userlar
create policy attachments_select on public.attachments
  for select to authenticated
  using (public.can_view_ticket_id(ticket_id));

create policy attachments_insert on public.attachments
  for insert to authenticated
  with check (uploaded_by = auth.uid() and public.can_view_ticket_id(ticket_id));

create policy attachments_delete on public.attachments
  for delete to authenticated
  using (public.current_role_name() in ('admin','dispatcher'));

-- logs: faqat admin ko'radi, to'g'ridan-to'g'ri yozib bo'lmaydi (faqat triggerlar orqali, SECURITY DEFINER)
create policy logs_select_admin on public.logs
  for select to authenticated
  using (public.current_role_name() = 'admin');

-- ============================================================================
-- TRIGGERLAR
-- ============================================================================

-- Yangi auth.users yaratilganda profiles qatorini avtomatik yaratish
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, fullname, username, role, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'fullname', new.raw_user_meta_data->>'username', 'Foydalanuvchi'),
    new.raw_user_meta_data->>'username',
    coalesce(new.raw_user_meta_data->>'role', 'employee'),
    true
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Ticket UPDATE'ni ustun darajasida cheklash + resolved_at/assigned_at avtomatik qo'yish
create function public.tickets_guard_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text := public.current_role_name();
begin
  if caller_role = 'employee' then
    raise exception 'Ruxsat yo''q';
  end if;

  if caller_role = 'technician' then
    -- Texnik faqat statusni o'zgartira oladi, boshqa hech narsani emas
    if new.assigned_to is distinct from old.assigned_to
       or new.department_id is distinct from old.department_id
       or new.priority is distinct from old.priority
       or new.created_by is distinct from old.created_by
       or new.fullname is distinct from old.fullname
       or new.description is distinct from old.description then
      raise exception 'Ruxsat yo''q';
    end if;
    if new.status = 'tugallandi' and old.status is distinct from 'tugallandi' then
      new.resolved_at := now();
    end if;
  end if;

  if caller_role in ('admin','dispatcher') then
    -- Biriktirish: assigned_to o'zgarsa, status/assigned_at ham to'g'ri qo'yiladi
    if new.assigned_to is distinct from old.assigned_to and new.assigned_to is not null then
      new.status := 'qabul';
      new.assigned_at := now();
    end if;
    if new.status = 'tugallandi' and old.status is distinct from 'tugallandi' then
      new.resolved_at := now();
    end if;
  end if;

  return new;
end;
$$;

create trigger tickets_guard_update
  before update on public.tickets
  for each row execute function public.tickets_guard_update();

-- Ticket yaratilganda avtomatik log
create function public.tickets_log_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.logs (action, user_id, ticket_id)
  values (format('Yangi murojaat #%s yaratildi', new.id), new.created_by, new.id);
  return new;
end;
$$;

create trigger tickets_log_insert
  after insert on public.tickets
  for each row execute function public.tickets_log_insert();

-- Ticket assign/status o'zgarganda avtomatik log
create function public.tickets_log_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  tech_name text;
begin
  if new.assigned_to is distinct from old.assigned_to and new.assigned_to is not null then
    select fullname into tech_name from public.profiles where id = new.assigned_to;
    insert into public.logs (action, user_id, ticket_id)
    values (format('Murojaat #%s → %s ga biriktirildi', new.id, coalesce(tech_name, '?')), actor, new.id);
  elsif new.status is distinct from old.status then
    insert into public.logs (action, user_id, ticket_id)
    values (format('Murojaat #%s → "%s"', new.id, new.status), actor, new.id);
  end if;
  return new;
end;
$$;

create trigger tickets_log_update
  after update on public.tickets
  for each row execute function public.tickets_log_update();

-- Fayl yuklanganda avtomatik log
create function public.attachments_log_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.logs (action, user_id, ticket_id)
  values (format('Murojaat #%s ga fayl yuklandi: %s', new.ticket_id, new.original), new.uploaded_by, new.ticket_id);
  return new;
end;
$$;

create trigger attachments_log_insert
  after insert on public.attachments
  for each row execute function public.attachments_log_insert();

-- ============================================================================
-- STATISTIKA RPC (SQL agregatsiya — Python for-loop o'rniga)
-- ============================================================================

create function public.get_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text := public.current_role_name();
  result json;
begin
  if caller_role not in ('admin','dispatcher') then
    raise exception 'Ruxsat yo''q';
  end if;

  select json_build_object(
    'total',      (select count(*) from tickets),
    'yangi',      (select count(*) from tickets where status = 'yangi'),
    'jarayon',    (select count(*) from tickets where status in ('qabul','jarayon')),
    'tugallandi', (select count(*) from tickets where status = 'tugallandi'),
    'bekor',      (select count(*) from tickets where status = 'bekor'),
    'by_category', (select coalesce(json_object_agg(problem_type, cnt), '{}'::json)
                     from (select problem_type, count(*) cnt from tickets group by problem_type) c),
    'by_priority', (select coalesce(json_object_agg(priority, cnt), '{}'::json)
                     from (select priority, count(*) cnt from tickets group by priority) p),
    'technician_kpi', (
      select coalesce(json_agg(json_build_object(
               'id', pr.id,
               'fullname', pr.fullname,
               'assigned', (select count(*) from tickets t where t.assigned_to = pr.id),
               'completed', (select count(*) from tickets t where t.assigned_to = pr.id and t.status = 'tugallandi'),
               'in_progress', (select count(*) from tickets t where t.assigned_to = pr.id and t.status in ('qabul','jarayon'))
             )), '[]'::json)
      from profiles pr where pr.role = 'technician'
    ),
    'online_users', 0
  ) into result;

  return result;
end;
$$;

-- ============================================================================
-- REALTIME
-- ============================================================================

alter publication supabase_realtime add table public.tickets;
