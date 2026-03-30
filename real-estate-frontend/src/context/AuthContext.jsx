import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('re_user')
    const token = localStorage.getItem('re_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials)
    const data = res.data.data
    localStorage.setItem('re_token', data.token)
    localStorage.setItem('re_user', JSON.stringify(data))
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setUser(data)
    return data
  }

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload)
    const data = res.data.data
    localStorage.setItem('re_token', data.token)
    localStorage.setItem('re_user', JSON.stringify(data))
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setUser(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem('re_token')
    localStorage.removeItem('re_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const hasRole = (...roles) => user && roles.includes(user.role)

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData }
    localStorage.setItem('re_user', JSON.stringify(merged))
    setUser(merged)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, hasRole, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
