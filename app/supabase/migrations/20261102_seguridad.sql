-- 2026-11-02 · Seguridad: sesiones reales, PIN cifrado y RLS por iglesia y rol.
--
-- Antes: el login comparaba teléfono + PIN en el navegador (la tabla profiles era
-- legible y editable con la clave pública) y la "sesión" era un JSON en
-- localStorage que cualquiera podía escribir.
--
-- Ahora:
--   * El PIN se guarda cifrado (bcrypt) en profile_secrets, que nadie puede leer.
--   * Cada dispositivo tiene una sesión de Supabase (anónima para quienes entran
--     con PIN) y login_with_pin() la vincula al perfil en profile_sessions.
--   * Las políticas RLS limitan cada tabla a la iglesia del usuario y las
--     escrituras a los roles directivos.
--   * Las altas públicas, el portal del miembro, el check-in y el panel CEO pasan
--     por funciones que validan los datos del lado de la base.
--
-- Requiere habilitar "Anonymous sign-ins" en Authentication → Providers.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Tablas internas (RLS activo y sin políticas: solo las usan funciones)
-- ---------------------------------------------------------------------------

create table if not exists public.profile_secrets (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  pin_hash text not null
);
alter table public.profile_secrets enable row level security;

create table if not exists public.profile_sessions (
  auth_uid uuid primary key references auth.users(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.profile_sessions enable row level security;

create table if not exists public.login_attempts (
  id bigserial primary key,
  key text not null,
  success boolean not null default false,
  attempted_at timestamptz not null default now()
);
create index if not exists login_attempts_key_time on public.login_attempts (key, attempted_at desc);
alter table public.login_attempts enable row level security;

create table if not exists public.app_settings (
  key text primary key,
  value text not null
);
alter table public.app_settings enable row level security;

-- Migrar los PIN existentes a hash y borrar la columna en texto plano.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'pin'
  ) then
    insert into public.profile_secrets (profile_id, pin_hash)
    select id, extensions.crypt(pin, extensions.gen_salt('bf'))
    from public.profiles
    where pin is not null
    on conflict (profile_id) do nothing;
    alter table public.profiles drop column pin;
  end if;
end $$;

-- El escáner registra asistencia sin evento asociado.
alter table public.attendance alter column event_id drop not null;
create index if not exists attendance_congregado_time on public.attendance (congregado_id, check_in_time desc);

-- ---------------------------------------------------------------------------
-- Identidad del usuario actual
-- ---------------------------------------------------------------------------

create or replace function public.current_profile_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select ps.profile_id from public.profile_sessions ps where ps.auth_uid = auth.uid()),
    (select p.id from public.profiles p where p.auth_user_id = auth.uid() limit 1)
  )
$$;

create or replace function public.get_user_org_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select organization_id from public.profiles where id = public.current_profile_id()
$$;

create or replace function public.current_app_role()
returns text
language sql stable security definer set search_path = public
as $$
  select lower(coalesce(role, '')) from public.profiles where id = public.current_profile_id()
$$;

-- Pastor, administrador, líder o maestro.
create or replace function public.is_directive()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(public.current_app_role() in ('admin', 'pastor', 'leader', 'maestro'), false)
$$;

create or replace function public.is_org_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(public.current_app_role() in ('admin', 'pastor'), false)
$$;

create or replace function public.phone_key(p_phone text)
returns text
language sql immutable
as $$
  select right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 8)
$$;

