import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CalendarDays, Users, GraduationCap, Plus } from 'lucide-react';

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});

interface DashboardStats {
  memberCount: number;
  studentCount: number;
  eventCount: number;
}

interface EventItem {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
  event_type: string;
}

function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ fullName: string; churchName: string; orgId: string } | null>(null);
  const [stats, setStats] = useState<DashboardStats>({ memberCount: 0, studentCount: 0, eventCount: 0 });
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 3000);

    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate({ to: '/login' });
          return;
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, organization_id, organizations(name)')
          .eq('auth_user_id', session.user.id)
          .single();

        if (!profileData?.organization_id) return;

        const orgId = profileData.organization_id;
        if (isMounted) {
          setProfile({
            fullName: profileData.full_name || 'Admin',
            churchName: (profileData.organizations as any)?.name || 'Mi Iglesia',
            orgId,
          });
        }

        const [{ count: memberCount }, { count: studentCount }, { data: eventData }] = await Promise.all([
          supabase
            .from('congregados')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId),
          supabase
            .from('congregados')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .eq('is_student', true),
          supabase
            .from('events')
            .select('*')
            .eq('organization_id', orgId)
            .order('event_date', { ascending: true })
            .limit(5),
        ]);

        if (isMounted) {
          setStats({
            memberCount: memberCount || 0,
            studentCount: studentCount || 0,
            eventCount: eventData?.length || 0,
          });
          setEvents(
            (eventData || []).map((e) => ({
              id: e.id,
              title: e.title,
              event_date: e.event_date,
              start_time: e.start_time ?? null,
              event_type: e.event_type,
            })),
          );
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
          clearTimeout(timer);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/login' });
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d.length === 10 ? `${d}T00:00:00` : d).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Cargando...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 space-y-8">
      <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold">{profile?.churchName}</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Hola, {profile?.fullName}</p>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm font-bold text-white">Dashboard</Link>
          <Link to="/congregados" className="text-sm text-zinc-400 hover:text-white">Congregados</Link>
        </nav>
        <button onClick={handleSignOut} className="text-sm text-zinc-400 hover:text-white">Salir</button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <p className="text-zinc-400 text-xs uppercase flex items-center gap-2">
            <Users className="w-3.5 h-3.5" /> Congregados
          </p>
          <p className="text-3xl font-bold mt-2">{stats.memberCount}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <p className="text-zinc-400 text-xs uppercase flex items-center gap-2">
            <GraduationCap className="w-3.5 h-3.5" /> Alumnos Formativos
          </p>
          <p className="text-3xl font-bold mt-2">{stats.studentCount}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <p className="text-zinc-400 text-xs uppercase flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5" /> Próximos Eventos
          </p>
          <p className="text-3xl font-bold mt-2">{stats.eventCount}</p>
        </div>
      </div>

      {/* Events */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="font-bold">Próximos Eventos</h2>
          <button className="text-xs bg-emerald-500 text-black px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold">
            <Plus className="w-3 h-3" /> Nuevo Evento
          </button>
        </div>
        {events.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 mb-4">
              <CalendarDays className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-white mb-1">Aún no hay eventos programados</h3>
            <p className="text-sm text-zinc-500 mb-6">Crea tu primer evento para comenzar a registrar asistencia con QR.</p>
            <button className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center gap-2 transition">
              <Plus className="w-4 h-4" /> Nuevo Evento
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-zinc-400 text-xs uppercase">
              <tr>
                <th className="p-4 text-left">Evento</th>
                <th className="p-4 text-left">Fecha</th>
                <th className="p-4 text-left">Hora</th>
                <th className="p-4 text-left">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {events.map((evt) => (
                <tr key={evt.id} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition">
                  <td className="p-4 font-bold text-white">{evt.title}</td>
                  <td className="p-4">{formatDate(evt.event_date)}</td>
                  <td className="p-4">{evt.start_time || '—'}</td>
                  <td className="p-4 text-emerald-400 capitalize">{String(evt.event_type).replace('_', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}