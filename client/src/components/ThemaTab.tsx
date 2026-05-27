import type { Thema } from 'shared'

interface ThemaTabProps {
  thema: Thema
  actief: boolean
  onClick: () => void
}

export default function ThemaTab({ thema, actief, onClick }: ThemaTabProps) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-t-md text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
      style={{
        backgroundColor: actief ? thema.kleur : 'transparent',
        color: actief ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
        borderBottom: actief ? `3px solid ${thema.kleur}` : '3px solid transparent',
      }}
    >
      {thema.titel}
    </button>
  )
}
