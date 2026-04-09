import { useState } from 'react'
import { Competentie } from 'shared'
import type { Vraag, CreateVraag, UpdateVraag } from 'shared'

interface VraagFormulierProps {
  competentie: Competentie
  bestaandeVraag?: Vraag
  onOpslaan: (data: CreateVraag | UpdateVraag) => Promise<void>
  onAnnuleer: () => void
  bezig?: boolean
}

const TIJD_OPTIES: { waarde: 30 | 60 | 120; label: string }[] = [
  { waarde: 30, label: '30 seconden' },
  { waarde: 60, label: '1 minuut' },
  { waarde: 120, label: '2 minuten' },
]

export default function VraagFormulier({
  competentie,
  bestaandeVraag,
  onOpslaan,
  onAnnuleer,
  bezig,
}: VraagFormulierProps) {
  const [vraagTekst, setVraagTekst] = useState(bestaandeVraag?.vraagTekst ?? '')
  const [tijdSeconden, setTijdSeconden] = useState<30 | 60 | 120>(
    (bestaandeVraag?.tijdSeconden as 30 | 60 | 120) ?? 60,
  )
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!vraagTekst.trim()) {
      setError('Vraagtekst is verplicht')
      return
    }
    setError(null)
    try {
      await onOpslaan({ vraagTekst: vraagTekst.trim(), competentie, tijdSeconden })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-alt rounded-xl border border-border p-4 space-y-4">
      <div>
        <label htmlFor="vraag-tekst" className="block text-sm font-medium text-text-secondary mb-1">
          Vraagtekst
        </label>
        <textarea
          id="vraag-tekst"
          value={vraagTekst}
          onChange={(e) => setVraagTekst(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
          placeholder="Typ je vraag hier..."
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="tijd" className="block text-sm font-medium text-text-secondary mb-1">
          Tijd
        </label>
        <select
          id="tijd"
          value={tijdSeconden}
          onChange={(e) => setTijdSeconden(Number(e.target.value) as 30 | 60 | 120)}
          className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
        >
          {TIJD_OPTIES.map((opt) => (
            <option key={opt.waarde} value={opt.waarde}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={bezig}
          className="px-4 py-2 text-sm bg-yonder-paars text-white rounded-md hover:bg-yonder-paars-dark transition-colors disabled:opacity-50 cursor-pointer"
        >
          {bezig ? 'Opslaan...' : 'Opslaan'}
        </button>
        <button
          type="button"
          onClick={onAnnuleer}
          className="px-4 py-2 text-sm text-text-secondary border border-border rounded-md hover:bg-bg cursor-pointer"
        >
          Annuleren
        </button>
      </div>
    </form>
  )
}
