import { useState } from 'react'
import type { Competentie, Vraag, CreateVraag, UpdateVraag } from 'shared'
import { useApiGet } from '../hooks/useApi'
import { api } from '../api/client'
import VraagFormulier from './VraagFormulier'
import BevestigDialoog from './BevestigDialoog'

interface VragenLijstProps {
  setId: number
  competentie: Competentie
}

export default function VragenLijst({ setId, competentie }: VragenLijstProps) {
  const { data: vragen, loading, error, refetch } = useApiGet<Vraag[]>(
    `/api/vragensets/${setId}/vragen?competentie=${competentie}`,
  )

  const [showNieuw, setShowNieuw] = useState(false)
  const [bewerkId, setBewerkId] = useState<number | null>(null)
  const [verwijderId, setVerwijderId] = useState<number | null>(null)
  const [bezig, setBezig] = useState(false)

  async function handleNieuw(data: CreateVraag | UpdateVraag) {
    setBezig(true)
    try {
      await api.post(`/api/vragensets/${setId}/vragen`, data)
      setShowNieuw(false)
      refetch()
    } finally {
      setBezig(false)
    }
  }

  async function handleBewerk(data: CreateVraag | UpdateVraag) {
    if (bewerkId === null) return
    setBezig(true)
    try {
      await api.put(`/api/vragensets/${setId}/vragen/${bewerkId}`, data)
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
      await api.delete(`/api/vragensets/${setId}/vragen/${verwijderId}`)
      setVerwijderId(null)
      refetch()
    } finally {
      setBezig(false)
    }
  }

  function formatTijd(seconden: number): string {

    if (seconden >= 60) return `${seconden / 60} min`
    return `${seconden} sec`
  }

  if (loading) return <p className="text-text-muted text-sm">Laden...</p>
  if (error) return <p className="text-red-600 text-sm">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <MinimumIndicator aantal={vragen?.length ?? 0} minimum={10} label="vragen" />
        {!showNieuw && bewerkId === null && (
          <button
            onClick={() => setShowNieuw(true)}
            className="px-3 py-1.5 text-sm bg-yonder-paars text-white rounded-md hover:bg-yonder-paars-dark transition-colors cursor-pointer"
          >
            Nieuwe vraag
          </button>
        )}
      </div>

      {showNieuw && (
        <div className="mb-4">
          <VraagFormulier
            competentie={competentie}
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
              <VraagFormulier
                key={vraag.id}
                competentie={competentie}
                bestaandeVraag={vraag}
                onOpslaan={handleBewerk}
                onAnnuleer={() => setBewerkId(null)}
                bezig={bezig}
              />
            ) : (
              <div
                key={vraag.id}
                className="bg-surface rounded-md border border-border p-3 flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-primary">{vraag.vraagTekst}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {formatTijd(vraag.tijdSeconden)}
                  </p>
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
            ),
          )}
        </div>
      )}

      {vragen && vragen.length === 0 && !showNieuw && (
        <p className="text-sm text-text-muted text-center py-8">
          Nog geen vragen in deze categorie
        </p>
      )}

      <BevestigDialoog
        open={verwijderId !== null}
        titel="Vraag verwijderen"
        bericht="Weet je zeker dat je deze vraag wilt verwijderen?"
        onBevestig={handleVerwijder}
        onAnnuleer={() => setVerwijderId(null)}
        bezig={bezig}
      />
    </div>
  )
}

function MinimumIndicator({ aantal, minimum, label }: { aantal: number; minimum: number; label: string }) {
  const gehaald = aantal >= minimum
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-medium ${gehaald ? 'text-green-700' : 'text-red-600'}`}>
        {aantal} / {minimum} {label}
      </span>
      {gehaald ? (
        <span className="text-green-700 text-sm">✓</span>
      ) : (
        <span className="text-red-500 text-xs">({minimum - aantal} meer nodig)</span>
      )}
    </div>
  )
}
