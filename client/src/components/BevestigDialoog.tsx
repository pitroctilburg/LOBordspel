interface BevestigDialoogProps {
  open: boolean
  titel: string
  bericht: string
  onBevestig: () => void
  onAnnuleer: () => void
  bezig?: boolean
}

export default function BevestigDialoog({
  open,
  titel,
  bericht,
  onBevestig,
  onAnnuleer,
  bezig,
}: BevestigDialoogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onAnnuleer} />
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{titel}</h3>
        <p className="text-sm text-gray-600 mb-6">{bericht}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onAnnuleer}
            disabled={bezig}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            Annuleren
          </button>
          <button
            onClick={onBevestig}
            disabled={bezig}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 cursor-pointer"
          >
            {bezig ? 'Bezig...' : 'Verwijderen'}
          </button>
        </div>
      </div>
    </div>
  )
}
