import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { QrCode, ShieldCheck, WifiOff, BarChart3, Plus } from 'lucide-react';

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});

interface DashboardStats {
  memberCount: number;
  activeAttendance: number;
  eventCount: number;
  teacherCount: number;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  groupName: string;
  status: 'Confirmado' | 'Pendiente' | 'En curso';
}

function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ fullName: string; churchName: string; orgId: string } | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ memberCount: 0, activeAttendance: 0, eventCount: 0, teacherCount: 0 });
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate({ to: '/login' });
          return;
        }

        // 1. Get Profile & Org
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, organization_id, organizations(name)')
          .eq('auth_user_id', session.user.id)
          .single();

        if (!profileData || !profileData.organization_id) {
          throw new Error('No profile or organization found');
        }

        const orgId = profileData.organization_id;
        setProfile({
          fullName: profileData.full_name || 'Admin',
          churchName: (profileData.organizations as any)?.name || 'Mi Iglesia',
          orgId
        });

        // 2. Fetch Real Data
        // Alumnos (Children)
        const { count: memberCount } = await supabase
          .from('children')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId);

        // Eventos
        const { data: eventData } = await supabase
          .from('events')
          .select('*')
          .eq('organization_id', orgId)
          .order('date', { ascending: true })
          .limit(5);

        // Maestros
        const { count: teacherCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)
          .eq('role', 'teacher');

        setStats({
          memberCount: memberCount || 0,
          activeAttendance: 0, // Implementar cuando tabla attendance esté lista
          eventCount: eventData?.length || 0,
          teacherCount: teacherCount || 0,
        });

        setEvents((eventData || []).map(e => ({
          id: e.id,
          title: e.title,
          date: e.date,
          time: '10:00 AM', // Ajustar según esquema real
          groupName: 'General',
          status: 'Pendiente'
        })));

      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/login' });
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Cargando...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{profile?.churchName}</h1>
        <button onClick={handleSignOut} className="text-sm text-zinc-400 hover:text-white">Salir</button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <p className="text-zinc-400 text-xs uppercase">Alumnos</p>
          <p className="text-3xl font-bold mt-2">{stats.memberCount}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <p className="text-zinc-400 text-xs uppercase">Eventos</p>
          <p className="text-3xl font-bold mt-2">{stats.eventCount}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <p className="text-zinc-400 text-xs uppercase">Maestros</p>
          <p className="text-3xl font-bold mt-2">{stats.teacherCount}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <p className="text-zinc-400 text-xs uppercase">Asistencia</p>
          <p className="text-3xl font-bold mt-2">{stats.activeAttendance}</p>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="font-bold">Próximos Eventos</h2>
          <button className="text-xs bg-emerald-500 text-black px-3 py-1 rounded-lg flex items-center gap-1">
            <Plus className="w-3 h-3" /> Crear evento
          </button>
        </div>
        {events.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <p>No hay clases o eventos programados.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-zinc-400 text-xs uppercase">
              <tr>
                <th className="p-4">Evento</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {events.map(evt => (
                <tr key={evt.id} className="border-t border-zinc-800">
                  <td className="p-4">{evt.title}</td>
                  <td className="p-4">{evt.date}</td>
                  <td className="p-4 text-emerald-400">{evt.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
