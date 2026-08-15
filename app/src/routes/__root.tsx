import { createRootRoute, HeadContent, Scripts, Link } from '@tanstack/react-router';
// CSS principal con Tailwind v4 (@import "tailwindcss") — imprescindible para que
// los estilos lleguen al <head> del documento renderizado en SSR.
import '../styles.css';
import { PwaRegister } from '../components/PwaRegister';

export const Route = createRootRoute({
  shellComponent: RootDocument,
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

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased flex flex-col">
        {children}
        <PwaRegister />
        <Scripts />
      </body>
    </html>
  );
}
