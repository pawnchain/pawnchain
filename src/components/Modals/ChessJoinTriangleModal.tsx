'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Target, Crown, Shield, Sword, Castle, AlertCircle, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'

interface Plan {
  name: string
  price: number
  payout: number
  referralBonus: number
}

interface ChessJoinTriangleModalProps {
  onClose: () => void
  onJoinSuccess: () => void
}

const ChessJoinTriangleModal: React.FC<ChessJoinTriangleModalProps> = ({ 
  onClose, 
  onJoinSuccess 
}) => {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [referrerCode, setReferrerCode] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [referrerInfo, setReferrerInfo] = useState<any>(null)
  const [showReferrerInfo, setShowReferrerInfo] = useState(false)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/admin/config')
        if (response.ok) {
          const config = await response.json()
          setPlans(config.plans || [])
          // Pre-select user's previous plan if available
          if (user?.plan) {
            setSelectedPlan(user.plan)
          } else if (config.plans.length > 0) {
            setSelectedPlan(config.plans[0].name)
          }
        }
      } catch (err) {
        setError('Failed to load plans')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [user?.plan])

  const validateReferrer = async () => {
    if (!referrerCode) {
      setReferrerInfo(null)
      setShowReferrerInfo(false)
      return
    }

    try {
      const response = await fetch(`/api/auth/referrer?code=${encodeURIComponent(referrerCode)}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Referrer data received:', data); // Debug log
        setReferrerInfo(data)
        setShowReferrerInfo(true)
        
        // If referrer has a specific plan, auto-select it
        if (data.plan) {
          setSelectedPlan(data.plan)
          console.log('Auto-selected plan:', data.plan); // Debug log
        }
      } else {
        setReferrerInfo(null)
        setShowReferrerInfo(false)
      }
    } catch (err) {
      console.error('Error validating referrer:', err); // Debug log
      setReferrerInfo(null)
      setShowReferrerInfo(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateReferrer()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [referrerCode])

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'King': return Crown
      case 'Queen': return Shield
      case 'Bishop': return Sword
      case 'Knight': return Castle
      default: return Target
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/triangle/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
          referrerId: referrerCode || undefined
        }),
      })

      if (response.ok) {
        const data = await response.json()
        addNotification({
          userId: user?.id || '',
          title: 'Triangle Assignment',
          message: 'You have been successfully assigned to a new triangle!',
          type: 'success',
          read: false
        })
        onJoinSuccess()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to join triangle')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPlanDetails = (planName: string) => {
    return plans.find(plan => plan.name === planName)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="royal-modal rounded-2xl p-8 max-w-2xl w-full border border-white/20"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="text-center mb-8">
            <motion.div
              className="text-5xl mb-4 inline-block"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              ♟️
            </motion.div>
            <h2 className="text-3xl font-bold gradient-text mb-2">
              Join New Battle Formation
            </h2>
            <p className="text-gray-300">
              Begin your next conquest in the PawnChain kingdom
            </p>
          </div>

          {error && (
            <motion.div 
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-start space-x-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Referral Code */}
            <div className="mb-8">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Noble Sponsor (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={referrerCode}
                  onChange={(e) => setReferrerCode(e.target.value)}
                  placeholder="Enter sponsor's username, ID, or referral code"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50"
                  disabled={isSubmitting}
                />
              </div>
              
              <AnimatePresence>
                {showReferrerInfo && referrerInfo && (
                  <motion.div 
                    className="mt-3 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <div>
                        <p className="text-green-400 font-medium text-sm">Noble Sponsor Found!</p>
                        <p className="text-gray-300 text-sm">
                          {referrerInfo.username} ({referrerInfo.plan})
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Plan Selection */}
            <div className="mb-8">
              <label className="block text-gray-300 text-sm font-medium mb-3">
                Select Your Royal Rank
              </label>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="loading-spinner w-8 h-8"></div>
                  <span className="ml-3 text-gray-400">Loading ranks...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {plans.map((plan) => {
                    const Icon = getPlanIcon(plan.name)
                    const planDetails = getPlanDetails(plan.name)
                    return (
                      <motion.label
                        key={plan.name}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                          selectedPlan === plan.name
                            ? 'border-yellow-500/50 bg-yellow-500/10'
                            : 'border-white/20 bg-white/5 hover:border-white/40'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <input
                          type="radio"
                          name="plan"
                          value={plan.name}
                          checked={selectedPlan === plan.name}
                          onChange={() => setSelectedPlan(plan.name)}
                          className="sr-only"
                          disabled={isSubmitting}
                        />
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            selectedPlan === plan.name
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-white/10 text-gray-400'
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className={`font-bold ${
                              selectedPlan === plan.name ? 'text-yellow-400' : 'text-white'
                            }`}>
                              {plan.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {planDetails?.price} USDT
                            </p>
                          </div>
                          {selectedPlan === plan.name && (
                            <div className="p-1 bg-yellow-500 rounded-full">
                              <Check className="h-4 w-4 text-black" />
                            </div>
                          )}
                        </div>
                      </motion.label>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Plan Details */}
            {selectedPlan && !isLoading && (
              <motion.div 
                className="mb-8 p-4 bg-white/5 border border-white/10 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h4 className="text-white font-bold mb-2">Rank Benefits</h4>
                {getPlanDetails(selectedPlan) ? (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-yellow-400">
                        {getPlanDetails(selectedPlan)!.price} USDT
                      </p>
                      <p className="text-xs text-gray-400">Entry Fee</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-400">
                        {getPlanDetails(selectedPlan)!.payout} USDT
                      </p>
                      <p className="text-xs text-gray-400">Payout</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-400">
                        {getPlanDetails(selectedPlan)!.referralBonus} USDT
                      </p>
                      <p className="text-xs text-gray-400">Referral Bonus</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Plan details not available</p>
                )}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <motion.button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-6 rounded-xl font-bold border border-white/20 text-gray-300 hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
              >
                Later
              </motion.button>
              <motion.button
                type="submit"
                className="flex-1 py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 transition-all disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="loading-spinner w-4 h-4"></div>
                    <span>Joining...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Join Formation</span>
                  </span>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ChessJoinTriangleModal