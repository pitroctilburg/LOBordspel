import { Competentie, COMPETENTIE_META } from 'shared'
import type { Competentie as CompetentieType } from 'shared'
import kwaliteitenImg from '../assets/kwaliteiten.png'
import motivenImg from '../assets/motieven.png'
import werkImg from '../assets/werk.png'
import sturingImg from '../assets/sturing.png'
import netwerkenImg from '../assets/netwerken.png'
import geslotenImg from '../assets/gesloten.png'
import powerupImg from '../assets/powerup.png'

const COMPETENTIES = Object.values(Competentie) as CompetentieType[]

const COMPETENTIE_ICOON: Record<CompetentieType, string> = {
  KWALITEITEN: kwaliteitenImg,
  MOTIEVEN: motivenImg,
  WERK: werkImg,
  STURING: sturingImg,
  NETWERKEN: netwerkenImg,
}

interface SpelKnoppenBalkProps {
  onCompetentie: (competentie: CompetentieType) => void
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
  onCompetentie,
  onGeslotenVraag,
  onPowerUp,
  disabled,
}: SpelKnoppenBalkProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 px-2">
      {/* Rij 1: 5 competentie-knoppen */}
      <div className="flex justify-center gap-6">
        {COMPETENTIES.map((comp) => {
          const meta = COMPETENTIE_META[comp]
          return (
            <IcoonKnop
              key={comp}
              src={COMPETENTIE_ICOON[comp]}
              label={meta.label}
              onClick={() => onCompetentie(comp)}
              disabled={disabled}
            />
          )
        })}
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
