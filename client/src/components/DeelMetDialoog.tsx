import { useEffect, useState } from 'react'
import type { User, VragenSet, DeelResultaat } from 'shared'
import { useApiGet } from '../hooks/useApi'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

interface DeelMetDialoogProps {
  set: VragenSet | null
  onSluit: () => void
}

export default function DeelMetDialoog({ set, onSluit }: DeelMetDialoogProps) {
  const { user } = useAuth()
  const open = set !== null
  const [gekozen, setGekozen] = useState<Set<number>>(new Set())
  const [bezig, setBezig] = useState(false)
  const [foutmelding, setFoutmelding] = useState<string | null>(null)
  const [resultaat, setResultaat] = useState<DeelResultaat | null>(null)

  // Reset alles wanneer de dialoog (opnieuw) geopend wordt
  useEffect(() => {
    if (open) {
      setGekozen(new Set())
      setBezig(false)
      setFoutmelding(null)
      setResultaat(null)
    }
  }, [open, set?.id])

  const { data: gebruikers, loading: bezigMetLaden, error } = useApiGet<User[]>(
    open ? '/api/users' : null,
  )

  if (!set) return null

  // useApiGet zet loading pas na de eerste render; zonder data zijn we nog aan het laden
  const loading = bezigMetLaden || (gebruikers === null && !error)

  const anderen = (gebruikers ?? []).filter((u) => u.id !== user?.id)

  function toggle(id: number) {
    setGekozen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleDeel() {
    if (!set || gekozen.size === 0) return
    setBezig(true)
    setFoutmelding(null)
    try {
      const res = await api.post<DeelResultaat>(
        `/api/vragensets/${set.id}/deel-met`,
        { userIds: [...gekozen] },
      )
      setResultaat(res)
    } catch (err) {
      setFoutmelding(err instanceof Error ? err.message : 'Delen mislukt')
    } finally {
      setBezig(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={bezig ? undefined : onSluit} />
      <div className="relative bg-surface rounded-xl shadow-lg p-6 w-full max-w-md mx-4 max-h-[85vh] flex flex-col">
        <h3 className="text-lg font-semibold text-text-primary mb-1">Deel met...</h3>

        {resultaat ? (
          <>
            <p className="text-sm text-text-secondary mb-6">
              De vragenset "{set.label}" is gekopieerd naar{' '}
              {resultaat.aantalOntvangers === 1
                ? '1 gebruiker'
                : `${resultaat.aantalOntvangers} gebruikers`}
              .
            </p>
            <div className="flex justify-end">
              <button
                onClick={onSluit}
                className="px-4 py-2 text-sm text-white bg-yonder-paars rounded-md hover:opacity-90 cursor-pointer"
              >
                Sluiten
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-text-secondary mb-4">
              Kies naar wie je "{set.label}" wilt kopiëren. Iedereen krijgt een eigen
              kopie die hij zelf kan aanpassen.
            </p>

            {loading && <p className="text-sm text-text-muted">Laden...</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!loading && !error && anderen.length === 0 && (
              <p className="text-sm text-text-muted">Er zijn geen andere gebruikers.</p>
            )}

            <div className="overflow-y-auto flex-1 divide-y divide-border rounded-lg border border-border empty:border-0">
              {anderen.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-bg"
                >
                  <input
                    type="checkbox"
                    checked={gekozen.has(u.id)}
                    onChange={() => toggle(u.id)}
                    className="w-4 h-4 shrink-0 cursor-pointer accent-yonder-paars"
                  />
                  <span className="text-sm text-text-primary">{u.naam}</span>
                </label>
              ))}
            </div>

            {foutmelding && <p className="text-sm text-red-600 mt-3">{foutmelding}</p>}

            <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-border">
              <button
                onClick={onSluit}
                disabled={bezig}
                className="px-4 py-2 text-sm text-text-secondary border border-border rounded-md hover:bg-bg disabled:opacity-50 cursor-pointer"
              >
                Annuleren
              </button>
              <button
                onClick={handleDeel}
                disabled={bezig || gekozen.size === 0}
                className="px-4 py-2 text-sm text-white bg-yonder-paars rounded-md hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {bezig ? 'Bezig...' : 'Delen'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
