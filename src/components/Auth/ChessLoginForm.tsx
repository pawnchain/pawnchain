'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, User, Lock, Crown, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'

interface ChessLoginFormProps {
  onNavigate: (page: string) => void
}

const ChessLoginForm: React.FC<ChessLoginFormProps> = ({ onNavigate }) => {
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
            title: 'Royal Access Granted',
            message: 'Welcome to the throne room, Your Majesty',
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
            title: 'Welcome Back, Knight',
            message: 'Your kingdom awaits your return',
            type: 'success',
            read: false,
          })
          
          // Check if there's a pending deposit that needs to be shown
          const pendingDeposit = localStorage.getItem('pending_deposit')
          if (pendingDeposit) {
            // Navigate to deposit instructions page to show the modal
            onNavigate('deposit-instructions')
          } else {
            // No pending deposit, go to dashboard
            onNavigate('dashboard')
          }
        }
      }

      if (!success) {
        const attempts = localStorage.getItem('login_attempts') ? 
          parseInt(localStorage.getItem('login_attempts') || '0') : 0
        
        localStorage.setItem('login_attempts', (attempts + 1).toString())
        
        if (attempts >= 4) {
          addNotification({
            userId: 'system',
            title: 'Castle Gates Sealed',
            message: 'Too many failed attempts. The guards are watching.',
            type: 'error',
            read: false,
          })
        } else {
          addNotification({
            userId: 'system',
            title: 'Access Denied',
            message: 'Invalid credentials. The guards remain vigilant.',
            type: 'error',
            read: false,
          })
        }
      } else {
        localStorage.removeItem('login_attempts')
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'The castle gates remain closed'
      
      addNotification({
        userId: 'system',
        title: 'Siege Failed',
        message: errorMessage,
        type: 'error',
        read: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="chess-board-pattern absolute inset-0 opacity-5"></div>
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-yellow-500/10 rounded-full blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div 
        className="relative max-w-md w-full"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="glass-morphism rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="text-6xl mb-4 inline-block chess-piece-shadow"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {isAdminLogin ? '♔' : '♞'}
            </motion.div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              {isAdminLogin ? 'Royal Throne' : 'Enter the Kingdom'}
            </h1>
            <p className="text-gray-400">
              {isAdminLogin ? 'Supreme command awaits' : 'Join the greatest chess empire'}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isAdminLogin ? 'Royal Username' : 'Knight Name'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder-gray-400 transition-all"
                  placeholder={isAdminLogin ? "Enter royal username" : "Enter your knight name"}
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Secret Passphrase
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder-gray-400 transition-all"
                  placeholder="Enter your secret passphrase"
                  required
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </motion.button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-3 rounded-lg font-bold hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(212, 175, 55, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {isLoading ? (
                <motion.div
                  className="flex items-center justify-center space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Entering Kingdom...</span>
                </motion.div>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  {isAdminLogin ? <Crown className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                  <span>{isAdminLogin ? 'Ascend to Throne' : 'Enter Kingdom'}</span>
                </span>
              )}
            </motion.button>

            <motion.div 
              className="flex justify-between items-center text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.button
                onClick={() => onNavigate('forgot-password')}
                className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Lost Your Key?
              </motion.button>
              
              <motion.button
                onClick={() => setIsAdminLogin(!isAdminLogin)}
                className="text-gray-400 hover:text-gray-300 transition-colors flex items-center space-x-1"
                whileHover={{ scale: 1.05 }}
              >
                {isAdminLogin ? (
                  <>
                    <Shield className="h-4 w-4" />
                    <span>Knight Login</span>
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4" />
                    <span>Royal Access</span>
                  </>
                )}
              </motion.button>
            </motion.div>

            {!isAdminLogin && (
              <motion.div 
                className="text-center pt-4 border-t border-white/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-gray-400 mb-3">
                  Not yet a knight of the realm?
                </p>
                <motion.button
                  onClick={() => onNavigate('register')}
                  className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Join the Royal Army →
                </motion.button>
              </motion.div>
            )}
          </form>
        </div>

        {/* Floating Chess Pieces */}
        <motion.div
          className="absolute top-10 right-10 text-6xl text-yellow-500/20"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          ♛
        </motion.div>
        
        <motion.div
          className="absolute bottom-10 left-10 text-4xl text-purple-500/20"
          animate={{
            rotate: [360, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          ♝
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ChessLoginForm