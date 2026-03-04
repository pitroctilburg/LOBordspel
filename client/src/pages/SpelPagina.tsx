import { useState, useMemo, useCallback } from 'react'
import { useParams } from 'react-router'
import { Competentie } from 'shared'
import type { Competentie as CompetentieType, SpelData, Vraag, CorrectAntwoord } from 'shared'
import { useApiGet } from '../hooks/useApi'
import { useSpelTimer } from '../hooks/useSpelTimer'
import SpelKnoppenBalk from '../components/SpelKnoppenBalk'
import SpelTimer from '../components/SpelTimer'
import SpelVraagVlak from '../components/SpelVraagVlak'
import type { SpelState } from '../components/SpelVraagVlak'

// --- Power Up types met gewogen kansen ---

const POWER_UPS = [
  ...(Array(8).fill('Extra beurt! 🎲') as string[]),
  ...(Array(2).fill('Speel een challenge naar keuze ⭐') as string[]),
  ...(Array(3).fill('Druk nogmaals voor een andere vraag ⏭️') as string[]),
  ...(Array(3).fill('Wijs iemand aan die een beurt overslaat! ⏭️') as string[]),
  ...(Array(1).fill('Kruis een competentie af naar keuze! ⭐') as string[]),
]

function kiesWillekeurig<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined
  return items[Math.floor(Math.random() * items.length)]
}

// --- Hoofdcomponent ---

export default function SpelPagina() {
  const { shareToken } = useParams<{ shareToken: string }>()
  const { data: spelData, loading, error } = useApiGet<SpelData>(
    shareToken ? `/api/spel/${shareToken}` : null,
  )

  const [state, setState] = useState<SpelState>({ type: 'idle' })

  // Groepeer vragen per competentie
  const vragenPerCompetentie = useMemo(() => {
    if (!spelData) return {} as Record<CompetentieType, Vraag[]>
    const result = {} as Record<CompetentieType, Vraag[]>
    for (const comp of Object.values(Competentie) as CompetentieType[]) {
      result[comp] = spelData.vragen.filter((v) => v.competentie === comp)
    }
    return result
  }, [spelData])

  const handleTimerAfgelopen = useCallback(() => {
    setState({ type: 'idle' })
  }, [])

  const timer = useSpelTimer({ onAfgelopen: handleTimerAfgelopen })

  const isBezig = state.type !== 'idle'

  function handleCompetentie(competentie: CompetentieType) {
    const vragen = vragenPerCompetentie[competentie]
    const vraag = kiesWillekeurig(vragen)
    if (!vraag) return
    setState({ type: 'competentie', vraag, competentie })
    timer.start(vraag.tijdSeconden)
  }

  function handleGeslotenVraag() {
    if (!spelData) return
    const vraag = kiesWillekeurig(spelData.geslotenVragen)
    if (!vraag) return
    setState({ type: 'gesloten', vraag, gekozen: null })
    timer.start(vraag.tijdSeconden)
  }

  function handlePowerUp() {
    const tekst = kiesWillekeurig(POWER_UPS)
    if (!tekst) return
    timer.stop()
    setState({ type: 'powerup', tekst })
  }

  function handleAntwoord(antwoord: CorrectAntwoord) {
    if (state.type !== 'gesloten') return
    timer.stop()
    setState({ ...state, gekozen: antwoord })
  }

  function handleVolgende() {
    setState({ type: 'idle' })
  }

  function handleStop() {
    timer.stop()
    setState({ type: 'idle' })
  }

  // --- Laadstates ---

  if (loading) {
    return (
      <div className="min-h-screen bg-yonder-rood flex items-center justify-center">
        <p className="text-white text-xl">Laden...</p>
      </div>
    )
  }

  if (error || !spelData) {
    return (
      <div className="min-h-screen bg-yonder-rood flex items-center justify-center">
        <p className="text-white text-xl">{error ?? 'Spel niet gevonden'}</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-yonder-rood flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 text-center py-2">
        <h1 className="text-xl font-bold text-white">LOBordspel</h1>
      </header>

      {/* Knoppen-sectie: ~50% van resterende hoogte */}
      <div className="flex-1 flex flex-col justify-center">
        <SpelKnoppenBalk
          onCompetentie={handleCompetentie}
          onGeslotenVraag={handleGeslotenVraag}
          onPowerUp={handlePowerUp}
          disabled={isBezig}
        />

        <SpelTimer
          tijdOver={timer.tijdOver}
          percentage={timer.percentage}
          kleur={timer.kleur}
          actief={timer.actief}
        />

        {/* Stop-knop: alleen zichtbaar bij actieve vraag */}
        {isBezig && (
          <div className="flex justify-center mt-2">
            <button
              onClick={handleStop}
              className="px-5 py-2 rounded-full font-bold text-white bg-vuurrood hover:scale-105 transition-transform cursor-pointer shadow-md"
            >
              ⏹ Stop beurt
            </button>
          </div>
        )}
      </div>

      {/* Vraag-sectie: ~50% van resterende hoogte */}
      <div className="flex-1 px-4 pb-4">
        <SpelVraagVlak
          state={state}
          onAntwoord={handleAntwoord}
          onVolgende={handleVolgende}
        />
      </div>
    </div>
  )
}
