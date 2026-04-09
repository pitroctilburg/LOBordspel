import { Link } from 'react-router'

export default function NietGevondenPagina() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-text-muted font-heading mb-4">404</h1>
        <p className="text-text-secondary mb-6">Pagina niet gevonden</p>
        <Link
          to="/"
          className="text-yonder-paars hover:underline"
        >
          Terug naar home
        </Link>
      </div>
    </div>
  )
}
