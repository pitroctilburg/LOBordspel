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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-2">LOBordspel</h1>
        <p className="text-gray-600 mb-10">Educatief bordspel voor loopbaanorientatie</p>

        <form onSubmit={handleSpelen} className="flex flex-col gap-4">
          <input
            type="text"
            value={spelId}
            onChange={(e) => setSpelId(e.target.value)}
            placeholder="Voer spel-id in"
            className="px-4 py-3 border border-gray-300 rounded-md text-center text-lg focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!spelId.trim()}
            className="py-3 bg-yonder-paars text-white text-lg font-semibold rounded-md hover:opacity-90 disabled:opacity-40 cursor-pointer"
          >
            Spelen
          </button>
        </form>

        <p className="mt-12 text-sm text-gray-400">
          Ben je docent?{' '}
          <Link to="/admin" className="text-gray-500 hover:underline">
            Ga naar het adminpaneel
          </Link>
        </p>
      </div>
    </div>
  )
}
