import { createRootRoute, Outlet, Link, useNavigate } from '@tanstack/react-router';
import { supabase } from '../lib/supabase';

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100 p-6">
      <h1 className="text-4xl font-black text-emerald-400 mb-2">404</h1>
      <p className="text-zinc-400 mb-6">Página no encontrada en AsistApp.</p>
      <Link className="px-4 py-2 bg-emerald-500 text-zinc-950 font-bold rounded-xl text-sm" to="/dashboard">
        Volver al Dashboard
      </Link>
    </div>
  ),
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
      <Outlet/>
    </div>
  );
}
