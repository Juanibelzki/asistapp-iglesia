/** Formateo de fechas/textos compartido por toda la UI. */

/** Convierte 'YYYY-MM-DD' o ISO en Date local (evita corrimiento por zona horaria). */
export function parseDate(value: string): Date {
  return new Date(value.length === 10 ? `${value}T00:00:00` : value)
}

export function formatDate(value?: string | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!value) return ''
  const d = parseDate(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleDateString('es-AR', opts ?? { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateLong(value?: string | null): string {
  return formatDate(value, { weekday: 'long', day: 'numeric', month: 'long' })
}

export function toDateInput(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export function greeting(date = new Date()): string {
  const h = date.getHours()
  if (h < 6) return 'Buenas noches'
  if (h < 13) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export function errorMessage(err: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (err instanceof Error && err.message) return err.message
  if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
    return (err as any).message
  }
  return fallback
}
