import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { User, CreateUser } from 'shared'
import { useAuth } from '../context/AuthContext'
import { useApiGet } from '../hooks/useApi'
import { api } from '../api/client'

export default function LoginPagina() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const { data: users, loading } = useApiGet<User[]>('/api/users')

  const [showRegistratie, setShowRegistratie] = useState(false)
  const [naam, setNaam] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Als al ingelogd, redirect naar dashboard
  if (user) {
    navigate('/dashboard', { replace: true })
    return null
  }

  async function handleLogin(u: User) {
    login(u)
    navigate('/dashboard')
  }

  async function handleRegistratie(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const body: CreateUser = { naam: naam.trim(), email: email.trim() }
      const newUser = await api.post<User>('/api/users', body)
      login(newUser)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registratie mislukt')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">LOBordspel</h1>
          <p className="text-gray-600">Educatief bordspel voor loopbaanorientatie</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {!showRegistratie ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Inloggen</h2>

              {loading && <p className="text-gray-500 text-sm">Laden...</p>}

              {users && users.length > 0 && (
                <div className="space-y-2 mb-4">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleLogin(u)}
                      className="w-full text-left px-4 py-3 rounded-md border border-gray-200 hover:border-yonder-paars hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <span className="font-medium text-gray-900">{u.naam}</span>
                      <span className="text-sm text-gray-500 ml-2">{u.email}</span>
                    </button>
                  ))}
                </div>
              )}

              {users && users.length === 0 && (
                <p className="text-gray-500 text-sm mb-4">
                  Nog geen gebruikers. Registreer je hieronder.
                </p>
              )}

              <button
                onClick={() => setShowRegistratie(true)}
                className="w-full py-2 text-sm text-yonder-paars hover:underline cursor-pointer"
              >
                Nieuw account registreren
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Registreren</h2>

              <form onSubmit={handleRegistratie} className="space-y-4">
                <div>
                  <label htmlFor="naam" className="block text-sm font-medium text-gray-700 mb-1">
                    Naam
                  </label>
                  <input
                    id="naam"
                    type="text"
                    value={naam}
                    onChange={(e) => setNaam(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
                    placeholder="Je naam"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
                    placeholder="je@email.nl"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 bg-yonder-paars text-white rounded-md hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Registreren...' : 'Registreren'}
                </button>
              </form>

              <button
                onClick={() => {
                  setShowRegistratie(false)
                  setError(null)
                }}
                className="w-full py-2 mt-2 text-sm text-gray-500 hover:underline cursor-pointer"
              >
                Terug naar inloggen
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
