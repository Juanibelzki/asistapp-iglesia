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
- **CRÍTICO — estilos:** `app/src/routes/__root.tsx` debe mantener `shellComponent` con `<html><head><HeadContent/></head><body>{children}<Scripts/></body></html>` e `import '../styles.css'`. Si se elimina el shell (o `HeadContent`), el SSR deja de inyectar el `<link>` del stylesheet y la app se ve sin estilos. Síntoma: el HTML servido no contiene `stylesheet`.
- **Tema claro/oscuro (ya NO es oscuro forzado):** el shell inyecta `themeInitScript` (`lib/theme.ts`) en `<head>` para aplicar la clase `dark` antes del primer pintado (localStorage `ecclesiahs_theme` o preferencia del sistema). Usá `useTheme()`/`<ThemeToggle/>`.
- Los botones decorativos sin `onClick` son un patrón de bug real en este repo (p. ej. "Nuevo Evento", "Añadir evento"). Todo botón que parezca de acción debe tener handler.

## Frontend (rediseño "Vitral")
- **Tokens de diseño** en `app/src/styles.css` (variables CSS `:root` / `.dark` mapeadas con `@theme inline`). Usá clases semánticas: `bg-canvas`, `bg-surface`, `bg-sunken`, `text-ink`, `text-ink-soft`, `text-ink-faint`, `border-line`, `bg-primary`, `bg-primary-soft`, `bg-accent`, `text-success`, `text-danger`… **No** uses colores fijos (`slate-*`, `yellow-*`, `#0B0F17`) en código nuevo. Fuentes: Bricolage Grotesque (`font-display`) + Figtree.
- **UI propia** (sin radix) en `app/src/components/ui/`: `Button/LinkButton`, `Field/Input/Select/Textarea/SwitchRow`, `Card`, `Badge`, `Modal/ConfirmDialog`, `Segmented`, `Alert/EmptyState/Skeleton/Spinner`, `useToast()` (`ToastProvider` en el root). Nunca uses `window.confirm`; usá `ConfirmDialog`.
- Layouts en `components/layout/`: `AppShell` (zona autenticada), `AuthLayout`, `CenteredLayout`, `PublicPage`, `SiteHeader/Footer`. Landing en `components/landing/`.
- **Zona autenticada**: ruta pathless `routes/_app.tsx` (`OrgProvider` + `AppShell`). Las páginas hijas se llaman `_app.<ruta>.tsx` y conservan su URL (`/dashboard`, `/congregados`). Dentro usá `useOrg()` (`orgId, fullName, churchName, memberLimit, signOut`) en vez de repetir la resolución de sesión. Redirige a `/login` o `/asistencia` (staff) automáticamente.
- Datos en `lib/`: `congregados.ts`, `events.ts`, `registro.ts`, `login.ts`; carga con `useResource(fetcher, deps)` (`lib/hooks.ts`).
- **Migración pendiente (aún con estilos oscuros/dorados antiguos):** `asistencia`, `ajustes`, `materiales`, `suscripcion`, `portal`, `escanear`, `eventos*`, `ceo`, `registerstaff`. Al migrarlas, moverlas bajo `_app.` cuando deban llevar el shell y quitar su header propio.

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
- `npx tsc --noEmit` tiene unos pocos errores PREEXISTENTES en archivos legacy (stripe, escanear, eventos, vite.config). `npm run build` (Vite) NO falla por tipos. No trates errores de tsc como regresiones; valida solo los archivos que tocas (filtrar: `npx tsc --noEmit 2>&1 | Select-String -Pattern "<archivo>"`).
- La ruta `/ninos` fue eliminada y reemplazada por `/congregados`; no enlaces a `/ninos`.
- `app/src/components/ui/` ya NO es shadcn: son componentes propios sin radix (ver sección Frontend).

## Deeps / dependencias
- Deps compartidas declaradas en el `package.json` de la raíz (p. ej. `@supabase/supabase-js`, `qrcode.react`, `html5-qrcode`, `stripe`) y resueltas desde `node_modules` de raíz. Antes de añadir un paquete, verifica dónde se resuelve el import.

## Archivos clave
- `app/src/routes/__root.tsx` — shell del documento + import CSS (ver arriba).
- `app/src/routes/_app.dashboard.tsx` — KPIs reales (query `congregados` y `events`), modal crear evento.
- `app/src/routes/_app.congregados.tsx` — directorio + modal de registro (insert con `organization_id` y `qr_code`).
- `app/src/lib/data.ts` — helpers de consultas (`getProfile`, `getEvents`, `getOrganization`, etc.).
- `app/src/lib/auth.ts` — `handleSocialLogin` (OAuth).
- `app/src/components/` — `ui/`, `layout/`, `landing/`, `brand/`, `dashboard/`, `congregados/`.

## Referencia
- `app/AGENTS.md` contiene la guía TanStack Intent: antes de editar funcionalidad de TanStack/Start, ejecutar `npx @tanstack/intent@latest load <id>` con el id correspondiente.