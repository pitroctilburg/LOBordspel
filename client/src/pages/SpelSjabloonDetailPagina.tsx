import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import type { SpelSjabloonDetail, Thema } from 'shared'
import { useApiGet } from '../hooks/useApi'
import { api } from '../api/client'
import ThemaFormulier from '../components/ThemaFormulier'
import BevestigDialoog from '../components/BevestigDialoog'

export default function SpelSjabloonDetailPagina() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: sjabloon, loading, error, refetch } = useApiGet<SpelSjabloonDetail>(
    id ? `/api/spelsjablonen/${id}` : null,
  )

  const [showNieuwThema, setShowNieuwThema] = useState(false)
  const [bewerkThemaId, setBewerkThemaId] = useState<number | null>(null)
  const [verwijderThemaId, setVerwijderThemaId] = useState<number | null>(null)
  const [bewerkNaam, setBewerkNaam] = useState(false)
  const [naam, setNaam] = useState('')
  const [bezig, setBezig] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadThemaId, setUploadThemaId] = useState<number | null>(null)

  async function handleNaamOpslaan(e: React.FormEvent) {
    e.preventDefault()
    if (!naam.trim()) return
    setBezig(true)
    try {
      await api.put(`/api/spelsjablonen/${id}`, { naam: naam.trim() })
      setBewerkNaam(false)
      refetch()
    } finally {
      setBezig(false)
    }
  }

  async function handleNieuwThema(data: { titel: string; kleur: string }) {
    setBezig(true)
    try {
      await api.post(`/api/spelsjablonen/${id}/themas`, data)
      setShowNieuwThema(false)
      refetch()
    } finally {
      setBezig(false)
    }
  }

  async function handleBewerkThema(data: { titel: string; kleur: string }) {
    if (bewerkThemaId === null) return
    setBezig(true)
    try {
      await api.put(`/api/spelsjablonen/${id}/themas/${bewerkThemaId}`, data)
      setBewerkThemaId(null)
      refetch()
    } finally {
      setBezig(false)
    }
  }

  async function handleVerwijderThema() {
    if (verwijderThemaId === null) return
    setBezig(true)
    try {
      await api.delete(`/api/spelsjablonen/${id}/themas/${verwijderThemaId}`)
      setVerwijderThemaId(null)
      refetch()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Verwijderen mislukt')
      setVerwijderThemaId(null)
    } finally {
      setBezig(false)
    }
  }

  function handleAfbeeldingKnop(themaId: number) {
    setUploadThemaId(themaId)
    fileInputRef.current?.click()
  }

  async function handleAfbeeldingUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || uploadThemaId === null) return

    const formData = new FormData()
    formData.append('afbeelding', file)

    setBezig(true)
    try {
      await fetch(`/api/spelsjablonen/${id}/themas/${uploadThemaId}/afbeelding`, {
        method: 'POST',
        headers: {
          'X-User-Id': String(JSON.parse(localStorage.getItem('lobordspel_user') ?? '{}').id ?? ''),
        },
        body: formData,
      })
      refetch()
    } finally {
      setBezig(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setUploadThemaId(null)
    }
  }

  if (loading) return <p className="text-text-muted">Laden...</p>
  if (error || !sjabloon) return <p className="text-red-600">{error ?? 'Sjabloon niet gevonden'}</p>

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        {bewerkNaam ? (
          <form onSubmit={handleNaamOpslaan} className="flex gap-3 items-end">
            <div className="flex-1">
              <input
                type="text"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={bezig}
              className="px-4 py-2 text-sm bg-yonder-paars text-white rounded-md hover:bg-yonder-paars-dark transition-colors disabled:opacity-50 cursor-pointer"
            >
              Opslaan
            </button>
            <button
              type="button"
              onClick={() => setBewerkNaam(false)}
              className="px-4 py-2 text-sm text-text-secondary border border-border rounded-md hover:bg-bg cursor-pointer"
            >
              Annuleren
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary font-heading">{sjabloon.naam}</h1>
              <p className="text-sm text-text-muted mt-1">
                {sjabloon.themas.length} thema's
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setBewerkNaam(true); setNaam(sjabloon.naam) }}
                className="px-3 py-1.5 text-sm text-text-secondary border border-border rounded-md hover:bg-bg cursor-pointer"
              >
                Naam wijzigen
              </button>
              <button
                onClick={() => navigate('/admin/spelsjablonen')}
                className="px-3 py-1.5 text-sm text-text-secondary border border-border rounded-md hover:bg-bg cursor-pointer"
              >
                Terug
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Thema's */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-text-primary">Thema's</h2>
        {!showNieuwThema && bewerkThemaId === null && (
          <button
            onClick={() => setShowNieuwThema(true)}
            className="px-3 py-1.5 text-sm bg-yonder-paars text-white rounded-md hover:bg-yonder-paars-dark transition-colors cursor-pointer"
          >
            Thema toevoegen
          </button>
        )}
      </div>

      {showNieuwThema && (
        <div className="mb-4">
          <ThemaFormulier
            onOpslaan={handleNieuwThema}
            onAnnuleer={() => setShowNieuwThema(false)}
            bezig={bezig}
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAfbeeldingUpload}
        className="hidden"
      />

      <div className="space-y-2">
        {sjabloon.themas.map((thema: Thema) =>
          bewerkThemaId === thema.id ? (
            <ThemaFormulier
              key={thema.id}
              bestaandThema={thema}
              onOpslaan={handleBewerkThema}
              onAnnuleer={() => setBewerkThemaId(null)}
              bezig={bezig}
            />
          ) : (
            <div
              key={thema.id}
              className="bg-surface rounded-lg border border-border p-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full shrink-0"
                  style={{ backgroundColor: thema.kleur }}
                />
                {thema.afbeeldingUrl && (
                  <img
                    src={thema.afbeeldingUrl}
                    alt={thema.titel}
                    className="h-10 w-10 object-contain"
                  />
                )}
                <div>
                  <p className="font-medium text-text-primary">{thema.titel}</p>
                  <p className="text-xs text-text-muted font-mono">{thema.kleur}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => handleAfbeeldingKnop(thema.id)}
                  className="px-2 py-1 text-xs text-text-secondary hover:text-yonder-paars cursor-pointer"
                >
                  Afbeelding
                </button>
                <button
                  onClick={() => setBewerkThemaId(thema.id)}
                  className="px-2 py-1 text-xs text-text-secondary hover:text-yonder-paars cursor-pointer"
                >
                  Bewerk
                </button>
                <button
                  onClick={() => setVerwijderThemaId(thema.id)}
                  className="px-2 py-1 text-xs text-red-600 hover:text-red-800 cursor-pointer"
                >
                  Verwijder
                </button>
              </div>
            </div>
          ),
        )}
      </div>

      {sjabloon.themas.length === 0 && !showNieuwThema && (
        <p className="text-sm text-text-muted text-center py-8">
          Voeg minimaal 2 thema's toe aan dit sjabloon.
        </p>
      )}

      <BevestigDialoog
        open={verwijderThemaId !== null}
        titel="Thema verwijderen"
        bericht="Weet je zeker dat je dit thema wilt verwijderen? Dit kan alleen als er geen vragen aan gekoppeld zijn."
        onBevestig={handleVerwijderThema}
        onAnnuleer={() => setVerwijderThemaId(null)}
        bezig={bezig}
      />
    </div>
  )
}
