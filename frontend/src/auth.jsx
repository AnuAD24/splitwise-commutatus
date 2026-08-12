import { createContext, useContext, useEffect, useState } from 'react'
import { api } from './api'

const AuthContext = createContext(null)
const STORAGE_KEY = 'splitwise_auth'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').token || null
    } catch {
      return null
    }
  })
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').user || null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    let cancelled = false
    api
      .me(token)
      .then((me) => {
        if (!cancelled) {
          setUser(me)
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: me }))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setToken(null)
          setUser(null)
          localStorage.removeItem(STORAGE_KEY)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  function saveSession(nextToken, nextUser) {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }))
  }

  async function login(email, password) {
    const data = await api.login(email, password)
    saveSession(data.access_token, data.user)
    return data.user
  }

  async function register(payload) {
    const data = await api.register(payload)
    saveSession(data.access_token, data.user)
    return data.user
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
