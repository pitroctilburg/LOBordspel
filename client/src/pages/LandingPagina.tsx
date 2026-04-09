import { useState } from 'react'
import { useNavigate, Link } from 'react-router'

export default function LandingPagina() {
  const [spelId, setSpelId] = useState('')
  const navigate = useNavigate()

  function handleSpelen(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = spelId.trim()
    if (trimmed) {
      navigate(`/spel/${trimmed}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg">
      <div className="w-full max-w-md text-center">
        <img src="https://www.yonder.nl/img/logo-yonder.svg" alt="Yonder" className="h-10 mx-auto mb-4" />
        <h1 className="text-5xl font-bold text-text-primary font-heading mb-2">LOBordspel</h1>
        <p className="text-text-secondary mb-10">Educatief bordspel voor loopbaanorientatie</p>

        <form onSubmit={handleSpelen} className="flex flex-col gap-4">
          <input
            type="text"
            value={spelId}
            onChange={(e) => setSpelId(e.target.value)}
            placeholder="Voer spel-id in"
            className="px-4 py-3 border border-border rounded-xl text-center text-lg focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!spelId.trim()}
            className="py-3 bg-yonder-paars text-white text-lg font-semibold rounded-xl hover:bg-yonder-paars-dark disabled:opacity-40 cursor-pointer transition-colors"
          >
            Spelen
          </button>
        </form>

        <p className="mt-12 text-sm text-text-muted">
          Ben je docent?{' '}
          <Link to="/admin" className="text-yonder-rood hover:underline">
            Ga naar het adminpaneel
          </Link>
        </p>
      </div>
    </div>
  )
}
