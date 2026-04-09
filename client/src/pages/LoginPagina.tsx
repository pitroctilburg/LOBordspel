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
    navigate('/admin/dashboard', { replace: true })
    return null
  }

  async function handleLogin(u: User) {
    login(u)
    navigate('/admin/dashboard')
  }

  async function handleRegistratie(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const body: CreateUser = { naam: naam.trim(), email: email.trim() }
      const newUser = await api.post<User>('/api/users', body)
      login(newUser)
      navigate('/admin/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registratie mislukt')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="https://www.yonder.nl/img/logo-yonder.svg" alt="Yonder" className="h-8 mx-auto mb-3" />
          <h1 className="text-4xl font-bold text-text-primary font-heading mb-2">LOBordspel</h1>
          <p className="text-text-secondary">Educatief bordspel voor loopbaanorientatie</p>
        </div>

        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
          {!showRegistratie ? (
            <>
              <h2 className="text-lg font-semibold text-text-primary mb-4">Inloggen</h2>

              {loading && <p className="text-text-muted text-sm">Laden...</p>}

              {users && users.length > 0 && (
                <div className="space-y-2 mb-4">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleLogin(u)}
                      className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-yonder-paars hover:bg-yonder-paars-pale transition-colors cursor-pointer"
                    >
                      <span className="font-medium text-text-primary">{u.naam}</span>
                      <span className="text-sm text-text-muted ml-2">{u.email}</span>
                    </button>
                  ))}
                </div>
              )}

              {users && users.length === 0 && (
                <p className="text-text-muted text-sm mb-4">
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
              <h2 className="text-lg font-semibold text-text-primary mb-4">Registreren</h2>

              <form onSubmit={handleRegistratie} className="space-y-4">
                <div>
                  <label htmlFor="naam" className="block text-sm font-medium text-text-secondary mb-1">
                    Naam
                  </label>
                  <input
                    id="naam"
                    type="text"
                    value={naam}
                    onChange={(e) => setNaam(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
                    placeholder="Je naam"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-yonder-paars focus:border-transparent"
                    placeholder="je@email.nl"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 bg-yonder-paars text-white rounded-md hover:bg-yonder-paars-dark disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {submitting ? 'Registreren...' : 'Registreren'}
                </button>
              </form>

              <button
                onClick={() => {
                  setShowRegistratie(false)
                  setError(null)
                }}
                className="w-full py-2 mt-2 text-sm text-text-muted hover:underline cursor-pointer"
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
