import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { loginWithPin } from '../lib/session';

export const Route = createFileRoute('/registerCongregacion')({
  component: RegisterCongregacionPage,
});

interface OrgForm {
  name: string;
  cityProvince: string;
  address: string;
  pastorName: string;
  phone: string;
  pin: string;
}

const EMPTY_FORM: OrgForm = {
  name: '',
  cityProvince: '',
  address: '',
  pastorName: '',
  phone: '',
  pin: '',
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

    if (!/^\d{4}$/.test(form.pin)) {
      setFormError('El PIN debe tener exactamente 4 dígitos.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const cleanPhone = form.phone.replace(/\D/g, '');
      // Crea la iglesia y al pastor como administrador en una sola operación del lado
      // de la base, con el PIN cifrado.
      const { data, error } = await supabase.rpc('register_church', {
        p_name: form.name.trim(),
        p_city: form.cityProvince.trim(),
        p_address: form.address.trim() || null,
        p_pastor_name: form.pastorName.trim(),
        p_phone: cleanPhone,
        p_pin: form.pin,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.organization_id) throw new Error('No se pudo registrar la congregación.');

      await loginWithPin(cleanPhone, form.pin);
      const result = { data: { id: row.organization_id as string, name: form.name.trim() } };
      setCreatedOrg(result.data as { id: string; name: string });
    } catch (err) {
      console.error('Error al registrar la congregación:', err);
      const msg = err instanceof Error ? err.message : 'Error al registrar la congregación.';
      if (/phone_taken/i.test(msg)) {
        setFormError('Ese teléfono ya tiene una cuenta. Ingresá con tu PIN o usá otro número.');
      } else {
        setFormError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-[#0B0F17] border border-slate-700 text-zinc-100 rounded-xl px-4 py-3 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 outline-none transition-all placeholder:text-zinc-600';

  if (createdOrg) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-zinc-100 flex flex-col font-sans">
        <main className="flex-1 w-full max-w-md mx-auto p-4 md:p-6 space-y-6 pb-10">
          <div className="flex flex-col items-center text-center gap-3 pt-6">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-yellow-500/20">
              {createdOrg.name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">¡Congregación registrada!</h1>
            <p className="text-sm text-zinc-400">
              <strong className="text-white">{createdOrg.name}</strong> ya está en Ecclesiahs. Compartí el
              enlace de auto-inscripción con tus miembros para que generen su credencial con código QR.
            </p>
          </div>

          <div className="bg-[#141C2B] border border-slate-700/50 rounded-2xl p-6 shadow-2xl shadow-black/40">
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Enlace de auto-inscripción (único para tu iglesia)
            </label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={registrationLink}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full bg-[#0B0F17] border border-slate-700 text-zinc-300 text-xs rounded-lg px-3 py-2.5 truncate focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/20 outline-none"
              />
              <button
                type="button"
                onClick={copyLink}
                className="shrink-0 px-3 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold text-xs transition active:scale-95"
              >
                {copied ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">
              Enviá este enlace por WhatsApp o Email para que cada miembro complete su auto-inscripción.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                to="/dashboard"
                className="block w-full py-3.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold text-sm transition-all text-center active:scale-[0.98]"
              >
                Ir a mi panel
              </Link>
              <button
                type="button"
                onClick={copyLink}
                className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all active:scale-[0.98]"
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
    <div className="min-h-screen bg-[#0B0F17] text-zinc-100 flex flex-col font-sans">
      <main className="flex-1 w-full max-w-md mx-auto p-4 md:p-6 space-y-6 pb-10">
        <div className="flex flex-col items-center text-center gap-3 pt-6">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-yellow-500/20">
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

        <div className="bg-[#141C2B] border border-slate-700/50 rounded-2xl p-6 shadow-2xl shadow-black/40">
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
                Tu teléfono / WhatsApp (con él vas a ingresar) *
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
                Vas a quedar como administrador de la iglesia.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">PIN de 4 dígitos para ingresar *</label>
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
              className="w-full px-6 py-3.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
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
          <Link to="/registro" className="text-yellow-500 hover:text-yellow-400 font-semibold">
            Auto-inscripción aquí
          </Link>
        </p>
      </main>
    </div>
  );
}