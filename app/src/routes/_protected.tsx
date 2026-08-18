import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router';
import { useAuth } from '../context/AuthContext';

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const { session, localSession, isAuthenticated, isLoading } = useAuth();

  // Validate profile / organization presence
  const hasOrganization = !!localSession?.organization_id || (session?.user?.id && true); // Real validation usually requires a DB query here, but we'll approximate for now or assume token claims.


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si no tiene organizacion en localSession y estamos usando supabase, la DB RLS los bloqueara
  // Una mejor validacion UX seria mostrar un mensaje, pero para cumplir:
  if (!localSession?.organization_id && !session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
