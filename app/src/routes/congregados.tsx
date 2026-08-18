import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { readLocalSession } from '../lib/session';
import { exportAttendanceReport } from '../lib/export';
import { QRCodeSVG } from 'qrcode.react';

export const Route = createFileRoute('/congregados')({
  component: CongregadosPage,
});

type MainTab = 'todos' | 'alumnos';
type StudentStage = 'todos' | 'niño' | 'adolescente' | 'adulto';
type FormStage = 'niño' | 'adolescente' | 'adulto';

interface Congregado {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_student: boolean;
  student_stage?: FormStage;
  guardian_name?: string;
  guardian_phone?: string;
  status: string;
  qr_code?: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

interface CongregadoForm {
  first_name: string;
  last_name: string;
  phone: string;
  is_student: boolean;
  student_stage: FormStage;
  guardian_name: string;
  guardian_phone: string;
}

const EMPTY_FORM: CongregadoForm = {
  first_name: '',
  last_name: '',
  phone: '',
  is_student: false,
  student_stage: 'niño',
  guardian_name: '',
  guardian_phone: '',
};

function CongregadosPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [churchName, setChurchName] = useState('Mi Congregación');
  const [memberLimit, setMemberLimit] = useState(50);
  const [congregados, setCongregados] = useState<Congregado[]>([]);

