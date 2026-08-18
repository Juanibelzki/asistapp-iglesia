-- FASE 1: Activar RLS en todas las tablas
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Nota: Como 'congregados' se usa en el backend, también aseguramos que esté protegido si existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'congregados') THEN
    ALTER TABLE congregados ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 2. Función Helper Segura
-- Utilizamos una función estable para obtener el organization_id del usuario autenticado
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS uuid AS $$
  SELECT organization_id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ==========================================
-- POLÍTICAS PARA: organizations
-- ==========================================
-- Permitir al dashboard maestro/onboarding crear/actualizar (según archivos separados de migración).
-- Aquí nos aseguramos del acceso regular de un miembro a su propia organización.
CREATE POLICY "Users can view their own organization"
ON organizations FOR SELECT
USING (id = get_user_org_id());

CREATE POLICY "Users can update their own organization"
ON organizations FOR UPDATE
USING (id = get_user_org_id());


-- ==========================================
-- POLÍTICAS PARA: profiles
-- ==========================================
-- Select: Un usuario puede ver perfiles de su misma organización, o el suyo propio durante creación.
CREATE POLICY "Users can view profiles in their organization"
ON profiles FOR SELECT
USING (organization_id = get_user_org_id() OR auth_user_id = auth.uid());

-- Insert: Permitir inserción (necesario en el registro inicial de staff/admins)
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth_user_id = auth.uid());

-- Update: Un usuario puede actualizar su propio perfil
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth_user_id = auth.uid());

-- Delete: Sólo admins podrían borrar perfiles, por simplicidad ahora permitimos a los admins de su org.
CREATE POLICY "Admins can delete profiles in their organization"
ON profiles FOR DELETE
USING (
  organization_id = get_user_org_id()
  AND (SELECT role FROM profiles WHERE auth_user_id = auth.uid()) = 'admin'
);


-- ==========================================
-- POLÍTICAS PARA: children
-- ==========================================
CREATE POLICY "Users can view children in their organization"
ON children FOR SELECT
USING (organization_id = get_user_org_id());

CREATE POLICY "Users can insert children in their organization"
ON children FOR INSERT
WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY "Users can update children in their organization"
ON children FOR UPDATE
USING (organization_id = get_user_org_id());

CREATE POLICY "Users can delete children in their organization"
ON children FOR DELETE
USING (organization_id = get_user_org_id());


-- ==========================================
-- POLÍTICAS PARA: congregados
-- ==========================================
-- Bloque anónimo para crear políticas de tabla congregados si existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'congregados') THEN
    EXECUTE 'CREATE POLICY "Users can view congregados in their organization" ON congregados FOR SELECT USING (organization_id = get_user_org_id())';
    EXECUTE 'CREATE POLICY "Users can insert congregados in their organization" ON congregados FOR INSERT WITH CHECK (organization_id = get_user_org_id())';
    EXECUTE 'CREATE POLICY "Users can update congregados in their organization" ON congregados FOR UPDATE USING (organization_id = get_user_org_id())';
    EXECUTE 'CREATE POLICY "Users can delete congregados in their organization" ON congregados FOR DELETE USING (organization_id = get_user_org_id())';
  END IF;
END $$;


-- ==========================================
-- POLÍTICAS PARA: events
-- ==========================================
CREATE POLICY "Users can view events in their organization"
ON events FOR SELECT
USING (organization_id = get_user_org_id());

CREATE POLICY "Users can insert events in their organization"
ON events FOR INSERT
WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY "Users can update events in their organization"
ON events FOR UPDATE
USING (organization_id = get_user_org_id());

CREATE POLICY "Users can delete events in their organization"
ON events FOR DELETE
USING (organization_id = get_user_org_id());


-- ==========================================
-- POLÍTICAS PARA: attendance
-- ==========================================
-- Note: As attendance might not have organization_id directly, we join through events
-- but schema says it does not have organization_id. Let's check schema: event_id, child_id.
-- Let's use the event's organization_id.
CREATE POLICY "Users can view attendance in their organization"
ON attendance FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = attendance.event_id AND events.organization_id = get_user_org_id()
  )
);

CREATE POLICY "Users can insert attendance in their organization"
ON attendance FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = attendance.event_id AND events.organization_id = get_user_org_id()
  )
);

CREATE POLICY "Users can update attendance in their organization"
ON attendance FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = attendance.event_id AND events.organization_id = get_user_org_id()
  )
);

CREATE POLICY "Users can delete attendance in their organization"
ON attendance FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = attendance.event_id AND events.organization_id = get_user_org_id()
  )
);
