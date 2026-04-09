import { COMPETENTIE_META } from 'shared'
import type { Competentie, Vraag, GeslotenVraag, CorrectAntwoord } from 'shared'

// --- Types ---

export type SpelState =
  | { type: 'idle' }
  | { type: 'competentie'; vraag: Vraag; competentie: Competentie }
  | { type: 'gesloten'; vraag: GeslotenVraag; gekozen: CorrectAntwoord | null }
  | { type: 'powerup'; tekst: string }

interface SpelVraagVlakProps {
  state: SpelState
  onAntwoord: (antwoord: CorrectAntwoord) => void
  onVolgende: () => void
}

// --- Component ---

export default function SpelVraagVlak({ state, onAntwoord, onVolgende }: SpelVraagVlakProps) {
  return (
    <div className="h-full p-4 flex flex-col items-center justify-center overflow-y-auto">
      {state.type === 'idle' && <IdleWeergave />}
      {state.type === 'competentie' && (
        <CompetentieWeergave vraag={state.vraag} competentie={state.competentie} />
      )}
      {state.type === 'gesloten' && (
        <GeslotenWeergave vraag={state.vraag} gekozen={state.gekozen} onAntwoord={onAntwoord} />
      )}
      {state.type === 'powerup' && <PowerUpWeergave tekst={state.tekst} />}

      {/* Volgende knop bij beantwoorde gesloten vraag of power up */}
      {((state.type === 'gesloten' && state.gekozen !== null) || state.type === 'powerup') && (
        <button
          onClick={onVolgende}
          className="mt-6 px-6 py-2 bg-yonder-paars text-white rounded-full font-bold hover:scale-105 transition-transform cursor-pointer"
        >
          Volgende
        </button>
      )}
    </div>
  )
}

// --- Subcomponenten ---

function IdleWeergave() {
  return (
    <p className="text-white/60 text-lg text-center font-heading">
      Klik op een knop om te beginnen
    </p>
  )
}

function CompetentieWeergave({ vraag, competentie }: { vraag: Vraag; competentie: Competentie }) {
  const meta = COMPETENTIE_META[competentie]
  return (
    <div className="text-center">
      <span
        className="inline-block px-3 py-1 rounded-full text-sm font-bold mb-4"
        style={{ backgroundColor: meta.kleur, color: 'var(--color-text-primary)' }}
      >
        {meta.icoon} {meta.label}
      </span>
      <p className="text-4xl font-bold text-white leading-relaxed font-heading">
        {vraag.vraagTekst}
      </p>
    </div>
  )
}

function GeslotenWeergave({
  vraag,
  gekozen,
  onAntwoord,
}: {
  vraag: GeslotenVraag
  gekozen: CorrectAntwoord | null
  onAntwoord: (antwoord: CorrectAntwoord) => void
}) {
  const opties: { letter: CorrectAntwoord; tekst: string | null }[] = [
    { letter: 'A', tekst: vraag.optieA },
    { letter: 'B', tekst: vraag.optieB },
    { letter: 'C', tekst: vraag.optieC },
    { letter: 'D', tekst: vraag.optieD },
  ]

  const zichtbareOpties = opties.filter((o) => o.tekst !== null)
  const beantwoord = gekozen !== null

  return (
    <div className="text-center w-full max-w-lg">
      <p className="text-4xl font-bold text-white mb-4 leading-relaxed font-heading">
        {vraag.vraagTekst}
      </p>

      <div className="grid grid-cols-1 gap-3">
        {zichtbareOpties.map(({ letter, tekst }) => {
          const isCorrect = letter === vraag.correctAntwoord
          const isGekozen = letter === gekozen

          let achtergrond = '#8F88FD' // yonder-paars
          let tekstKleur = 'white'

          if (beantwoord) {
            if (isCorrect) {
              achtergrond = '#81FBAE' // yonder-groen
              tekstKleur = 'var(--color-text-primary)'
            } else if (isGekozen) {
              achtergrond = '#FD6555' // yonder-rood
              tekstKleur = 'white'
            } else {
              achtergrond = 'var(--color-border-light)' // lichtgrijs
              tekstKleur = 'var(--color-text-muted)'
            }
          }

          return (
            <button
              key={letter}
              onClick={() => !beantwoord && onAntwoord(letter)}
              disabled={beantwoord}
              className="px-4 py-3 rounded-full font-medium transition-transform hover:scale-[1.02] disabled:hover:scale-100 cursor-pointer text-left"
              style={{ backgroundColor: achtergrond, color: tekstKleur }}
            >
              {tekst}
            </button>
          )
        })}
      </div>

      {beantwoord && (
        <p className="mt-4 text-lg font-bold text-white">
          {gekozen === vraag.correctAntwoord ? 'Goed!' : 'Helaas, dat is niet juist.'}
        </p>
      )}
    </div>
  )
}

function PowerUpWeergave({ tekst }: { tekst: string }) {
  return (
    <div className="text-center">
      <p className="text-4xl mb-4">⚡</p>
      <p className="text-2xl font-bold text-white">POWER UP!</p>
      <p className="text-xl mt-4 text-white">{tekst}</p>
    </div>
  )
}