  const [mainTab, setMainTab] = useState<MainTab>('todos');
  const [studentStage, setStudentStage] = useState<StudentStage>('todos');

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CongregadoForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [qrMember, setQrMember] = useState<Congregado | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [exportingAttendance, setExportingAttendance] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 3000);

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
          .select('name, member_limit')
          .eq('id', orgForLoad)
          .maybeSingle();

        if (org && isMounted) {
          setChurchName(org.name || 'Mi Congregación');
          setMemberLimit(org.member_limit ?? 50);
        }

        const { data: members, error: membersError } = await supabase
          .from('congregados')
          .select('*')
          .eq('organization_id', orgForLoad)
          .order('created_at', { ascending: false });

        if (!membersError && members && isMounted) {
          setCongregados(members);
        }
      } catch (err) {
        console.error('Error al cargar congregados:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
          clearTimeout(timer);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [navigate]);

  const reloadCongregados = async () => {
    if (!orgId) return;
    const { data: members, error: membersError } = await supabase
      .from('congregados')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });
    if (!membersError && members) {
      setCongregados(members);
    }
  };

  const showToast = (message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleExportAttendance = async () => {
    if (!orgId || exportingAttendance) return;
    setExportingAttendance(true);
    const now = new Date();
    const res = await exportAttendanceReport(orgId, now.getMonth(), now.getFullYear());
    setExportingAttendance(false);
    if (res.ok) {
      showToast(res.count > 0 ? `${res.count} registros exportados.` : 'No hay asistencias registradas este mes.');
    } else {
      showToast(res.error || 'No se pudo exportar.', 'error');
    }
  };

  const openModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setIsOpenModal(true);
  };

  const openEditModal = (item: Congregado) => {
    setEditingId(item.id);
    setForm({
      first_name: item.first_name,
      last_name: item.last_name,
      phone: item.phone || '',
      is_student: item.is_student,
      student_stage: item.student_stage || 'niño',
      guardian_name: item.guardian_name || '',
      guardian_phone: item.guardian_phone || '',
    });
    setFormError('');
    setIsOpenModal(true);
  };

  const closeModal = () => {
    setIsOpenModal(false);
    setEditingId(null);
    setFormError('');
  };

  const handleDelete = async (item: Congregado) => {
    if (!orgId) return;
    if (!window.confirm(`¿Eliminar a ${item.first_name} ${item.last_name}? Esta acción no se puede deshacer.`)) return;

    const { error } = await supabase
      .from('congregados')
      .delete()
      .eq('id', item.id)
      .eq('organization_id', orgId);

    if (error) {
      console.error('Error al eliminar congregado:', error);
      showToast(error.message, 'error');
      return;
    }

    await reloadCongregados();
    showToast(`${item.first_name} ${item.last_name} fue eliminado.`);
  };

  const openQrModal = (item: Congregado) => setQrMember(item);
  const closeQrModal = () => setQrMember(null);

  const downloadQr = (item: Congregado) => {
    const svg = document.getElementById('congregado-qr-svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${item.first_name}-${item.last_name}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const needsGuardian = form.is_student && (form.student_stage === 'niño' || form.student_stage === 'adolescente');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) {
      setFormError('No se pudo determinar tu organización. Intenta recargar la página.');
      return;
    }
    if (!editingId && congregados.length >= memberLimit) {
      setFormError(`Has alcanzado el límite de ${memberLimit} congregados de tu plan actual. Actualiza tu suscripción en Ajustes > Planes y Suscripción.`);
      return;
    }
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setFormError('Nombre y Apellido son obligatorios.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        const { error } = await supabase
          .from('congregados')
          .update({
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
            phone: form.phone.trim() || null,
            is_student: form.is_student,
            student_stage: form.is_student ? form.student_stage : null,
            guardian_name: needsGuardian ? form.guardian_name.trim() || null : null,
            guardian_phone: needsGuardian ? form.guardian_phone.trim() || null : null,
          })
          .eq('id', editingId)
          .eq('organization_id', orgId);

        if (error) throw error;

        await reloadCongregados();
        closeModal();
        showToast(`${form.first_name.trim()} ${form.last_name.trim()} fue actualizado.`);
      } else {
        const { error } = await supabase.from('congregados').insert({
          organization_id: orgId,
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim() || null,
          is_student: form.is_student,
          student_stage: form.is_student ? form.student_stage : null,
          guardian_name: needsGuardian ? form.guardian_name.trim() || null : null,
          guardian_phone: needsGuardian ? form.guardian_phone.trim() || null : null,
          qr_code: crypto.randomUUID(),
          status: 'activo',
        });
        if (error) throw error;

        await reloadCongregados();
        closeModal();
        showToast(`${form.first_name.trim()} ${form.last_name.trim()} fue registrado.`);
      }
    } catch (err) {
      console.error('Error al guardar congregado:', err);
      setFormError(err instanceof Error ? err.message : 'Error al guardar el congregado.');
    } finally {
      setSaving(false);
    }
  };

  const setField = <K extends keyof CongregadoForm>(key: K, value: CongregadoForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const filteredList = congregados.filter((item) => {
    if (mainTab === 'todos') return true;
    if (mainTab === 'alumnos') {
      if (!item.is_student) return false;
      if (studentStage === 'todos') return true;
      return item.student_stage === studentStage;
    }
    return true;
  });

  const inputClass =
    'w-full bg-[#0B0F17] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/20 transition';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center text-zinc-100">
        <div className="w-10 h-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400 font-medium">Cargando directorio de congregados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-zinc-100 flex flex-col font-sans selection:bg-yellow-500 selection:text-slate-950">

      {/* NAVBAR */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0B0F17]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link className="flex items-center gap-2.5" to="/dashboard">
              <div className="w-9 h-9 rounded-xl bg-yellow-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-yellow-500/20">
                A
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Ecclesiahs
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 transition" to="/dashboard">
                Panel General
              </Link>
              <span className="px-3 py-1.5 rounded-lg bg-[#141C2B] text-yellow-500 border border-slate-700/60">
                Congregados
              </span>
              <Link className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 transition" to="/materiales">
                Materiales
              </Link>
              <Link className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 transition" to="/asistencia">
                Asistencia
              </Link>
              <Link className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 transition" to="/ajustes">
                Ajustes
              </Link>
            </nav>
          </div>

          <Link className="text-xs text-zinc-400 hover:text-zinc-200 border border-slate-700 px-3 py-1.5 rounded-lg transition" to="/dashboard">
            ← Volver al Dashboard
          </Link>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Directorio de Congregados</h1>
            <p className="text-sm text-zinc-400 mt-1">Gestión integral de miembros y alumnos formativos de <span className="text-zinc-200 font-semibold">{churchName}</span></p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportAttendance}
            disabled={exportingAttendance}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-zinc-100 font-bold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{exportingAttendance ? 'Exportando…' : 'Exportar Lista'}</span>
          </button>
          <button
            onClick={openModal}
            className="px-4 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold text-sm transition shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Registrar Congregado</span>
          </button>
        </div>
        </div>

        {/* PESTAÑA PRINCIPAL: TODOS VS ALUMNOS */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <button
              onClick={() => setMainTab('todos')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                mainTab === 'todos'
                  ? 'bg-[#141C2B] text-white border border-slate-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141C2B]/40'
              }`}
            >
              Todos los Congregados ({congregados.length})
            </button>
            <button
              onClick={() => setMainTab('alumnos')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
                mainTab === 'alumnos'
                  ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141C2B]/40'
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
            <div className="flex items-center gap-2 bg-[#141C2B]/60 p-1.5 rounded-xl border border-slate-700/60 w-fit">
              <button
                onClick={() => setStudentStage('todos')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  studentStage === 'todos' ? 'bg-slate-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Todos los Niveles
              </button>
              <button
                onClick={() => setStudentStage('niño')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  studentStage === 'niño' ? 'bg-yellow-500 text-slate-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Niños (0-11 años)
              </button>
              <button
                onClick={() => setStudentStage('adolescente')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  studentStage === 'adolescente' ? 'bg-yellow-500 text-slate-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Adolescentes (12-17 años)
              </button>
              <button
                onClick={() => setStudentStage('adulto')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  studentStage === 'adulto' ? 'bg-yellow-500 text-slate-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Adultos (18+ años)
              </button>
            </div>
          )}
        </div>

        {/* LISTADO / TABLA O ESTADO VACÍO */}
        {filteredList.length === 0 ? (
          <div className="bg-[#141C2B]/40 border border-slate-700/60 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto mt-6">
            <div className="w-14 h-14 rounded-2xl bg-[#141C2B] border border-slate-700 flex items-center justify-center text-zinc-500 mb-4">
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
            <button
              onClick={openModal}
              className="px-4 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold text-sm transition shadow-lg shadow-yellow-500/20"
            >
              + Registrar Primer Miembro
            </button>
          </div>
        ) : (
          <div className="bg-[#141C2B]/50 border border-slate-700/60 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-[#1E293B]/80 text-xs uppercase tracking-wider text-zinc-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-6 font-semibold">Nombre Completo</th>
                    <th className="py-3.5 px-6 font-semibold">Categoría / Etapa</th>
                    <th className="py-3.5 px-6 font-semibold">Tutor / Contacto</th>
                    <th className="py-3.5 px-6 font-semibold">Estado</th>
                    <th className="py-3.5 px-6 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-4 px-6 font-bold text-white">
                        {item.first_name} {item.last_name}
                      </td>
                      <td className="py-4 px-6">
                        {item.is_student ? (
                          <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize">
                            Alumno ({item.student_stage || 'General'})
                          </span>
                        ) : (
                          <span className="bg-slate-800 text-zinc-300 border border-slate-700/60 px-2.5 py-1 rounded-lg text-xs font-semibold">
                            Congregado
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-zinc-400 text-xs">
                        {item.guardian_name ? (
                          <div>
                            <span className="text-zinc-200 font-semibold">{item.guardian_name}</span>
                            {item.guardian_phone && <span className="block text-zinc-500">{item.guardian_phone}</span>}
                          </div>
                        ) : (
                          item.phone || 'Sin contacto'
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.status || 'Activo'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openQrModal(item)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 transition hover:text-yellow-500 hover:bg-yellow-500/10"
                            aria-label={`Ver QR de ${item.first_name} ${item.last_name}`}
                            title="Ver QR"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 4h1v2h-1v-2zm3 0h1v1h-1v-1zm0 3h2v1h-2v-1zm-3-6h3v1h-3v-1zm-4 2h1v3h-1v-3z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 transition hover:text-yellow-500 hover:bg-yellow-500/10"
                            aria-label={`Editar ${item.first_name} ${item.last_name}`}
                            title="Editar"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 transition hover:text-red-400 hover:bg-red-500/10"
                            aria-label={`Eliminar ${item.first_name} ${item.last_name}`}
                            title="Eliminar"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE REGISTRO */}
      {isOpenModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-[#141C2B] border border-slate-700/60 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60">
              <h2 className="text-lg font-bold text-white">
                {editingId ? 'Editar Congregado' : 'Registrar Congregado'}
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-slate-800 transition"
                aria-label="Cerrar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {!editingId && congregados.length >= memberLimit && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium rounded-xl p-4 flex flex-col gap-2">
                  <p className="font-bold">⚠️ Límite de miembros alcanzado ({congregados.length}/{memberLimit})</p>
                  <p className="text-zinc-400">Has alcanzado el cupo máximo de tu plan actual. Para registrar más congregados, mejora tu suscripción.</p>
                  <Link to="/suscripcion" className="text-yellow-500 font-bold hover:underline inline-flex items-center gap-1 mt-1">
                    Ver planes y mejorar suscripción →
                  </Link>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nombre *</label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setField('first_name', e.target.value)}
                    placeholder="Ej: María"
                    className={inputClass}
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Teléfono (opcional)</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  placeholder="Ej: 611223344"
                  className={inputClass}
                />
              </div>

              <div className="flex items-center justify-between bg-[#0B0F17] border border-slate-700/60 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">¿Es alumno de clases bíblicas / discipulado?</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Los alumnos se registran en niveles y generan su QR de asistencia.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.is_student}
                  onClick={() => setField('is_student', !form.is_student)}
                  className={`relative shrink-0 w-11 h-6 rounded-full transition ${
                    form.is_student ? 'bg-yellow-500' : 'bg-slate-700'
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
                    {(['niño', 'adolescente', 'adulto'] as FormStage[]).map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => setField('student_stage', stage)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold capitalize transition border ${
                          form.student_stage === stage
                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                            : 'bg-[#0B0F17] text-zinc-400 border-slate-700 hover:text-zinc-200 hover:border-slate-600'
                        }`}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1.5">
                    {form.student_stage === 'niño' && '0-11 años'}
                    {form.student_stage === 'adolescente' && '12-17 años'}
                    {form.student_stage === 'adulto' && '18+ años'}
                  </p>
                </div>
              )}

              {needsGuardian && (
                <div className="space-y-4 border-t border-slate-700/60 pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nombre del Tutor</label>
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

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-700/60">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-300 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold text-sm transition shadow-lg shadow-yellow-500/20 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : editingId ? (
                    'Guardar Cambios'
                  ) : (
                    'Registrar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE QR */}
      {qrMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeQrModal}
        >
          <div
            className="bg-[#141C2B] border border-slate-700/60 rounded-2xl w-full max-w-sm shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60">
              <h2 className="text-lg font-bold text-white">QR de Asistencia</h2>
              <button
                onClick={closeQrModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-slate-800 transition"
                aria-label="Cerrar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 flex flex-col items-center gap-4">
              <p className="text-sm text-zinc-300 font-semibold text-center">
                {qrMember.first_name} {qrMember.last_name}
              </p>
              <div className="bg-white rounded-xl p-4">
                <QRCodeSVG id="congregado-qr-svg" value={qrMember.qr_code || qrMember.id} size={180} />
              </div>
              <p className="text-[11px] text-zinc-500 text-center">
                Comparte este código con {qrMember.is_student ? 'el alumno' : 'el miembro'} para registrar su asistencia.
              </p>
              <button
                onClick={() => downloadQr(qrMember)}
                className="w-full px-4 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold text-sm transition shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar QR (SVG)
              </button>
            </div>
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