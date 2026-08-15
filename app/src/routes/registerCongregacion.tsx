import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const Route = createFileRoute('/registerCongregacion')({
  component: RegisterCongregacionPage,
});

interface OrgForm {
  name: string;
  cityProvince: string;
  address: string;
  pastorName: string;
  phone: string;
}

const EMPTY_FORM: OrgForm = {
  name: '',
  cityProvince: '',
  address: '',
  pastorName: '',
  phone: '',
};

function RegisterCongregacionPage() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<OrgForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [createdOrg, setCreatedOrg] = useState<{ id: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const setField = <K extends keyof OrgForm>(key: K, value: OrgForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const registrationLink =
    typeof window !== 'undefined' && createdOrg
      ? `${window.location.origin}/registro?org=${createdOrg.id}`
      : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(registrationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setFormError('No se pudo copiar el enlace. Copialo manualmente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.cityProvince.trim() || !form.pastorName.trim() || !form.phone.trim()) {
      setFormError('Completá los campos obligatorios para continuar.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const base = {
        name: form.name.trim(),
        address: form.address.trim() || null,
        phone: form.phone.trim(),
      };

      let result = await supabase
        .from('organizations')
        .insert({
          ...base,
          city: form.cityProvince.trim() || null,
          pastor_name: form.pastorName.trim() || null,
        })
        .select('id, name')
        .single();

      if (result.error && (result.error.code === '42703' || result.error.code === 'PGRST204')) {
        result = await supabase.from('organizations').insert(base).select('id, name').single();
      }

      if (result.error) throw result.error;

      setCreatedOrg(result.data as { id: string; name: string });
    } catch (err) {
      console.error('Error al registrar la congregación:', err);
      const msg = err instanceof Error ? err.message : 'Error al registrar la congregación.';
      if (/row-level security|violates row-level security policy/i.test(msg)) {
        setFormError(
          'Aún no se habilitaron los permisos para registrar congregaciones. Contactá al administrador de AsistApp para activar esta función.',
        );
      } else {
        setFormError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-zinc-900/90 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-600';

  if (createdOrg) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
        <main className="flex-1 w-full max-w-md mx-auto p-4 md:p-6 space-y-6 pb-10">
          <div className="flex flex-col items-center text-center gap-3 pt-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-2xl shadow-lg shadow-emerald-500/20">
              {createdOrg.name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">¡Congregación registrada!</h1>
            <p className="text-sm text-zinc-400">
              <strong className="text-white">{createdOrg.name}</strong> ya está en AsistApp. Compartí el
              enlace de auto-inscripción con tus miembros para que generen su credencial con código QR.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-2xl shadow-black/40">
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Enlace de auto-inscripción (único para tu iglesia)
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={registrationLink}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full bg-zinc-950/70 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2.5 truncate focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
              <button
                type="button"
                onClick={copyLink}
                className="shrink-0 px-3 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition active:scale-95"
              >
                {copied ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">
              Enviá este enlace por WhatsApp o Email para que cada miembro complete su auto-inscripción.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                to="/asistencia"
                className="block w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm transition-all text-center active:scale-[0.98]"
              >
                Ir al Panel de Asistencia
              </Link>
              <button
                type="button"
                onClick={copyLink}
                className="w-full py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition-all active:scale-[0.98]"
              >
                Copiar enlace para miembros
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <main className="flex-1 w-full max-w-md mx-auto p-4 md:p-6 space-y-6 pb-10">
        <div className="flex flex-col items-center text-center gap-3 pt-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-2xl shadow-lg shadow-emerald-500/20">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Registrar mi Congregación</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Dá de alta tu iglesia y obtené tu enlace único de auto-inscripción para miembros.
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Nombre de la Congregación / Iglesia *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Ej: Iglesia Vida Nueva"
                className={inputClass}
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Ciudad y Provincia *</label>
              <input
                type="text"
                value={form.cityProvince}
                onChange={(e) => setField('cityProvince', e.target.value)}
                placeholder="Ej: Buenos Aires, Buenos Aires"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Dirección de la sede principal
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                placeholder="Ej: Av. Rivadavia 1234"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Nombre del Pastor o Administrador responsable *
              </label>
              <input
                type="text"
                value={form.pastorName}
                onChange={(e) => setField('pastorName', e.target.value)}
                placeholder="Ej: Pastor Juan Pérez"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Teléfono / WhatsApp de contacto *
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="Ej: 611223344"
                className={inputClass}
                required
              />
              <p className="text-[11px] text-zinc-500 mt-1.5">
                Se usará para contactarte ante dudas sobre tu cuenta.
              </p>
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
                'Registrar Congregación'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-500">
          ¿Sos miembro y querés inscribirte con tu credencial?{' '}
          <Link to="/registro" className="text-emerald-400 hover:text-emerald-300 font-semibold">
            Auto-inscripción aquí
          </Link>
        </p>
      </main>
    </div>
  );
}