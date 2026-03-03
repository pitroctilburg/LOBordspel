import { Link } from 'react-router'
import type { VragenSet } from 'shared'

interface VragenSetKaartProps {
  set: VragenSet
  onVerwijder: (id: number) => void
}

export default function VragenSetKaart({ set, onVerwijder }: VragenSetKaartProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <Link
          to={`/vragensets/${set.id}`}
          className="text-lg font-medium text-gray-900 hover:text-yonder-paars truncate block"
        >
          {set.label}
        </Link>
        <p className="text-sm text-gray-500 mt-1">
          {set.shareToken ? 'Gedeeld' : 'Niet gedeeld'}
          {' · '}
          Aangemaakt op {new Date(set.createdAt).toLocaleDateString('nl-NL')}
        </p>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <Link
          to={`/vragensets/${set.id}`}
          className="px-3 py-1.5 text-sm bg-yonder-paars text-white rounded-md hover:opacity-90"
        >
          Bewerken
        </Link>
        <button
          onClick={() => onVerwijder(set.id)}
          className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 cursor-pointer"
        >
          Verwijder
        </button>
      </div>
    </div>
  )
}
