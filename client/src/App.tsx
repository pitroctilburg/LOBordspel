import { BrowserRouter, Routes, Route } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPagina from './pages/LandingPagina'
import LoginPagina from './pages/LoginPagina'
import DashboardPagina from './pages/DashboardPagina'
import VragenSetDetailPagina from './pages/VragenSetDetailPagina'
import NietGevondenPagina from './pages/NietGevondenPagina'
import SpelPagina from './pages/SpelPagina'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPagina />} />
          <Route path="/admin">
            <Route index element={<LoginPagina />} />
            <Route element={<Layout />}>
              <Route element={<ProtectedRoute />}>
                <Route path="dashboard" element={<DashboardPagina />} />
                <Route path="vragensets/:id" element={<VragenSetDetailPagina />} />
              </Route>
            </Route>
          </Route>
          <Route path="/spel/:shareToken" element={<SpelPagina />} />
          <Route path="*" element={<NietGevondenPagina />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