create or replace function public._too_many_attempts(p_key text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select count(*) >= 5
  from public.login_attempts
  where key = p_key and not success and attempted_at > now() - interval '15 minutes'
$$;

-- ---------------------------------------------------------------------------
-- Sesión: login con teléfono + PIN, perfil actual y logout
-- ---------------------------------------------------------------------------

create or replace function public.login_with_pin(p_phone text, p_pin text)
returns table (profile_id uuid, organization_id uuid, role text, full_name text, church_name text)
language plpgsql security definer set search_path = public, extensions
as $$
#variable_conflict use_column
declare
  v_key text := 'login:' || public.phone_key(p_phone);
  v_profile public.profiles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'no_session';
  end if;
  if length(public.phone_key(p_phone)) < 6 or coalesce(p_pin, '') !~ '^\d{4}$' then
    return;
  end if;
  if public._too_many_attempts(v_key) then
    raise exception 'too_many_attempts';
  end if;

  select p.* into v_profile
  from public.profiles p
  join public.profile_secrets s on s.profile_id = p.id
  where public.phone_key(p.phone) = public.phone_key(p_phone)
    and s.pin_hash = extensions.crypt(p_pin, s.pin_hash)
  order by p.created_at desc
  limit 1;

  if v_profile.id is null then
    insert into public.login_attempts (key, success) values (v_key, false);
    return;
  end if;

  insert into public.login_attempts (key, success) values (v_key, true);
  insert into public.profile_sessions (auth_uid, profile_id)
  values (auth.uid(), v_profile.id)
  on conflict (auth_uid) do update set profile_id = excluded.profile_id, created_at = now();

  return query
  select v_profile.id, v_profile.organization_id, v_profile.role, v_profile.full_name, o.name
  from public.organizations o
  where o.id = v_profile.organization_id;
end;
$$;

create or replace function public.current_profile()
returns table (profile_id uuid, organization_id uuid, role text, full_name text, church_name text)
language sql stable security definer set search_path = public
as $$
  select p.id, p.organization_id, p.role, p.full_name, o.name
  from public.profiles p
  left join public.organizations o on o.id = p.organization_id
  where p.id = public.current_profile_id()
$$;

create or replace function public.logout_session()
returns void
language sql security definer set search_path = public
as $$
  delete from public.profile_sessions where auth_uid = auth.uid()
$$;

-- ---------------------------------------------------------------------------
-- Altas públicas
-- ---------------------------------------------------------------------------

create or replace function public.public_church_list()
returns table (id uuid, name text, address text, logo_url text, motto text)
language sql stable security definer set search_path = public
as $$
  select o.id, o.name, o.address, o.logo_url, o.motto from public.organizations o order by o.name
$$;

-- Crea la iglesia y a su pastor como administrador.
create or replace function public.register_church(
  p_name text, p_city text, p_address text, p_pastor_name text, p_phone text, p_pin text
)
returns table (organization_id uuid)
language plpgsql security definer set search_path = public, extensions
as $$
#variable_conflict use_column
declare
  v_org uuid;
  v_profile uuid;
begin
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_pastor_name), '') = '' then
    raise exception 'missing_fields';
  end if;
  if length(public.phone_key(p_phone)) < 6 or coalesce(p_pin, '') !~ '^\d{4}$' then
    raise exception 'invalid_credentials';
  end if;
  if exists (select 1 from public.profiles where public.phone_key(phone) = public.phone_key(p_phone)) then
    raise exception 'phone_taken';
  end if;

  insert into public.organizations (name, city, address, phone, pastor_name, member_limit)
  values (trim(p_name), nullif(trim(p_city), ''), nullif(trim(p_address), ''),
          regexp_replace(p_phone, '\D', '', 'g'), trim(p_pastor_name), 40)
  returning id into v_org;

  insert into public.profiles (organization_id, full_name, role, phone)
  values (v_org, trim(p_pastor_name), 'admin', regexp_replace(p_phone, '\D', '', 'g'))
  returning id into v_profile;

  insert into public.profile_secrets (profile_id, pin_hash)
  values (v_profile, extensions.crypt(p_pin, extensions.gen_salt('bf')));

  return query select v_org;
end;
$$;

-- Alta pública de ujieres: el rol siempre es staff.
create or replace function public.register_staff(p_org uuid, p_full_name text, p_phone text, p_pin text)
returns void
language plpgsql security definer set search_path = public, extensions
as $$
declare
  v_profile uuid;
