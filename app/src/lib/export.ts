import { supabase } from './supabase';

const csvCell = (value: string | number): string => {
  const s = String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  return `"${s.replace(/"/g, '""')}"`;
};

const formatDate = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const formatTime = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mi}`;
};

export async function exportAttendanceReport(
  organizationId: string,
  month: number,
  year: number,
): Promise<{ ok: boolean; error?: string; count: number }> {
  try {
    const [{ data: attRows }, { data: congregados }, { data: events }] = await Promise.all([
      supabase.from('attendance').select('*').eq('organization_id', organizationId),
      supabase.from('congregados').select('id, first_name, last_name').eq('organization_id', organizationId),
      supabase.from('events').select('id, title, event_date').eq('organization_id', organizationId),
    ]);

    const members = new Map((congregados ?? []).map((c: any) => [c.id, c]));
    const evtMap = new Map((events ?? []).map((e: any) => [e.id, e]));

    const rows = (attRows ?? [])
      .map((a: any) => {
        let ts: Date | null = a.check_in_time ? new Date(a.check_in_time) : null;
        if (!ts || isNaN(ts.getTime())) {
          const evt = evtMap.get(a.event_id);
          if (evt?.event_date) ts = new Date(evt.event_date);
        }
        if (!ts || isNaN(ts.getTime())) return null;
        if (ts.getFullYear() !== year || ts.getMonth() !== month) return null;
        return { ...a, ts };
      })
      .filter((a: any): a is any => a !== null)
      .sort((a: any, b: any) => a.ts.getTime() - b.ts.getTime());

    const header = ['Fecha', 'Hora', 'Alumno', 'Programa / Clase', 'Docente / Registrado Por', 'Estado'];

    const lines = [
      header,
      ...rows.map((a: any) => {
        const member = a.congregado_id ? members.get(a.congregado_id) : undefined;
        const evt = a.event_id ? evtMap.get(a.event_id) : undefined;
        return [
          formatDate(a.check_in_time || evt?.event_date),
          formatTime(a.check_in_time),
          member ? `${member.first_name} ${member.last_name}`.trim() : '—',
          evt?.title || '—',
          '—',
          'Presente',
        ];
      }),
    ];

    const csv = '\uFEFF' + lines.map((row) => row.map(csvCell).join(';')).join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const label = `${String(month + 1).padStart(2, '0')}-${year}`;
    link.href = url;
    link.download = `asistencias_${label}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { ok: true, count: rows.length };
  } catch (err) {
    console.error('Error al exportar asistencias:', err);
    return { ok: false, count: 0, error: err instanceof Error ? err.message : 'Error al exportar asistencias.' };
  }
}