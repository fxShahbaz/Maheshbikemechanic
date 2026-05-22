-- ============================================================
-- Mahesh Bike Institute · enquiries table
-- Paste this in Supabase SQL Editor and click "Run"
-- ============================================================

create table if not exists public.enquiries (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text        not null,
  phone       text        not null,
  city        text,
  interest    text,
  status      text        not null default 'new'
              check (status in ('new', 'contacted', 'enrolled', 'closed')),
  notes       text,
  source      text        default 'website'
);

create index if not exists enquiries_created_at_idx
  on public.enquiries (created_at desc);

create index if not exists enquiries_status_idx
  on public.enquiries (status);

-- ============================================================
-- Row Level Security
-- All access goes through the service_role on the server.
-- No anon or authenticated policies = no client direct access.
-- ============================================================

alter table public.enquiries enable row level security;

-- Explicit deny-by-default for anon and authenticated roles.
-- (RLS without policies already denies, but we make it explicit.)
revoke all on public.enquiries from anon, authenticated;
grant  all on public.enquiries to   service_role;
