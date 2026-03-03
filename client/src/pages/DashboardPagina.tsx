import { useState } from 'react'
import type { VragenSet } from 'shared'
import { useApiGet } from '../hooks/useApi'
import { api } from '../api/client'
import VragenSetKaart from '../components/VragenSetKaart'
import VragenSetFormulier from '../components/VragenSetFormulier'
import BevestigDialoog from '../components/BevestigDialoog'

export default function DashboardPagina() {
  const { data: sets, loading, error, refetch } = useApiGet<VragenSet[]>('/api/vragensets')

  const [showNieuw, setShowNieuw] = useState(false)
  const [bezig, setBezig] = useState(false)
  const [verwijderId, setVerwijderId] = useState<number | null>(null)

  async function handleNieuweSet(label: string) {
    setBezig(true)
    try {
      await api.post('/api/vragensets', { label })
      setShowNieuw(false)
      refetch()
    } finally {
      setBezig(false)
    }
  }

  async function handleVerwijder() {
    if (verwijderId === null) return
    setBezig(true)
    try {
      await api.delete(`/api/vragensets/${verwijderId}`)
      setVerwijderId(null)
      refetch()
    } finally {
      setBezig(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mijn vragensets</h1>
        {!showNieuw && (
          <button
            onClick={() => setShowNieuw(true)}
            className="px-4 py-2 bg-yonder-paars text-white rounded-md hover:opacity-90 cursor-pointer"
          >
            Nieuwe vragenset
          </button>
        )}
      </div>

      {showNieuw && (
        <div className="mb-6">
          <VragenSetFormulier
            onOpslaan={handleNieuweSet}
            onAnnuleer={() => setShowNieuw(false)}
            bezig={bezig}
          />
        </div>
      )}

      {loading && <p className="text-gray-500">Laden...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {sets && sets.length === 0 && !showNieuw && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">Nog geen vragensets</p>
          <p className="text-sm">Maak je eerste vragenset aan om te beginnen.</p>
        </div>
      )}

      {sets && sets.length > 0 && (
        <div className="space-y-3">
          {sets.map((set) => (
            <VragenSetKaart
              key={set.id}
              set={set}
              onVerwijder={setVerwijderId}
            />
          ))}
        </div>
      )}

      <BevestigDialoog
        open={verwijderId !== null}
        titel="Vragenset verwijderen"
        bericht="Weet je zeker dat je deze vragenset wilt verwijderen? Alle bijbehorende vragen worden ook verwijderd."
        onBevestig={handleVerwijder}
        onAnnuleer={() => setVerwijderId(null)}
        bezig={bezig}
      />
    </div>
  )
}
