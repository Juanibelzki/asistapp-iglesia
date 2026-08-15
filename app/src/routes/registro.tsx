import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const Route = createFileRoute('/registro')({
  component: RegistroPage,
});

type StudentStage = 'niño' | 'adolescente' | 'adulto';

interface OrgInfo {
  id: string;
  name: string;
  logo_url?: string | null;
  motto?: string | null;
}

interface RegisterForm {
  first_name: string;
  last_name: string;
  phone: string;
  is_student: boolean;
  student_stage: StudentStage;
  guardian_name: string;
  guardian_phone: string;
}

const EMPTY_FORM: RegisterForm = {
  first_name: '',
  last_name: '',
  phone: '',
  is_student: true,
  student_stage: 'niño',
  guardian_name: '',
  guardian_phone: '',
};

function RegistroPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [form, setForm] = useState<RegisterForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadOrg() {
      try {
        const params = new URLSearchParams(window.location.search);
        const orgParam = params.get('org');

        let orgQuery = supabase.from('organizations').select('id, name, logo_url, motto');

        if (orgParam) {
          orgQuery = orgQuery.eq('id', orgParam);
        } else {
          orgQuery = orgQuery.limit(1);
        }

        const { data, error } = await orgQuery.maybeSingle();

        if (data && isMounted) {
          setOrg(data as OrgInfo);
        } else if (error && error.code === 'PGRST204') {
          const { data: fallback, error: fallbackError } = await supabase
            .from('organizations')
            .select('id, name, motto')
            .limit(1)
            .maybeSingle();
          if (fallback && isMounted) setOrg(fallback as OrgInfo);
          if (fallbackError && isMounted) setFormError('No se pudo cargar la organización.');
        } else if (error && isMounted) {
          setFormError('No se pudo cargar la organización.');
        }
      } catch (err) {
        console.error('Error al cargar organización:', err);
        if (isMounted) setFormError('Error de conexión. Intenta nuevamente.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrg();

    return () => {
      isMounted = false;
    };
  }, []);

  const setField = <K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const needsGuardian = form.is_student && (form.student_stage === 'niño' || form.student_stage === 'adolescente');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) {
      setFormError('No se pudo identificar la organización. Intenta recargar la página.');
      return;
    }
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setFormError('Nombre y Apellido son obligatorios.');
      return;
    }
    if (!form.phone.trim()) {
      setFormError('El teléfono es obligatorio para acceder a tu credencial.');
      return;
    }
    if (needsGuardian && !form.guardian_name.trim()) {
      setFormError('Para menores de edad, el nombre del tutor es obligatorio.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const generatedQr = crypto.randomUUID();

      const { error } = await supabase.from('congregados').insert({
        organization_id: org.id,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        is_student: form.is_student,
        student_stage: form.is_student ? form.student_stage : null,
        guardian_name: needsGuardian ? form.guardian_name.trim() || null : null,
        guardian_phone: needsGuardian ? form.guardian_phone.trim() || null : null,
        qr_code: generatedQr,
        status: 'activo',
      });
      if (error) throw error;

      localStorage.setItem('asistapp_congregado_code', generatedQr);
      setSuccess(true);
    } catch (err) {
      console.error('Error al inscribirse:', err);
      setFormError(err instanceof Error ? err.message : 'Error al guardar tu inscripción. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const goToPortal = () => {
    navigate({ to: '/portal' });
  };

  const inputClass =
    'w-full bg-zinc-900/90 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-600';

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
      <main className="flex-1 w-full max-w-md mx-auto p-4 md:p-6 space-y-6 pb-10">
        {/* CABECERA DE IGLESIA */}
        <div className="flex flex-col items-center text-center gap-3 pt-6">
          {org?.logo_url ? (
            <img
              src={org.logo_url}
              alt="Logo de la iglesia"
              className="w-16 h-16 rounded-2xl object-cover border border-zinc-700 bg-zinc-900"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-2xl shadow-lg shadow-emerald-500/20">
              {(org?.name || 'A').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">{org?.name || 'Mi Iglesia'}</h1>
            {org?.motto && <p className="text-sm text-zinc-400 mt-1">{org.motto}</p>}
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-2xl shadow-black/40">
          {success ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white">¡Inscripción exitosa!</h2>
              <p className="text-sm text-zinc-400">
                Tu credencial digital ya está lista con tu código QR. Presentalo en la puerta para registrar tu asistencia.
              </p>
              <button
                onClick={goToPortal}
                className="w-full px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20"
              >
                Ver mi Credencial Digital
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="font-bold text-white text-center">Auto-Inscripción</h2>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nombre *</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => setField('first_name', e.target.value)}
                  placeholder="Ej: María"
                  className={inputClass}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Apellido *</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setField('last_name', e.target.value)}
                  placeholder="Ej: García"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="Ej: 611223344"
                  className={inputClass}
                  required
                />
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  Lo usarás para ingresar a tu credencial desde el portal.
                </p>
              </div>

              <div className="flex items-center justify-between bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">¿Te inscribís a un curso formativo?</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Ej: Escuela de Vida, clases bíblicas o discipulado.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.is_student}
                  onClick={() => setField('is_student', !form.is_student)}
                  className={`relative shrink-0 w-11 h-6 rounded-full transition ${
                    form.is_student ? 'bg-emerald-500' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      form.is_student ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              {form.is_student && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-2">Etapa formativa</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['niño', 'adolescente', 'adulto'] as StudentStage[]).map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => setField('student_stage', stage)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold capitalize transition border ${
                          form.student_stage === stage
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {needsGuardian && (
                <div className="space-y-4 border-t border-zinc-800 pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nombre del Tutor / Responsable *</label>
                    <input
                      type="text"
                      value={form.guardian_name}
                      onChange={(e) => setField('guardian_name', e.target.value)}
                      placeholder="Ej: Ana Fernández"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Teléfono del Tutor</label>
                    <input
                      type="tel"
                      value={form.guardian_phone}
                      onChange={(e) => setField('guardian_phone', e.target.value)}
                      placeholder="Ej: 611223344"
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

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
                    Inscribiendo...
                  </>
                ) : (
                  'Inscribirme'
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}