import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Ajuste de ruta basado en la estructura previa


export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
});


interface UserProfile {
  fullName: string;
  churchName: string;
  role: string;
  email: string;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);


  // Lista de eventos de ejemplo (o vinculada a Supabase)
  const [events] = useState<EventItem[]>([
    {
      id: '1',
      title: 'Clase Bíblica Infantil - Nivel Cuna & Párvulos',
      date: '2026-06-01',
      time: '10:00 AM',
      groupName: 'Niños (3-6 años)',
      status: 'Confirmado',
    },
    {
      id: '2',
      title: 'Reunión de Preadolescentes & Dinámica QR',
      date: '2026-06-07',
      time: '11:30 AM',
      groupName: 'Preadolescentes (12-14)',
      status: 'Pendiente',
    },
    {
      id: '3',
      title: 'Escuela de Servidores & Maestros',
      date: '2026-06-14',
      time: '18:00 PM',
      groupName: 'Liderazgo',
      status: 'Confirmado',
    },
  ]);


  useEffect(() => {
    async function checkAuthAndLoadData() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          navigate({ to: '/login' });
          return;
        }


        // Obtener datos del perfil y de la iglesia
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, role, email, organizations(name)')
          .eq('auth_user_id', session.user.id)
          .maybeSingle();


        if (profileData) {
          setProfile({
            fullName: profileData.full_name || session.user.email?.split('@')[0] || 'Administrador',
            email: session.user.email || '',
            role: profileData.role || 'Admin',
            churchName: (profileData.organizations as any)?.name || 'Mi Congregación',
          });
        } else {
          setProfile({
            fullName: session.user.email?.split('@')[0] || 'Administrador',
            email: session.user.email || '',
            role: 'Admin',
            churchName: 'Mi Congregación',
          });
        }
      } catch (err) {
        console.error('Error cargando dashboard:', err);
      } finally {
        setLoading(false);
      }
    }


    checkAuthAndLoadData();
  }, [navigate]);


  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/login' });
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-zinc-400 font-medium tracking-wide">Cargando ecosistema AsistApp...</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* NAVBAR SUPERIOR */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <Link className="flex items-center gap-2.5" to="/dashboard">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-lg shadow-lg shadow-emerald-500/20">
                A
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Asist<span className="text-emerald-400">App</span>
              </span>
            </Link>


            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <span className="px-3 py-1.5 rounded-lg bg-zinc-900 text-emerald-400 border border-zinc-800">
                Panel General
              </span>
              <span className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 transition">
                Asistencia QR
              </span>
              <span className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 transition">
                Alumnos & Familias
              </span>
              <span className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 transition">
                Eventos
              </span>
            </nav>
          </div>


          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-bold text-zinc-100">{profile?.fullName}</span>
              <span className="text-xs text-emerald-400 font-medium">{profile?.churchName}</span>
            </div>


            <button
              onClick={handleSignOut}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition flex items-center gap-2 shadow-sm"
              title="Cerrar sesión"
            >
              <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>


      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* HEADER DE BIENVENIDA Y ACCIONES */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Panel de Control
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Monitoreo en tiempo real para <strong className="text-zinc-200">{profile?.churchName}</strong>
            </p>
          </div>


          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium text-sm transition">
              Descargar Reporte
            </button>
            <button className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Tomar Asistencia QR</span>
            </button>
          </div>
        </div>


        {/* GRID DE KPIs (TARJETAS MÉTRICAS CON CONTRASTE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1 */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700 transition">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Alumnos</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-white">48</div>
            <div className="text-xs text-emerald-400 mt-2 font-medium flex items-center gap-1">
              <span>↑ +12%</span>
              <span className="text-zinc-500">vs mes anterior</span>
            </div>
          </div>


          {/* Card 2 */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700 transition">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Última Asistencia</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-white">42 <span className="text-lg text-zinc-500 font-normal">/ 48</span></div>
            <div className="text-xs text-emerald-400 mt-2 font-medium">87.5% de concurrencia</div>
          </div>


          {/* Card 3 */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700 transition">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Eventos este Mes</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-white">{events.length}</div>
            <div className="text-xs text-zinc-400 mt-2">Próximo: Domingo 10:00 AM</div>
          </div>


          {/* Card 4 */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700 transition">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Maestros Activos</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-black text-white">8</div>
            <div className="text-xs text-emerald-400 mt-2 font-medium">100% verificados</div>
          </div>


        </div>


        {/* TABLA DE PRÓXIMOS EVENTOS */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Próximas Clases & Eventos</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Cronograma programado para el ministerio</p>
            </div>
            <button className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition">
              + Nuevo Evento
            </button>
          </div>


          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-zinc-900/80 text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Evento / Clase</th>
                  <th className="py-3.5 px-6 font-semibold">Fecha & Horario</th>
                  <th className="py-3.5 px-6 font-semibold">Grupo / Nivel</th>
                  <th className="py-3.5 px-6 font-semibold">Estado</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-zinc-800/30 transition">
                    <td className="py-4 px-6 font-bold text-white">
                      {evt.title}
                    </td>
                    <td className="py-4 px-6 text-zinc-300 whitespace-nowrap">
                      {evt.date} <span className="text-zinc-500">· {evt.time}</span>
                    </td>
                    <td className="py-4 px-6 text-zinc-400">
                      <span className="bg-zinc-800 border border-zinc-700/60 px-2.5 py-1 rounded-lg text-xs text-zinc-200">
                        {evt.groupName}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        evt.status === 'Confirmado'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition">
                        Iniciar QR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


      </main>


      {/* FOOTER */}
      <footer className="border-t border-zinc-900 mt-auto py-6 px-6 text-center text-xs text-zinc-500">
        AsistApp &copy; {new Date().getFullYear()} — Plataforma Multi-Tenant para Iglesias.
      </footer>


    </div>
  );
}
