import { Link } from 'react-router'

export default function NietGevondenPagina() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-gray-600 mb-6">Pagina niet gevonden</p>
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
