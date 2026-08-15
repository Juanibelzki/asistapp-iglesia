export const USER_SESSION_KEY = 'asistapp_user_session';
export const STAFF_SESSION_KEY = 'asistapp_staff_session';

export interface LocalSession {
  organization_id?: string;
  role?: string;
  full_name?: string;
  church_name?: string;
  pin?: string;
}

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

export const clearLocalSessions = () => {
  localStorage.removeItem(USER_SESSION_KEY);
  localStorage.removeItem(STAFF_SESSION_KEY);
  localStorage.removeItem('asistapp_staff_cloud_pending');
  localStorage.removeItem('asistapp_welcome_msg');
};