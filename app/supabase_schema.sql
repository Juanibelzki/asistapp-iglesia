-- FASE 1: Esquema de Base de Datos para AsistApp Iglesia

-- Tabla organizations
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'trial' check (plan in ('trial','basico','pro')),
  subscription_status text not null default 'trialing' check (subscription_status in ('trialing','active','past_due','canceled')),
  created_at timestamptz not null default now()
);
-- RLS activado por organization_id (Ver supabase_rls.sql)

-- Tabla profiles
create table profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  auth_user_id uuid,
  full_name text not null,
  email text not null,
  role text not null default 'maestro' check (role in ('admin','maestro')),
  created_at timestamptz not null default now()
);
-- RLS activado por organization_id (Ver supabase_rls.sql)

-- Tabla children
create table children (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  group_name text not null check (group_name in ('Preescolar','Primaria','Adolescentes')),
  birth_date date,
  guardian_name text,
  guardian_phone text,
  notes text,
  created_at timestamptz not null default now()
);
-- RLS activado por organization_id (Ver supabase_rls.sql)

-- Tabla events
create table events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  event_type text not null check (event_type in ('clase_sabado','actividad_semana')),
  event_date date not null,
  start_time time,
  qr_token uuid not null default gen_random_uuid() unique,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);
-- RLS activado por organization_id (Ver supabase_rls.sql)

-- Tabla attendance
create table attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  child_id uuid not null references children(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  checked_in_by uuid references profiles(id),
  status text not null default 'presente' check (status in ('presente','justificado')),
  unique (event_id, child_id)
);
-- RLS activado por organization_id (Ver supabase_rls.sql)

-- Mock Data Seed
insert into organizations (id, name, city, plan, subscription_status) 
values ('00000000-0000-0000-0000-000000000001', 'Iglesia Camino de Vida', 'Madrid', 'trial', 'trialing');

insert into profiles (organization_id, full_name, email, role) values
('00000000-0000-0000-0000-000000000001', 'María López', 'maria.lopez@caminodevida.es', 'admin'),
('00000000-0000-0000-0000-000000000001', 'Carlos Ruiz', 'carlos.ruiz@caminodevida.es', 'maestro');

insert into children (organization_id, first_name, last_name, group_name, birth_date, guardian_name, guardian_phone) values
('00000000-0000-0000-0000-000000000001', 'Lucía', 'García Fernández', 'Primaria', '2016-03-12', 'Ana Fernández', '611223344'),
('00000000-0000-0000-0000-000000000001', 'Mateo', 'Sánchez Ortiz', 'Primaria', '2015-07-22', 'Laura Ortiz', '622334455'),
('00000000-0000-0000-0000-000000000001', 'Sofía', 'Martín Díaz', 'Preescolar', '2019-01-05', 'Pedro Díaz', '633445566'),
('00000000-0000-0000-0000-000000000001', 'Hugo', 'Romero Vega', 'Preescolar', '2018-11-30', 'Marta Vega', '644556677'),
('00000000-0000-0000-0000-000000000001', 'Valentina', 'Torres Ibáñez', 'Adolescentes', '2011-05-18', 'Sergio Torres', '655667788'),
('00000000-0000-0000-0000-000000000001', 'Daniel', 'Jiménez Cano', 'Adolescentes', '2010-09-09', 'Elena Cano', '666778899'),
('00000000-0000-0000-0000-000000000001', 'Martina', 'Ruiz Molina', 'Primaria', '2016-12-01', 'Javier Ruiz', '677889900'),
('00000000-0000-0000-0000-000000000001', 'Pablo', 'Herrera Soto', 'Preescolar', '2019-04-14', 'Cristina Soto', '688990011');
