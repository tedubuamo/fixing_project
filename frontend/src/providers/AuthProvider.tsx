'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, defaultHeaders } from '@/services/api'

interface AuthUser {
  id: number
  username: string
  email: string
  role: string
  cluster?: number
  id_cluster?: number
  branch?: number
  region?: number
  area?: number
}

interface AuthContextType {
  user: AuthUser | null
  login: (userData: any) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check auth status on mount and token change
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking auth status...')
        const token = localStorage.getItem('auth_token')
        
        if (!token) {
          console.log('No token found')
          setUser(null)
          setIsLoading(false)
          return
        }

        // Get session data
        const sessionStr = document.cookie
          .split('; ')
          .find(row => row.startsWith('session='))
          ?.split('=')[1]

        if (sessionStr) {
          try {
            const sessionData = JSON.parse(decodeURIComponent(sessionStr))
            console.log('Found session data:', sessionData)
            
            if (sessionData.user && new Date(sessionData.expiresAt) > new Date()) {
              console.log('Setting user from session')
              setUser(sessionData.user)
              defaultHeaders['Authorization'] = `Bearer ${token}`
              setIsLoading(false)
              return
            }
          } catch (e) {
            console.error('Error parsing session:', e)
          }
        }

        // Fallback to token if no valid session
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          console.log('Setting user from token')
          setUser(payload)
          defaultHeaders['Authorization'] = `Bearer ${token}`
        } catch (e) {
          console.error('Invalid token:', e)
          localStorage.removeItem('auth_token')
          setUser(null)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const getRoleBasedPath = (role: string) => {
    const rolePaths = {
      'admin_area': '/dashboard/admin/area',
      'admin_region': '/dashboard/admin/region', 
      'admin_branch': '/dashboard/admin/branch',
      'admin_cluster_mcot': '/dashboard/admin/cluster',
      'admin_cluster_gm': '/dashboard/admin/cluster',
      'user': '/dashboard/user'
    }
    return rolePaths[role] || '/dashboard/user'
  }

  const login = async (userData: any) => {
    try {
      const user = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        cluster: userData.cluster,
        branch: userData.branch,
        region: userData.region,
        area: userData.area
      }

      if (userData.token) {
        // Set token
        localStorage.setItem('auth_token', userData.token)
        defaultHeaders['Authorization'] = `Bearer ${userData.token}`
        
        // Set user state
        setUser(user)
        
        // Set session cookie
        const sessionData = {
          user,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
        document.cookie = `session=${JSON.stringify(sessionData)}; path=/`

        // Ubah redirect ke path sesuai role
        window.location.href = getRoleBasedPath(user.role)
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // Clear everything
      setUser(null)
      localStorage.removeItem('auth_token')
      document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      delete defaultHeaders['Authorization']
      
      // Redirect to login
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }

  const handleRouting = (user: AuthUser) => {
    if (!user) return

    switch (user.role) {
      case 'area':
      case 'region':
      case 'branch':
        // Admin level atas bisa akses overview
        router.push('/dashboard/admin/cluster')
        break
      case 'cluster':
        // Admin cluster diarahkan ke dashboard mereka
        router.push(`/dashboard/admin/cluster/${user.cluster}`)
        break
      default:
        router.push('/dashboard/user')
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}