import { useId, useState } from 'react'
import { Check, Search, X } from 'lucide-react'
import { churchLabel, type ChurchInfo } from '../../lib/registro'
import { Input } from '../ui/field'

interface Props {
  churches: ChurchInfo[]
  selected: ChurchInfo | null
  onSelect: (c: ChurchInfo | null) => void
  id?: string
}

/** Buscador de iglesias con lista desplegable (combobox accesible básico). */
export function ChurchPicker({ churches, selected, onSelect, id }: Props) {
  const listId = useId()
  const [query, setQuery] = useState(selected ? churchLabel(selected) : '')
  const [open, setOpen] = useState(false)

  const q = query.trim().toLowerCase()
  const matches =
    !q || (selected && q === churchLabel(selected).toLowerCase())
      ? churches.slice(0, 8)
      : churches.filter((c) => c.name.toLowerCase().includes(q) || (c.address || '').toLowerCase().includes(q)).slice(0, 8)

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
      <Input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          if (selected && e.target.value.trim() !== churchLabel(selected)) onSelect(null)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Escribí el nombre o la dirección…"
        className="pl-10 pr-10"
        autoComplete="off"
      />
      {(selected || query) && (
        <button
          type="button"
          aria-label="Borrar selección"
          onClick={() => {
            onSelect(null)
            setQuery('')
            setOpen(true)
          }}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-ink-faint hover:bg-sunken hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-line bg-surface py-1 shadow-pop"
        >
          {matches.length === 0 ? (
            <li className="px-4 py-3 text-sm text-ink-faint">No encontramos iglesias con ese nombre.</li>
          ) : (
            matches.map((c) => (
              <li key={c.id} role="option" aria-selected={selected?.id === c.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSelect(c)
                    setQuery(churchLabel(c))
                    setOpen(false)
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left hover:bg-sunken"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{c.name}</span>
                    {c.address && <span className="block truncate text-xs text-ink-faint">{c.address}</span>}
                  </span>
                  {selected?.id === c.id && <Check className="h-4 w-4 text-primary" />}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
