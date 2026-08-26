import { useState } from 'react'
import api from '../services/api'
import { AuthContext } from './authContext.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
  const [loading, setLoading] = useState(false)
  const persist = (data) => { if (data.accessToken) localStorage.setItem('accessToken', data.accessToken); if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken); if (data.user) { localStorage.setItem('user', JSON.stringify(data.user)); setUser(data.user) } }
  const login = async (payload) => { setLoading(true); try { const { data } = await api.post('/auth/login', payload); persist(data); return data } finally { setLoading(false) } }
  const register = async (payload) => { setLoading(true); try { const { data } = await api.post('/auth/register', payload); persist(data); return data } finally { setLoading(false) } }
  const logout = async () => { try { await api.post('/auth/logout') } finally { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); localStorage.removeItem('user'); setUser(null) } }
  return <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: Boolean(user) }}>{children}</AuthContext.Provider>
}
