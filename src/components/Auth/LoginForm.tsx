'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, User, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'

interface LoginFormProps {
  onNavigate: (page: string) => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAdminLogin, setIsAdminLogin] = useState(false)

  const { login, adminLogin } = useAuth()
  const { addNotification } = useNotifications()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let success
      if (isAdminLogin) {
        success = await adminLogin(formData.username, formData.password)
        if (success) {
          addNotification({
            userId: 'admin',
            title: 'Admin Login Successful',
            message: 'Welcome to the admin portal',
            type: 'success',
            read: false,
          })
          onNavigate('admin-dashboard')
        }
      } else {
        success = await login(formData.username, formData.password)
        if (success) {
          addNotification({
            userId: '1',
            title: 'Login Successful',
            message: 'Welcome back to ForgeChain Networks',
            type: 'success',
            read: false,
          })
          onNavigate('dashboard')
        }
      }

      if (!success) {
        // Check if we've hit the rate limit
        const attempts = localStorage.getItem('login_attempts') ? 
          parseInt(localStorage.getItem('login_attempts') || '0') : 0
        
        localStorage.setItem('login_attempts', (attempts + 1).toString())
        
        // Different message if rate limited
        if (attempts >= 4) {
          addNotification({
            userId: 'system',
            title: 'Login Failed',
            message: 'Too many login attempts. Please try again later.',
            type: 'error',
            read: false,
          })
        } else {
          addNotification({
            userId: 'system',
            title: 'Login Failed',
            message: 'Invalid username or password',
            type: 'error',
            read: false,
          })
        }
      } else {
        // Reset login attempts on successful login
        localStorage.removeItem('login_attempts')
      }
    } catch (error: any) {
      // Display the specific error message if available
      const errorMessage = error?.message || 'An error occurred during login'
      
      addNotification({
        userId: 'system',
        title: 'Login Error',
        message: errorMessage,
        type: 'error',
        read: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ForgeChain</h1>
            <p className="text-gray-600">
              {isAdminLogin ? 'Admin Portal' : 'Welcome back to your investment network'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={isAdminLogin ? "Admin username" : "Enter your username"}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 flex justify-between items-center text-sm">
            <button
              onClick={() => onNavigate('forgot-password')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot Password?
            </button>
            
            <button
              onClick={() => setIsAdminLogin(!isAdminLogin)}
              className="text-gray-600 hover:text-gray-700"
            >
              {isAdminLogin ? 'User Login' : 'Admin Login'}
            </button>
          </div>

          {!isAdminLogin && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => onNavigate('register')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up here
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginForm