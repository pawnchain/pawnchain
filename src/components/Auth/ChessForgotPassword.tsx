'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Lock, Eye, EyeOff, Crown, Shield, ArrowLeft } from 'lucide-react'

interface ChessForgotPasswordProps {
  onNavigate: (page: string) => void
}

const ChessForgotPassword: React.FC<ChessForgotPasswordProps> = ({ onNavigate }) => {
  const [walletAddress, setWalletAddress] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState<'verify' | 'reset'>('verify')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [foundUsername, setFoundUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleVerifyWallet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletAddress.trim()) {
      setError('Please enter your royal vault address')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: walletAddress.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setFoundUsername(data.username)
        setMessage(`Royal account found! Knight: ${data.username}`)
        setStep('reset')
      } else {
        setError(data.message || 'No knight found with this royal vault address')
      }
    } catch (error) {
      setError('Failed to verify royal vault address')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all royal decree fields')
      return
    }

    if (newPassword.length < 6) {
      setError('Royal passphrase must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Royal passphrases do not match')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          walletAddress: walletAddress.trim(),
          newPassword 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Royal passphrase updated successfully! You may now enter your kingdom with the new passphrase.')
        setTimeout(() => {
          onNavigate('login')
        }, 3000)
      } else {
        setError(data.message || 'Failed to update royal passphrase')
      }
    } catch (error) {
      setError('Failed to update royal passphrase')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="chess-board-pattern absolute inset-0 opacity-5"></div>
        {/* Floating elements */}
        {['🔑', '🏰', '👑', '⚔️', '🛡️'].map((icon, index) => (
          <motion.div
            key={index}
            className="absolute text-6xl text-white/10"
            style={{
              left: `${10 + (index * 20)}%`,
              top: `${15 + (index * 15)}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8 + index * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5,
            }}
          >
            {icon}
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="relative max-w-lg w-full"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="glass-morphism-strong rounded-2xl p-8 shadow-2xl border border-white/20">
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
              {step === 'verify' ? '🔑' : '🛡️'}
            </motion.div>
            <h2 className="text-3xl font-bold gradient-text mb-2">
              {step === 'verify' ? 'Recover Royal Access' : 'Forge New Passphrase'}
            </h2>
            <p className="text-gray-300">
              {step === 'verify' 
                ? 'Enter your royal vault address to reclaim your throne.' 
                : 'Create a new secret passphrase for your kingdom.'
              }
            </p>
          </motion.div>
          
          <AnimatePresence mode="wait">
            {step === 'verify' ? (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                <form onSubmit={handleVerifyWallet} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Royal Vault Address
                    </label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder="Enter royal vault address (0x... or T...)"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 royal-input rounded-xl"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <motion.div 
                      className="text-red-400 text-sm text-center p-3 rounded-lg bg-red-500/10 border border-red-500/30"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {error}
                    </motion.div>
                  )}
                  
                  {message && (
                    <motion.div 
                      className="text-green-400 text-sm text-center p-3 rounded-lg bg-green-500/10 border border-green-500/30"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {message}
                    </motion.div>
                  )}
                  
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full royal-button py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={!loading ? { scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center space-x-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Shield className="h-5 w-5" />
                        </motion.div>
                        <span>Consulting Royal Archives...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <Crown className="h-5 w-5" />
                        <span>Verify Royal Vault</span>
                      </span>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Account Found Banner */}
                <motion.div 
                  className="mb-8 p-6 glass-morphism rounded-xl border border-green-500/30"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center space-x-3">
                    <Crown className="h-8 w-8 text-green-400" />
                    <div>
                      <p className="text-green-400 font-bold text-lg">
                        Royal Account Located!
                      </p>
                      <p className="text-gray-300">
                        Knight: <strong className="text-white">{foundUsername}</strong>
                      </p>
                      <p className="text-gray-400 text-sm">
                        Vault: {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                      </p>
                    </div>
                  </div>
                </motion.div>
                
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Royal Passphrase
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new royal passphrase"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 royal-input rounded-xl"
                        disabled={loading}
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
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Royal Passphrase
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm new royal passphrase"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 royal-input rounded-xl"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <motion.div 
                      className="text-red-400 text-sm text-center p-3 rounded-lg bg-red-500/10 border border-red-500/30"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {error}
                    </motion.div>
                  )}
                  
                  {message && (
                    <motion.div 
                      className="text-green-400 text-sm text-center p-3 rounded-lg bg-green-500/10 border border-green-500/30"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {message}
                    </motion.div>
                  )}
                  
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full royal-button py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={!loading ? { scale: 1.02 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center space-x-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Shield className="h-5 w-5" />
                        </motion.div>
                        <span>Forging New Key...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <Crown className="h-5 w-5" />
                        <span>Forge New Passphrase</span>
                      </span>
                    )}
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={() => setStep('verify')}
                    className="w-full text-gray-400 hover:text-gray-300 py-3 font-medium transition-colors"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Vault Verification</span>
                    </span>
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button
            onClick={() => onNavigate('login')}
            className="w-full text-gray-400 hover:text-gray-300 mt-6 py-3 font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="flex items-center justify-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Castle Gates</span>
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default ChessForgotPassword