'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, password: string, walletAddress: string, plan: string, referralCode?: string) => Promise<{ success: boolean; deposit?: {
    transactionId: string
    amount: number
    coin: string
    network: string
    walletAddress: string
    positionId: string
    positionKey: string
  } }>
  logout: () => void
  adminLogin: (username: string, password: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const session = await response.json()
        console.log("Initial session check:", session)
        if (session.user) {
          setUser(session.user)
          if (session.user.isAdmin) {
            setIsAdmin(true)
          }
          console.log("Session loaded successfully:", session.user)
        } else {
          console.log("No user in initial session")
        }
      } catch (error) {
        console.error("Error checking session:", error)
      }
    }
    checkSession()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Get CSRF token
      const csrfResponse = await fetch('/api/auth/csrf')
      const { csrfToken } = await csrfResponse.json()

      // Perform login (Credentials provider expects callback endpoint)
      const response = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          password,
          csrfToken,
          redirect: 'false',
          json: 'true',
        }),
      })

      const data = await response.json()
      console.log('Login response data:', data)
      
      if (!response.ok) {
        console.error('Login failed with status:', response.status, data)
        throw new Error(data.error || 'Authentication failed')
      }
      
      // If the login response includes user data, use it directly
      if (data.user) {
        console.log('Using user data from login response:', data.user)
        setUser(data.user)
        if (data.user.isAdmin) {
          setIsAdmin(true)
          console.log('Admin user detected from login response')
        }
        localStorage.setItem('forgechain_user', JSON.stringify(data.user))
        return true
      }
      
      // Wait a moment for the session to be established
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Fetch the session after successful login
      const sessionResponse = await fetch('/api/auth/session')
      const session = await sessionResponse.json()
      console.log('Session after login:', session)
      
      if (session && session.user) {
        console.log('Setting user in context:', session.user)
        setUser(session.user)
        if (session.user.isAdmin) {
          setIsAdmin(true)
          console.log('Admin user detected, setting isAdmin to true')
        }
        // Store user info in localStorage for persistence
        localStorage.setItem('forgechain_user', JSON.stringify(session.user))
        return true
      } else {
        console.log('No user in first session check, retrying...')
        // Try one more time with a longer delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        const retrySessionResponse = await fetch('/api/auth/session')
        const retrySession = await retrySessionResponse.json()
        console.log('Retry session:', retrySession)
        
        if (retrySession && retrySession.user) {
          console.log('Setting user in context (retry):', retrySession.user)
          setUser(retrySession.user)
          if (retrySession.user.isAdmin) {
            setIsAdmin(true)
            console.log('Admin user detected on retry, setting isAdmin to true')
          }
          localStorage.setItem('forgechain_user', JSON.stringify(retrySession.user))
          return true
        }
        
        console.error("No user in session after login - both attempts failed")
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (
    username: string, 
    password: string, 
    walletAddress: string, 
    plan: string,
    referralCode?: string
  ): Promise<{ success: boolean; deposit?: {
    transactionId: string
    amount: number
    coin: string
    network: string
    walletAddress: string
    positionId: string
    positionKey: string
  } }> => {
    console.log('Registration attempt:', { username, walletAddress, plan, referralCode })
    
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        username, 
        password, 
        walletAddress, 
        planType: plan, 
        referrerId: referralCode 
      }),
    })

    const data = await response.json()
    console.log('Registration response:', { status: response.status, data })

    if (response.ok) {
      if (data?.deposit) {
        try {
          localStorage.setItem('pending_deposit', JSON.stringify(data.deposit))
        } catch {}
      }
      return { success: true, deposit: data.deposit }
    } else {
      console.error('Registration failed:', data.message)
      throw new Error(data.message)
    }
  }

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    const result = await login(username, password)
    if (!result) return false

    const sessionResponse = await fetch('/api/auth/session')
    const session = await sessionResponse.json()
    if (session.user?.isAdmin) {
      setIsAdmin(true)
      localStorage.setItem('forgechain_admin', 'true')
      return true
    }

    // Not an admin: immediately sign out to avoid logging in as normal user from admin form
    await logout()
    throw new Error('You are not an admin')
  }

  const logout = async () => {
    try {
      const csrfResponse = await fetch('/api/auth/csrf')
      const { csrfToken } = await csrfResponse.json()
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ csrfToken, redirect: 'false', json: 'true' }),
      })
    } catch (e) {
      // ignore
    } finally {
      setUser(null)
      setIsAdmin(false)
      localStorage.removeItem('forgechain_user')
      localStorage.removeItem('forgechain_admin')
      localStorage.removeItem('pending_deposit')
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, register, logout, adminLogin }}>
      {children}
    </AuthContext.Provider>
  )
}