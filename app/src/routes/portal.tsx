import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { AppLogo } from '../components/AppLogo';

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
  is_student: boolean;
  student_stage?: Stage;
  status?: string;
  qr_code?: string;
}

interface PortalEvent {
  id: string;
  title: string;
  event_date: string;
}

interface PortalPayload {
  member: PortalCongregado | null;
  church_name?: string;
  events?: PortalEvent[];
  materials?: StudyMaterial[] | null;
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
  const [lastNameInput, setLastNameInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);

  // El portal pide todo a una función de la base que devuelve solo los campos que se
  // muestran (sin teléfonos ni datos del tutor) y valida el código del miembro.
  function applyPortal(data: PortalPayload | null) {
    if (!data?.member) return false;
    setCongregado(data.member);
    if (data.church_name) setChurchName(data.church_name);
    setEvents(data.events ?? []);
    if (data.materials === null) {
      setMaterialsError(true);
      setMaterials([]);
    } else {
      setMaterialsError(false);
      setMaterials(data.materials ?? []);
    }
    if (data.member.qr_code) localStorage.setItem(LS_KEY, data.member.qr_code);
    setStatus('identified');
    return true;
  }

  async function identifyByCode(code: string) {
    const { data, error } = await supabase.rpc('member_portal', { p_code: code, p_today: localToday() });
    if (error) return false;
    return applyPortal(data as PortalPayload | null);
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
    const lastName = lastNameInput.trim();
    if (!phone || !lastName) {
      setPhoneError('Completá tu teléfono y tu apellido.');
      return;
    }
    setPhoneLoading(true);
    setPhoneError('');
    try {
      const { data, error } = await supabase.rpc('member_portal_by_phone', {
        p_phone: phone,
        p_last_name: lastName,
        p_today: localToday(),
      });
      if (error) {
        if (/too_many_attempts/i.test(error.message)) {
          setPhoneError('Demasiados intentos. Esperá 15 minutos y volvé a probar.');
          return;
        }
        throw error;
      }
      if (!applyPortal(data as PortalPayload | null)) {
        setPhoneError('No encontramos esos datos. Consultá con el staff.');
      }
    } catch (err) {
      console.error('Error al buscar por teléfono:', err);
      setPhoneError('Error al buscar tus datos. Intentá nuevamente.');
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
      <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center text-zinc-100">
        <div className="w-10 h-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400 font-medium">Cargando tu credencial...</p>
      </div>
    );
  }

  if (status === 'fallback') {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-zinc-100 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-2.5 justify-center">
            <div className="w-10 h-10 rounded-full bg-[#0B0F17]/80 border border-slate-700/60 flex items-center justify-center overflow-hidden shadow-lg shadow-yellow-500/10 shrink-0 p-1.5">
              <AppLogo className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Ecclesiahs
            </span>
          </div>

          <div className="bg-[#141C2B] border border-slate-700/50 rounded-2xl p-6 shadow-2xl shadow-black/40">
            <h1 className="text-xl font-extrabold text-white text-center">Bienvenido a Ecclesiahs</h1>
            <p className="text-xs text-zinc-400 text-center mt-1 mb-6">
              Ingresá tu teléfono y tu apellido, tal como te inscribiste, para ver tu credencial.
            </p>

            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Ej: 611223344"
                className="w-full bg-[#0B0F17] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/20 transition"
                autoFocus
              />
              <input
                type="text"
                value={lastNameInput}
                onChange={(e) => setLastNameInput(e.target.value)}
                placeholder="Apellido"
                autoComplete="family-name"
                className="w-full bg-[#0B0F17] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/20 transition"
              />
              <button
                type="submit"
                disabled={phoneLoading}
                className="w-full px-4 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold text-sm transition shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
              >
                {phoneLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
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
    <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-semibold capitalize">
      Alumno: {STAGE_LABELS[congregado.student_stage || 'adulto']}
    </span>
  ) : (
    <span className="bg-slate-800 text-slate-300 border border-slate-700/60 px-3 py-1 rounded-full text-xs font-semibold">
      Miembro General
    </span>
  );

  return (
    <div className="min-h-screen bg-[#0B0F17] text-zinc-100 flex flex-col font-sans">
      <main className="flex-1 w-full max-w-md mx-auto p-4 md:p-6 space-y-6 pb-10">
        {/* CREDENCIAL DIGITAL */}
        <section className="bg-gradient-to-b from-[#1E293B] to-[#141C2B] border border-slate-700/60 shadow-2xl rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-yellow-500/5 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />
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
                className="shrink-0 text-[11px] text-zinc-400 hover:text-zinc-200 border border-slate-700 hover:border-slate-600 px-2.5 py-1.5 rounded-lg transition"
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
            <div className="bg-[#141C2B]/40 border border-slate-700/60 rounded-2xl p-6 text-center">
              <p className="text-sm text-zinc-400">No hay clases programadas próximamente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-[#141C2B] border border-slate-700/60 rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex flex-col items-center justify-center text-yellow-500">
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
            <div className="bg-[#141C2B]/40 border border-slate-700/60 rounded-2xl p-6 text-center">
              <p className="text-sm text-zinc-400">Los materiales estarán disponibles próximamente.</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="bg-[#141C2B]/40 border border-slate-700/60 rounded-2xl p-6 text-center">
              <p className="text-sm text-zinc-400">No hay materiales asignados a tu etapa todavía.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-[#141C2B] border border-slate-700/60 rounded-2xl p-4"
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
                      className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 active:scale-[0.98] text-slate-950 font-bold text-xs transition-all shadow-lg shadow-yellow-500/20"
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