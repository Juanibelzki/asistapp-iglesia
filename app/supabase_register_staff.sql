-- Migración opcional para el registro público de staff (/registerstaff).
-- Ejecutar en el SQL Editor de Supabase.

-- 1) Columnas para PIN y teléfono (no existen en el esquema real de profiles).
--    El código intenta insertar con pin/phone y, si falla (PGRST204/42703), reintenta sin ellas.
alter table public.profiles
  add column if not exists pin text,
  add column if not exists phone text;

-- 2) Permitir que voluntarios/ujieres/líderes se registren sin sesión de auth.
--    Sin esta política el INSERT en profiles falla con
--    "new row violates row-level security policy".
create policy "Allow public staff registration" on public.profiles
  for insert
  with check (true);