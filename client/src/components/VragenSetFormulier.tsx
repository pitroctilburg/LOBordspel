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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label htmlFor="set-label" className="block text-sm font-medium text-gray-700 mb-1">
            Naam van de vragenset
          </label>
          <input
            id="set-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
            placeholder="Bijv. LOB Periode 2"
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={bezig}
          className="px-4 py-2 bg-yonder-paars text-white rounded-md hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          {bezig ? 'Opslaan...' : 'Opslaan'}
        </button>
        <button
          type="button"
          onClick={onAnnuleer}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
        >
          Annuleren
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </form>
  )
}
