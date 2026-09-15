import { useState } from 'react'
import type { VragenSet } from 'shared'
import { useApiGet } from '../hooks/useApi'
import { api } from '../api/client'
import VragenSetKaart from '../components/VragenSetKaart'
import VragenSetFormulier from '../components/VragenSetFormulier'
import SpelSjabloonKiezer from '../components/SpelSjabloonKiezer'
import BevestigDialoog from '../components/BevestigDialoog'
import DeelMetDialoog from '../components/DeelMetDialoog'

type NieuwStap = 'idle' | 'kiesSjabloon' | 'voerLabelIn'

export default function DashboardPagina() {
  const { data: sets, loading, error, refetch } = useApiGet<VragenSet[]>('/api/vragensets')

  const [nieuwStap, setNieuwStap] = useState<NieuwStap>('idle')
  const [gekozenSjabloonId, setGekozenSjabloonId] = useState<number | null>(null)
  const [bezig, setBezig] = useState(false)
  const [verwijderId, setVerwijderId] = useState<number | null>(null)
  const [deelSet, setDeelSet] = useState<VragenSet | null>(null)

  function handleSjabloonGekozen(sjabloonId: number) {
    setGekozenSjabloonId(sjabloonId)
    setNieuwStap('voerLabelIn')
  }

  async function handleNieuweSet(label: string) {
    if (gekozenSjabloonId === null) return
    setBezig(true)
    try {
      await api.post('/api/vragensets', { label, spelSjabloonId: gekozenSjabloonId })
      setNieuwStap('idle')
      setGekozenSjabloonId(null)
      refetch()
    } finally {
      setBezig(false)
    }
  }

  function handleAnnuleer() {
    setNieuwStap('idle')
    setGekozenSjabloonId(null)
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
        <h1 className="text-2xl font-bold text-text-primary font-heading">Mijn vragensets</h1>
        {nieuwStap === 'idle' && (
          <button
            onClick={() => setNieuwStap('kiesSjabloon')}
            className="px-4 py-2 bg-yonder-paars text-white rounded-md hover:bg-yonder-paars-dark cursor-pointer transition-colors"
          >
            Nieuwe vragenset
          </button>
        )}
      </div>

      {nieuwStap === 'kiesSjabloon' && (
        <div className="mb-6">
          <SpelSjabloonKiezer
            onKies={handleSjabloonGekozen}
            onAnnuleer={handleAnnuleer}
          />
        </div>
      )}

      {nieuwStap === 'voerLabelIn' && (
        <div className="mb-6">
          <VragenSetFormulier
            onOpslaan={handleNieuweSet}
            onAnnuleer={handleAnnuleer}
            bezig={bezig}
          />
        </div>
      )}

      {loading && <p className="text-text-muted">Laden...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {sets && sets.length === 0 && nieuwStap === 'idle' && (
        <div className="text-center py-12 text-text-muted">
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
              onDeel={setDeelSet}
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

      <DeelMetDialoog set={deelSet} onSluit={() => setDeelSet(null)} />
    </div>
  )
}
