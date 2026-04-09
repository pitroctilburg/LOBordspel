import { useState } from 'react'

interface VragenSetFormulierProps {
  initieleLabel?: string
  onOpslaan: (label: string) => Promise<void>
  onAnnuleer: () => void
  bezig?: boolean
}

export default function VragenSetFormulier({
  initieleLabel = '',
  onOpslaan,
  onAnnuleer,
  bezig,
}: VragenSetFormulierProps) {
  const [label, setLabel] = useState(initieleLabel)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = label.trim()
    if (!trimmed) {
      setError('Label is verplicht')
      return
    }
    setError(null)
    try {
      await onOpslaan(trimmed)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-xl shadow-sm border border-border p-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label htmlFor="set-label" className="block text-sm font-medium text-text-secondary mb-1">
            Naam van de vragenset
          </label>
          <input
            id="set-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
            placeholder="Bijv. LOB Periode 2"
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={bezig}
          className="px-4 py-2 bg-yonder-paars text-white rounded-md hover:bg-yonder-paars-dark disabled:opacity-50 cursor-pointer transition-colors"
        >
          {bezig ? 'Opslaan...' : 'Opslaan'}
        </button>
        <button
          type="button"
          onClick={onAnnuleer}
          className="px-4 py-2 text-text-secondary border border-border rounded-md hover:bg-bg cursor-pointer"
        >
          Annuleren
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </form>
  )
}
