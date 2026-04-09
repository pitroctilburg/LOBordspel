import { useState } from 'react'
import { GeslotenVraagType } from 'shared'
import type { GeslotenVraag, CreateGeslotenVraag, UpdateGeslotenVraag } from 'shared'
import { useApiGet } from '../hooks/useApi'
import { api } from '../api/client'
import GeslotenVraagFormulier from './GeslotenVraagFormulier'
import BevestigDialoog from './BevestigDialoog'

interface GeslotenVragenLijstProps {
  setId: number
}

export default function GeslotenVragenLijst({ setId }: GeslotenVragenLijstProps) {
  const { data: vragen, loading, error, refetch } = useApiGet<GeslotenVraag[]>(
    `/api/vragensets/${setId}/gesloten-vragen`,
  )

  const [showNieuw, setShowNieuw] = useState(false)
  const [bewerkId, setBewerkId] = useState<number | null>(null)
  const [verwijderId, setVerwijderId] = useState<number | null>(null)
  const [bezig, setBezig] = useState(false)

  async function handleNieuw(data: CreateGeslotenVraag | UpdateGeslotenVraag) {
    setBezig(true)
    try {
      await api.post(`/api/vragensets/${setId}/gesloten-vragen`, data)
      setShowNieuw(false)
      refetch()
    } finally {
      setBezig(false)
    }
  }

  async function handleBewerk(data: CreateGeslotenVraag | UpdateGeslotenVraag) {
    if (bewerkId === null) return
    setBezig(true)
    try {
      await api.put(`/api/vragensets/${setId}/gesloten-vragen/${bewerkId}`, data)
      setBewerkId(null)
      refetch()
    } finally {
      setBezig(false)
    }
  }

  async function handleVerwijder() {
    if (verwijderId === null) return
    setBezig(true)
    try {
      await api.delete(`/api/vragensets/${setId}/gesloten-vragen/${verwijderId}`)
      setVerwijderId(null)
      refetch()
    } finally {
      setBezig(false)
    }
  }

  function formatType(type: GeslotenVraagType): string {
    return type === GeslotenVraagType.WAAR_NIET_WAAR ? 'Waar/Niet waar' : '4 opties'
  }

  if (loading) return <p className="text-text-muted text-sm">Laden...</p>
  if (error) return <p className="text-red-600 text-sm">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <MinimumIndicator aantal={vragen?.length ?? 0} minimum={10} />
        {!showNieuw && bewerkId === null && (
          <button
            onClick={() => setShowNieuw(true)}
            className="px-3 py-1.5 text-sm bg-yonder-paars text-white rounded-md hover:bg-yonder-paars-dark transition-colors cursor-pointer"
          >
            Nieuwe gesloten vraag
          </button>
        )}
      </div>

      {showNieuw && (
        <div className="mb-4">
          <GeslotenVraagFormulier
            onOpslaan={handleNieuw}
            onAnnuleer={() => setShowNieuw(false)}
            bezig={bezig}
          />
        </div>
      )}

      {vragen && vragen.length > 0 && (
        <div className="space-y-2">
          {vragen.map((vraag) =>
            bewerkId === vraag.id ? (
              <GeslotenVraagFormulier
                key={vraag.id}
                bestaandeVraag={vraag}
                onOpslaan={handleBewerk}
                onAnnuleer={() => setBewerkId(null)}
                bezig={bezig}
              />
            ) : (
              <div
                key={vraag.id}
                className="bg-surface rounded-md border border-border p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary">{vraag.vraagTekst}</p>
                    <div className="flex gap-3 mt-2 text-xs text-text-muted">
                      <span>{formatType(vraag.type)}</span>
                      <span>{vraag.tijdSeconden} sec</span>
                      <span>Correct: {vraag.correctAntwoord}</span>
                    </div>
                    <div className="flex gap-2 mt-1 text-xs text-text-muted">
                      <span>A: {vraag.optieA}</span>
                      <span>B: {vraag.optieB}</span>
                      {vraag.optieC && <span>C: {vraag.optieC}</span>}
                      {vraag.optieD && <span>D: {vraag.optieD}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setBewerkId(vraag.id)}
                      className="px-2 py-1 text-xs text-text-secondary hover:text-yonder-paars cursor-pointer"
                    >
                      Bewerk
                    </button>
                    <button
                      onClick={() => setVerwijderId(vraag.id)}
                      className="px-2 py-1 text-xs text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      Verwijder
                    </button>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {vragen && vragen.length === 0 && !showNieuw && (
        <p className="text-sm text-text-muted text-center py-8">
          Nog geen gesloten vragen
        </p>
      )}

      <BevestigDialoog
        open={verwijderId !== null}
        titel="Gesloten vraag verwijderen"
        bericht="Weet je zeker dat je deze gesloten vraag wilt verwijderen?"
        onBevestig={handleVerwijder}
        onAnnuleer={() => setVerwijderId(null)}
        bezig={bezig}
      />
    </div>
  )
}

function MinimumIndicator({ aantal, minimum = 10 }: { aantal: number; minimum?: number }) {
  const gehaald = aantal >= minimum
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-medium ${gehaald ? 'text-green-700' : 'text-red-600'}`}>
        {aantal} / {minimum} gesloten vragen
      </span>
      {gehaald ? (
        <span className="text-green-700 text-sm">✓</span>
      ) : (
        <span className="text-red-500 text-xs">({minimum - aantal} meer nodig)</span>
      )}
    </div>
  )
}
