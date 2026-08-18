import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { readLocalSession, clearLocalSessions } from '../lib/session';
import type { LocalSession } from '../lib/session';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  localSession: LocalSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [localSession, setLocalSession] = useState<LocalSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const {
          data: { session: supabaseSession },
        } = await supabase.auth.getSession();

        if (mounted) {
          setSession(supabaseSession);
          // Leemos la sesión local (útil para roles de staff que no usan supabase auth)
          setLocalSession(readLocalSession());
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, supabaseSession) => {
      if (mounted) {
        setSession(supabaseSession);
        // Si hay una sesión de Supabase, normalmente la sesión local es redundante,
        // pero la mantenemos sincronizada en caso de cambios locales
        setLocalSession(readLocalSession());
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      clearLocalSessions();
      setSession(null);
      setLocalSession(null);
    }
  };

  const isAuthenticated = !!session || !!localSession;

  const value: AuthContextType = {
    session,
    localSession,
    isAuthenticated,
    isLoading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
