import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

export const Route = createFileRoute('/ceo')({
  component: CeoPage,
});

const CEO_AUTH_KEY = 'asistapp_ceo_auth';
const CEO_PIN = (import.meta.env.VITE_CEO_PIN as string | undefined) || '2026';
const PIN_LENGTH = CEO_PIN.length;

interface OrgRow {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  plan?: string | null;
  created_at?: string | null;
}

const PLAN_OPTIONS = [
  { value: 'Semilla', price: 0, badge: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30' },
  { value: 'Comunidad', price: 24, badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { value: 'Pro', price: 49, badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
];

const planToPrice = (plan?: string | null): number => {
  const p = (plan || '').toLowerCase();
  if (p.includes('pro')) return 49;
  if (p.includes('comunidad') || p.includes('community')) return 24;
  return 0;
};

const planBadgeClass = (plan?: string | null): string => {
  const p = (plan || '').toLowerCase();
  if (p.includes('pro')) return PLAN_OPTIONS[2].badge;
  if (p.includes('comunidad') || p.includes('community')) return PLAN_OPTIONS[1].badge;
  return PLAN_OPTIONS[0].badge;
};

const waLink = (phone?: string | null): string | null => {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (!digits.startsWith('54')) digits = `54${digits}`;
  return `https://wa.me/${digits}`;
};

const formatDate = (iso?: string | null): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
};

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === CEO_PIN) {
      sessionStorage.setItem(CEO_AUTH_KEY, '1');
      onUnlock();
    } else {
      setError('PIN incorrecto. Intentá nuevamente.');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center text-zinc-950 font-black text-xl shadow-lg shadow-emerald-500/20 mb-6">
        CC
      </div>
      <h1 className="text-lg font-bold text-white mb-1">Acceso de Super-Administrador</h1>
      <p className="text-sm text-zinc-500 mb-8">Ingresá el PIN Maestro para continuar.</p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH))}
          placeholder={'•'.repeat(PIN_LENGTH)}
          autoFocus
          className="w-full bg-zinc-900/90 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-4 text-center text-2xl tracking-[0.6em] font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-700"
        />
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
        <button
          type="submit"
          disabled={pin.length < PIN_LENGTH}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/10"
        >
          Desbloquear
        </button>
      </form>
    </div>
  );
}

