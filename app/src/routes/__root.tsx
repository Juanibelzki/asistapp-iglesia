import { createRootRoute, HeadContent, Scripts, Link, Outlet } from '@tanstack/react-router';
// CSS principal con Tailwind v4 (@import "tailwindcss") — imprescindible para que
// los estilos lleguen al <head> del documento renderizado en SSR.
import '../styles.css';
import { PwaRegister } from '../components/PwaRegister';
import { AuthProvider } from '../context/AuthContext';

export const Route = createRootRoute({
  component: () => (
    <RootDocument>
      <Outlet />
    </RootDocument>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col items-center justify-center text-zinc-100 p-6">
      <h1 className="text-4xl font-black text-yellow-500 mb-2">404</h1>
      <p className="text-zinc-400 mb-6">Página no encontrada en Ecclesiahs.</p>
      <Link className="px-4 py-2 bg-yellow-500 text-slate-950 font-bold rounded-xl text-sm" to="/dashboard">
        Volver al Dashboard
      </Link>
    </div>
  ),
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <link rel="icon" type="image/png" href="/favicon.png?v=3" />
        <link rel="shortcut icon" href="/favicon.png?v=3" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3" />
        <meta name="theme-color" content="#0b0f17" />
        <title>Ecclesiahs — Plataforma de Gestión y Asistencia Eclesial</title>
        <meta name="apple-mobile-web-app-title" content="Ecclesiahs" />
        <meta name="application-name" content="Ecclesiahs" />
        <HeadContent />
      </head>
      <body className="min-h-screen bg-[#0B0F17] text-zinc-100 font-sans antialiased flex flex-col w-full max-w-full overflow-x-hidden box-border">
        <AuthProvider>
          {children}
          <PwaRegister />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
