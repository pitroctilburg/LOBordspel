import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { Competentie, COMPETENTIE_META } from 'shared'
import type { VragenSetDetail } from 'shared'
import { useApiGet } from '../hooks/useApi'
import { api } from '../api/client'
import CompetentieTab from '../components/CompetentieTab'
import VragenLijst from '../components/VragenLijst'
import GeslotenVragenLijst from '../components/GeslotenVragenLijst'
import ShareDialoog from '../components/ShareDialoog'
import VragenSetFormulier from '../components/VragenSetFormulier'
import BevestigDialoog from '../components/BevestigDialoog'

type TabType = Competentie | 'GESLOTEN'

const COMPETENTIES = Object.values(Competentie) as Competentie[]

export default function VragenSetDetailPagina() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: set, loading, error, refetch } = useApiGet<VragenSetDetail>(
    id ? `/api/vragensets/${id}` : null,
  )

  const [actieveTab, setActieveTab] = useState<TabType>(Competentie.KWALITEITEN)
  const [showBewerk, setShowBewerk] = useState(false)
  const [showVerwijder, setShowVerwijder] = useState(false)
  const [bezig, setBezig] = useState(false)

  async function handleLabelOpslaan(label: string) {
    setBezig(true)
    try {
      await api.put(`/api/vragensets/${id}`, { label })
      setShowBewerk(false)
      refetch()
    } finally {
      setBezig(false)
    }
  }

  async function handleVerwijder() {
    setBezig(true)
    try {
      await api.delete(`/api/vragensets/${id}`)
      navigate('/dashboard')
    } finally {
      setBezig(false)
    }
  }

  function handleShareUpdate() {
    refetch()
  }

  if (loading) {
    return <p className="text-gray-500">Laden...</p>
  }

  if (error || !set) {
    return <p className="text-red-600">{error ?? 'Vragenset niet gevonden'}</p>
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        {showBewerk ? (
          <VragenSetFormulier
            initieleLabel={set.label}
            onOpslaan={handleLabelOpslaan}
            onAnnuleer={() => setShowBewerk(false)}
            bezig={bezig}
          />
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{set.label}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {set._count.vragen} vragen · {set._count.geslotenVragen} gesloten vragen
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBewerk(true)}
                className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                Naam wijzigen
              </button>
              <button
                onClick={() => setShowVerwijder(true)}
                className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 cursor-pointer"
              >
                Verwijderen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share */}
      <div className="mb-6">
        <ShareDialoog set={set} onUpdate={handleShareUpdate} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {COMPETENTIES.map((comp) => (
          <CompetentieTab
            key={comp}
            competentie={comp}
            meta={COMPETENTIE_META[comp]}
            actief={actieveTab === comp}
            onClick={() => setActieveTab(comp)}
          />
        ))}
        <button
          onClick={() => setActieveTab('GESLOTEN')}
          className="px-4 py-2 rounded-t-md text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
          style={{
            backgroundColor: actieveTab === 'GESLOTEN' ? '#f3f4f6' : 'transparent',
            color: actieveTab === 'GESLOTEN' ? '#1f2937' : '#6b7280',
            borderBottom: actieveTab === 'GESLOTEN' ? '3px solid #6b7280' : '3px solid transparent',
          }}
        >
          Gesloten vragen
        </button>
      </div>

      {/* Tab inhoud */}
      <div className="mt-4">
        {actieveTab === 'GESLOTEN' ? (
          <GeslotenVragenLijst setId={Number(id)} />
        ) : (
          <VragenLijst
            key={actieveTab}
            setId={Number(id)}
            competentie={actieveTab}
          />
        )}
      </div>

      <BevestigDialoog
        open={showVerwijder}
        titel="Vragenset verwijderen"
        bericht="Weet je zeker dat je deze vragenset wilt verwijderen? Alle bijbehorende vragen worden ook verwijderd."
        onBevestig={handleVerwijder}
        onAnnuleer={() => setShowVerwijder(false)}
        bezig={bezig}
      />
    </div>
  )
}
