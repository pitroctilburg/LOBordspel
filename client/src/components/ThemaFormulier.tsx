import { useState } from 'react'
import type { Thema } from 'shared'

interface ThemaFormulierProps {
  bestaandThema?: Thema
  onOpslaan: (data: { titel: string; kleur: string }) => Promise<void>
  onAnnuleer: () => void
  bezig?: boolean
}

export default function ThemaFormulier({
  bestaandThema,
  onOpslaan,
  onAnnuleer,
  bezig,
}: ThemaFormulierProps) {
  const [titel, setTitel] = useState(bestaandThema?.titel ?? '')
  const [kleur, setKleur] = useState(bestaandThema?.kleur ?? '#8F88FD')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titel.trim()) {
      setError('Titel is verplicht')
      return
    }
    setError(null)
    try {
      await onOpslaan({ titel: titel.trim(), kleur })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-alt rounded-xl border border-border p-4 space-y-4">
      <div>
        <label htmlFor="thema-titel" className="block text-sm font-medium text-text-secondary mb-1">
          Titel
        </label>
        <input
          id="thema-titel"
          type="text"
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          placeholder="Bijv. Kwaliteiten"
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="thema-kleur" className="block text-sm font-medium text-text-secondary mb-1">
          Kleur
        </label>
        <div className="flex items-center gap-3">
          <input
            id="thema-kleur"
            type="color"
            value={kleur}
            onChange={(e) => setKleur(e.target.value)}
            className="h-10 w-14 rounded border border-border cursor-pointer"
          />
          <span className="text-sm text-text-muted font-mono">{kleur}</span>
        </div>
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
