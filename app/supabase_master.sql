-- ==============================================================================
-- MASTER SUPABASE SCHEMA PARA ECCLESIAHS (SaaS Multi-tenant para Iglesias)
-- Este script es idempotente y puede ejecutarse de forma segura múltiples veces.
-- ==============================================================================

-- ==========================================
-- SECCIÓN 1: EXTENSIONES Y FUNCIONES BASE
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- SECCIÓN 2: DEFINICIÓN DE TABLAS
-- ==========================================

-- 2.1 organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  pastor_name text,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial','basico','pro')),
  subscription_status text NOT NULL DEFAULT 'trialing' CHECK (subscription_status IN ('trialing','active','past_due','canceled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2.2 profiles (Usuarios: Admins, Ujieres, Staff)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  auth_user_id uuid,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'maestro' CHECK (role IN ('admin','maestro')),
  pin text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2.3 congregados (Miembros de la iglesia)
CREATE TABLE IF NOT EXISTS public.congregados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  birth_date date,
  is_student boolean DEFAULT false,
  student_stage text CHECK (student_stage IN ('niño','adolescente','adulto')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2.4 children (Niños, alternativo o complemento a congregados si es específico)
CREATE TABLE IF NOT EXISTS public.children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  group_name text NOT NULL CHECK (group_name IN ('Preescolar','Primaria','Adolescentes')),
  birth_date date,
  guardian_name text,
  guardian_phone text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2.5 events (Eventos, clases, reuniones)
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  event_type text NOT NULL DEFAULT 'clase_sabado' CHECK (event_type IN ('clase_sabado','actividad_semana')),
  event_date date NOT NULL,
  start_time time,
  qr_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2.6 attendance (Registro de asistencia)
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  child_id uuid REFERENCES public.children(id) ON DELETE CASCADE,
  congregado_id uuid REFERENCES public.congregados(id) ON DELETE CASCADE,
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  checked_in_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'presente' CHECK (status IN ('presente','justificado')),
  -- Unique constraints para evitar doble check-in
  UNIQUE (event_id, child_id),
  UNIQUE (event_id, congregado_id)
);


-- ==========================================
-- SECCIÓN 3: ÍNDICES (Optimización de búsquedas)
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_cust ON public.organizations(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_congregados_org_id ON public.congregados(organization_id);
CREATE INDEX IF NOT EXISTS idx_children_org_id ON public.children(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_org_id ON public.events(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_attendance_event_id ON public.attendance(event_id);


-- ==========================================
-- SECCIÓN 4: FUNCIONES AUXILIARES (Helper Functions)
-- ==========================================
-- Función para obtener el organization_id del usuario actual sin caer en recursividad infinita
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS uuid
SET search_path = public
AS $$
  SELECT organization_id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ==========================================
-- SECCIÓN 5: SEGURIDAD Y POLÍTICAS RLS
-- ==========================================

-- 5.1 Habilitar RLS en todas las tablas
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.congregados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 5.2 Limpiar políticas existentes para evitar errores de duplicación
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can update their own organization" ON public.organizations;
DROP POLICY IF EXISTS "Allow public insert of organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow plan updates for ceo dashboard" ON public.organizations;

DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "Allow public staff registration" ON public.profiles;

DROP POLICY IF EXISTS "Users can view congregados in their organization" ON public.congregados;
DROP POLICY IF EXISTS "Users can insert congregados in their organization" ON public.congregados;
DROP POLICY IF EXISTS "Users can update congregados in their organization" ON public.congregados;
DROP POLICY IF EXISTS "Users can delete congregados in their organization" ON public.congregados;

DROP POLICY IF EXISTS "Users can view children in their organization" ON public.children;
DROP POLICY IF EXISTS "Users can insert children in their organization" ON public.children;
DROP POLICY IF EXISTS "Users can update children in their organization" ON public.children;
DROP POLICY IF EXISTS "Users can delete children in their organization" ON public.children;

DROP POLICY IF EXISTS "Users can view events in their organization" ON public.events;
DROP POLICY IF EXISTS "Users can insert events in their organization" ON public.events;
DROP POLICY IF EXISTS "Users can update events in their organization" ON public.events;
DROP POLICY IF EXISTS "Users can delete events in their organization" ON public.events;

DROP POLICY IF EXISTS "Users can view attendance in their organization" ON public.attendance;
DROP POLICY IF EXISTS "Users can insert attendance in their organization" ON public.attendance;
DROP POLICY IF EXISTS "Users can update attendance in their organization" ON public.attendance;
DROP POLICY IF EXISTS "Users can delete attendance in their organization" ON public.attendance;

-- 5.3 Crear Políticas para organizations
CREATE POLICY "Users can view their own organization" ON public.organizations FOR SELECT USING (id = get_user_org_id());
CREATE POLICY "Users can update their own organization" ON public.organizations FOR UPDATE USING (id = get_user_org_id());
CREATE POLICY "Allow public insert of organizations" ON public.organizations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow plan updates for ceo dashboard" ON public.organizations FOR UPDATE USING (true) WITH CHECK (true);

-- 5.4 Crear Políticas para profiles
CREATE POLICY "Users can view profiles in their organization" ON public.profiles FOR SELECT USING (organization_id = get_user_org_id() OR auth_user_id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth_user_id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth_user_id = auth.uid());
CREATE POLICY "Admins can delete profiles in their organization" ON public.profiles FOR DELETE USING (organization_id = get_user_org_id() AND (SELECT role FROM profiles WHERE auth_user_id = auth.uid()) = 'admin');
CREATE POLICY "Allow public staff registration" ON public.profiles FOR INSERT WITH CHECK (true);

-- 5.5 Crear Políticas para congregados
CREATE POLICY "Users can view congregados in their organization" ON public.congregados FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "Users can insert congregados in their organization" ON public.congregados FOR INSERT WITH CHECK (organization_id = get_user_org_id());
CREATE POLICY "Users can update congregados in their organization" ON public.congregados FOR UPDATE USING (organization_id = get_user_org_id());
CREATE POLICY "Users can delete congregados in their organization" ON public.congregados FOR DELETE USING (organization_id = get_user_org_id());

-- 5.6 Crear Políticas para children
CREATE POLICY "Users can view children in their organization" ON public.children FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "Users can insert children in their organization" ON public.children FOR INSERT WITH CHECK (organization_id = get_user_org_id());
CREATE POLICY "Users can update children in their organization" ON public.children FOR UPDATE USING (organization_id = get_user_org_id());
CREATE POLICY "Users can delete children in their organization" ON public.children FOR DELETE USING (organization_id = get_user_org_id());

-- 5.7 Crear Políticas para events
CREATE POLICY "Users can view events in their organization" ON public.events FOR SELECT USING (organization_id = get_user_org_id());
CREATE POLICY "Users can insert events in their organization" ON public.events FOR INSERT WITH CHECK (organization_id = get_user_org_id());
CREATE POLICY "Users can update events in their organization" ON public.events FOR UPDATE USING (organization_id = get_user_org_id());
CREATE POLICY "Users can delete events in their organization" ON public.events FOR DELETE USING (organization_id = get_user_org_id());

-- 5.8 Crear Políticas para attendance
CREATE POLICY "Users can view attendance in their organization" ON public.attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = attendance.event_id AND events.organization_id = get_user_org_id())
);
CREATE POLICY "Users can insert attendance in their organization" ON public.attendance FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM events WHERE events.id = attendance.event_id AND events.organization_id = get_user_org_id())
);
CREATE POLICY "Users can update attendance in their organization" ON public.attendance FOR UPDATE USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = attendance.event_id AND events.organization_id = get_user_org_id())
);
CREATE POLICY "Users can delete attendance in their organization" ON public.attendance FOR DELETE USING (
  EXISTS (SELECT 1 FROM events WHERE events.id = attendance.event_id AND events.organization_id = get_user_org_id())
);
