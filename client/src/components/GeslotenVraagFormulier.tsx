import { useState } from 'react'
import { GeslotenVraagType } from 'shared'
import type { GeslotenVraag, CreateGeslotenVraag, UpdateGeslotenVraag, CorrectAntwoord } from 'shared'

interface GeslotenVraagFormulierProps {
  bestaandeVraag?: GeslotenVraag
  onOpslaan: (data: CreateGeslotenVraag | UpdateGeslotenVraag) => Promise<void>
  onAnnuleer: () => void
  bezig?: boolean
}

const TIJD_OPTIES: { waarde: 30 | 45 | 60; label: string }[] = [
  { waarde: 30, label: '30 seconden' },
  { waarde: 45, label: '45 seconden' },
  { waarde: 60, label: '60 seconden' },
]

export default function GeslotenVraagFormulier({
  bestaandeVraag,
  onOpslaan,
  onAnnuleer,
  bezig,
}: GeslotenVraagFormulierProps) {
  const [vraagTekst, setVraagTekst] = useState(bestaandeVraag?.vraagTekst ?? '')
  const [type, setType] = useState<GeslotenVraagType>(
    bestaandeVraag?.type ?? GeslotenVraagType.WAAR_NIET_WAAR,
  )
  const [tijdSeconden, setTijdSeconden] = useState<30 | 45 | 60>(
    (bestaandeVraag?.tijdSeconden as 30 | 45 | 60) ?? 30,
  )
  const [optieA, setOptieA] = useState(bestaandeVraag?.optieA ?? 'Waar')
  const [optieB, setOptieB] = useState(bestaandeVraag?.optieB ?? 'Niet waar')
  const [optieC, setOptieC] = useState(bestaandeVraag?.optieC ?? '')
  const [optieD, setOptieD] = useState(bestaandeVraag?.optieD ?? '')
  const [correctAntwoord, setCorrectAntwoord] = useState<CorrectAntwoord>(
    (bestaandeVraag?.correctAntwoord as CorrectAntwoord) ?? 'A',
  )
  const [error, setError] = useState<string | null>(null)

  const isWaarNietWaar = type === GeslotenVraagType.WAAR_NIET_WAAR

  function handleTypeWissel(nieuwType: GeslotenVraagType) {
    setType(nieuwType)
    if (nieuwType === GeslotenVraagType.WAAR_NIET_WAAR) {
      setOptieA('Waar')
      setOptieB('Niet waar')
      setOptieC('')
      setOptieD('')
      if (correctAntwoord !== 'A' && correctAntwoord !== 'B') {
        setCorrectAntwoord('A')
      }
    } else {
      if (optieA === 'Waar') setOptieA('')
      if (optieB === 'Niet waar') setOptieB('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!vraagTekst.trim()) {
      setError('Vraagtekst is verplicht')
      return
    }
    if (!optieA.trim() || !optieB.trim()) {
      setError('Optie A en B zijn verplicht')
      return
    }
    if (!isWaarNietWaar && (!optieC.trim() || !optieD.trim())) {
      setError('Alle vier opties zijn verplicht bij dit type')
      return
    }
    setError(null)

    const data: CreateGeslotenVraag = {
      vraagTekst: vraagTekst.trim(),
      type,
      tijdSeconden,
      optieA: optieA.trim(),
      optieB: optieB.trim(),
      optieC: isWaarNietWaar ? null : optieC.trim(),
      optieD: isWaarNietWaar ? null : optieD.trim(),
      correctAntwoord,
    }

    try {
      await onOpslaan(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt')
    }
  }

  const antwoordOpties: { waarde: CorrectAntwoord; label: string }[] = isWaarNietWaar
    ? [
        { waarde: 'A', label: `A: ${optieA}` },
        { waarde: 'B', label: `B: ${optieB}` },
      ]
    : [
        { waarde: 'A', label: 'A' },
        { waarde: 'B', label: 'B' },
        { waarde: 'C', label: 'C' },
        { waarde: 'D', label: 'D' },
      ]

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-md border border-gray-200 p-4 space-y-4">
      <div>
        <label htmlFor="gv-tekst" className="block text-sm font-medium text-gray-700 mb-1">
          Vraagtekst
        </label>
        <textarea
          id="gv-tekst"
          value={vraagTekst}
          onChange={(e) => setVraagTekst(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
          placeholder="Typ je vraag hier..."
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="gv-type" className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            id="gv-type"
            value={type}
            onChange={(e) => handleTypeWissel(e.target.value as GeslotenVraagType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
          >
            <option value={GeslotenVraagType.WAAR_NIET_WAAR}>Waar / Niet waar</option>
            <option value={GeslotenVraagType.VIER_OPTIES}>4 opties</option>
          </select>
        </div>

        <div>
          <label htmlFor="gv-tijd" className="block text-sm font-medium text-gray-700 mb-1">
            Tijd
          </label>
          <select
            id="gv-tijd"
            value={tijdSeconden}
            onChange={(e) => setTijdSeconden(Number(e.target.value) as 30 | 45 | 60)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
          >
            {TIJD_OPTIES.map((opt) => (
              <option key={opt.waarde} value={opt.waarde}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="gv-a" className="block text-sm font-medium text-gray-700 mb-1">
            Optie A
          </label>
          <input
            id="gv-a"
            type="text"
            value={optieA}
            onChange={(e) => setOptieA(e.target.value)}
            disabled={isWaarNietWaar}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent disabled:bg-gray-100"
          />
        </div>
        <div>
          <label htmlFor="gv-b" className="block text-sm font-medium text-gray-700 mb-1">
            Optie B
          </label>
          <input
            id="gv-b"
            type="text"
            value={optieB}
            onChange={(e) => setOptieB(e.target.value)}
            disabled={isWaarNietWaar}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent disabled:bg-gray-100"
          />
        </div>
        {!isWaarNietWaar && (
          <>
            <div>
              <label htmlFor="gv-c" className="block text-sm font-medium text-gray-700 mb-1">
                Optie C
              </label>
              <input
                id="gv-c"
                type="text"
                value={optieC}
                onChange={(e) => setOptieC(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="gv-d" className="block text-sm font-medium text-gray-700 mb-1">
                Optie D
              </label>
              <input
                id="gv-d"
                type="text"
                value={optieD}
                onChange={(e) => setOptieD(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
              />
            </div>
          </>
        )}
      </div>

      <div>
        <label htmlFor="gv-correct" className="block text-sm font-medium text-gray-700 mb-1">
          Correct antwoord
        </label>
        <select
          id="gv-correct"
          value={correctAntwoord}
          onChange={(e) => setCorrectAntwoord(e.target.value as CorrectAntwoord)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
        >
          {antwoordOpties.map((opt) => (
            <option key={opt.waarde} value={opt.waarde}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={bezig}
          className="px-4 py-2 text-sm bg-yonder-paars text-white rounded-md hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          {bezig ? 'Opslaan...' : 'Opslaan'}
        </button>
        <button
          type="button"
          onClick={onAnnuleer}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
        >
          Annuleren
        </button>
      </div>
    </form>
  )
}
