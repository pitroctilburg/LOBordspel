import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User } from 'shared'
import { setCurrentUserId } from '../api/client'

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'lobordspel_user'

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

function saveUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = loadUser()
    if (stored) {
      setCurrentUserId(stored.id)
    }
    return stored
  })

  const login = useCallback((u: User) => {
    setUser(u)
    saveUser(u)
    setCurrentUserId(u.id)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    saveUser(null)
    setCurrentUserId(null)
  }, [])

  return (
    <AuthContext value={{ user, login, logout }}>
      {children}
    </AuthContext>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth moet binnen AuthProvider gebruikt worden')
  }
  return ctx
}
