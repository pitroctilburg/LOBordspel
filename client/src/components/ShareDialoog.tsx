import { useState } from 'react'
import type { VragenSet } from 'shared'
import { api } from '../api/client'

interface ShareDialoogProps {
  set: VragenSet
  onUpdate: () => void
}

export default function ShareDialoog({ set, onUpdate }: ShareDialoogProps) {
  const [bezig, setBezig] = useState(false)
  const [gekopieerd, setGekopieerd] = useState(false)

  const spelUrl = set.shareToken
    ? `${window.location.origin}/spel/${set.shareToken}`
    : null

  async function handleGenereer() {
    setBezig(true)
    try {
      await api.post(`/api/vragensets/${set.id}/share`)
      onUpdate()
    } finally {
      setBezig(false)
    }
  }

  async function handleIntrekken() {
    setBezig(true)
    try {
      await api.delete(`/api/vragensets/${set.id}/share`)
      onUpdate()
      setGekopieerd(false)
    } finally {
      setBezig(false)
    }
  }

  async function handleKopieer() {
    if (!spelUrl) return
    try {
      await navigator.clipboard.writeText(spelUrl)
      setGekopieerd(true)
      setTimeout(() => setGekopieerd(false), 2000)
    } catch {
      // Fallback: selecteer tekst
    }
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <h3 className="text-sm font-medium text-text-primary mb-3">Deel link</h3>

      {spelUrl ? (
        <div className="space-y-3">
          {/* Korte code — groot en goed leesbaar voor op het bord */}
          <div className="flex items-center justify-between bg-yonder-geel rounded-lg px-4 py-3">
            <div>
              <p className="text-xs font-medium text-text-secondary mb-0.5">Spelcode</p>
              <p className="text-4xl font-bold tracking-widest text-text-primary">
                {set.shareToken}
              </p>
            </div>
            <p className="text-xs text-text-secondary text-right leading-relaxed">
              Leerlingen gaan naar<br />
              <span className="font-medium">{window.location.host}/spel/</span>
            </p>
          </div>

          {/* Volledige URL voor kopiëren */}
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={spelUrl}
              className="flex-1 px-3 py-2 text-sm bg-surface-alt border border-border rounded-md"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleKopieer}
              className="px-3 py-2 text-sm bg-yonder-paars text-white rounded-md hover:bg-yonder-paars-dark cursor-pointer whitespace-nowrap transition-colors"
            >
              {gekopieerd ? 'Gekopieerd!' : 'Kopieer'}
            </button>
          </div>
          <button
            onClick={handleIntrekken}
            disabled={bezig}
            className="text-sm text-red-600 hover:underline disabled:opacity-50 cursor-pointer"
          >
            Link intrekken
          </button>
        </div>
      ) : (
        <button
          onClick={handleGenereer}
          disabled={bezig}
          className="px-4 py-2 text-sm bg-yonder-groen text-text-primary rounded-md hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          {bezig ? 'Genereren...' : 'Deel link genereren'}
        </button>
      )}
    </div>
  )
}
