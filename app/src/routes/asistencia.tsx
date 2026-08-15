import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../lib/supabase';

export const Route = createFileRoute('/asistencia')({
  component: AsistenciaPage,
});

interface PortalEvent {
  id: string;
  title: string;
  event_date: string;
}

interface Attendee {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

const QR_READER_ID = 'qr-reader';

function AsistenciaPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [events, setEvents] = useState<PortalEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [scannerRunning, setScannerRunning] = useState(false);
  const [scannerStarting, setScannerStarting] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const [processing, setProcessing] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const attendeesLoadedFor = useRef<string | null>(null);

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
          if (isMounted) setLoading(false);
          return;
        }

        if (isMounted) setOrgId(profile.organization_id);

        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('event_date', { ascending: true });

        if (!error && data && isMounted) {
          const today = new Date().toISOString().slice(0, 10);
          const upcoming = (data as PortalEvent[])
            .filter((evt) => evt.event_date >= today)
            .sort((a, b) => a.event_date.localeCompare(b.event_date));
          const recent = (data as PortalEvent[])
            .filter((evt) => evt.event_date < today)
            .sort((a, b) => b.event_date.localeCompare(a.event_date))
            .slice(0, 5);
          setEvents([...upcoming, ...recent]);
          if (upcoming.length > 0) {
            setSelectedEventId(upcoming[0].id);
          } else if (recent.length > 0) {
            setSelectedEventId(recent[0].id);
          }
        }
      } catch (err) {
        console.error('Error al cargar eventos:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const showToast = (message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAttendees = async (eventId: string) => {
    if (!orgId || attendeesLoadedFor.current === eventId) return;
    attendeesLoadedFor.current = eventId;
    setAttendeesLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('id, congregado_id, check_in_time, congregados(first_name, last_name)')
        .eq('event_id', eventId)
        .eq('organization_id', orgId)
        .order('check_in_time', { ascending: true });

      if (error) throw error;

      const mapped = (data || [])
        .map((row: any) => {
          const member = row.congregados;
          return {
            id: row.id,
            first_name: member?.first_name || 'Desconocido',
            last_name: member?.last_name || '',
            created_at: row.check_in_time || row.created_at,
          };
        })
        .filter((item: Attendee) => item.first_name !== 'Desconocido' || item.last_name !== '');
      setAttendees(mapped);
    } catch (err) {
      console.error('Error al cargar asistentes:', err);
      setAttendees([]);
    } finally {
      setAttendeesLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedEventId) return;
    attendeesLoadedFor.current = null;
    setAttendees([]);
    loadAttendees(selectedEventId);
  }, [selectedEventId, orgId]);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      scanner.clear();
    } catch (err) {
      console.warn('Error al detener el escáner:', err);
    }
    scannerRef.current = null;
    setScannerRunning(false);
  };

  const startScanner = async () => {
    if (!orgId || !selectedEventId) {
      setScannerError('Seleccioná un evento antes de iniciar el escáner.');
      return;
    }
    if (scannerRunning || scannerStarting) return;

    setScannerError('');
    setProcessing(false);
    setScannerStarting(true);

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const scanner = new Html5Qrcode(QR_READER_ID);
    scannerRef.current = scanner;

    const qrBoxSize = Math.min(window.innerWidth - 80, 260);

    const onScanSuccess = async (decodedText: string) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setProcessing(true);

      try {
        await scanner.pause(true);

        const { data: member, error: memberError } = await supabase
          .from('congregados')
          .select('id, first_name, last_name')
          .eq('qr_code', decodedText)
          .maybeSingle();

        if (memberError || !member) {
          showToast('Código QR no reconocido', 'error');
        } else {
          const { error: insertError } = await supabase.from('attendance').insert({
            event_id: selectedEventId,
            congregado_id: member.id,
            organization_id: orgId,
            check_in_time: new Date().toISOString(),
          });

          if (insertError) {
            const isDuplicate =
              (insertError as any)?.code === '23505' ||
              /duplicate|already exists|ya registrado/i.test(insertError.message);
            if (isDuplicate) {
              showToast('Ya registrado previamente', 'info');
            } else {
              showToast(insertError.message, 'error');
            }
          } else {
            showToast(`Asistencia registrada: ${member.first_name} ${member.last_name}`);
            attendeesLoadedFor.current = null;
            await loadAttendees(selectedEventId);
          }
        }

        setTimeout(() => {
          if (scannerRef.current) {
            try { scannerRef.current.resume(); } catch { /* escáner detenido */ }
          }
          processingRef.current = false;
          setProcessing(false);
        }, 2000);
      } catch (err) {
        console.error('Error procesando escaneo:', err);
        processingRef.current = false;
        setProcessing(false);
        if (scannerRef.current) {
          try { scannerRef.current.resume(); } catch { /* escáner detenido */ }
        }
      }
    };

    const onScanFailure = (errorMessage: string) => {
      if (errorMessage !== 'No QR code detected') {
        console.debug('Escaneo fallido:', errorMessage);
      }
    };

    try {
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: qrBoxSize, height: qrBoxSize },
        },
        onScanSuccess,
        onScanFailure
      );
      setScannerRunning(true);
    } catch (err) {
      console.error('Error al iniciar cámara:', err);
      setScannerError(
        'No se pudo iniciar la cámara. Verificá los permisos del navegador o usá un dispositivo con cámara.'
      );
      scannerRef.current = null;
    } finally {
      setScannerStarting(false);
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  const inputClass =
    'w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition [color-scheme:dark]';

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400 font-medium">Cargando toma de asistencia...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Toma de Asistencia</h1>
            <p className="text-sm text-zinc-400 mt-1">Escaneá el QR de cada congregado para registrar su presencia.</p>
          </div>
          <Link
            to="/dashboard"
            className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 px-3 py-1.5 rounded-lg transition"
          >
            ← Volver al Dashboard
          </Link>
          <Link
            to="/ajustes"
            className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 px-3 py-1.5 rounded-lg transition"
          >
            Ajustes
          </Link>
        </div>

        {/* SELECTOR DE EVENTO */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 space-y-3">
          <label className="block text-xs font-semibold text-zinc-400">Evento / Clase</label>
          {events.length === 0 ? (
            <p className="text-sm text-zinc-500">No hay eventos disponibles. Creá uno desde el Dashboard.</p>
          ) : (
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className={inputClass}
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} — {evt.event_date}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* VISOR DE CÁMARA */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-white">Escáner QR</h2>
            {scannerRunning && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {processing ? 'Procesando...' : 'Cámara activa'}
              </span>
            )}
          </div>

          <div
            id={QR_READER_ID}
            className={`w-full max-w-sm mx-auto rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-zinc-950 ${
              scannerRunning || scannerStarting ? '' : 'hidden'
            }`}
          />

          {!scannerRunning ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A1.5 1.5 0 0021.75 19.5V4.5A1.5 1.5 0 0020.25 3H3.75A1.5 1.5 0 002.25 4.5v15A1.5 1.5 0 003.75 21zM10.5 7.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <p className="text-xs text-zinc-500 text-center max-w-sm">
                La cámara usa el modo trasero (environment). Asegurate de tener permiso de cámara activado.
              </p>
              <button
                onClick={startScanner}
                disabled={!selectedEventId || events.length === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Iniciar Escáner / Activar Cámara
              </button>
            </div>
          ) : (
            <button
              onClick={stopScanner}
              className="mx-auto px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Apagar Cámara
            </button>
          )}

          {scannerError && (
            <p className="text-xs text-red-400 font-medium bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5">
              {scannerError}
            </p>
          )}
        </div>

        {/* LISTA DE ASISTENTES */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between gap-3">
            <h2 className="font-bold text-white">Asistentes del Evento</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 font-semibold">
              {attendees.length} {attendees.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
          {attendeesLoading ? (
            <div className="p-8 flex items-center justify-center gap-3 text-sm text-zinc-400">
              <span className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-200 rounded-full animate-spin" />
              Cargando asistentes...
            </div>
          ) : attendees.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-zinc-500">Aún no hay asistencias registradas para este evento.</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-800/60 max-h-80 overflow-y-auto">
              {attendees.map((item) => (
                <li key={item.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-black">
                      {item.first_name.charAt(0)}
                    </span>
                    <p className="font-bold text-white truncate">
                      {item.first_name} {item.last_name}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-400">{formatTime(item.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl text-sm font-bold shadow-2xl border transition ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
              : toast.type === 'error'
                ? 'bg-red-500 text-zinc-950 border-red-400'
                : 'bg-zinc-200 text-zinc-900 border-zinc-300'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}