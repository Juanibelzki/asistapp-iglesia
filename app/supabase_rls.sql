-- 1. Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- 2. Define Policies
-- Helper to get org_id
-- CREATE OR REPLACE FUNCTION get_user_org_id() RETURNS uuid AS $$
--   SELECT organization_id FROM profiles WHERE auth_user_id = auth.uid();
-- $$ LANGUAGE sql STABLE;

-- Organizations
CREATE POLICY "Users can view and update their own organization" ON organizations
  FOR ALL USING (id = (SELECT organization_id FROM profiles WHERE auth_user_id = auth.uid()));

-- Profiles
CREATE POLICY "Users can view profiles in their organization" ON profiles
  FOR SELECT USING (organization_id = (SELECT organization_id FROM profiles WHERE auth_user_id = auth.uid()));

-- Children, Events, Attendance
CREATE POLICY "Users can manage data in their organization" ON children
  FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can manage data in their organization" ON events
  FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can manage data in their organization" ON attendance
  FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE auth_user_id = auth.uid()));
