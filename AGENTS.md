# AGENTS.md

AsistApp — SaaS de control de asistencia y gestión infantil para iglesias. Stack: **TanStack Start** (React Router + Vite + Nitro SSR) + **Tailwind CSS v4** + **Supabase**. El código vive en `app/`; la raíz solo tiene `.env`, un `package.json` con deps compartidas y `node_modules`. Comunicación en español (código, commits y mensajes).

## Comandos (ejecutar desde `app/`)
- Dev server: `npm run dev` → `http://localhost:3000` (Vite; escucha en IPv6 `::1`).
- Build: `npm run build` → `vite build` + Nitro; salida en `app/.output`.
- Verificar SSR de producción: `node .output/server/index.mjs` (después de build) y revisar que el HTML servido incluya `<link rel="stylesheet">`.
- Generar rutas: `npm run generate-routes` (las rutas por archivo suelen regenerarse solas con dev/build).
- No hay scripts de test ni lint. El "test" de facto es `npm run build` + revisar el HTML SSR.

## Shell: Windows PowerShell
- No existe `grep` / `rm -rf` / `&&`. Usar `Select-String`, `Remove-Item`, `; if ($?) { ... }`.
- Para `Start-Process` usar `npm.cmd` (npm no es una app Win32).
- Directorio temporal aprobado: `C:\Users\juaniB\AppData\Local\Temp\opencode`.

## Arquitectura (asunciones erróneas comunes)
- **Es TanStack Start, NO Vite estándar**: no existe `main.tsx`, `index.tsx` ni `index.html`. Los entry points los genera el plugin `tanstackStart()` en `app/vite.config.ts`. No crees esos archivos.
- Rutas por archivos en `app/src/routes/`; `routeTree.gen.ts` y `app/src/router.tsx` (factory `getRouter`) son generados. Para añadir ruta, crear el archivo en `routes/`.
- **Tailwind v4 vía plugin `@tailwindcss/vite`** y configuración en CSS (`app/src/styles.css`: `@import "tailwindcss"` + `@theme`). NO crees `tailwind.config.*` ni `postcss.config.*` — no se usan y son configuración muerta.
- **CRÍTICO — estilos:** `app/src/routes/__root.tsx` debe mantener `shellComponent` con `<html><head><HeadContent/></head><body>{children}<Scripts/></body></html>` e `import '../styles.css'`. Si se elimina el shell (o `HeadContent`), el SSR deja de inyectar el `<link>` del stylesheet y la app se ve sin estilos (fondo blanco, tipografía base). Síntoma: el HTML servido no contiene `stylesheet`. Tema oscuro forzado con `className="dark"` en `<html>`.
- Los botones decorativos sin `onClick` son un patrón de bug real en este repo (p. ej. "Nuevo Evento", "Añadir evento"). Todo botón que parezca de acción debe tener handler.

## Supabase
- Cliente en `app/src/lib/supabase.ts`; credenciales `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` en `app/.env`. No modifiques `supabase.ts` ni commitees `.env`.
- Registro usa la RPC `register_church_admin` (SECURITY DEFINER) con params `p_auth_user_id`, `p_full_name`, `p_email`, `p_church_name`.
- RLS está habilitado: INSERT/UPDATE requieren políticas. Ver `app/supabase_rls.sql`; si falta una, crearla en el SQL Editor de Supabase, p. ej.:
  ```sql
  create policy "Users can manage data in their organization" on <tabla>
    for all using (organization_id = (select organization_id from profiles where auth_user_id = auth.uid()));
  ```
  (INSERT en `events`/`congregados`/`profiles` fallan con `new row violates row-level security policy` si no existe.)
- **Gotcha de esquema:** `app/supabase_schema.sql` es de Fase 1 y NO coincide con la BD real. Esquema real verificado:
  - `congregados`: `id, organization_id, first_name, last_name, phone, is_student, student_stage (niño/adolescente/adulto), guardian_name, guardian_phone, status, qr_code, created_at`.
  - `events`: SOLO `id, title, event_date, organization_id, created_at`. No existen `event_type`, `start_time`, `created_by`, `qr_token`, `status`.
  - Para inspeccionar columnas reales: `GET https://<ref>.supabase.co/rest/v1/<tabla>?select=<col>&limit=1` con headers `apikey` y `Authorization` (anon). Un error `PGRST204` indica columna inexistente.
- Google/Apple OAuth requieren activarse manualmente en Supabase Dashboard (Authentication → Providers); el código cliente no puede hacerlo (falta credenciales).
- Insertar congregados genera `qr_code` con `crypto.randomUUID()`.

## TypeScript / calidad
- `npx tsc --noEmit` falla con MUCHOS errores PREEXISTENTES (faltan `three`, paquetes radix-ui de shadcn, imports sin usar, link a ruta eliminada). `npm run build` (Vite) NO falla por tipos. No trates errores de tsc como regresiones; valida solo los archivos que tocas (filtrar: `npx tsc --noEmit 2>&1 | Select-String -Pattern "<archivo>"`).
- La ruta `/ninos` fue eliminada y reemplazada por `/congregados`; no enlaces a `/ninos`.
- Los componentes de `app/src/components/ui/` (shadcn) referencian paquetes radix-ui no instalados — no los uses como dependencia de nuevas features.

## Deeps / dependencias
- Deps compartidas declaradas en el `package.json` de la raíz (p. ej. `@supabase/supabase-js`, `qrcode.react`, `html5-qrcode`, `stripe`) y resueltas desde `node_modules` de raíz. Antes de añadir un paquete, verifica dónde se resuelve el import.

## Archivos clave
- `app/src/routes/__root.tsx` — shell del documento + import CSS (ver arriba).
- `app/src/routes/dashboard.tsx` — KPIs reales (query `congregados` y `events`), modal crear evento.
- `app/src/routes/congregados.tsx` — directorio + modal de registro (insert con `organization_id` y `qr_code`).
- `app/src/lib/data.ts` — helpers de consultas (`getProfile`, `getEvents`, `getOrganization`, etc.).
- `app/src/lib/auth.ts` — `handleSocialLogin` (OAuth).
- `app/src/components/` — Header/Footer, SocialButtons, ThemeToggle, `ui/` (shadcn).

## Referencia
- `app/AGENTS.md` contiene la guía TanStack Intent: antes de editar funcionalidad de TanStack/Start, ejecutar `npx @tanstack/intent@latest load <id>` con el id correspondiente.