import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { SpelSjabloonDetail } from 'shared'
import { useApiGet } from '../hooks/useApi'
import { api } from '../api/client'
import BevestigDialoog from '../components/BevestigDialoog'

export default function SpelSjablonenPagina() {
  const navigate = useNavigate()
  const { data: sjablonen, loading, error, refetch } = useApiGet<SpelSjabloonDetail[]>('/api/spelsjablonen')

  const [showNieuw, setShowNieuw] = useState(false)
  const [nieuwNaam, setNieuwNaam] = useState('')
  const [bezig, setBezig] = useState(false)
  const [verwijderId, setVerwijderId] = useState<number | null>(null)

  async function handleNieuwSjabloon(e: React.FormEvent) {
    e.preventDefault()
    if (!nieuwNaam.trim()) return
    setBezig(true)
    try {
      const result = await api.post<SpelSjabloonDetail>('/api/spelsjablonen', { naam: nieuwNaam.trim() })
      setShowNieuw(false)
      setNieuwNaam('')
      navigate(`/admin/spelsjablonen/${result.id}`)
    } finally {
      setBezig(false)
    }
  }

  async function handleVerwijder() {
    if (verwijderId === null) return
    setBezig(true)
    try {
      await api.delete(`/api/spelsjablonen/${verwijderId}`)
      setVerwijderId(null)
      refetch()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Verwijderen mislukt')
      setVerwijderId(null)
    } finally {
      setBezig(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary font-heading">Spelsjablonen</h1>
        {!showNieuw && (
          <button
            onClick={() => setShowNieuw(true)}
            className="px-4 py-2 bg-yonder-paars text-white rounded-md hover:bg-yonder-paars-dark cursor-pointer transition-colors"
          >
            Nieuw sjabloon
          </button>
        )}
      </div>

      {showNieuw && (
        <form onSubmit={handleNieuwSjabloon} className="mb-6 bg-surface-alt rounded-xl border border-border p-4 flex gap-3 items-end">
          <div className="flex-1">
            <label htmlFor="sjabloon-naam" className="block text-sm font-medium text-text-secondary mb-1">
              Naam
            </label>
            <input
              id="sjabloon-naam"
              type="text"
              value={nieuwNaam}
              onChange={(e) => setNieuwNaam(e.target.value)}
              placeholder="Bijv. STEM Challenge"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={bezig || !nieuwNaam.trim()}
            className="px-4 py-2 text-sm bg-yonder-paars text-white rounded-md hover:bg-yonder-paars-dark transition-colors disabled:opacity-50 cursor-pointer"
          >
            {bezig ? 'Aanmaken...' : 'Aanmaken'}
          </button>
          <button
            type="button"
            onClick={() => { setShowNieuw(false); setNieuwNaam('') }}
            className="px-4 py-2 text-sm text-text-secondary border border-border rounded-md hover:bg-bg cursor-pointer"
          >
            Annuleren
          </button>
        </form>
      )}

      {loading && <p className="text-text-muted">Laden...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {sjablonen && sjablonen.length === 0 && !showNieuw && (
        <div className="text-center py-12 text-text-muted">
          <p className="text-lg mb-2">Nog geen spelsjablonen</p>
          <p className="text-sm">Maak je eerste spelsjabloon aan om te beginnen.</p>
        </div>
      )}

      {sjablonen && sjablonen.length > 0 && (
        <div className="space-y-3">
          {sjablonen.map((sjabloon) => (
            <div
              key={sjabloon.id}
              className="bg-surface rounded-lg border border-border p-4 flex items-center justify-between hover:border-yonder-paars/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/admin/spelsjablonen/${sjabloon.id}`)}
            >
              <div>
                <h2 className="font-medium text-text-primary">{sjabloon.naam}</h2>
                <div className="flex gap-1 mt-1.5">
                  {sjabloon.themas.map((thema) => (
                    <span
                      key={thema.id}
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: thema.kleur, color: 'var(--color-text-primary)' }}
                    >
                      {thema.titel}
                    </span>
                  ))}
                  {sjabloon.themas.length === 0 && (
                    <span className="text-xs text-text-muted">Geen thema's</span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setVerwijderId(sjabloon.id) }}
                className="px-2 py-1 text-xs text-red-600 hover:text-red-800 cursor-pointer"
              >
                Verwijder
              </button>
            </div>
          ))}
        </div>
      )}

      <BevestigDialoog
        open={verwijderId !== null}
        titel="Spelsjabloon verwijderen"
        bericht="Weet je zeker dat je dit spelsjabloon wilt verwijderen? Dit kan alleen als er geen vragensets aan gekoppeld zijn."
        onBevestig={handleVerwijder}
        onAnnuleer={() => setVerwijderId(null)}
        bezig={bezig}
      />
    </div>
  )
}
