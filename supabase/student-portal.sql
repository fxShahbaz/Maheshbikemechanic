-- ============================================================
-- Mahesh Bike Institute · student portal tables
-- Applied to Supabase as migration "student_portal_core".
-- Kept here as the repo mirror of the live schema.
-- ============================================================

create table if not exists public.student_profiles (
  id                uuid        primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  user_id           uuid        not null unique references auth.users (id) on delete cascade,
  name              text        not null,
  email             text        not null,
  phone             text,
  status            text        not null default 'pending'
                    check (status in ('pending', 'active', 'inactive')),
  access_expires_at date,
  approved_at       timestamptz,
  notes             text
);

create table if not exists public.practice_sessions (
  id             uuid        primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  student_id     uuid        not null references public.student_profiles (id) on delete cascade,
  engine         text        not null,
  punched_in_at  timestamptz not null default now(),
  punched_out_at timestamptz,
  notes          text,
  check (punched_out_at is null or punched_out_at >= punched_in_at)
);

create index if not exists practice_sessions_student_idx
  on public.practice_sessions (student_id, punched_in_at desc);

create table if not exists public.study_materials (
  id           uuid        primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  title        text        not null,
  description  text,
  storage_path text        not null unique,
  file_size    bigint,
  published    boolean     not null default true
);

create table if not exists public.announcements (
  id         uuid        primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title      text        not null,
  body       text,
  published  boolean     not null default true,
  pinned     boolean     not null default false
);

-- Workshop engines students can punch in on (admin-managed list).
create table if not exists public.engines (
  id         uuid        primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text        not null unique,
  brand      text,
  active     boolean     not null default true,
  sort_order integer     not null default 1000
);

-- Same pattern as enquiries: RLS on, no anon/authenticated policies.
-- All access goes through the service_role on the server.
alter table public.student_profiles  enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.study_materials   enable row level security;
alter table public.announcements     enable row level security;
alter table public.engines           enable row level security;

-- Explicit deny-by-default for anon and authenticated roles.
-- Only the server's service_role can touch these tables — students can
-- never read or write access, profile, admission or payment data directly.
revoke all on public.student_profiles  from anon, authenticated;
revoke all on public.practice_sessions from anon, authenticated;
revoke all on public.study_materials   from anon, authenticated;
revoke all on public.announcements     from anon, authenticated;
revoke all on public.engines           from anon, authenticated;
revoke all on public.admissions        from anon, authenticated;
revoke all on public.payments          from anon, authenticated;

grant all on public.student_profiles  to service_role;
grant all on public.practice_sessions to service_role;
grant all on public.study_materials   to service_role;
grant all on public.announcements     to service_role;
grant all on public.engines           to service_role;
grant all on public.admissions        to service_role;
grant all on public.payments          to service_role;

-- Private bucket for study material PDFs (served only via the app's
-- authenticated streaming route, never by public URL).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('study-materials', 'study-materials', false, 52428800, array['application/pdf'])
on conflict (id) do nothing;
