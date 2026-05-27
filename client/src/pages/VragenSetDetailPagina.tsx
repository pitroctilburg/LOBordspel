import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import type { VragenSetDetail } from 'shared'
import { useApiGet } from '../hooks/useApi'
import { api } from '../api/client'
import ThemaTab from '../components/ThemaTab'
import VragenLijst from '../components/VragenLijst'
import GeslotenVragenLijst from '../components/GeslotenVragenLijst'
import ShareDialoog from '../components/ShareDialoog'
import VragenSetFormulier from '../components/VragenSetFormulier'
import BevestigDialoog from '../components/BevestigDialoog'

type TabType = number | 'GESLOTEN'

export default function VragenSetDetailPagina() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: set, loading, error, refetch } = useApiGet<VragenSetDetail>(
    id ? `/api/vragensets/${id}` : null,
  )

  const [actieveTab, setActieveTab] = useState<TabType | null>(null)
  const [showBewerk, setShowBewerk] = useState(false)
  const [showVerwijder, setShowVerwijder] = useState(false)
  const [bezig, setBezig] = useState(false)

  const themas = set?.spelSjabloon?.themas ?? []
  const effectieveTab = actieveTab ?? (themas.length > 0 ? themas[0].id : 'GESLOTEN')

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
      navigate('/admin/dashboard')
    } finally {
      setBezig(false)
    }
  }

  function handleShareUpdate() {
    refetch()
  }

  if (loading) {
    return <p className="text-text-muted">Laden...</p>
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
              <h1 className="text-2xl font-bold text-text-primary font-heading">{set.label}</h1>
              <p className="text-sm text-text-muted mt-1">
                {set.spelSjabloon.naam} · {set._count.vragen} vragen · {set._count.geslotenVragen} gesloten vragen
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBewerk(true)}
                className="px-3 py-1.5 text-sm text-text-secondary border border-border rounded-md hover:bg-bg cursor-pointer"
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
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {themas.map((thema) => (
          <ThemaTab
            key={thema.id}
            thema={thema}
            actief={effectieveTab === thema.id}
            onClick={() => setActieveTab(thema.id)}
          />
        ))}
        <button
          onClick={() => setActieveTab('GESLOTEN')}
          className="px-4 py-2 rounded-t-md text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
          style={{
            backgroundColor: effectieveTab === 'GESLOTEN' ? 'var(--color-surface-alt)' : 'transparent',
            color: effectieveTab === 'GESLOTEN' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            borderBottom: effectieveTab === 'GESLOTEN' ? '3px solid var(--color-text-muted)' : '3px solid transparent',
          }}
        >
          Gesloten vragen
        </button>
      </div>

      {/* Tab inhoud */}
      <div className="mt-4">
        {effectieveTab === 'GESLOTEN' ? (
          <GeslotenVragenLijst setId={Number(id)} />
        ) : (
          <VragenLijst
            key={effectieveTab}
            setId={Number(id)}
            themaId={effectieveTab}
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