begin
  if not exists (select 1 from public.organizations where id = p_org) then
    raise exception 'church_not_found';
  end if;
  if coalesce(trim(p_full_name), '') = '' then
    raise exception 'missing_fields';
  end if;
  if length(public.phone_key(p_phone)) < 6 or coalesce(p_pin, '') !~ '^\d{4}$' then
    raise exception 'invalid_credentials';
  end if;
  if exists (select 1 from public.profiles where public.phone_key(phone) = public.phone_key(p_phone)) then
    raise exception 'phone_taken';
  end if;

  insert into public.profiles (organization_id, full_name, role, phone)
  values (p_org, trim(p_full_name), 'staff', regexp_replace(p_phone, '\D', '', 'g'))
  returning id into v_profile;

  insert into public.profile_secrets (profile_id, pin_hash)
  values (v_profile, extensions.crypt(p_pin, extensions.gen_salt('bf')));
end;
$$;

-- Auto-inscripción de miembros con control del cupo del plan.
create or replace function public.register_member(
  p_org uuid, p_first_name text, p_last_name text, p_phone text, p_is_student boolean,
  p_student_stage text, p_guardian_name text, p_guardian_phone text
)
returns table (id uuid, qr_code text)
language plpgsql security definer set search_path = public
as $$
#variable_conflict use_column
declare
  v_limit int;
begin
  select coalesce(member_limit, 50) into v_limit from public.organizations where organizations.id = p_org;
  if v_limit is null then
    raise exception 'church_not_found';
  end if;
  if coalesce(trim(p_first_name), '') = '' or coalesce(trim(p_last_name), '') = '' then
    raise exception 'missing_fields';
  end if;
  if (select count(*) from public.congregados c where c.organization_id = p_org) >= v_limit then
    raise exception 'member_limit';
  end if;

  return query
  insert into public.congregados (
    organization_id, first_name, last_name, phone, is_student, student_stage,
    guardian_name, guardian_phone, qr_code, status
  )
  values (
    p_org, trim(p_first_name), trim(p_last_name), nullif(trim(p_phone), ''), coalesce(p_is_student, false),
    case when coalesce(p_is_student, false) then p_student_stage end,
    nullif(trim(p_guardian_name), ''), nullif(trim(p_guardian_phone), ''),
    gen_random_uuid()::text, 'activo'
  )
  returning congregados.id, congregados.qr_code;
end;
$$;

-- ---------------------------------------------------------------------------
-- Portal del miembro: solo los campos que se muestran
-- ---------------------------------------------------------------------------

create or replace function public.member_portal(p_code text, p_today date default current_date)
returns json
language plpgsql stable security definer set search_path = public
as $$
declare
  m public.congregados%rowtype;
begin
  if coalesce(length(p_code), 0) < 16 then
    return null;
  end if;
  select * into m from public.congregados c where c.qr_code = p_code or c.id::text = p_code limit 1;
  if m.id is null then
    return null;
  end if;

  return json_build_object(
    'member', json_build_object(
      'id', m.id, 'organization_id', m.organization_id, 'first_name', m.first_name,
      'last_name', m.last_name, 'is_student', coalesce(m.is_student, false),
      'student_stage', m.student_stage, 'status', m.status, 'qr_code', m.qr_code
    ),
    'church_name', (select o.name from public.organizations o where o.id = m.organization_id),
    'events', coalesce((
      select json_agg(json_build_object('id', e.id, 'title', e.title,
                                        'event_date', to_char(e.event_date, 'YYYY-MM-DD'))
                      order by e.event_date)
      from public.events e
      where e.organization_id = m.organization_id and e.event_date >= p_today
    ), '[]'::json),
    'materials', coalesce((
      select json_agg(json_build_object('id', s.id, 'title', s.title, 'description', s.description,
                                        'file_url', s.file_url)
                      order by s.created_at desc)
      from public.study_materials s
      where s.organization_id = m.organization_id
        and s.target_stage in ('todos', coalesce(m.student_stage, 'adulto'))
    ), '[]'::json)
  );
end;
$$;

-- Recuperar la credencial con teléfono + apellido, con límite de intentos.
create or replace function public.member_portal_by_phone(p_phone text, p_last_name text, p_today date default current_date)
returns json
language plpgsql security definer set search_path = public
as $$
declare
  v_key text := 'portal:' || public.phone_key(p_phone);
  v_code text;
