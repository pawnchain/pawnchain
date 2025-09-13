'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, User, Lock, Wallet, Crown, Shield, Sword, Castle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { PlanType } from '@/types'

interface ChessRegisterFormProps {
  onNavigate: (page: string) => void
}

const ChessRegisterForm: React.FC<ChessRegisterFormProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    walletAddress: '',
    plan: 'King' as PlanType,
    referralCode: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [referrerInfo, setReferrerInfo] = useState<{username: string; planType: string} | null>(null)
  const [isReferralCodeLocked, setIsReferralCodeLocked] = useState(false)
  const [isRejoiningUser, setIsRejoiningUser] = useState(false) // New state to track rejoining users

  const { register } = useAuth()
  const { addNotification } = useNotifications()

  // Check if user is rejoining after withdrawal
  useEffect(() => {
    // Check for rejoining user data in localStorage
    const rejoinData = localStorage.getItem('rejoin_user_data')
    if (rejoinData) {
      try {
        const userData = JSON.parse(rejoinData)
        console.log('Rejoin data found:', userData) // Debug log
        setIsRejoiningUser(true)
        // Prefill the form with user data
        setFormData(prev => ({
          ...prev,
          username: userData.username || '',
          walletAddress: userData.walletAddress || '',
          plan: userData.plan || 'King'
        }))
        // Remove the data from localStorage after using it
        localStorage.removeItem('rejoin_user_data')
      } catch (e) {
        console.error('Error parsing rejoin data:', e)
      }
    }
  }, [])

  const handleReferralCodeChange = async (code: string) => {
    setFormData({ ...formData, referralCode: code })
    
    if (code.trim() === '') {
      setReferrerInfo(null)
      setIsReferralCodeLocked(false)
      return
    }

    if (code.trim().length >= 3) {
      try {
        const response = await fetch(`/api/auth/referrer?code=${encodeURIComponent(code.trim())}`)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Referrer data for registration:', data); // Debug log
          setReferrerInfo(data)
          setIsReferralCodeLocked(true)
          
          // The API returns the plan directly, not nested in referrer object
          if (data.plan) {
            setFormData(prev => ({ ...prev, plan: data.plan, referralCode: code }))
            
            addNotification({
              userId: 'system',
              title: 'Noble Sponsor Found',
              message: `You shall join ${data.username}'s ${data.plan} battalion`,
              type: 'info',
              read: false,
            })
          }
        } else {
          setReferrerInfo(null)
          setIsReferralCodeLocked(false)
        }
      } catch (error) {
        console.error('Error looking up referrer:', error)
        setReferrerInfo(null)
        setIsReferralCodeLocked(false)
      }
    } else {
      setReferrerInfo(null)
      setIsReferralCodeLocked(false)
    }
  }

  const plans = [
    { 
      name: 'King' as PlanType, 
      price: 1.0, 
      icon: Crown, 
      piece: '♔',
      color: 'from-yellow-500 to-yellow-600',
      description: 'Supreme ruler of the realm',
      benefits: ['4x Payout Multiplier', 'Royal Treasury Access', 'Crown Privileges']
    },
    { 
      name: 'Queen' as PlanType, 
      price: 0.5, 
      icon: Shield, 
      piece: '♕',
      color: 'from-purple-500 to-purple-600',
      description: 'Powerful royal consort',
      benefits: ['3x Payout Multiplier', 'Noble Treasury', 'Royal Court Access']
    },
    { 
      name: 'Bishop' as PlanType, 
      price: 0.25, 
      icon: Sword, 
      piece: '♗',
      color: 'from-green-500 to-green-600',
      description: 'Wise spiritual advisor',
      benefits: ['2x Payout Multiplier', 'Sacred Treasury', 'Divine Guidance']
    },
    { 
      name: 'Knight' as PlanType, 
      price: 0.1, 
      icon: Castle, 
      piece: '♘',
      color: 'from-blue-500 to-blue-600',
      description: 'Brave warrior of the realm',
      benefits: ['1.5x Payout Multiplier', 'Warrior Treasury', 'Battle Honor']
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Only validate passwords for new registrations, not rejoining users
    if (!isRejoiningUser && formData.password !== formData.confirmPassword) {
      addNotification({
        userId: 'system',
        title: 'Oath Mismatch',
        message: 'Your secret phrases do not align',
        type: 'error',
        read: false,
      })
      setIsLoading(false)
      return
    }

    const isEth = formData.walletAddress.startsWith('0x') && formData.walletAddress.length === 42
    const tronRegex = /^T[1-9A-HJ-NP-Za-km-z]{33}$/
    const isTron = tronRegex.test(formData.walletAddress)

    if (!(isEth || isTron)) {
      addNotification({
        userId: 'system',
        title: 'Invalid Treasury Key',
        message: 'Please provide a valid wallet address (ETH 0x... or Tron T...)',
        type: 'error',
        read: false,
      })
      setIsLoading(false)
      return
    }

    try {
      // Use a placeholder password for rejoining users since they don't need to enter one
      const passwordToUse = isRejoiningUser ? 'rejoin-placeholder-password' : formData.password;
      
      const { success, deposit } = await register(
        formData.username,
        passwordToUse,
        formData.walletAddress,
        formData.plan,
        formData.referralCode
      )

      if (success) {
        addNotification({
          userId: 'system',
          title: 'Welcome to the Kingdom!',
          message: 'Your knighthood has been granted',
          type: 'success',
          read: false,
        })
        if (deposit) {
          addNotification({
            userId: 'system',
            title: 'Treasury Tribute Required',
            message: `Send ${deposit.amount} ${deposit.coin} on ${deposit.network} to claim your position`,
            type: 'info',
            read: false,
          })
        }
        onNavigate('dashboard')
      } else {
        addNotification({
          userId: 'system',
          title: 'Knighthood Denied',
          message: 'This name or treasury key is already claimed',
          type: 'error',
          read: false,
        })
      }
    } catch (error) {
      addNotification({
        userId: 'system',
        title: 'Recruitment Failed',
        message: 'The royal scribes encountered an error',
        type: 'error',
        read: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="chess-board-pattern absolute inset-0 opacity-5"></div>
        {/* Floating chess pieces */}
        {['♔', '♕', '♗', '♘', '♖', '♙'].map((piece, index) => (
          <motion.div
            key={index}
            className="absolute text-6xl text-white/5"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 8 + index * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5,
            }}
          >
            {piece}
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="relative max-w-4xl w-full"
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
              {isRejoiningUser ? '♞' : '♘'}
            </motion.div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              {isRejoiningUser ? 'Welcome Back, Knight' : 'Join the Royal Army'}
            </h1>
            <p className="text-gray-400">
              {isRejoiningUser 
                ? 'Continue your conquest in the ForgeChain kingdom' 
                : 'Embark on your journey to financial sovereignty'}
            </p>
            
            {/* Show special message for rejoining users */}
            {isRejoiningUser && (
              <motion.div 
                className="mt-4 p-3 bg-gradient-to-r from-yellow-500/20 to-green-500/20 border border-yellow-500/30 rounded-lg inline-block"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-yellow-300 text-sm">
                  Welcome back! You can now join a new triangle formation.
                </p>
              </motion.div>
            )}
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Knight Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder-gray-400 transition-all"
                  placeholder="Choose your knight name"
                  required
                />
              </div>
            </motion.div>

            {/* Wallet Address */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Treasury Key (Wallet Address)
              </label>
              <div className="relative">
                <Wallet className="absolute left-33 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={formData.walletAddress}
                  onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder-gray-400 transition-all"
                  placeholder="Your crypto wallet address"
                  required
                />
              </div>
            </motion.div>

            {/* Password Fields - Only show for new registration, not for rejoining users */}
            {!isRejoiningUser && (
              <>
                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
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
                      placeholder="Create your secret passphrase"
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

                {/* Confirm Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Secret Passphrase
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder-gray-400 transition-all"
                      placeholder="Confirm your secret passphrase"
                      required
                    />
                  </div>
                </motion.div>
              </>
            )}

            {/* Plan Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kingdom Tier
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((plan, index) => (
                  <motion.div
                    key={plan.name}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      formData.plan === plan.name
                        ? `border-yellow-500 bg-gradient-to-br ${plan.color} bg-opacity-20`
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                    }`}
                    onClick={() => setFormData({ ...formData, plan: plan.name })}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${plan.color}`}>
                        <plan.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{plan.name}</h3>
                        <p className="text-sm text-gray-400">{plan.price} USDT</p>
                      </div>
                    </div>
                    <div className="text-center text-2xl mb-2">{plan.piece}</div>
                    <p className="text-xs text-gray-400 mb-3">{plan.description}</p>
                    <ul className="text-xs space-y-1">
                      {plan.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center text-gray-300">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></div>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    {formData.plan === plan.name && (
                      <motion.div 
                        className="absolute top-2 right-2 text-yellow-500"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Crown className="h-5 w-5" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Referral Code */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Noble Sponsor (Optional)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => handleReferralCodeChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder-gray-400 transition-all"
                  placeholder="Enter sponsor's name, ID, or code"
                  disabled={isReferralCodeLocked}
                />
              </div>
              {referrerInfo && (
                <motion.div 
                  className="mt-2 p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-blue-300">
                    Sponsored by <span className="font-bold">{referrerInfo.username}</span> ({referrerInfo.planType})
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-3 rounded-lg font-bold hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(212, 175, 55, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
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
                  <span>{isRejoiningUser ? 'Rejoining Kingdom...' : 'Joining Army...'}</span>
                </motion.div>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>{isRejoiningUser ? 'Continue Conquest' : 'Swear Allegiance'}</span>
                </span>
              )}
            </motion.button>

            {/* Login Link */}
            <motion.div 
              className="text-center pt-4 border-t border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <p className="text-gray-400 mb-3">
                Already sworn allegiance to the realm?
              </p>
              <motion.button
                onClick={() => onNavigate('login')}
                className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Enter the Kingdom →
              </motion.button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default ChessRegisterForm