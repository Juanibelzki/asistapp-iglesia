import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';

export const Route = createFileRoute('/portal')({
  component: PortalPage,
});

const LS_KEY = 'asistapp_congregado_code';
type Stage = 'niño' | 'adolescente' | 'adulto';
type Status = 'loading' | 'identified' | 'fallback';

interface PortalCongregado {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_student: boolean;
  student_stage?: Stage;
  guardian_name?: string;
  guardian_phone?: string;
  status?: string;
  qr_code?: string;
}

interface PortalEvent {
  id: string;
  title: string;
  event_date: string;
}

interface StudyMaterial {
  id: string;
  title: string;
  description?: string;
  file_url?: string;
}

const STAGE_LABELS: Record<Stage, string> = {
  'niño': 'Niños',
  'adolescente': 'Adolescentes',
  'adulto': 'Adultos',
};

function localToday(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function formatEventDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function PortalPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [congregado, setCongregado] = useState<PortalCongregado | null>(null);
  const [churchName, setChurchName] = useState('Mi Congregación');
  const [events, setEvents] = useState<PortalEvent[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [materialsError, setMaterialsError] = useState(false);

  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);

  async function loadChurchAndContent(c: PortalCongregado) {
    try {
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', c.organization_id)
        .maybeSingle();
      if (org?.name) setChurchName(org.name);
    } catch {
      // silencioso: se conserva el nombre por defecto
    }

    const { data: evts } = await supabase
      .from('events')
      .select('*')
      .eq('organization_id', c.organization_id)
      .gte('event_date', localToday())
      .order('event_date', { ascending: true });
    if (evts) setEvents(evts as PortalEvent[]);

    try {
      const stage = c.student_stage || 'adulto';
      const { data: mats, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('organization_id', c.organization_id)
        .or(`target_stage.eq.todos,target_stage.eq.${stage}`)
        .order('created_at', { ascending: false });
      if (error) {
        setMaterialsError(true);
        setMaterials([]);
      } else if (mats) {
        setMaterials(mats as StudyMaterial[]);
      }
    } catch {
      setMaterialsError(true);
      setMaterials([]);
    }
  }

  async function identifyByCode(code: string) {
    const { data, error } = await supabase
      .from('congregados')
      .select('*')
      .eq('qr_code', code)
      .maybeSingle();
    if (error || !data) return false;
    setCongregado(data as PortalCongregado);
    localStorage.setItem(LS_KEY, code);
    await loadChurchAndContent(data as PortalCongregado);
    setStatus('identified');
    return true;
  }

  useEffect(() => {
    let isMounted = true;

    async function init() {
      const params = new URLSearchParams(window.location.search);
      let code = params.get('code') || params.get('id');

      if (code) {
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        code = localStorage.getItem(LS_KEY);
      }

      if (!code) {
        if (isMounted) setStatus('fallback');
        return;
      }

      const found = await identifyByCode(code);
      if (!found && isMounted) {
        localStorage.removeItem(LS_KEY);
        setStatus('fallback');
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = phoneInput.trim();
    if (!phone) return;
    setPhoneLoading(true);
    setPhoneError('');
    try {
      const { data, error } = await supabase
        .from('congregados')
        .select('*')
        .eq('phone', phone)
        .limit(1);
      if (error) throw error;
      if (!data || data.length === 0) {
        setPhoneError('Número no encontrado. Consulta con el Staff.');
        return;
      }
      const found = data[0] as PortalCongregado;
      const code = found.qr_code || found.id;
      localStorage.setItem(LS_KEY, code);
      setCongregado(found);
      await loadChurchAndContent(found);
      setStatus('identified');
    } catch (err) {
      console.error('Error al buscar por teléfono:', err);
      setPhoneError(err instanceof Error ? err.message : 'Error al buscar el número. Intenta nuevamente.');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(LS_KEY);
    setCongregado(null);
    setEvents([]);
    setMaterials([]);
    setMaterialsError(false);
    setPhoneInput('');
    setPhoneError('');
    setStatus('fallback');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400 font-medium">Cargando tu credencial...</p>
      </div>
    );
  }

  if (status === 'fallback') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-2.5 justify-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-lg shadow-lg shadow-emerald-500/20">
              A
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Asist<span className="text-emerald-400">App</span>
            </span>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-2xl shadow-black/40">
            <h1 className="text-xl font-extrabold text-white text-center">Ingreso al Portal</h1>
            <p className="text-xs text-zinc-400 text-center mt-1 mb-6">
              Ingresá tu número de teléfono registrado para ver tu credencial y tus próximas clases.
            </p>

            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Ej: 611223344"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition"
                autoFocus
              />
              <button
                type="submit"
                disabled={phoneLoading}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {phoneLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-zinc-950/40 border-t-zinc-950 rounded-full animate-spin" />
                    Buscando...
                  </>
                ) : (
                  'Ingresar a mi Credencial'
                )}
              </button>
            </form>

            {phoneError && (
              <p className="text-xs text-red-400 font-medium mt-3 text-center bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5">
                {phoneError}
              </p>
            )}
          </div>

          <p className="text-[11px] text-zinc-600 text-center">
            ¿Recibiste un código QR? Escanealo con tu teléfono para acceder directamente.
          </p>
        </div>
      </div>
    );
  }

  const stageBadge = congregado?.is_student ? (
    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold capitalize">
      Alumno: {STAGE_LABELS[congregado.student_stage || 'adulto']}
    </span>
  ) : (
    <span className="bg-zinc-800 text-zinc-300 border border-zinc-700/60 px-3 py-1 rounded-full text-xs font-semibold">
      Miembro General
    </span>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <main className="flex-1 w-full max-w-md mx-auto p-4 md:p-6 space-y-6 pb-10">
        {/* CREDENCIAL DIGITAL */}
        <section className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/80 shadow-2xl rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">{churchName}</p>
                <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
                  {congregado?.first_name} {congregado?.last_name}
                </h1>
                <div className="mt-2">{stageBadge}</div>
              </div>
              <button
                onClick={handleLogout}
                className="shrink-0 text-[11px] text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1.5 rounded-lg transition"
              >
                Salir
              </button>
            </div>

            <div className="mt-5 bg-white rounded-2xl p-3 shadow-inner flex flex-col items-center">
              <QRCodeSVG
                value={congregado?.qr_code || congregado?.id || ''}
                size={200}
                className="w-full max-w-[200px] h-auto"
              />
              <p className="text-[11px] text-zinc-500 mt-3 text-center">
                Presentá este código en la puerta para registrar tu asistencia.
              </p>
            </div>
          </div>
        </section>

        {/* PRÓXIMAS CLASES */}
        <section>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Próximas Clases</h2>
          {events.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 text-center">
              <p className="text-sm text-zinc-400">No hay clases programadas próximamente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center text-emerald-400">
                    <span className="text-lg font-black leading-none">
                      {evt.event_date.slice(8, 10)}
                    </span>
                    <span className="text-[10px] font-semibold uppercase">
                      {new Date(evt.event_date + 'T00:00:00').toLocaleDateString('es-AR', { month: 'short' })}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{evt.title}</p>
                    <p className="text-xs text-zinc-400 capitalize">{formatEventDate(evt.event_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* MIS MATERIALES DE ESTUDIO */}
        <section>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Mis Materiales de Estudio</h2>
          {materialsError ? (
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 text-center">
              <p className="text-sm text-zinc-400">Los materiales estarán disponibles próximamente.</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 text-center">
              <p className="text-sm text-zinc-400">No hay materiales asignados a tu etapa todavía.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4"
                >
                  <p className="font-bold text-white">{mat.title}</p>
                  {mat.description && (
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{mat.description}</p>
                  )}
                  {mat.file_url && (
                    <a
                      href={mat.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-zinc-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Descargar Guía / PDF
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}