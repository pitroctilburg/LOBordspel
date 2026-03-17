import { useState, useEffect, useRef, useCallback } from 'react'

function speelTimerGeluid() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 440
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.8)
  } catch {
    // AudioContext niet beschikbaar
  }
}

interface UseSpelTimerOpties {
  onAfgelopen?: () => void
}

interface UseSpelTimerResult {
  tijdOver: number
  percentage: number
  kleur: string
  actief: boolean
  start: (duurSeconden: number) => void
  stop: () => void
}

export function useSpelTimer(opties?: UseSpelTimerOpties): UseSpelTimerResult {
  const [tijdOver, setTijdOver] = useState(0)
  const [totaal, setTotaal] = useState(0)
  const [actief, setActief] = useState(false)
  const onAfgelopenRef = useRef(opties?.onAfgelopen)
  onAfgelopenRef.current = opties?.onAfgelopen

  const start = useCallback((duurSeconden: number) => {
    setTotaal(duurSeconden)
    setTijdOver(duurSeconden)
    setActief(true)
  }, [])

  const stop = useCallback(() => {
    setActief(false)
    setTijdOver(0)
    setTotaal(0)
  }, [])

  useEffect(() => {
    if (!actief || tijdOver <= 0) return

    const interval = setInterval(() => {
      setTijdOver((prev) => {
        const nieuw = prev - 1
        if (nieuw <= 0) {
          setActief(false)
          // Gebruik setTimeout zodat state-update eerst afrondt
          setTimeout(() => {
            speelTimerGeluid()
            onAfgelopenRef.current?.()
          }, 0)
          return 0
        }
        return nieuw
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [actief, tijdOver])

  const percentage = totaal > 0 ? tijdOver / totaal : 0

  // Kleur: >50% groen, 25-50% geel, <25% rood
  let kleur = '#81FBAE' // yonder-groen
  if (percentage <= 0.25) {
    kleur = '#FF0000' // vuurrood
  } else if (percentage <= 0.5) {
    kleur = '#FBFB00' // yonder-geel
  }

  return { tijdOver, percentage, kleur, actief, start, stop }
}
