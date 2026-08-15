import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, User, Trash2, Search, Filter } from 'lucide-react';

export const Route = createFileRoute('/congregados')({
  component: CongregadosPage,
});

interface Congregado {
  id: string;
  first_name: string;
  last_name: string;
  student_stage: 'niño' | 'adolescente' | 'adulto';
  guardian_name: string;
  guardian_phone: string;
  status: string;
}

function CongregadosPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [congregados, setCongregados] = useState<Congregado[]>([]);
  const [filter, setFilter] = useState<'todos' | 'niño' | 'adolescente' | 'adulto'>('todos');

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate({ to: '/login' });
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('auth_user_id', session.user.id)
          .single();

        if (!profile?.organization_id) throw new Error('No org');

        let query = supabase
          .from('children')
          .select('*')
          .eq('organization_id', profile.organization_id);

        if (filter !== 'todos') {
          query = query.eq('student_stage', filter);
        }

        const { data } = await query;
        setCongregados((data as any[]) || []);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [filter, navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">Congregados</h1>
        <Link to="/dashboard" className="text-zinc-400 hover:text-white">Volver al Dashboard</Link>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-zinc-900 p-1 rounded-xl w-max">
        {(['todos', 'niño', 'adolescente', 'adulto'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              filter === f ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-zinc-500">Cargando...</div>
      ) : congregados.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">
          <User className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin miembros registrados</h3>
          <p className="text-zinc-400 mb-6">Aún no hay miembros en esta categoría.</p>
          <button className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-6 py-3 rounded-xl transition-all">
            + Registrar Congregado
          </button>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-900/80 text-zinc-400 text-xs uppercase border-b border-zinc-800">
              <tr>
                <th className="p-4">Nombre</th>
                <th className="p-4">Etapa</th>
                <th className="p-4">Tutor</th>
                <th className="p-4">Contacto</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {congregados.map(c => (
                <tr key={c.id} className="hover:bg-zinc-800/30 transition">
                  <td className="p-4 font-medium">{c.first_name} {c.last_name}</td>
                  <td className="p-4 capitalize">{c.student_stage}</td>
                  <td className="p-4">{c.guardian_name}</td>
                  <td className="p-4">{c.guardian_phone}</td>
                  <td className="p-4 text-right">
                    <button className="text-emerald-400 hover:text-emerald-300 mr-3">Ver QR</button>
                    <button className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
