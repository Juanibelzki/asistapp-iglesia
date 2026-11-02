import { supabase } from './supabase';

export const USER_SESSION_KEY = 'asistapp_user_session';
export const STAFF_SESSION_KEY = 'asistapp_staff_session';

export interface LocalSession {
  profile_id?: string;
  organization_id?: string;
  role?: string;
  full_name?: string;
  church_name?: string;
}

// Copia local solo para pintar la interfaz (nombre, iglesia, rol). No autoriza
// nada: la base valida cada consulta con la sesión de Supabase y RLS.
export const readLocalSession = (): LocalSession | null => {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY) || localStorage.getItem(STAFF_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.organization_id ? (parsed as LocalSession) : null;
  } catch {
    return null;
  }
};

const saveLocalSession = (s: LocalSession) => {
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(s));
  localStorage.removeItem(STAFF_SESSION_KEY);
};

export const clearLocalSessions = () => {
  localStorage.removeItem(USER_SESSION_KEY);
  localStorage.removeItem(STAFF_SESSION_KEY);
  localStorage.removeItem('asistapp_staff_cloud_pending');
  localStorage.removeItem('asistapp_welcome_msg');
};

export const isStaffRole = (role?: string | null) => {
  const r = (role || '').toLowerCase();
  return r === 'staff' || r === 'usher' || r === 'ujier';
};

const firstRow = <T,>(data: T | T[] | null): T | null => (Array.isArray(data) ? (data[0] ?? null) : data);

// Asegura una sesión de Supabase en este dispositivo. Los usuarios que entran
// con teléfono + PIN usan una sesión anónima que la base vincula a su perfil.
const ensureAuthSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return;
  const { error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
};

export class LoginError extends Error {
  constructor(public code: 'invalid' | 'locked' | 'network', message: string) {
    super(message);
  }
}

export const loginWithPin = async (phone: string, pin: string): Promise<LocalSession> => {
  await ensureAuthSession();
  const { data, error } = await supabase.rpc('login_with_pin', { p_phone: phone, p_pin: pin });
  if (error) {
    if (/too_many_attempts/i.test(error.message)) {
      throw new LoginError('locked', 'Demasiados intentos. Esperá 15 minutos y volvé a probar.');
    }
    throw new LoginError('network', error.message);
  }
  const row = firstRow(data as LocalSession | LocalSession[] | null);
  if (!row?.organization_id) throw new LoginError('invalid', 'Teléfono o PIN incorrectos.');
  saveLocalSession(row);
  return row;
};

// Perfil real del usuario según la base. Devuelve null si no hay sesión válida.
export const resolveCurrentProfile = async (): Promise<LocalSession | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data, error } = await supabase.rpc('current_profile');
  if (error) return null;
  const row = firstRow(data as LocalSession | LocalSession[] | null);
  if (!row?.organization_id) return null;
  saveLocalSession(row);
  return row;
};

export const logout = async () => {
  try {
    await supabase.rpc('logout_session');
  } catch {
    // Si falla la red igual cerramos la sesión local.
  }
  clearLocalSessions();
  await supabase.auth.signOut();
};
