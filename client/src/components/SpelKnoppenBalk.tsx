import { Competentie, COMPETENTIE_META } from 'shared'
import type { Competentie as CompetentieType } from 'shared'

const COMPETENTIES = Object.values(Competentie) as CompetentieType[]

interface SpelKnoppenBalkProps {
  onCompetentie: (competentie: CompetentieType) => void
  onGeslotenVraag: () => void
  onPowerUp: () => void
  disabled: boolean
}

export default function SpelKnoppenBalk({
  onCompetentie,
  onGeslotenVraag,
  onPowerUp,
  disabled,
}: SpelKnoppenBalkProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 py-3 px-2">
      {COMPETENTIES.map((comp) => {
        const meta = COMPETENTIE_META[comp]
        return (
          <button
            key={comp}
            onClick={() => onCompetentie(comp)}
            disabled={disabled}
            className="px-3 py-2 rounded-full text-sm font-bold transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer shadow-md"
            style={{ backgroundColor: meta.kleur, color: '#1f2937' }}
          >
            {meta.icoon}
          </button>
        )
      })}

      {/* Scheidingslijn */}
      <div className="w-px bg-white/30 self-stretch mx-1" />

      {/* Gesloten vragen */}
      <button
        onClick={onGeslotenVraag}
        disabled={disabled}
        className="px-3 py-2 rounded-full text-sm font-bold transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer shadow-md border-2 border-yonder-paars bg-white"
        style={{ color: '#8F88FD' }}
      >
        ❓
      </button>

      {/* Power Up */}
      <button
        onClick={onPowerUp}
        disabled={disabled}
        className="px-3 py-2 rounded-full text-sm font-bold transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer shadow-md bg-vuurrood text-white"
      >
        ⚡
      </button>
    </div>
  )
}
