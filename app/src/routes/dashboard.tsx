import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CalendarDays, Users, GraduationCap, Plus, CheckCircle2, Pencil, Trash2, Eraser, ChevronDown, CalendarCheck, LayoutGrid, Link2 } from 'lucide-react';

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});

const USER_SESSION_KEY = 'asistapp_user_session';

interface LocalUserSession {
  organization_id?: string;
  role?: string;
  full_name?: string;
  church_name?: string;
}

const readLocalUserSession = (): LocalUserSession | null => {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.organization_id ? (parsed as LocalUserSession) : null;
  } catch {
    return null;
  }
};

interface DashboardStats {
  memberCount: number;
  newMembers30d: number;
  studentCount: number;
  stageCounts: { 'niño': number; 'adolescente': number; 'adulto': number };
  lastEventAttendance: number;
  lastEventTitle: string;
  lastEventDate: string;
  activePrograms: number;
}

interface EventItem {
  id: string;
  title: string;
  event_date: string;
}

interface EventProgram {
  title: string;
  sessions: EventItem[];
  rangeLabel: string;
}

function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ fullName: string; churchName: string; orgId: string } | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    memberCount: 0,
    newMembers30d: 0,
    studentCount: 0,
    stageCounts: { 'niño': 0, 'adolescente': 0, 'adulto': 0 },
    lastEventAttendance: 0,
    lastEventTitle: '',
    lastEventDate: '',
    activePrograms: 0,
  });
  const [events, setEvents] = useState<EventItem[]>([]);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    event_date: '',
    is_recurring: false,
    frequency: 'semanal',
    end_date: '',
  });
  const [savingEvent, setSavingEvent] = useState(false);
  const [eventError, setEventError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({});
  const [copiedStaffLink, setCopiedStaffLink] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 3000);

    async function loadData() {
      try {
        let profileForLoad: { fullName: string; churchName: string; orgId: string } | null = null;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          const local = readLocalUserSession();
          if (local?.role === 'admin' && local.organization_id) {
            profileForLoad = {
              fullName: local.full_name || 'Admin',
              churchName: local.church_name || 'Mi Iglesia',
              orgId: local.organization_id,
            };
          } else {
            navigate({ to: '/login' });
            return;
          }
        } else {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, organization_id, organizations(name)')
            .eq('auth_user_id', session.user.id)
            .single();

          if (!profileData?.organization_id) return;

          profileForLoad = {
            fullName: profileData.full_name || 'Admin',
            churchName: (profileData.organizations as any)?.name || 'Mi Iglesia',
            orgId: profileData.organization_id,
          };
        }

        if (!profileForLoad) return;
        if (isMounted) setProfile(profileForLoad);
        const orgId = profileForLoad.orgId;

        const today = new Date().toISOString().slice(0, 10);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const [
          { count: memberCount },
          { count: newMembers30d },
          { count: studentCount },
          { count: niñoCount },
          { count: adolescenteCount },
          { count: adultoCount },
          { data: eventData },
          { data: lastEventData },
        ] = await Promise.all([
          supabase
            .from('congregados')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId),
          supabase
            .from('congregados')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .gte('created_at', thirtyDaysAgo),
          supabase
            .from('congregados')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .eq('is_student', true),
          supabase
            .from('congregados')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .eq('is_student', true)
            .eq('student_stage', 'niño'),
          supabase
            .from('congregados')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .eq('is_student', true)
            .eq('student_stage', 'adolescente'),
          supabase
            .from('congregados')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .eq('is_student', true)
            .eq('student_stage', 'adulto'),
          supabase
            .from('events')
            .select('*')
            .eq('organization_id', orgId)
            .order('event_date', { ascending: true })
            .limit(100),
          supabase
            .from('events')
            .select('id, title, event_date')
            .eq('organization_id', orgId)
            .lte('event_date', today)
            .order('event_date', { ascending: false })
            .limit(1),
        ]);

        let lastEventAttendance = 0;
        if (lastEventData && lastEventData.length > 0) {
          const lastEvent = lastEventData[0];
          const { count: attCount } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', lastEvent.id)
            .eq('organization_id', orgId);
          lastEventAttendance = attCount || 0;
        }

        const uniquePrograms = new Set<string>();
        for (const evt of eventData || []) {
          if (evt.event_date >= today) uniquePrograms.add(evt.title);
        }

        if (isMounted) {
          setStats({
            memberCount: memberCount || 0,
            newMembers30d: newMembers30d || 0,
            studentCount: studentCount || 0,
            stageCounts: {
              'niño': niñoCount || 0,
              'adolescente': adolescenteCount || 0,
              'adulto': adultoCount || 0,
            },
            lastEventAttendance,
            lastEventTitle: (lastEventData && lastEventData[0]?.title) || '',
            lastEventDate: (lastEventData && lastEventData[0]?.event_date) || '',
            activePrograms: uniquePrograms.size,
          });
          setEvents(
            (eventData || []).map((e) => ({
              id: e.id,
              title: e.title,
              event_date: e.event_date,
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

  const staffLink = profile ? `${window.location.origin}/registerstaff?org=${profile.orgId}` : '';

  const copyStaffLink = async () => {
    if (!staffLink) return;
    try {
      await navigator.clipboard.writeText(staffLink);
      setCopiedStaffLink(true);
      setTimeout(() => setCopiedStaffLink(false), 2500);
    } catch {
      /* portapapeles no disponible */
    }
  };

  const openEventModal = () => {
    setEditingEventId(null);
    setEventForm({ title: '', event_date: '', is_recurring: false, frequency: 'semanal', end_date: '' });
    setEventError('');
    setSuccessMsg('');
    setIsOpenModal(true);
  };

  const openEditModal = (event: EventItem) => {
    setEditingEventId(event.id);
    setEventForm({
      title: event.title,
      event_date: event.event_date,
      is_recurring: false,
      frequency: 'semanal',
      end_date: '',
    });
    setEventError('');
    setSuccessMsg('');
    setIsOpenModal(true);
  };

  const closeEventModal = () => {
    setIsOpenModal(false);
    setEditingEventId(null);
    setEventError('');
  };

  const toDateString = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const reloadEvents = async () => {
    if (!profile) return;
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('organization_id', profile.orgId)
      .order('event_date', { ascending: true })
      .limit(100);

    if (eventData) {
      setEvents(
        eventData.map((e) => ({
          id: e.id,
          title: e.title,
          event_date: e.event_date,
        })),
      );
      const today = new Date().toISOString().slice(0, 10);
      const active = new Set<string>();
      for (const evt of eventData) {
        if (evt.event_date >= today) active.add(evt.title);
      }
      setStats((s) => ({ ...s, activePrograms: active.size }));
    }
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      setEventError('No se pudo determinar tu organización. Intenta recargar la página.');
      return;
    }
    if (!eventForm.title.trim() || !eventForm.event_date) {
      setEventError('Título y Fecha son obligatorios.');
      return;
    }

    setSavingEvent(true);
    setEventError('');
    try {
      if (editingEventId) {
        const { error } = await supabase
          .from('events')
          .update({ title: eventForm.title.trim(), event_date: eventForm.event_date })
          .eq('id', editingEventId)
          .eq('organization_id', profile.orgId);
        if (error) throw error;
        setSuccessMsg('Evento actualizado con éxito.');
      } else {
        if (eventForm.is_recurring && !eventForm.end_date) {
          setEventError('Indica la fecha límite de repetición.');
          return;
        }
        if (eventForm.is_recurring && eventForm.end_date <= eventForm.event_date) {
          setEventError('La fecha límite debe ser posterior a la fecha del evento.');
          return;
        }

        let insertedCount = 1;

        if (!eventForm.is_recurring) {
          const { error } = await supabase.from('events').insert({
            organization_id: profile.orgId,
            title: eventForm.title.trim(),
            event_date: eventForm.event_date,
          });
          if (error) throw error;
        } else {
          const intervalDays = eventForm.frequency === 'quincenal' ? 14 : 7;
          const eventsToInsert: { title: string; event_date: string; organization_id: string }[] = [];
          const currentDate = new Date(`${eventForm.event_date}T00:00:00`);
          const finalDate = new Date(`${eventForm.end_date}T00:00:00`);

          while (currentDate <= finalDate) {
            eventsToInsert.push({
              title: eventForm.title.trim(),
              event_date: toDateString(currentDate),
              organization_id: profile.orgId,
            });
            currentDate.setDate(currentDate.getDate() + intervalDays);
          }

          if (eventsToInsert.length === 0) {
            setEventError('No se pudo generar ninguna fecha para la recurrencia.');
            return;
          }

          const { error } = await supabase.from('events').insert(eventsToInsert);
          if (error) throw error;
          insertedCount = eventsToInsert.length;
        }

        setSuccessMsg(
          insertedCount === 1
            ? 'Evento programado con éxito.'
            : `Se programaron ${insertedCount} clases con éxito.`,
        );
      }

      await reloadEvents();
      closeEventModal();
    } catch (err) {
      console.error('Error al guardar evento:', err);
      setEventError(err instanceof Error ? err.message : 'Error al guardar el evento.');
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (event: EventItem) => {
    if (!profile) return;
    if (!window.confirm(`¿Eliminar el evento "${event.title}"? Esta acción no se puede deshacer.`)) return;

    setEventError('');
    setSuccessMsg('');
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id)
        .eq('organization_id', profile.orgId);
      if (error) throw error;
      setSuccessMsg('Evento eliminado.');
      await reloadEvents();
    } catch (err) {
      console.error('Error al eliminar evento:', err);
      setEventError(err instanceof Error ? err.message : 'Error al eliminar el evento.');
    }
  };

  const handleCleanupPast = async () => {
    if (!profile) return;
    if (!window.confirm('¿Eliminar todos los eventos con fecha anterior a hoy?')) return;

    setEventError('');
    setSuccessMsg('');
    try {
      const today = toDateString(new Date());
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('organization_id', profile.orgId)
        .lt('event_date', today);
      if (error) throw error;
      setSuccessMsg('Eventos pasados eliminados.');
      await reloadEvents();
    } catch (err) {
      console.error('Error al limpiar eventos pasados:', err);
      setEventError(err instanceof Error ? err.message : 'Error al limpiar eventos pasados.');
    }
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

  const programs = useMemo<EventProgram[]>(() => {
    const grouped = new Map<string, EventItem[]>();
    for (const evt of events) {
      const list = grouped.get(evt.title) || [];
      list.push(evt);
      grouped.set(evt.title, list);
    }

    return Array.from(grouped.entries())
      .map(([title, sessions]) => {
        sessions.sort((a, b) => a.event_date.localeCompare(b.event_date));
        const first = sessions[0].event_date;
        const last = sessions[sessions.length - 1].event_date;
        return {
          title,
          sessions,
          rangeLabel: first === last ? formatDate(first) : `${formatDate(first)} — ${formatDate(last)}`,
        };
      })
      .sort((a, b) => a.sessions[0].event_date.localeCompare(b.sessions[0].event_date));
  }, [events]);

  const toggleProgram = (title: string) => {
    setExpandedPrograms((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleDeleteProgram = async (program: EventProgram) => {
    if (!profile) return;
    if (!window.confirm(`¿Eliminar todo el programa "${program.title}" (${program.sessions.length} clases)? Esta acción no se puede deshacer.`)) return;

    setEventError('');
    setSuccessMsg('');
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('organization_id', profile.orgId)
        .eq('title', program.title);
      if (error) throw error;
      setSuccessMsg(`Programa "${program.title}" eliminado.`);
      setExpandedPrograms((prev) => {
        const next = { ...prev };
        delete next[program.title];
        return next;
      });
      await reloadEvents();
    } catch (err) {
      console.error('Error al eliminar programa:', err);
      setEventError(err instanceof Error ? err.message : 'Error al eliminar el programa.');
    }
  };

  const minEndDate = eventForm.event_date
    ? (() => {
        const d = new Date(`${eventForm.event_date}T00:00:00`);
        d.setDate(d.getDate() + 1);
        return toDateString(d);
      })()
    : '';

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Cargando...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-lg shadow-lg shadow-emerald-500/20 shrink-0">
              {(profile?.churchName || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-white truncate leading-tight">{profile?.churchName}</h1>
              <p className="text-xs text-zinc-400 truncate">Hola, {profile?.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <nav className="flex items-center gap-1">
              <Link
                to="/dashboard"
                className="text-sm text-white font-medium bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800/60"
              >
                Dashboard
              </Link>
              <Link
                to="/congregados"
                className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-1.5 rounded-lg"
              >
                Congregados
              </Link>
              <Link
                to="/materiales"
                className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-1.5 rounded-lg"
              >
                Materiales
              </Link>
              <Link
                to="/asistencia"
                className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-1.5 rounded-lg"
              >
                Asistencia
              </Link>
              <Link
                to="/ajustes"
                className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-1.5 rounded-lg"
              >
                Ajustes
              </Link>
            </nav>
            <button
              onClick={handleSignOut}
              className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-900/60"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Invitación al equipo */}
      <div className="border border-zinc-800/80 bg-zinc-900/40 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <Link2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                Compartir enlace de registro para tu equipo de ujieres y servidores
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Voluntarios, ujieres y líderes se registran con su rol y PIN para usar el escáner de puerta.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              readOnly
              value={staffLink}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 sm:flex-none sm:w-72 bg-zinc-950/70 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2.5 truncate focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
            <button
              onClick={copyStaffLink}
              className="shrink-0 px-3 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition active:scale-95"
            >
              {copiedStaffLink ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="border border-zinc-800/80 bg-zinc-900/40 p-5 rounded-2xl hover:border-zinc-700/60 transition-all shadow-sm">
          <p className="text-zinc-400 text-xs uppercase flex items-center gap-2">
            <Users className="w-3.5 h-3.5" /> Congregados
          </p>
          <p className="text-3xl font-bold tracking-tight text-white mt-2">{stats.memberCount}</p>
          <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[11px] font-semibold">
              +{stats.newMembers30d}
            </span>
            altas en los últimos 30 días
          </p>
        </div>
        <div className="border border-zinc-800/80 bg-zinc-900/40 p-5 rounded-2xl hover:border-zinc-700/60 transition-all shadow-sm">
          <p className="text-zinc-400 text-xs uppercase flex items-center gap-2">
            <GraduationCap className="w-3.5 h-3.5" /> Alumnos en Formación
          </p>
          <p className="text-3xl font-bold tracking-tight text-white mt-2">{stats.studentCount}</p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[11px] font-semibold">
              {stats.stageCounts['niño']} niños
            </span>
            <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full text-[11px] font-semibold">
              {stats.stageCounts['adolescente']} adolescentes
            </span>
            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full text-[11px] font-semibold">
              {stats.stageCounts['adulto']} adultos
            </span>
          </div>
        </div>
        <div className="border border-zinc-800/80 bg-zinc-900/40 p-5 rounded-2xl hover:border-zinc-700/60 transition-all shadow-sm">
          <p className="text-zinc-400 text-xs uppercase flex items-center gap-2">
            <CalendarCheck className="w-3.5 h-3.5" /> Asistencia del Último Evento
          </p>
          <p className="text-3xl font-bold tracking-tight text-white mt-2">{stats.lastEventAttendance}</p>
          <p className="text-xs text-zinc-400 mt-2 truncate">
            {stats.lastEventTitle
              ? `${stats.lastEventAttendance} presentes · ${stats.lastEventTitle}`
              : 'Sin eventos con asistencia registrada'}
          </p>
        </div>
        <div className="border border-zinc-800/80 bg-zinc-900/40 p-5 rounded-2xl hover:border-zinc-700/60 transition-all shadow-sm">
          <p className="text-zinc-400 text-xs uppercase flex items-center gap-2">
            <LayoutGrid className="w-3.5 h-3.5" /> Programas Activos
          </p>
          <p className="text-3xl font-bold tracking-tight text-white mt-2">{stats.activePrograms}</p>
          <p className="text-xs text-zinc-500 mt-2">Cursos programados con fechas futuras</p>
        </div>
      </div>

      {/* Events */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold">Próximos Eventos</h2>
          <div className="flex items-center gap-2">
            {events.length > 0 && (
              <button
                onClick={handleCleanupPast}
                className="text-xs text-zinc-400 px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center gap-1 font-semibold transition hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
              >
                <Eraser className="w-3 h-3" /> Limpiar Pasados
              </button>
            )}
            <button onClick={openEventModal} className="text-xs bg-emerald-500 text-black px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold">
              <Plus className="w-3 h-3" /> Nuevo Evento
            </button>
          </div>
        </div>
        {events.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 mb-4">
              <CalendarDays className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-white mb-1">Aún no hay eventos programados</h3>
            <p className="text-sm text-zinc-500 mb-6">Crea tu primer evento para comenzar a registrar asistencia con QR.</p>
            <button onClick={openEventModal} className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center gap-2 transition">
              <Plus className="w-4 h-4" /> Nuevo Evento
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {programs.map((program) => {
              const isOpen = !!expandedPrograms[program.title];
              return (
                <div key={program.title}>
                  <div className="flex flex-wrap items-center gap-3 p-4 hover:bg-zinc-800/40 transition-colors">
                    <button
                      onClick={() => toggleProgram(program.title)}
                      className="flex items-center gap-3 flex-1 min-w-[200px] text-left"
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? 'Colapsar' : 'Expandir'} programa ${program.title}`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`}
                      />
                      <span className={`font-medium transition-colors ${isOpen ? 'text-emerald-400' : 'text-white'}`}>{program.title}</span>
                      <span className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-0.5 rounded-full shrink-0">
                        {program.sessions.length} {program.sessions.length === 1 ? 'clase' : 'clases'}
                      </span>
                    </button>
                    <span className="text-sm text-zinc-400">{program.rangeLabel}</span>
                    <button
                      onClick={() => handleDeleteProgram(program)}
                      className="text-xs text-zinc-400 px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center gap-1 font-semibold transition hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
                    >
                      <Trash2 className="w-3 h-3" /> Eliminar Programa
                    </button>
                  </div>

                  {isOpen && (
                    <div className="ml-4 border-l-2 border-zinc-800 pl-4 space-y-2 py-3 pr-4">
                      {program.sessions.map((evt, index) => (
                        <div
                          key={evt.id}
                          className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg hover:bg-zinc-800/30 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="shrink-0 text-xs font-bold text-zinc-500">Clase {index + 1}</span>
                            <span className="text-sm text-zinc-300">{formatDate(evt.event_date)}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openEditModal(evt)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 transition hover:text-emerald-400 hover:bg-emerald-500/10"
                              aria-label={`Editar clase ${index + 1} de ${program.title}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(evt)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 transition hover:text-red-400 hover:bg-red-500/10"
                              aria-label={`Eliminar clase ${index + 1} de ${program.title}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      </main>

      {/* MODAL NUEVO EVENTO */}
      {isOpenModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeEventModal}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white">{editingEventId ? 'Editar Evento' : 'Nuevo Evento'}</h2>
              <button
                onClick={closeEventModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                aria-label="Cerrar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitEvent} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Título *</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ej: Clase de Escuela Sabática"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Fecha *</label>
                <input
                  type="date"
                  value={eventForm.event_date}
                  onChange={(e) => setEventForm((f) => ({ ...f, event_date: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition [color-scheme:dark]"
                  required
                />
              </div>

              {!editingEventId && (
                <>
                  <div className="flex items-center justify-between bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">¿Es un evento recurrente?</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Se repetirá automáticamente hasta la fecha límite.</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={eventForm.is_recurring}
                      onClick={() => setEventForm((f) => ({ ...f, is_recurring: !f.is_recurring }))}
                      className={`relative shrink-0 w-11 h-6 rounded-full transition ${
                        eventForm.is_recurring ? 'bg-emerald-500' : 'bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          eventForm.is_recurring ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {eventForm.is_recurring && (
                    <div className="space-y-4 border-t border-zinc-800 pt-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 mb-2">Frecuencia</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['semanal', 'quincenal'] as const).map((freq) => (
                            <button
                              key={freq}
                              type="button"
                              onClick={() => setEventForm((f) => ({ ...f, frequency: freq }))}
                              className={`px-3 py-2 rounded-lg text-xs font-bold transition border ${
                                eventForm.frequency === freq
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                              }`}
                            >
                              {freq === 'semanal' ? 'Semanal (7 días)' : 'Cada 14 días'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Repetir hasta *</label>
                        <input
                          type="date"
                          min={minEndDate}
                          value={eventForm.end_date}
                          onChange={(e) => setEventForm((f) => ({ ...f, end_date: e.target.value }))}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition [color-scheme:dark]"
                          required
                        />
                        {eventForm.end_date && eventForm.end_date <= eventForm.event_date && (
                          <p className="text-[11px] text-red-400 mt-1">La fecha límite debe ser posterior a la fecha del evento.</p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {eventError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium rounded-lg px-3 py-2.5">
                  {eventError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={closeEventModal}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEvent}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  {savingEvent ? (
                    <>
                      <span className="w-4 h-4 border-2 border-zinc-950/40 border-t-zinc-950 rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : editingEventId ? (
                    'Guardar Cambios'
                  ) : (
                    'Crear Evento'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}