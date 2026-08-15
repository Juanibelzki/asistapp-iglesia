-- Migración opcional para el alta pública de congregaciones (/registerCongregacion).
-- Ejecutar en el SQL Editor de Supabase.

-- 1) Columnas para datos que no existían en el esquema real de organizations.
--    El código inserta city/pastor_name y, si fallan (42703), reintenta sin ellas.
alter table public.organizations
  add column if not exists city text,
  add column if not exists pastor_name text;

-- 2) Permitir que cualquier persona (anon) dé de alta una organización desde
--    el onboarding público. Sin esta política el INSERT falla con
--    "new row violates row-level security policy".
create policy "Allow public insert of organizations" on public.organizations
  for insert
  with check (true);
