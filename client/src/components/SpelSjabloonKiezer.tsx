import type { SpelSjabloonDetail } from 'shared'
import { useApiGet } from '../hooks/useApi'

interface SpelSjabloonKiezerProps {
  onKies: (sjabloonId: number) => void
  onAnnuleer: () => void
}

export default function SpelSjabloonKiezer({ onKies, onAnnuleer }: SpelSjabloonKiezerProps) {
  const { data: sjablonen, loading, error } = useApiGet<SpelSjabloonDetail[]>('/api/spelsjablonen')

  if (loading) return <p className="text-text-muted text-sm">Sjablonen laden...</p>
  if (error) return <p className="text-red-600 text-sm">{error}</p>

  return (
    <div className="bg-surface-alt rounded-xl border border-border p-4">
      <h2 className="text-lg font-bold text-text-primary font-heading mb-1">Nieuwe vragenset toevoegen</h2>
      <p className="text-sm text-text-secondary mb-3">Kies een spelsjabloon</p>

      {sjablonen && sjablonen.length === 0 && (
        <p className="text-sm text-text-muted">
          Er zijn nog geen spelsjablonen. Maak eerst een sjabloon aan via Spelsjablonen.
        </p>
      )}

      <div className="space-y-2">
        {sjablonen?.map((sjabloon) => (
          <button
            key={sjabloon.id}
            onClick={() => onKies(sjabloon.id)}
            className="w-full text-left p-3 rounded-lg border border-border hover:border-yonder-paars hover:bg-bg transition-colors cursor-pointer"
          >
            <p className="font-medium text-text-primary">{sjabloon.naam}</p>
            <div className="flex gap-1 mt-1.5">
              {sjabloon.themas.map((thema) => (
                <span
                  key={thema.id}
                  className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: thema.kleur, color: 'var(--color-text-primary)' }}
                >
                  {thema.titel}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3">
        <button
          onClick={onAnnuleer}
          className="px-4 py-2 text-sm text-text-secondary border border-border rounded-md hover:bg-bg cursor-pointer"
        >
          Annuleren
        </button>
      </div>
    </div>
  )
}
