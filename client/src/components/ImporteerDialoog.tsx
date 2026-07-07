import { useEffect, useRef, useState } from 'react'
import type {
  VragenSet,
  VragenSetDetail,
  Vraag,
  GeslotenVraag,
  Thema,
} from 'shared'
import { useApiGet } from '../hooks/useApi'
import { api } from '../api/client'

interface ImporteerDialoogProps {
  open: boolean
  doelSet: VragenSetDetail
  onKlaar: () => void
  onAnnuleer: () => void
}

// Checkbox die ook een "gedeeltelijk geselecteerd" (indeterminate) staat kan tonen
function DriewegCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean
  indeterminate: boolean
  onChange: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate && !checked
    }
  }, [indeterminate, checked])
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 shrink-0 cursor-pointer accent-yonder-paars"
    />
  )
}

const GESLOTEN_KEY = 'GESLOTEN'

export default function ImporteerDialoog({
  open,
  doelSet,
  onKlaar,
  onAnnuleer,
}: ImporteerDialoogProps) {
  const [stap, setStap] = useState<'kiesBron' | 'kiesItems'>('kiesBron')
  const [bronId, setBronId] = useState<number | null>(null)
  const [geopend, setGeopend] = useState<Set<string>>(new Set())
  const [gekozenVragen, setGekozenVragen] = useState<Set<number>>(new Set())
  const [gekozenGesloten, setGekozenGesloten] = useState<Set<number>>(new Set())
  const [bezig, setBezig] = useState(false)
  const [foutmelding, setFoutmelding] = useState<string | null>(null)

  // Reset alles wanneer de dialoog (opnieuw) geopend wordt
  useEffect(() => {
    if (open) {
      setStap('kiesBron')
      setBronId(null)
      setGeopend(new Set())
      setGekozenVragen(new Set())
      setGekozenGesloten(new Set())
      setBezig(false)
      setFoutmelding(null)
    }
  }, [open])

  const { data: alleSets, loading: setsLaden } = useApiGet<VragenSet[]>(
    open ? '/api/vragensets' : null,
  )
  const { data: bronVragen, loading: vragenLaden } = useApiGet<Vraag[]>(
    open && bronId ? `/api/vragensets/${bronId}/vragen` : null,
  )
  const { data: bronGesloten, loading: geslotenLaden } = useApiGet<
    GeslotenVraag[]
  >(open && bronId ? `/api/vragensets/${bronId}/gesloten-vragen` : null)

  if (!open) return null

  const bronOpties = (alleSets ?? []).filter(
    (s) => s.spelSjabloonId === doelSet.spelSjabloonId && s.id !== doelSet.id,
  )

  function kiesBron(id: number) {
    setBronId(id)
    setStap('kiesItems')
  }

  function toggleGeopend(key: string) {
    setGeopend((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleItem(setter: typeof setGekozenVragen, id: number) {
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleGroep(
    setter: typeof setGekozenVragen,
    huidige: Set<number>,
    ids: number[],
  ) {
    const allesGekozen = ids.length > 0 && ids.every((id) => huidige.has(id))
    setter((prev) => {
      const next = new Set(prev)
      if (allesGekozen) ids.forEach((id) => next.delete(id))
      else ids.forEach((id) => next.add(id))
      return next
    })
  }

  const totaalGekozen = gekozenVragen.size + gekozenGesloten.size

  async function handleImporteer() {
    if (!bronId || totaalGekozen === 0) return
    setBezig(true)
    setFoutmelding(null)
    try {
      await api.post(`/api/vragensets/${doelSet.id}/importeer`, {
        bronSetId: bronId,
        vraagIds: [...gekozenVragen],
        geslotenVraagIds: [...gekozenGesloten],
      })
      onKlaar()
    } catch (err) {
      setFoutmelding(err instanceof Error ? err.message : 'Import mislukt')
    } finally {
      setBezig(false)
    }
  }

  // Groepeer bronvragen per thema (zelfde sjabloon, dus themaId's komen overeen)
  const themas: Thema[] = doelSet.spelSjabloon.themas
  const vragenPerThema = new Map<number, Vraag[]>()
  for (const v of bronVragen ?? []) {
    const lijst = vragenPerThema.get(v.themaId) ?? []
    lijst.push(v)
    vragenPerThema.set(v.themaId, lijst)
  }
  const themasMetVragen = themas.filter((t) => (vragenPerThema.get(t.id)?.length ?? 0) > 0)
  const gesloten = bronGesloten ?? []
  const itemsLaden = vragenLaden || geslotenLaden
  const geenItems =
    !itemsLaden && themasMetVragen.length === 0 && gesloten.length === 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onAnnuleer} />
      <div className="relative bg-surface rounded-xl shadow-lg p-6 w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
        <h3 className="text-lg font-semibold text-text-primary mb-1">
          Vragen importeren
        </h3>

        {stap === 'kiesBron' && (
          <>
            <p className="text-sm text-text-secondary mb-4">
              Kies een vragenset om vragen uit over te nemen.
            </p>
            {setsLaden && <p className="text-sm text-text-muted">Laden...</p>}
            {!setsLaden && bronOpties.length === 0 && (
              <p className="text-sm text-text-muted">
                Je hebt geen andere vragensets met hetzelfde spelsjabloon.
              </p>
            )}
            <div className="space-y-2 overflow-y-auto">
              {bronOpties.map((s) => (
                <button
                  key={s.id}
                  onClick={() => kiesBron(s.id)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:border-yonder-paars hover:bg-bg transition-colors cursor-pointer"
                >
                  <p className="font-medium text-text-primary">{s.label}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={onAnnuleer}
                className="px-4 py-2 text-sm text-text-secondary border border-border rounded-md hover:bg-bg cursor-pointer"
              >
                Annuleren
              </button>
            </div>
          </>
        )}

        {stap === 'kiesItems' && (
          <>
            <p className="text-sm text-text-secondary mb-4">
              Vink de categorieën of losse vragen aan die je wilt importeren.
            </p>

            {itemsLaden && <p className="text-sm text-text-muted">Laden...</p>}
            {geenItems && (
              <p className="text-sm text-text-muted">
                Deze vragenset bevat geen vragen om te importeren.
              </p>
            )}

            <div className="space-y-2 overflow-y-auto flex-1 -mx-1 px-1">
              {themasMetVragen.map((thema) => {
                const items = vragenPerThema.get(thema.id) ?? []
                const ids = items.map((v) => v.id)
                const gekozenAantal = ids.filter((id) => gekozenVragen.has(id)).length
                const isOpen = geopend.has(String(thema.id))
                return (
                  <div
                    key={thema.id}
                    className="rounded-lg border border-border overflow-hidden"
                  >
                    <div className="flex items-center gap-2 p-2.5 bg-surface-alt">
                      <DriewegCheckbox
                        checked={gekozenAantal === ids.length}
                        indeterminate={gekozenAantal > 0}
                        onChange={() =>
                          toggleGroep(setGekozenVragen, gekozenVragen, ids)
                        }
                      />
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: thema.kleur, color: 'var(--color-text-primary)' }}
                      >
                        {thema.titel}
                      </span>
                      <span className="text-xs text-text-muted">
                        {gekozenAantal}/{ids.length}
                      </span>
                      <button
                        onClick={() => toggleGeopend(String(thema.id))}
                        className="ml-auto text-xs text-text-secondary hover:text-yonder-paars cursor-pointer px-1"
                      >
                        {isOpen ? 'Inklappen ▲' : 'Uitklappen ▼'}
                      </button>
                    </div>
                    {isOpen && (
                      <div className="divide-y divide-border">
                        {items.map((v) => (
                          <label
                            key={v.id}
                            className="flex items-center gap-2 p-2.5 pl-9 cursor-pointer hover:bg-bg"
                          >
                            <DriewegCheckbox
                              checked={gekozenVragen.has(v.id)}
                              indeterminate={false}
                              onChange={() => toggleItem(setGekozenVragen, v.id)}
                            />
                            <span className="text-sm text-text-primary truncate">
                              {v.vraagTekst}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {gesloten.length > 0 && (
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="flex items-center gap-2 p-2.5 bg-surface-alt">
                    <DriewegCheckbox
                      checked={gekozenGesloten.size === gesloten.length}
                      indeterminate={gekozenGesloten.size > 0}
                      onChange={() =>
                        toggleGroep(
                          setGekozenGesloten,
                          gekozenGesloten,
                          gesloten.map((g) => g.id),
                        )
                      }
                    />
                    <span className="text-sm font-medium text-text-primary">
                      Gesloten vragen
                    </span>
                    <span className="text-xs text-text-muted">
                      {gekozenGesloten.size}/{gesloten.length}
                    </span>
                    <button
                      onClick={() => toggleGeopend(GESLOTEN_KEY)}
                      className="ml-auto text-xs text-text-secondary hover:text-yonder-paars cursor-pointer px-1"
                    >
                      {geopend.has(GESLOTEN_KEY) ? 'Inklappen ▲' : 'Uitklappen ▼'}
                    </button>
                  </div>
                  {geopend.has(GESLOTEN_KEY) && (
                    <div className="divide-y divide-border">
                      {gesloten.map((g) => (
                        <label
                          key={g.id}
                          className="flex items-center gap-2 p-2.5 pl-9 cursor-pointer hover:bg-bg"
                        >
                          <DriewegCheckbox
                            checked={gekozenGesloten.has(g.id)}
                            indeterminate={false}
                            onChange={() => toggleItem(setGekozenGesloten, g.id)}
                          />
                          <span className="text-sm text-text-primary truncate">
                            {g.vraagTekst}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {foutmelding && (
              <p className="text-sm text-red-600 mt-3">{foutmelding}</p>
            )}

            <div className="flex gap-3 justify-between items-center mt-4 pt-4 border-t border-border">
              <button
                onClick={() => setStap('kiesBron')}
                disabled={bezig}
                className="px-4 py-2 text-sm text-text-secondary border border-border rounded-md hover:bg-bg disabled:opacity-50 cursor-pointer"
              >
                Vorige
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onAnnuleer}
                  disabled={bezig}
                  className="px-4 py-2 text-sm text-text-secondary border border-border rounded-md hover:bg-bg disabled:opacity-50 cursor-pointer"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleImporteer}
                  disabled={bezig || totaalGekozen === 0}
                  className="px-4 py-2 text-sm text-white bg-yonder-paars rounded-md hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {bezig ? 'Bezig...' : `Importeer (${totaalGekozen})`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
