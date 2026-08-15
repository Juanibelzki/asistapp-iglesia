import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const Route = createFileRoute('/materiales')({
  component: MaterialesPage,
});

type TargetStage = 'todos' | 'niño' | 'adolescente' | 'adulto';

interface StudyMaterial {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  file_url?: string;
  target_stage: TargetStage;
  created_at: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

const STAGE_LABELS: Record<TargetStage, string> = {
  todos: 'Todos',
  'niño': 'Niños',
  'adolescente': 'Adolescentes',
  'adulto': 'Adultos',
};

const STAGE_BADGE_CLASS: Record<TargetStage, string> = {
  todos: 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
  'niño': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'adolescente': 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  'adulto': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
};

const ALLOWED_EXT = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];

const EMPTY_FILE_ERROR = 'Seleccioná un archivo para subir.';

function MaterialesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loadError, setLoadError] = useState('');

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetStage, setTargetStage] = useState<TargetStage>('todos');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');

  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          if (isMounted) navigate({ to: '/login' });
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('auth_user_id', session.user.id)
          .maybeSingle();

        if (!profile?.organization_id) {
          if (isMounted) setLoadError('No se pudo determinar tu organización.');
          return;
        }

        if (isMounted) setOrgId(profile.organization_id);

        const { data, error } = await supabase
          .from('study_materials')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false });

        if (error) {
          if (isMounted) setLoadError(error.message);
        } else if (data && isMounted) {
          setMaterials(data as StudyMaterial[]);
        }
      } catch (err) {
        console.error('Error al cargar materiales:', err);
        if (isMounted) setLoadError(err instanceof Error ? err.message : 'Error al cargar los materiales.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const reloadMaterials = async () => {
    if (!orgId) return;
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setMaterials(data as StudyMaterial[]);
    }
  };

  const showToast = (message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openModal = () => {
    setTitle('');
    setDescription('');
    setTargetStage('todos');
    setFile(null);
    setFormError('');
    setIsOpenModal(true);
  };

  const closeModal = () => {
    setIsOpenModal(false);
    setFormError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) {
      setFormError('No se pudo determinar tu organización. Intenta recargar la página.');
      return;
    }
    if (!title.trim()) {
      setFormError('El título es obligatorio.');
      return;
    }
    if (!file) {
      setFormError(EMPTY_FILE_ERROR);
      return;
    }
    const lowerName = file.name.toLowerCase();
    const hasAllowedExt = ALLOWED_EXT.some((ext) => lowerName.endsWith(ext));
    if (!hasAllowedExt) {
      setFormError('Formato no permitido. Usá .pdf, .doc, .docx, .png o .jpg.');
      return;
    }

    setUploading(true);
    setFormError('');
    try {
      const filePath = `${orgId}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('study-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('study-files')
        .getPublicUrl(filePath);
      const fileUrl = urlData?.publicUrl;
      if (!fileUrl) throw new Error('No se pudo generar la URL pública del archivo.');

      const { error: insertError } = await supabase.from('study_materials').insert({
        organization_id: orgId,
        title: title.trim(),
        description: description.trim() || null,
        file_url: fileUrl,
        target_stage: targetStage,
      });
      if (insertError) throw insertError;

      await reloadMaterials();
      closeModal();
      showToast('Material publicado correctamente.');
    } catch (err) {
      console.error('Error al subir material:', err);
      setFormError(err instanceof Error ? err.message : 'Error al subir el material.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: StudyMaterial) => {
    if (!orgId) return;
    if (!window.confirm(`¿Eliminar el material "${item.title}"? Esta acción no se puede deshacer.`)) return;

    const { error } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', item.id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Error al eliminar material:', error);
      showToast(error.message, 'error');
      return;
    }

    await reloadMaterials();
    showToast('Material eliminado.');
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  const inputClass =
    'w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition';

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400 font-medium">Cargando materiales de estudio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Materiales de Estudio</h1>
            <p className="text-sm text-zinc-400 mt-1">Subí guías, lecciones y PDFs para tus alumnos y congregados.</p>
          </div>

          <button
            onClick={openModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Subir Material</span>
          </button>
        </div>

        {/* ERROR DE CARGA */}
        {loadError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium rounded-xl px-4 py-3">
            {loadError}
          </div>
        )}

        {/* LISTADO / EMPTY STATE */}
        {!loadError && materials.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto mt-6">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No hay materiales cargados</h3>
            <p className="text-xs text-zinc-400 max-w-sm mb-6">
              Subí la primera guía o lección de tu ministerio para que los alumnos la descarguen desde su portal.
            </p>
            <button
              onClick={openModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20"
            >
              + Subir Primer Material
            </button>
          </div>
        ) : (
          !loadError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((item) => (
                <div
                  key={item.id}
                  className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3 hover:border-zinc-700/80 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-white">{item.title}</h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{formatDate(item.created_at)}</p>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize border ${STAGE_BADGE_CLASS[item.target_stage]}`}
                    >
                      {STAGE_LABELS[item.target_stage]}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2">{item.description}</p>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80 mt-auto">
                    {item.file_url ? (
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Ver / Descargar
                      </a>
                    ) : (
                      <span className="flex-1 text-xs text-zinc-600 text-center py-2">Sin archivo adjunto</span>
                    )}
                    <button
                      onClick={() => handleDelete(item)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 transition hover:text-red-400 hover:bg-red-500/10"
                      aria-label={`Eliminar ${item.title}`}
                      title="Eliminar"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {/* MODAL DE SUBIDA */}
      {isOpenModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white">Subir Material</h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                aria-label="Cerrar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Título de la lección / guía *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Lección 1 - La Creación"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Descripción breve (opcional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Guía de actividades para la clase de esta semana."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-2">Etapa Destino</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.keys(STAGE_LABELS) as TargetStage[]).map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => setTargetStage(stage)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition border ${
                        targetStage === stage
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      {STAGE_LABELS[stage]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Archivo *</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="w-full text-sm text-zinc-400 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border file:border-zinc-700 file:bg-zinc-950 file:text-zinc-200 file:text-xs file:font-bold hover:file:bg-zinc-900 transition"
                />
                {file && (
                  <p className="text-[11px] text-emerald-400 mt-1.5 truncate">✓ {file.name}</p>
                )}
              </div>

              {formError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium rounded-lg px-3 py-2.5">
                  {formError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-zinc-950/40 border-t-zinc-950 rounded-full animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    'Publicar Material'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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