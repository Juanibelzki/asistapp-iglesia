import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const Route = createFileRoute('/congregados')({
  component: CongregadosPage,
});

type MainTab = 'todos' | 'alumnos';
type StudentStage = 'todos' | 'niño' | 'adolescente' | 'adulto';

interface Congregado {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_student: boolean;
  student_stage?: 'niño' | 'adolescente' | 'adulto';
  guardian_name?: string;
  guardian_phone?: string;
  status: string;
}

function CongregadosPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [churchName, setChurchName] = useState('Mi Congregación');
  const [congregados, setCongregados] = useState<Congregado[]>([]);
  
  // Filtros de navegación
  const [mainTab, setMainTab] = useState<MainTab>('todos');
  const [studentStage, setStudentStage] = useState<StudentStage>('todos');

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate({ to: '/login' });
          return;
        }

        // Obtener organización
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id, organizations(name)')
          .eq('auth_user_id', session.user.id)
          .maybeSingle();

        if (profile?.organizations) {
          setChurchName((profile.organizations as any).name || 'Mi Congregación');
        }

        if (profile?.organization_id) {
          // Consultar registros reales de la tabla congregados
          const { data, error } = await supabase
            .from('congregados')
            .select('*')
            .eq('organization_id', profile.organization_id)
            .order('created_at', { ascending: false });

          if (!error && data) {
            setCongregados(data as Congregado[]);
          }
        }
      } catch (err) {
        console.error('Error cargando congregados:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  // Filtrado reactivo en memoria
  const filteredList = congregados.filter((item) => {
    if (mainTab === 'todos') return true;
    if (mainTab === 'alumnos') {
      if (!item.is_student) return false;
      if (studentStage === 'todos') return true;
      return item.student_stage === studentStage;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400">Cargando directorio de congregados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* NAVBAR */}
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
              <Link className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 transition" to="/dashboard">
                Panel General
              </Link>
              <span className="px-3 py-1.5 rounded-lg bg-zinc-900 text-emerald-400 border border-zinc-800">
                Congregados
              </span>
              <span className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 transition cursor-not-allowed opacity-60">
                Asistencia QR
              </span>
              <span className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 transition cursor-not-allowed opacity-60">
                Eventos
              </span>
            </nav>
          </div>

          <Link className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 px-3 py-1.5 rounded-lg transition" to="/dashboard">
            ← Volver al Dashboard
          </Link>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Directorio de Congregados</h1>
            <p className="text-sm text-zinc-400 mt-1">Gestión integral de miembros y alumnos formativos de <span className="text-zinc-200 font-semibold">{churchName}</span></p>
          </div>

          <button className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Registrar Congregado</span>
          </button>
        </div>

        {/* PESTAÑA PRINCIPAL: TODOS VS ALUMNOS */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
            <button
              onClick={() => setMainTab('todos')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                mainTab === 'todos'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              Todos los Congregados ({congregados.length})
            </button>
            <button
              onClick={() => setMainTab('alumnos')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                mainTab === 'alumnos'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <span>Alumnos Formativos</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {congregados.filter((c) => c.is_student).length}
              </span>
            </button>
          </div>

          {/* SUB-PESTAÑAS DE ALUMNOS (NIÑOS / ADOLESCENTES / ADULTOS) */}
          {mainTab === 'alumnos' && (
            <div className="flex items-center gap-2 bg-zinc-900/60 p-1.5 rounded-xl border border-zinc-800/80 w-fit">
              <button
                onClick={() => setStudentStage('todos')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  studentStage === 'todos' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Todos los Niveles
              </button>
              <button
                onClick={() => setStudentStage('niño')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  studentStage === 'niño' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Niños (0-11 años)
              </button>
              <button
                onClick={() => setStudentStage('adolescente')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  studentStage === 'adolescente' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Adolescentes (12-17 años)
              </button>
              <button
                onClick={() => setStudentStage('adulto')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  studentStage === 'adulto' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Adultos (18+ años)
              </button>
            </div>
          )}
        </div>

        {/* LISTADO / TABLA O ESTADO VACÍO */}
        {filteredList.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto mt-6">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              {mainTab === 'alumnos' ? 'No hay alumnos en esta categoría' : 'No hay congregados registrados'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mb-6">
              {mainTab === 'alumnos'
                ? 'Comienza a registrar alumnos para asignarles un nivel, generar su QR de asistencia y dar seguimiento a sus clases.'
                : 'Registra a las familias, jóvenes y miembros de la congregación para centralizar el directorio.'}
            </p>
            <button className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20">
              + Registrar Primer Miembro
            </button>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-900/80 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-4 font-semibold">Nombre y Apellido</th>
                  <th className="p-4 font-semibold">Categoría / Etapa</th>
                  <th className="p-4 font-semibold">Tutor / Contacto</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredList.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/30 transition">
                    <td className="p-4 font-medium text-white">{c.first_name} {c.last_name}</td>
                    <td className="p-4 capitalize text-zinc-300">{c.student_stage || '-'}</td>
                    <td className="p-4 text-zinc-300">
                        {c.guardian_name || '-'}<br/>
                        <span className="text-xs text-zinc-500">{c.guardian_phone || '-'}</span>
                    </td>
                    <td className="p-4">
                        <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-500/20">
                            {c.status}
                        </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-emerald-400 hover:text-emerald-300 mr-4 font-medium text-xs">Ver QR</button>
                      <button className="text-zinc-500 hover:text-white font-medium text-xs">Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