begin
  if length(public.phone_key(p_phone)) < 6 or coalesce(trim(p_last_name), '') = '' then
    return null;
  end if;
  if public._too_many_attempts(v_key) then
    raise exception 'too_many_attempts';
  end if;

  select c.qr_code into v_code
  from public.congregados c
  where public.phone_key(c.phone) = public.phone_key(p_phone)
    and lower(trim(c.last_name)) = lower(trim(p_last_name))
  order by c.created_at desc
  limit 1;

  insert into public.login_attempts (key, success) values (v_key, v_code is not null);
  if v_code is null then
    return null;
  end if;
  return public.member_portal(v_code, p_today);
end;
$$;

-- ---------------------------------------------------------------------------
-- Check-in del escáner
-- ---------------------------------------------------------------------------

create or replace function public.record_checkin(p_congregado uuid, p_at timestamptz default now())
returns text
language plpgsql security definer set search_path = public
as $$
declare
  v_org uuid := public.get_user_org_id();
  v_at timestamptz := coalesce(p_at, now());
begin
  if v_org is null then
    raise exception 'not_allowed';
  end if;
  if not exists (select 1 from public.congregados where id = p_congregado and organization_id = v_org) then
    raise exception 'not_allowed';
  end if;
  -- Un registro por persona cada 6 horas evita duplicados del mismo culto.
  if exists (
    select 1 from public.attendance
    where congregado_id = p_congregado and check_in_time > v_at - interval '6 hours'
  ) then
    return 'duplicate';
  end if;

  insert into public.attendance (organization_id, congregado_id, check_in_time)
  values (v_org, p_congregado, v_at);
  return 'ok';
end;
$$;

-- ---------------------------------------------------------------------------
-- Panel CEO: PIN cifrado en la base y verificado con límite de intentos
-- ---------------------------------------------------------------------------

create or replace function public._ceo_verify(p_pin text)
returns boolean
language plpgsql security definer set search_path = public, extensions
as $$
declare
  v_hash text;
  v_ok boolean;
begin
  select value into v_hash from public.app_settings where key = 'ceo_pin_hash';
  if v_hash is null then
    return false;
  end if;
  v_ok := coalesce(p_pin, '') <> '' and extensions.crypt(p_pin, v_hash) = v_hash;
  insert into public.login_attempts (key, success) values ('ceo', v_ok);
  return v_ok;
end;
$$;

create or replace function public.ceo_overview(p_pin text)
returns json
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.app_settings where key = 'ceo_pin_hash') then
    return json_build_object('error', 'not_configured');
  end if;
  if public._too_many_attempts('ceo') then
    return json_build_object('error', 'too_many_attempts');
  end if;
  if not public._ceo_verify(p_pin) then
    return json_build_object('error', 'invalid_pin');
  end if;

  return json_build_object(
    'orgs', coalesce((
      select json_agg(json_build_object('id', o.id, 'name', o.name, 'address', o.address,
                                        'phone', o.phone, 'plan', o.plan, 'created_at', o.created_at)
                      order by o.created_at desc)
      from public.organizations o
    ), '[]'::json),
    'member_counts', coalesce((
      select json_object_agg(organization_id, n)
      from (select organization_id, count(*) n from public.congregados group by organization_id) c
    ), '{}'::json),
    'members_total', (select count(*) from public.congregados),
    'attendance_total', (select count(*) from public.attendance)
  );
end;
$$;

