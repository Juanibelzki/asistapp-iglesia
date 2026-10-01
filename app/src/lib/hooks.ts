import { useCallback, useEffect, useRef, useState } from 'react'

export interface Resource<T> {
  data: T | undefined
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  setData: (updater: T | ((prev: T | undefined) => T)) => void
}

/**
 * Carga asíncrona simple con estados loading/error y recarga manual.
 * Solo se ejecuta en cliente (useEffect) — seguro con SSR.
 * Si `enabled` es false no dispara la carga.
 */
export function useResource<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown>,
  enabled = true,
): Resource<T> {
  const [data, setDataState] = useState<T | undefined>(undefined)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const runId = useRef(0)

  const run = useCallback(async () => {
    const id = ++runId.current
    setLoading(true)
    setError(null)
    try {
      const result = await fetcherRef.current()
      if (id === runId.current) setDataState(result)
    } catch (err) {
      if (id === runId.current) {
        setError(err instanceof Error ? err.message : (err as any)?.message || 'No se pudo cargar la información.')
      }
    } finally {
      if (id === runId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    void run()
    return () => {
      runId.current++
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps])

  const setData = useCallback((updater: T | ((prev: T | undefined) => T)) => {
    setDataState((prev) =>
      typeof updater === 'function' ? (updater as (p: T | undefined) => T)(prev) : updater,
    )
  }, [])

  return { data, loading, error, reload: run, setData }
}

/** Valor con retraso — útil para búsquedas. */
export function useDebounced<T>(value: T, ms = 200): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

/** Copia texto al portapapeles y devuelve un flag `copied` temporal. */
export function useCopy(timeout = 2200) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), timeout)
        return true
      } catch {
        return false
      }
    },
    [timeout],
  )
  return { copied, copy }
}
