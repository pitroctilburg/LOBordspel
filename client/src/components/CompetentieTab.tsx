import type { Competentie, CompetentieMeta } from 'shared'

interface CompetentieTabProps {
  competentie: Competentie
  meta: CompetentieMeta
  actief: boolean
  onClick: () => void
}

export default function CompetentieTab({ meta, actief, onClick }: CompetentieTabProps) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-t-md text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
      style={{
        backgroundColor: actief ? meta.kleur : 'transparent',
        color: actief ? '#1f2937' : '#6b7280',
        borderBottom: actief ? `3px solid ${meta.kleur}` : '3px solid transparent',
      }}
    >
      {meta.icoon} {meta.label}
    </button>
  )
}
