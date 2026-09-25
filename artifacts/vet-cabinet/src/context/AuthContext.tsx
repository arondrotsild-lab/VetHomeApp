import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User } from '../api'

interface AuthContextType {
  user: User | null
  token: string | null
  setAuth: (token: string, user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('vet_token')
    const savedUser = localStorage.getItem('vet_user')
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('vet_token')
        localStorage.removeItem('vet_user')
      }
    }
    setIsLoading(false)
  }, [])

  const setAuth = (newToken: string, newUser: User) => {
    localStorage.setItem('vet_token', newToken)
    localStorage.setItem('vet_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('vet_token')
    localStorage.removeItem('vet_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, setAuth, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
