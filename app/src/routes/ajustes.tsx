import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { readLocalSession } from '../lib/session';

export const Route = createFileRoute('/ajustes')({
  component: AjustesPage,
});

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

const ALLOWED_IMG_EXT = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];

function AjustesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    motto: '',
    address: '',
    phone: '',
    logo_url: '',
  });
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let orgForLoad: string | null = null;

        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('auth_user_id', session.user.id)
            .maybeSingle();
          orgForLoad = profile?.organization_id ?? null;
        } else {
          const local = readLocalSession();
          orgForLoad = local?.organization_id ?? null;
        }

        if (!orgForLoad) {
          if (isMounted) navigate({ to: '/login' });
          return;
        }

        if (isMounted) setOrgId(orgForLoad);

        const { data: org } = await supabase
          .from('organizations')
          .select('name, motto, address, phone, logo_url')
          .eq('id', orgForLoad)
          .maybeSingle();

        if (org && isMounted) {
          setForm({
            name: org.name || '',
            motto: org.motto || '',
            address: org.address || '',
            phone: org.phone || '',
            logo_url: org.logo_url || '',
          });
        }
      } catch (err) {
        console.error('Error al cargar ajustes:', err);
        if (isMounted) setFormError(err instanceof Error ? err.message : 'Error al cargar los ajustes.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const showToast = (message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const setField = <K extends keyof typeof form>(key: K, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!orgId) {
      setFormError('No se pudo determinar tu organización. Intenta recargar la página.');
      return;
    }

    const lowerName = file.name.toLowerCase();
    const extMatch = ALLOWED_IMG_EXT.find((ext) => lowerName.endsWith(ext));
    if (!extMatch) {
      setFormError('Formato no permitido. Usá .png, .jpg, .svg o .webp.');
      return;
    }

    setUploadingLogo(true);
    setFormError('');
    try {
      const ext = extMatch.replace('.', '');
      const filePath = `${orgId}/logo_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('church-assets')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('church-assets').getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) throw new Error('No se pudo generar la URL pública del logo.');

      setForm((f) => ({ ...f, logo_url: publicUrl }));
      showToast('Logo subido correctamente.');
    } catch (err) {
      console.error('Error al subir logo:', err);
      setFormError(err instanceof Error ? err.message : 'Error al subir el logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) {
      setFormError('No se pudo determinar tu organización. Intenta recargar la página.');
      return;
    }
    if (!form.name.trim()) {
      setFormError('El nombre de la iglesia es obligatorio.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: form.name.trim(),
          motto: form.motto.trim() || null,
          address: form.address.trim() || null,
          phone: form.phone.trim() || null,
          logo_url: form.logo_url || null,
        })
        .eq('id', orgId);
      if (error) throw error;
      showToast('Configuración guardada correctamente.');
    } catch (err) {
      console.error('Error al guardar ajustes:', err);
      setFormError(err instanceof Error ? err.message : 'Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition';

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400 font-medium">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Configuración y Branding</h1>
            <p className="text-sm text-zinc-400 mt-1">Personalizá la identidad de tu iglesia y la credencial digital.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/configuracion/suscripcion"
              className="text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              💳 Planes y Suscripción
            </Link>
            <Link
              to="/dashboard"
              className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 px-3 py-2 rounded-xl transition"
            >
              ← Volver al Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* FORMULARIO */}
          <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 space-y-5">
            <h2 className="font-bold text-white">Identidad Institucional</h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nombre de la Iglesia / Ministerio *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Ej: Iglesia Adventista del Séptimo Día"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Lema o Visión</label>
              <input
                type="text"
                value={form.motto}
                onChange={(e) => setField('motto', e.target.value)}
                placeholder="Ej: Una iglesia que ama, forma y envía"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Dirección / Sede</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                placeholder="Ej: Av. Principal 123, Ciudad"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Teléfono / WhatsApp de contacto</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="Ej: 611223344"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Logo de la Iglesia</label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.svg,.webp"
                onChange={handleLogoChange}
                disabled={uploadingLogo}
                className="w-full text-sm text-zinc-400 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border file:border-zinc-700 file:bg-zinc-950 file:text-zinc-200 file:text-xs file:font-bold hover:file:bg-zinc-900 transition disabled:opacity-60"
              />
              {uploadingLogo && <p className="text-[11px] text-emerald-400 mt-1.5">Subiendo logo...</p>}
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium rounded-lg px-3 py-2.5">
                {formError}
              </div>
            )}

            <div className="flex items-center justify-end pt-2 border-t border-zinc-800">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-medium text-sm transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-zinc-950/40 border-t-zinc-950 rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Ajustes'
                )}
              </button>
            </div>
          </form>

          {/* VISTA PREVIA EN VIVO */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 space-y-4 lg:sticky lg:top-6">
            <h2 className="font-bold text-white">Vista Previa</h2>

            <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                {form.logo_url ? (
                  <img
                    src={form.logo_url}
                    alt="Logo de la iglesia"
                    className="w-14 h-14 rounded-xl object-cover border border-zinc-700 bg-zinc-900"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-xl shadow-lg shadow-emerald-500/20">
                    {(form.name || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-extrabold text-white leading-tight truncate">{form.name || 'Mi Iglesia'}</p>
                  <p className="text-xs text-zinc-400 truncate">{form.motto || 'Lema o visión de la iglesia'}</p>
                </div>
              </div>
              <div className="mt-4 border-t border-zinc-800 pt-4 space-y-1">
                {form.address && <p className="text-[11px] text-zinc-500">📍 {form.address}</p>}
                {form.phone && <p className="text-[11px] text-zinc-500">📞 {form.phone}</p>}
              </div>
            </div>

            <p className="text-[11px] text-zinc-500">
              Así se verá el encabezado de la iglesia en la credencial digital y en los documentos del ministerio.
            </p>
          </div>
        </div>
      </main>

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl text-sm font-bold shadow-2xl border transition ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
              : 'bg-red-500 text-zinc-950 border-red-400'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}