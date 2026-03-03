interface SpelTimerProps {
  tijdOver: number
  percentage: number
  kleur: string
  actief: boolean
}

function formatTijd(seconden: number): string {
  const min = Math.floor(seconden / 60)
  const sec = seconden % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export default function SpelTimer({ tijdOver, percentage, kleur, actief }: SpelTimerProps) {
  if (!actief && tijdOver <= 0) return null

  return (
    <div className="w-full px-4 py-2">
      <p className="text-white text-center text-lg font-bold mb-1">
        ⏱️ {formatTijd(tijdOver)}
      </p>
      <div className="w-full h-4 bg-white/30 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${percentage * 100}%`,
            backgroundColor: kleur,
            transition: 'width 1s linear, background-color 0.5s',
          }}
        />
      </div>
    </div>
  )
}