create or replace function public.ceo_set_plan(p_pin text, p_org uuid, p_plan text)
returns json
language plpgsql security definer set search_path = public
as $$
begin
  if public._too_many_attempts('ceo') then
    return json_build_object('error', 'too_many_attempts');
  end if;
  if not public._ceo_verify(p_pin) then
    return json_build_object('error', 'invalid_pin');
  end if;
  if p_plan not in ('Semilla', 'Comunidad', 'Pro') then
    return json_build_object('error', 'invalid_plan');
  end if;
  update public.organizations set plan = p_plan where id = p_org;
  return json_build_object('ok', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- Permisos de ejecución
-- ---------------------------------------------------------------------------

revoke execute on function public._ceo_verify(text) from public, anon, authenticated;
revoke execute on function public._too_many_attempts(text) from public, anon, authenticated;
-- La función vieja de alta por email permitía reasignar un perfil existente.
revoke execute on function public.register_church_admin(uuid, text, text, text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Políticas RLS: se reemplazan todas las de las tablas públicas
-- ---------------------------------------------------------------------------

do $$
declare
  r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('organizations', 'profiles', 'congregados', 'events', 'attendance', 'study_materials', 'children')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Iglesias: cada usuario ve la suya; solo el admin la edita (sin tocar el plan).
create policy org_select on public.organizations for select to authenticated
  using (id = public.get_user_org_id());
create policy org_update on public.organizations for update to authenticated
  using (id = public.get_user_org_id() and public.is_org_admin())
  with check (id = public.get_user_org_id());
revoke insert, update, delete on public.organizations from anon, authenticated;
grant update (name, motto, address, phone, city, pastor_name, logo_url) on public.organizations to authenticated;

-- Perfiles: los directivos ven el equipo de su iglesia; cada uno se ve a sí mismo.
create policy profiles_select on public.profiles for select to authenticated
  using (organization_id = public.get_user_org_id()
         and (public.is_directive() or id = public.current_profile_id()));
create policy profiles_update on public.profiles for update to authenticated
  using (id = public.current_profile_id())
  with check (id = public.current_profile_id());
create policy profiles_delete on public.profiles for delete to authenticated
  using (organization_id = public.get_user_org_id() and public.is_org_admin()
         and id <> public.current_profile_id());
revoke insert, update on public.profiles from anon, authenticated;
grant update (full_name, email) on public.profiles to authenticated;

-- Congregados: todo el equipo de la iglesia los ve; los directivos los editan.
create policy congregados_select on public.congregados for select to authenticated
  using (organization_id = public.get_user_org_id());
create policy congregados_write on public.congregados for all to authenticated
  using (organization_id = public.get_user_org_id() and public.is_directive())
  with check (organization_id = public.get_user_org_id() and public.is_directive());

-- Eventos.
create policy events_select on public.events for select to authenticated
  using (organization_id = public.get_user_org_id());
create policy events_write on public.events for all to authenticated
  using (organization_id = public.get_user_org_id() and public.is_directive())
  with check (organization_id = public.get_user_org_id() and public.is_directive());

-- Asistencia: el alta va por record_checkin(); los directivos la consultan y corrigen.
create policy attendance_select on public.attendance for select to authenticated
  using (organization_id = public.get_user_org_id() and public.is_directive());
create policy attendance_delete on public.attendance for delete to authenticated
  using (organization_id = public.get_user_org_id() and public.is_directive());
revoke insert, update on public.attendance from anon, authenticated;

-- Materiales de estudio (el portal los recibe vía member_portal()).
create policy materials_select on public.study_materials for select to authenticated
  using (organization_id = public.get_user_org_id());
create policy materials_write on public.study_materials for all to authenticated
  using (organization_id = public.get_user_org_id() and public.is_directive())
  with check (organization_id = public.get_user_org_id() and public.is_directive());

-- children es una tabla vieja sin uso: sin políticas, nadie accede.

-- ---------------------------------------------------------------------------
-- Storage: solo directivos suben o borran, y solo dentro de la carpeta de su iglesia
-- ---------------------------------------------------------------------------

do $$
declare
  r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and (coalesce(qual, '') ~ '(study-files|church-assets)' or coalesce(with_check, '') ~ '(study-files|church-assets)')
  loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;
end $$;

create policy church_files_read on storage.objects for select
  using (bucket_id in ('study-files', 'church-assets'));
create policy church_files_insert on storage.objects for insert to authenticated
  with check (bucket_id in ('study-files', 'church-assets') and public.is_directive()
              and (storage.foldername(name))[1] = public.get_user_org_id()::text);
create policy church_files_update on storage.objects for update to authenticated
  using (bucket_id in ('study-files', 'church-assets') and public.is_directive()
         and (storage.foldername(name))[1] = public.get_user_org_id()::text);
create policy church_files_delete on storage.objects for delete to authenticated
  using (bucket_id in ('study-files', 'church-assets') and public.is_directive()
         and (storage.foldername(name))[1] = public.get_user_org_id()::text);
