'use client'

import React, { useState } from 'react'
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

  const { register } = useAuth()
  const { addNotification } = useNotifications()

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
          setReferrerInfo(data.referrer)
          setIsReferralCodeLocked(true)
          
          const referrerPlan = data.referrer.planType.charAt(0).toUpperCase() + data.referrer.planType.slice(1).toLowerCase()
          setFormData(prev => ({ ...prev, plan: referrerPlan as PlanType, referralCode: code }))
          
          addNotification({
            userId: 'system',
            title: 'Noble Sponsor Found',
            message: `You shall join ${data.referrer.username}'s ${referrerPlan} battalion`,
            type: 'info',
            read: false,
          })
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

    if (formData.password !== formData.confirmPassword) {
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
      const { success, deposit } = await register(
        formData.username,
        formData.password,
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
        className="relative max-w-2xl w-full"
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
              ⚔️
            </motion.div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Join the Royal Army</h1>
            <p className="text-gray-400">Choose your rank and begin your conquest</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Treasury Vault Address
                </label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={formData.walletAddress}
                    onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder-gray-400 transition-all"
                    placeholder="0x... or T..."
                    required
                  />
                </div>
              </motion.div>
            </div>

            {/* Plan Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Choose Your Rank {referrerInfo && <span className="text-yellow-400">(Aligned with sponsor: {referrerInfo.username})</span>}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map((plan, index) => (
                  <motion.button
                    key={plan.name}
                    type="button"
                    onClick={() => !isReferralCodeLocked && setFormData({ ...formData, plan: plan.name })}
                    disabled={isReferralCodeLocked}
                    className={`relative p-6 border-2 rounded-xl transition-all duration-300 ${
                      formData.plan === plan.name
                        ? 'border-yellow-500 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 shadow-lg'
                        : isReferralCodeLocked
                        ? 'border-gray-600 bg-gray-800/50 cursor-not-allowed opacity-60'
                        : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    }`}
                    whileHover={!isReferralCodeLocked ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!isReferralCodeLocked ? { scale: 0.98 } : {}}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <div className="text-center">
                      <div className={`text-4xl mb-3 ${isReferralCodeLocked && formData.plan !== plan.name ? 'opacity-50' : ''}`}>
                        {plan.piece}
                      </div>
                      <div className={`font-bold text-lg mb-2 ${isReferralCodeLocked && formData.plan !== plan.name ? 'opacity-50' : 'text-white'}`}>
                        {plan.name}
                      </div>
                      <div className={`text-2xl font-bold mb-2 ${isReferralCodeLocked && formData.plan !== plan.name ? 'opacity-50' : 'text-yellow-400'}`}>
                        {plan.price} ETH
                      </div>
                      <div className={`text-xs text-gray-400 mb-3 ${isReferralCodeLocked && formData.plan !== plan.name ? 'opacity-50' : ''}`}>
                        {plan.description}
                      </div>
                      <div className="space-y-1">
                        {plan.benefits.map((benefit, i) => (
                          <div key={i} className={`text-xs ${isReferralCodeLocked && formData.plan !== plan.name ? 'opacity-50 text-gray-500' : 'text-gray-300'}`}>
                            • {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                    {formData.plan === plan.name && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-xl"
                        layoutId="selectedPlan"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
              {isReferralCodeLocked && (
                <motion.p 
                  className="text-sm text-yellow-400 mt-3 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ⚔️ Rank automatically aligned with your sponsor's battalion
                </motion.p>
              )}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
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
                    placeholder="Create your secret phrase"
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

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Passphrase
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder-gray-400 transition-all"
                    placeholder="Confirm your secret phrase"
                    required
                  />
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sponsor Code (Optional)
              </label>
              <div className="relative">
                <Crown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => handleReferralCodeChange(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white placeholder-gray-400 transition-all"
                  placeholder="Enter sponsor's code"
                />
                {referrerInfo && (
                  <motion.div 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <div className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/30">
                      ✓ {referrerInfo.username}
                    </div>
                  </motion.div>
                )}
              </div>
              {referrerInfo && (
                <motion.p 
                  className="text-sm text-green-400 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  🛡️ Noble sponsor verified: {referrerInfo.username} ({referrerInfo.planType} battalion)
                </motion.p>
              )}
            </motion.div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-4 rounded-lg font-bold hover:from-yellow-400 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg text-lg"
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(212, 175, 55, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              {isLoading ? (
                <motion.div
                  className="flex items-center justify-center space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    className="w-6 h-6 border-2 border-black border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Forging Your Destiny...</span>
                </motion.div>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Sword className="h-5 w-5" />
                  <span>Claim Your Throne</span>
                </span>
              )}
            </motion.button>
          </form>

          <motion.div 
            className="text-center pt-6 border-t border-white/10 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <p className="text-gray-400 mb-3">
              Already sworn allegiance to the realm?
            </p>
            <motion.button
              onClick={() => onNavigate('login')}
              className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Return to Your Castle →
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default ChessRegisterForm