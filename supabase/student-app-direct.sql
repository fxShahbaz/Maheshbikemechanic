-- ============================================================
-- Mahesh Bike Institute · mobile app talks to Supabase directly
--
-- The app used to reach the database only through the webapp's
-- /api/student/* routes (service role). These functions move the same
-- checks into Postgres so the app can call them with the student's own
-- login (supabase.rpc), without the webapp being online.
--
-- Tables stay locked (no anon/authenticated grants). Each function is
-- SECURITY DEFINER, works only on the caller's own data (auth.uid()),
-- and returns only the columns the app shows. Mirrors
-- src/lib/student-portal.ts + src/lib/student-api.ts — keep both in sync.
--
-- Paste in Supabase SQL Editor and click "Run". Safe to re-run.
-- ============================================================

-- ---------- helpers (not callable by clients) ----------

-- Same list as ADMIN_EMAILS in src/lib/types.ts
create or replace function public.bmm_is_admin_email(p_email text)
returns boolean
language sql immutable
set search_path = ''
as $$
  select lower(trim(coalesce(p_email, ''))) in ('team.celvix@gmail.com', 'bmm2wservice@gmail.com');
$$;

create or replace function public.bmm_last10(p_phone text)
returns text
language sql immutable
set search_path = ''
as $$
  select case
    when length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) >= 10
      then right(regexp_replace(p_phone, '\D', '', 'g'), 10)
  end;
$$;

-- Caller's portal profile; created (pending) on first use, like
-- loadStudentProfile(). Raises 28000 (→ 401) when signed out,
-- 42501 (→ 403) for admin accounts.
create or replace function public.bmm_current_profile()
returns public.student_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_user  auth.users;
  v_row   public.student_profiles;
begin
  if v_uid is null then
    raise exception 'You are signed out.' using errcode = '28000';
  end if;

  select * into v_user from auth.users where id = v_uid;
  if not found then
    raise exception 'You are signed out.' using errcode = '28000';
  end if;
  if public.bmm_is_admin_email(v_user.email) then
    raise exception 'Admin accounts can''t use the student app.' using errcode = '42501';
  end if;

  select * into v_row from public.student_profiles where user_id = v_uid;
  if found then
    return v_row;
  end if;

  insert into public.student_profiles (user_id, name, email, phone)
  values (
    v_uid,
    coalesce(
      nullif(trim(v_user.raw_user_meta_data ->> 'full_name'), ''),
      nullif(split_part(coalesce(v_user.email, ''), '@', 1), ''),
      'Student'
    ),
    lower(coalesce(v_user.email, '')),
    nullif(trim(v_user.raw_user_meta_data ->> 'phone'), '')
  )
  on conflict (user_id) do nothing;

  select * into v_row from public.student_profiles where user_id = v_uid;
  return v_row;
end;
$$;

-- Active status and not past the expiry date (IST; expiry day itself is valid)
create or replace function public.bmm_has_access(p public.student_profiles)
returns boolean
language sql stable
set search_path = ''
as $$
  select p.status = 'active'
     and (p.access_expires_at is null
          or p.access_expires_at >= (now() at time zone 'Asia/Kolkata')::date);
$$;

-- Like bmm_current_profile, but 42501 (→ 403) unless access is active
create or replace function public.bmm_active_profile()
returns public.student_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.student_profiles := public.bmm_current_profile();
begin
  if not public.bmm_has_access(v_row) then
    raise exception 'Forbidden' using errcode = '42501';
  end if;
  return v_row;
end;
$$;

-- Admission record linked by email, else last 10 digits of phone
create or replace function public.bmm_admission(p public.student_profiles)
returns public.admissions
language sql stable
security definer
set search_path = ''
as $$
  select a.* from public.admissions a
  where lower(coalesce(a.email, '')) = lower(p.email)
     or (public.bmm_last10(p.phone) is not null
         and public.bmm_last10(a.phone) = public.bmm_last10(p.phone))
  order by (lower(coalesce(a.email, '')) = lower(p.email)) desc, a.created_at desc
  limit 1;
$$;

-- Batch assigned on the portal account, else from the admission
create or replace function public.bmm_batch(p public.student_profiles)
returns text
language sql stable
security definer
set search_path = ''
as $$
  select coalesce(
    nullif(trim(p.batch_no), ''),
    nullif(trim((select a.batch_no from public.bmm_admission(p) a)), '')
  );
$$;

-- Empty batches = everyone; otherwise only the listed batches
create or replace function public.bmm_batch_allowed(p_batches text[], p_batch text)
returns boolean
language sql immutable
set search_path = ''
as $$
  select coalesce(cardinality(p_batches), 0) = 0
      or (p_batch is not null and p_batch = any (p_batches));
$$;

-- Profile as sent to the app — admin notes stay internal
create or replace function public.bmm_public_profile(p public.student_profiles)
returns jsonb
language sql immutable
set search_path = ''
as $$
  select to_jsonb(p) - 'notes';
$$;

-- ---------- app API (callable by signed-in users) ----------

-- GET /me — who's signed in and whether the portal is unlocked
create or replace function public.student_me()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  p public.student_profiles := public.bmm_current_profile();
  v_active boolean := public.bmm_has_access(p);
  v_lock jsonb;
begin
  if not v_active then
    v_lock := case
      when p.status = 'pending' then jsonb_build_object(
        'heading', 'Awaiting approval',
        'message', 'Your account has been created. The institute will review and approve your access soon — check back here or contact the office.')
      when p.status = 'active' and p.access_expires_at is not null then jsonb_build_object(
        'heading', 'Access expired',
        'message', format('Your portal access ended on %s. Contact the institute to extend it.', p.access_expires_at))
      else jsonb_build_object(
        'heading', 'Access deactivated',
        'message', 'Your portal access has been turned off. Contact the institute if you think this is a mistake.')
    end;
  end if;
  return jsonb_build_object(
    'profile', public.bmm_public_profile(p),
    'active', v_active,
    'lock', v_lock
  );
end;
$$;

-- GET /practice — own sessions + active engine list
create or replace function public.student_practice()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  p public.student_profiles := public.bmm_active_profile();
begin
  return jsonb_build_object(
    'sessions', coalesce((
      select jsonb_agg(to_jsonb(s) order by s.punched_in_at desc)
      from (
        select * from public.practice_sessions
        where student_id = p.id
        order by punched_in_at desc
        limit 200
      ) s), '[]'::jsonb),
    'engines', coalesce((
      select jsonb_agg(jsonb_build_object('name', e.name, 'brand', e.brand)
                       order by e.sort_order, e.name)
      from public.engines e where e.active), '[]'::jsonb)
  );
end;
$$;

-- POST /practice — punch in (P0001 → 400 with the message)
create or replace function public.student_punch_in(p_engine text, p_notes text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  p public.student_profiles := public.bmm_active_profile();
  v_engine text := trim(coalesce(p_engine, ''));
  v_notes  text := nullif(trim(coalesce(p_notes, '')), '');
begin
  if v_engine = '' then
    raise exception 'Enter the engine number / name.';
  end if;
  -- With an admin-defined engine list, only active engines are allowed
  if exists (select 1 from public.engines)
     and not exists (select 1 from public.engines where name = v_engine and active) then
    raise exception 'Select an engine from the list.';
  end if;
  -- One open session at a time (lock the profile row against double taps)
  perform 1 from public.student_profiles where id = p.id for update;
  if exists (select 1 from public.practice_sessions
             where student_id = p.id and punched_out_at is null) then
    raise exception 'You already have an open session. Punch out first.';
  end if;

  insert into public.practice_sessions (student_id, engine, notes)
  values (p.id, v_engine, v_notes);
end;
$$;

-- POST /practice/:id/punch-out
create or replace function public.student_punch_out(p_session_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  p public.student_profiles := public.bmm_active_profile();
begin
  if coalesce(p_session_id, '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    raise exception 'Session not found or already punched out.';
  end if;
  update public.practice_sessions
     set punched_out_at = now()
   where id = p_session_id::uuid
     and student_id = p.id
     and punched_out_at is null;
  if not found then
    raise exception 'Session not found or already punched out.';
  end if;
end;
$$;

-- GET /materials — published material this student's batch may see
create or replace function public.student_materials()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  p public.student_profiles := public.bmm_active_profile();
  v_batch text := public.bmm_batch(p);
begin
  return jsonb_build_object('materials', coalesce((
    select jsonb_agg(jsonb_build_object(
             'id', m.id, 'created_at', m.created_at, 'title', m.title,
             'description', m.description, 'category', m.category,
             'file_size', m.file_size)
           order by m.created_at desc)
    from public.study_materials m
    where m.published and public.bmm_batch_allowed(m.batches, v_batch)
  ), '[]'::jsonb));
end;
$$;

-- Storage path of a material the caller may open (null otherwise).
-- The file itself is downloaded through the storage policy below.
create or replace function public.student_material_path(p_material_id text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  p public.student_profiles := public.bmm_active_profile();
begin
  if coalesce(p_material_id, '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return null;
  end if;
  return (
    select m.storage_path from public.study_materials m
    where m.id = p_material_id::uuid
      and m.published
      and public.bmm_batch_allowed(m.batches, public.bmm_batch(p))
  );
end;
$$;

-- Storage policy helper: may the caller read this object?
create or replace function public.bmm_can_read_material_object(p_name text)
returns boolean
language plpgsql stable
security definer
set search_path = ''
as $$
declare
  p public.student_profiles;
begin
  if auth.uid() is null then
    return false;
  end if;
  select * into p from public.student_profiles where user_id = auth.uid();
  if not found or not public.bmm_has_access(p) then
    return false;
  end if;
  return exists (
    select 1 from public.study_materials m
    where m.storage_path = p_name
      and m.published
      and public.bmm_batch_allowed(m.batches, public.bmm_batch(p))
  );
end;
$$;

-- GET /updates — published announcements for this student, pinned first.
-- The app adds isNew / ago / audience.
create or replace function public.student_updates()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  p public.student_profiles := public.bmm_active_profile();
  v_batch text := public.bmm_batch(p);
begin
  return jsonb_build_object(
    'batch', v_batch,
    'posts', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', a.id, 'created_at', a.created_at, 'title', a.title,
               'body', a.body, 'pinned', a.pinned, 'batches', a.batches)
             order by a.pinned desc, a.created_at desc)
      from public.announcements a
      where a.published and public.bmm_batch_allowed(a.batches, v_batch)
    ), '[]'::jsonb)
  );
end;
$$;

-- GET /profile — profile, linked admission (Aadhar masked) and fee summary
create or replace function public.student_profile()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  p public.student_profiles := public.bmm_active_profile();
  a public.admissions := public.bmm_admission(p);
  v_paid numeric;
  v_aadhar text;
begin
  if a.id is null then
    return jsonb_build_object('profile', public.bmm_public_profile(p), 'admission', null, 'fees', null);
  end if;

  select coalesce(sum(amount), 0) into v_paid from public.payments where admission_id = a.id;
  v_aadhar := regexp_replace(coalesce(a.aadhar_no, ''), '\D', '', 'g');

  return jsonb_build_object(
    'profile', public.bmm_public_profile(p),
    'admission', jsonb_build_object(
      'batch_no', a.batch_no,
      'created_at', a.created_at,
      'age', a.age,
      'address', a.address,
      'aadhar_masked', case
        when a.aadhar_no is null then '—'
        when length(v_aadhar) < 4 then 'XXXX'
        else 'XXXX XXXX ' || right(v_aadhar, 4) end,
      'family_name', a.family_name,
      'family_relation', a.family_relation,
      'family_phone', a.family_phone
    ),
    'fees', jsonb_build_object(
      'paid', v_paid,
      'total', a.total_fee,
      'due', case when a.total_fee is null then null else greatest(0, a.total_fee - v_paid) end,
      'pct', case when a.total_fee is not null and a.total_fee > 0
                  then least(100, round(v_paid / a.total_fee * 100)) end
    )
  );
end;
$$;

-- POST /push-token — register this device (any signed-in student)
create or replace function public.student_register_push(p_token text, p_platform text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  p public.student_profiles := public.bmm_current_profile();
  v_token text := trim(coalesce(p_token, ''));
begin
  if v_token !~ '^Expo(nent)?PushToken\[[^\]]+\]$' then
    raise exception 'Invalid push token.';
  end if;
  insert into public.push_tokens (token, student_id, platform, updated_at)
  values (v_token, p.id, case when p_platform in ('ios', 'android') then p_platform end, now())
  on conflict (token) do update
    set student_id = excluded.student_id,
        platform   = excluded.platform,
        updated_at = excluded.updated_at;
end;
$$;

-- DELETE /push-token — signing out: stop pushes to this device
create or replace function public.student_unregister_push(p_token text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  p public.student_profiles := public.bmm_current_profile();
begin
  delete from public.push_tokens where token = trim(coalesce(p_token, '')) and student_id = p.id;
end;
$$;

-- ---------- permissions ----------

-- Postgres grants EXECUTE to PUBLIC by default — take it away everywhere,
-- then allow only the app API functions for signed-in users.
revoke all on function public.bmm_is_admin_email(text)              from public, anon, authenticated;
revoke all on function public.bmm_last10(text)                      from public, anon, authenticated;
revoke all on function public.bmm_current_profile()                 from public, anon, authenticated;
revoke all on function public.bmm_has_access(public.student_profiles)      from public, anon, authenticated;
revoke all on function public.bmm_active_profile()                  from public, anon, authenticated;
revoke all on function public.bmm_admission(public.student_profiles)       from public, anon, authenticated;
revoke all on function public.bmm_batch(public.student_profiles)           from public, anon, authenticated;
revoke all on function public.bmm_batch_allowed(text[], text)       from public, anon, authenticated;
revoke all on function public.bmm_public_profile(public.student_profiles)  from public, anon, authenticated;
revoke all on function public.bmm_can_read_material_object(text)    from public, anon;
revoke all on function public.student_me()                          from public, anon;
revoke all on function public.student_practice()                    from public, anon;
revoke all on function public.student_punch_in(text, text)          from public, anon;
revoke all on function public.student_punch_out(text)               from public, anon;
revoke all on function public.student_materials()                   from public, anon;
revoke all on function public.student_material_path(text)           from public, anon;
revoke all on function public.student_updates()                     from public, anon;
revoke all on function public.student_profile()                     from public, anon;
revoke all on function public.student_register_push(text, text)     from public, anon;
revoke all on function public.student_unregister_push(text)         from public, anon;

grant execute on function public.bmm_can_read_material_object(text) to authenticated;
grant execute on function public.student_me()                       to authenticated;
grant execute on function public.student_practice()                 to authenticated;
grant execute on function public.student_punch_in(text, text)       to authenticated;
grant execute on function public.student_punch_out(text)            to authenticated;
grant execute on function public.student_materials()                to authenticated;
grant execute on function public.student_material_path(text)        to authenticated;
grant execute on function public.student_updates()                  to authenticated;
grant execute on function public.student_profile()                  to authenticated;
grant execute on function public.student_register_push(text, text)  to authenticated;
grant execute on function public.student_unregister_push(text)      to authenticated;

-- ---------- storage: students read only PDFs they're allowed to see ----------

drop policy if exists "students read allowed study materials" on storage.objects;
create policy "students read allowed study materials"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'study-materials' and public.bmm_can_read_material_object(name));
