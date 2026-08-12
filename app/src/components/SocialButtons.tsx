import { handleSocialLogin } from '../lib/auth'

export function SocialButtons() {
  return (
    <>
      <div className="flex items-center gap-3 my-4">
        <div className="h-px bg-zinc-700 flex-1"></div>
        <span className="text-zinc-500 text-xs uppercase tracking-widest whitespace-nowrap">o continuar con</span>
        <div className="h-px bg-zinc-700 flex-1"></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          className="bg-zinc-800/60 hover:bg-zinc-700/80 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-medium text-zinc-200 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
          Google
        </button>
        <button
          type="button"
          onClick={() => handleSocialLogin('apple')}
          className="bg-zinc-800/60 hover:bg-zinc-700/80 border border-white/10 rounded-xl py-2.5 px-4 text-sm font-medium text-zinc-200 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 13.97c-.03-2.67 2.31-3.92 2.41-3.96-1.32-1.91-3.32-2.17-4.04-2.2-1.72-.17-3.37 1.01-4.25 1.01-.88 0-2.25-1.05-3.69-1.01-1.9.03-3.66 1.1-4.66 2.87-2.01 3.47-.51 8.53 1.41 11.31.95 1.41 2.08 2.99 3.56 2.93 1.44-.06 1.99-.92 3.73-.92 1.74 0 2.24.92 3.76.89 1.57-.03 2.53-1.42 3.48-2.83 1.1-1.6 1.56-3.15 1.58-3.23-.03-.01-3.07-1.18-3.1-4.67zM12.75 5.58c.76-.92 1.28-2.2 1.14-3.47-1.1.04-2.43.73-3.21 1.65-.7.8-1.28 2.08-1.12 3.32 1.23.09 2.45-.6 3.19-1.5z" />
            </svg>
          Apple
        </button>
      </div>
    </>
  )
}