function CeoPage() {
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof sessionStorage === 'undefined') return false;
    return sessionStorage.getItem(CEO_AUTH_KEY) === '1';
  });

  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({ churches: 0, members: 0, attendance: 0, mrr: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [orgRes, memberRes, attendanceRes, totalMembersRes] = await Promise.all([
        supabase.from('organizations').select('id, name, address, phone, plan, created_at'),
        supabase.from('congregados').select('organization_id'),
        supabase.from('attendance').select('id', { count: 'exact', head: true }),
        supabase.from('congregados').select('id', { count: 'exact', head: true }),
      ]);

      if (orgRes.error) throw orgRes.error;

      const list = (orgRes.data ?? []) as OrgRow[];
      setOrgs(list);

      const counts: Record<string, number> = {};
      for (const row of (memberRes.data ?? []) as { organization_id: string }[]) {
        counts[row.organization_id] = (counts[row.organization_id] || 0) + 1;
      }
      setMemberCounts(counts);

      const mrr = list.reduce((acc, o) => acc + planToPrice(o.plan), 0);

      setStats({
        churches: list.length,
        members: totalMembersRes.count ?? 0,
        attendance: attendanceRes.count ?? 0,
        mrr,
      });
    } catch (err) {
      console.error('Error cargando métricas del CEO:', err);
      setLoadError('No se pudieron cargar las métricas globales. Revisá los permisos de lectura en Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unlocked) loadData();
  }, [unlocked]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orgs;
    return orgs.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        (o.address || '').toLowerCase().includes(q),
    );
  }, [orgs, search]);

  const changePlan = async (id: string, plan: string) => {
    const { error } = await supabase.from('organizations').update({ plan }).eq('id', id);
    if (error) {
      showToast('No se pudo actualizar el plan (revisá políticas RLS de UPDATE).', 'error');
      return;
    }
    setOrgs((prev) => prev.map((o) => (o.id === id ? { ...o, plan } : o)));
    showToast('Plan actualizado correctamente.');
  };

  const copyRegLink = async (id: string) => {
    const link = `${window.location.origin}/registro?org=${id}`;
    try {
      await navigator.clipboard.writeText(link);
      showToast('Enlace de registro copiado.');
    } catch {
      showToast('No se pudo copiar el enlace.', 'error');
    }
  };

  const logout = () => {
    sessionStorage.removeItem(CEO_AUTH_KEY);
    setUnlocked(false);
  };

  if (!unlocked) {
    return <PinGate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-zinc-950/80 border-b border-zinc-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center text-zinc-950 font-black text-sm shrink-0">
              CC
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-white truncate leading-tight">
                Master Dashboard
              </h1>
              <p className="text-xs text-zinc-400 truncate">Super-Administrador · AsistApp</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-900/60"
          >
            Cerrar sesión de CEO
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {loadError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium rounded-lg px-3 py-2.5">
            {loadError}
          </div>
        )}

        {/* KPIs GLOBALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="border border-zinc-800/80 bg-zinc-900/40 p-5 rounded-2xl">
            <p className="text-zinc-400 text-xs uppercase">Iglesias registradas</p>
            <p className="text-3xl font-bold tracking-tight text-white mt-2">{loading ? '…' : stats.churches}</p>
          </div>
          <div className="border border-zinc-800/80 bg-zinc-900/40 p-5 rounded-2xl">
            <p className="text-zinc-400 text-xs uppercase">Miembros acumulados</p>
            <p className="text-3xl font-bold tracking-tight text-white mt-2">{loading ? '…' : stats.members}</p>
          </div>
          <div className="border border-zinc-800/80 bg-zinc-900/40 p-5 rounded-2xl">
            <p className="text-zinc-400 text-xs uppercase">Asistencias escaneadas</p>
            <p className="text-3xl font-bold tracking-tight text-white mt-2">{loading ? '…' : stats.attendance}</p>
          </div>
          <div className="border border-zinc-800/80 bg-zinc-900/40 p-5 rounded-2xl">
            <p className="text-zinc-400 text-xs uppercase">MRR Estimado</p>
            <p className="text-3xl font-bold tracking-tight text-white mt-2">
              {loading ? '…' : `$${stats.mrr} USD`}
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">Según planes (Semilla $0 · Comunidad $24 · Pro $49)</p>
          </div>
        </div>

        {/* DIRECTORIO GLOBAL */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-white">Directorio Global de Iglesias</h2>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o dirección..."
              className="w-full sm:w-80 bg-zinc-900/90 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          <div className="border border-zinc-800/80 bg-zinc-900/40 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-zinc-500 border-b border-zinc-800/80">
                    <th className="px-4 py-3 font-semibold">Iglesia</th>
                    <th className="px-4 py-3 font-semibold">Contacto</th>
                    <th className="px-4 py-3 font-semibold">Registro</th>
                    <th className="px-4 py-3 font-semibold">Miembros</th>
                    <th className="px-4 py-3 font-semibold">Plan</th>
                    <th className="px-4 py-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-zinc-500 text-sm">
                        Cargando directorio...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-zinc-500 text-sm">
                        No hay iglesias que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((org) => {
                      const wa = waLink(org.phone);
                      return (
                        <tr
                          key={org.id}
                          className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/60 transition"
                        >
                          <td className="px-4 py-3">
                            <p className="font-semibold text-white">{org.name}</p>
                            {org.address && <p className="text-xs text-zinc-500 mt-0.5">{org.address}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-zinc-300">{org.phone || '—'}</p>
                            {wa && (
                              <a
                                href={wa}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                              >
                                Abrir WhatsApp
                              </a>
                            )}
                          </td>
                          <td className="px-4 py-3 text-zinc-400 text-xs">{formatDate(org.created_at)}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 bg-zinc-800/60 text-zinc-300 px-2.5 py-1 rounded-full text-xs font-semibold">
                              {memberCounts[org.id] ?? 0} activos
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${planBadgeClass(org.plan)}`}
                              >
                                {org.plan || 'Semilla'}
                              </span>
                              <select
                                value={org.plan || 'Semilla'}
                                onChange={(e) => changePlan(org.id, e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2 py-1.5 outline-none focus:border-emerald-500"
                              >
                                {PLAN_OPTIONS.map((p) => (
                                  <option key={p.value} value={p.value}>
                                    {p.value}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => copyRegLink(org.id)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition active:scale-95"
                            >
                              Copiar enlace
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}