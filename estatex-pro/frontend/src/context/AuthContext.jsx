import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// Axios defaults
axios.defaults.baseURL = '/api'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('estatex_token'))

  // Set auth header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await axios.get('/auth/me')
      if (data.success) setUser(data.user)
    } catch {
      localStorage.removeItem('estatex_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [token, fetchMe])

  const login = async (email, password) => {
    const { data } = await axios.post('/auth/login', { email, password })
    if (data.success) {
      localStorage.setItem('estatex_token', data.token)
      setToken(data.token)
      setUser(data.user)
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      toast.success(data.message || 'Welcome back!')
      return data.user
    }
    throw new Error(data.message)
  }

  const register = async (formData) => {
    const { data } = await axios.post('/auth/register', formData)
    if (data.success) {
      localStorage.setItem('estatex_token', data.token)
      setToken(data.token)
      setUser(data.user)
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      toast.success(data.message || 'Account created!')
      return data.user
    }
    throw new Error(data.message)
  }

  const logout = () => {
    localStorage.removeItem('estatex_token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
    toast.success('Logged out successfully.')
  }

  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }))
  }

  const isRole = (...roles) => user && roles.includes(user.role)

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, updateUser, isRole, fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}
