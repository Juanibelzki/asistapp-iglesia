/// <reference types="vite-plugin-pwa/client" />
import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((r) => r.unregister())))
      .catch(() => {})
      .finally(() => {
        import('virtual:pwa-register')
          .then(({ registerSW }) => {
            registerSW({ immediate: true })
          })
          .catch((err) => {
            console.warn('No se pudo registrar el service worker:', err)
          })
      })
  }, [])

  return null
}