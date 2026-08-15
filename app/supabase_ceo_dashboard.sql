-- Migración opcional para el Master Dashboard (/ceo).
-- Ejecutar en el SQL Editor de Supabase.

-- El panel /ceo lee organizations, congregados y attendance (SELECT anónimo ya funciona)
-- y actualiza el plan de cada iglesia. Si el UPDATE de plan falla con
-- "row-level security", ejecutar esta política:
create policy "Allow plan updates for ceo dashboard" on public.organizations
  for update
  using (true)
  with check (true);

-- Opcional: variable de entorno VITE_CEO_PIN en app/.env para cambiar el PIN maestro.
-- Por defecto el PIN es "2026".
