import type { Thema } from 'shared'
import geslotenImg from '../assets/gesloten.png'
import powerupImg from '../assets/powerup.png'

interface SpelKnoppenBalkProps {
  themas: Thema[]
  onThema: (themaId: number) => void
  onGeslotenVraag: () => void
  onPowerUp: () => void
  disabled: boolean
}

function IcoonKnop({
  src,
  label,
  onClick,
  disabled,
}: {
  src: string
  label: string
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-2 transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer bg-transparent border-none p-0"
    >
      <img src={src} alt={label} className="h-20 w-20 object-contain drop-shadow-md" />
      <span className="text-sm font-bold text-white">{label}</span>
    </button>
  )
}

export default function SpelKnoppenBalk({
  themas,
  onThema,
  onGeslotenVraag,
  onPowerUp,
  disabled,
}: SpelKnoppenBalkProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 px-2">
      {/* Rij 1: thema-knoppen */}
      <div className="flex justify-center gap-6">
        {themas.map((thema) => (
          <IcoonKnop
            key={thema.id}
            src={thema.afbeeldingUrl ?? ''}
            label={thema.titel}
            onClick={() => onThema(thema.id)}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Rij 2: Gesloten vragen + Power Up */}
      <div className="flex justify-center gap-6">
        <IcoonKnop
          src={geslotenImg}
          label="Gesloten"
          onClick={onGeslotenVraag}
          disabled={disabled}
        />
        <IcoonKnop
          src={powerupImg}
          label="Power Up"
          onClick={onPowerUp}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
