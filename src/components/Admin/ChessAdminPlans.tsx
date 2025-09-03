'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Shield, Sword, Castle, Edit, Save, X, Plus } from 'lucide-react'

interface Plan {
  name: string
  price: number
  payout: number
  referralBonus: number
  description: string
  features: string[]
}

const ChessAdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true)
        // Mock data for demo
        setPlans([
          {
            name: 'King',
            price: 100,
            payout: 400,
            referralBonus: 10,
            description: 'The ultimate royal position with maximum earning potential',
            features: ['Highest payout multiplier (4x)', 'Position A eligibility', 'Premium royal status']
          },
          {
            name: 'Queen',
            price: 50,
            payout: 200,
            referralBonus: 10,
            description: 'Noble position with excellent earning opportunities',
            features: ['High payout multiplier (4x)', 'Level 2 position access', 'Royal status benefits']
          },
          {
            name: 'Bishop',
            price: 20,
            payout: 100,
            referralBonus: 80,
            description: 'Strategic position for steady kingdom growth',
            features: ['Balanced payout multiplier (4x)', 'Mid-tier position access', 'Stable earning potential']
          },
          {
            name: 'Knight',
            price: 10,
            payout: 40,
            referralBonus: 10,
            description: 'Entry-level position to start your royal journey',
            features: ['Entry payout multiplier (4x)', 'Foundation position access', 'Growth potential']
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  const getPlanPiece = (planName: string) => {
    switch (planName) {
      case 'King': return '♔'
      case 'Queen': return '♕'
      case 'Bishop': return '♗'
      case 'Knight': return '♘'
      default: return '♔'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div className="chess-board-pattern absolute inset-0 opacity-5"></div>
        <div className="relative py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="flex items-center justify-center space-x-3 text-gray-400 py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="loading-spinner w-8 h-8"></div>
              <span className="text-lg">Consulting the royal plan archives...</span>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <div className="chess-board-pattern absolute inset-0 opacity-5"></div>
      
      <div className="relative py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold gradient-text flex items-center">
              <motion.span
                className="mr-3 text-4xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                📋
              </motion.span>
              Royal Kingdom Plans
            </h1>
            <p className="text-gray-400 mt-2">Manage subscription plans and royal membership tiers</p>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className="glass-morphism rounded-xl p-6 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <motion.div
                    className="text-6xl mb-4 inline-block chess-piece-shadow"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5
                    }}
                  >
                    {getPlanPiece(plan.name)}
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-300 text-sm">{plan.description}</p>
                </div>

                {/* Plan Details */}
                <div className="space-y-4">
                  {/* Pricing */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Entry Price</p>
                        <p className="text-white font-bold">{plan.price} USDT</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Max Payout</p>
                        <p className="text-green-400 font-bold">{plan.payout} USDT</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-400">Referral Bonus</p>
                        <p className="text-purple-400 font-bold">{plan.referralBonus} USDT (10%)</p>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-bold text-yellow-400 mb-3">Royal Benefits</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start text-sm">
                          <span className="text-green-400 mr-2 mt-1">✓</span>
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Edit Button */}
                  <motion.button
                    onClick={() => setEditingPlan(plan.name)}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Plan</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Chess Pieces */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['♔', '♕', '♗', '♘', '📋', '✨'].map((piece, index) => (
          <motion.div
            key={index}
            className="absolute text-4xl text-white/5"
            style={{
              left: `${5 + (index * 18)}%`,
              top: `${15 + (index * 12)}%`,
            }}
            animate={{
              y: [0, -25, 0],
              rotate: [0, 180, 360],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 6 + index * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.8,
            }}
          >
            {piece}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ChessAdminPlans