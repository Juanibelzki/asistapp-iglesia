import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'
export const THEME_KEY = 'ecclesiahs_theme'

/**
 * Script inline para el <head>: aplica el tema guardado (o el del sistema)
 * ANTES del primer pintado, evitando el parpadeo claro→oscuro.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.classList.toggle('dark',t==='dark');var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'#0e0d1a':'#fbf8f3')}catch(e){}})()`

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    setThemeState(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#0e0d1a' : '#fbf8f3')
    try {
      localStorage.setItem(THEME_KEY, next)
    } catch {
      /* almacenamiento no disponible */
    }
  }, [])

  const toggle = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme])

  return { theme, setTheme, toggle }
}
