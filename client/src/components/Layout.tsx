import { Outlet, Link, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-bg">
      <nav className="bg-surface shadow-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <img src="https://www.yonder.nl/img/logo-yonder.svg" alt="Yonder" className="h-7" />
            <span className="text-lg font-bold text-text-primary font-heading">LOBordspel</span>
          </Link>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-secondary">{user.naam}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-text-muted hover:text-text-secondary cursor-pointer"
              >
                Uitloggen
              </button>
            </div>
          )}
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
