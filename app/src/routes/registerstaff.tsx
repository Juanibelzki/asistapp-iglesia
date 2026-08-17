import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AppLogo } from '../components/AppLogo';

export const Route = createFileRoute('/registerstaff')({
  component: RegisterStaffPage,
});

interface ChurchInfo {
  id: string;
  name: string;
  address?: string | null;
}

interface StaffForm {
  fullName: string;
  phone: string;
  pin: string;
}

const EMPTY_FORM: StaffForm = {
  fullName: '',
  phone: '',
  pin: '',
};

const ROLES = [
  { value: 'staff', label: 'Ujier / Recepción (Escáner de puerta)' },
  { value: 'leader', label: 'Líder de Ministerio / Maestro (Dashboard y Gestión)' },
  { value: 'admin', label: 'Pastor / Administrador General (Control Total)' },
];

const USER_SESSION_KEY = 'asistapp_user_session';

function RegisterStaffPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [churches, setChurches] = useState<ChurchInfo[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<ChurchInfo | null>(null);
  const [selectedChurchId, setSelectedChurchId] = useState('');
  const [lockedOrg, setLockedOrg] = useState<ChurchInfo | null>(null);
  const [churchQuery, setChurchQuery] = useState('');
  const [churchOpen, setChurchOpen] = useState(false);
  const [form, setForm] = useState<StaffForm>(EMPTY_FORM);
  const [selectedRole, setSelectedRole] = useState('staff');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadChurches() {
      try {
        const params = new URLSearchParams(window.location.search);
        const orgParam = params.get('org');

        const { data, error } = await supabase
          .from('organizations')
          .select('id, name, address')
          .order('name', { ascending: true });

        if (error) throw error;
        if (!isMounted) return;

        const list = (data ?? []) as ChurchInfo[];
        setChurches(list);

        if (orgParam) {
          const match = list.find((c) => c.id === orgParam);
          if (match) {
            setLockedOrg(match);
            setSelectedChurch(match);
            setSelectedChurchId(match.id);
            setChurchQuery(match.name + (match.address ? ` · ${match.address}` : ''));
          } else {
            setFormError('La iglesia indicada no fue encontrada. Seleccioná otra.');
          }
        }
      } catch (err) {
        console.error('Error al cargar iglesias:', err);
        if (isMounted) setFormError('No se pudo cargar la lista de iglesias. Intenta nuevamente.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadChurches();

    return () => {
      isMounted = false;
    };
  }, []);

  const churchDisplay = (c: ChurchInfo) => c.name + (c.address ? ` · ${c.address}` : '');

  const selectChurch = (c: ChurchInfo) => {
    setSelectedChurch(c);
    setSelectedChurchId(c.id);
    setChurchQuery(churchDisplay(c));
    setChurchOpen(false);
  };

  const handleQueryChange = (v: string) => {
    setChurchQuery(v);
    if (selectedChurch && v.trim() !== churchDisplay(selectedChurch)) {
      setSelectedChurch(null);
      setSelectedChurchId('');
    }
    setChurchOpen(true);
  };

  const q = churchQuery.trim().toLowerCase();
  const isSelectedText = !!selectedChurch && q === churchDisplay(selectedChurch).toLowerCase();
  const filteredChurches = !q || isSelectedText
    ? churches.slice(0, 8)
    : churches
        .filter((c) => c.name.toLowerCase().includes(q) || (c.address || '').toLowerCase().includes(q))
        .slice(0, 8);

  const setField = <K extends keyof StaffForm>(key: K, value: StaffForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChurchId || !selectedChurch) {
      setFormError('Seleccioná tu iglesia para continuar.');
      return;
    }
    if (!form.fullName.trim()) {
      setFormError('Nombre y Apellido son obligatorios.');
      return;
    }
    if (!form.phone.trim()) {
      setFormError('El teléfono es obligatorio para el contacto del equipo.');
      return;
    }
    if (!/^\d{4}$/.test(form.pin)) {
      setFormError('El PIN debe tener exactamente 4 dígitos.');
      return;
    }

    const cleanPhone = form.phone.replace(/\D/g, '').trim();
    const cleanPin = form.pin.trim();

    setSubmitting(true);
    setFormError('');
    try {
      const base = {
        organization_id: selectedChurchId,
        full_name: form.fullName.trim(),
        role: selectedRole,
      };

      const attempts: Record<string, string | null>[] = [
        { ...base, phone: cleanPhone, pin: cleanPin, auth_user_id: crypto.randomUUID() },
        { ...base, phone: cleanPhone, pin: cleanPin },
        { ...base, auth_user_id: crypto.randomUUID() },
        { ...base },
      ];

      let saved = false;
      let lastError: Error | null = null;

      for (const payload of attempts) {
        const { error } = await supabase.from('profiles').insert(payload);
        if (!error) {
          saved = true;
          break;
        }
        lastError = error;
        if (/row-level security/i.test(error.message)) break;
      }

      if (saved) {
        localStorage.removeItem('asistapp_staff_cloud_pending');
      } else {
        console.warn('Registro en nube pendiente:', lastError?.message);
        localStorage.setItem('asistapp_staff_cloud_pending', '1');
      }

      localStorage.setItem('asistapp_welcome_msg', `¡Bienvenido al equipo de ${selectedChurch.name}!`);

      const isUsher = selectedRole === 'staff' || selectedRole === 'usher' || selectedRole === 'ujier';
      if (isUsher) {
        localStorage.setItem(
          'asistapp_staff_session',
          JSON.stringify({
            organization_id: selectedChurchId,
            full_name: form.fullName.trim(),
            role: selectedRole,
            pin: cleanPin,
            church_name: selectedChurch.name,
          }),
        );
        navigate({ to: '/asistencia' });
      } else {
        localStorage.setItem(
          USER_SESSION_KEY,
          JSON.stringify({
            organization_id: selectedChurchId,
            role: selectedRole,
            full_name: form.fullName.trim(),
            phone: cleanPhone,
            church_name: selectedChurch.name,
          }),
        );
        navigate({ to: '/dashboard' });
      }
    } catch (err) {
      console.error('Error al registrar staff:', err);
      const msg = err instanceof Error ? err.message : 'Error al registrarte en el equipo.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-zinc-900/90 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-600';

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400 font-medium">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <main className="flex-1 w-full max-w-md mx-auto px-4 sm:px-6 space-y-6 pb-10">
        <div className="flex flex-col items-center text-center gap-3 pt-6">
          <AppLogo className="h-20 w-auto mx-auto object-contain" />
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Sumate al equipo</h1>
            <p className="text-sm text-zinc-400 mt-1">
              {lockedOrg ? `Equipo de ${lockedOrg.name}` : 'Registrate como voluntario, ujier o líder'}
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* IGLESIA */}
            {lockedOrg ? (
              <div className="bg-zinc-950/60 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-sm shrink-0">
                  {lockedOrg.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-emerald-400 font-mono uppercase tracking-wider mb-0.5">
                    Iglesia confirmada
                  </p>
                  <p className="text-sm font-semibold text-white truncate">{lockedOrg.name}</p>
                  {lockedOrg.address && (
                    <p className="text-[11px] text-zinc-500 truncate">{lockedOrg.address}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative">
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Tu Iglesia / Congregación *
                </label>
                <input
                  type="text"
                  value={churchQuery}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => setChurchOpen(true)}
                  onBlur={() => setTimeout(() => setChurchOpen(false), 150)}
                  placeholder="Escribí el nombre de tu iglesia..."
                  className={inputClass}
                  autoFocus
                  required
                />
                {churchOpen && (
                  <div className="absolute z-20 mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl shadow-black/50 max-h-64 overflow-y-auto">
                    {filteredChurches.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-zinc-500">
                        Sin resultados para "{churchQuery}".
                      </p>
                    ) : (
                      filteredChurches.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectChurch(c)}
                          className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition border-b border-zinc-800/60 last:border-0"
                        >
                          <p className="text-sm font-semibold text-white">{c.name}</p>
                          {c.address && <p className="text-[11px] text-zinc-500 mt-0.5">{c.address}</p>}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nombre y Apellido *</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setField('fullName', e.target.value)}
                placeholder="Ej: María García"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Teléfono / WhatsApp *
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="Ej: 611223344"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2">Función / Rol en el equipo</label>
              <div className="space-y-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setSelectedRole(r.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition border ${
                      selectedRole === r.value
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                PIN de 4 dígitos (acceso rápido en dispositivos de puerta)
              </label>
              <input
                type="password"
                inputMode="numeric"
                value={form.pin}
                onChange={(e) => setField('pin', e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className={`${inputClass} tracking-[0.5em] text-center font-mono`}
                required
              />
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium rounded-lg px-3 py-2.5">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-zinc-950/40 border-t-zinc-950 rounded-full animate-spin" />
                  Registrando...
                </>
              ) : (
                'Registrarme en el Equipo'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-500">
          ¿Sos miembro y querés tu credencial?{' '}
          <Link to="/registro" className="text-emerald-400 hover:text-emerald-300 font-semibold">
            Auto-inscripción aquí
          </Link>
        </p>
      </main>
    </div>
  );
}