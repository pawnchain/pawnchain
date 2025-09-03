'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Copy, Share2, TrendingUp, Award, CheckCircle, Crown, Shield, Sword, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'

interface ReferralTransaction {
  id: string
  amount: number
  date: string
  status: string
  username: string
  plan: string
}

interface ReferralData {
  code: string
  totalReferrals: number
  totalCommission: number
  pendingCommission: number
  history: ReferralTransaction[]
  referredUsers: Array<{
    id: string
    username: string
    plan: string
    joinedAt: string
  }>
}

const ChessReferrals: React.FC = () => {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [copied, setCopied] = useState(false)
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'recruits' | 'history'>('overview')

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/user/referrals')
        if (!response.ok) {
          throw new Error('Failed to fetch referral data')
        }
        const data = await response.json()
        setReferralData(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load referral data')
        // Mock data for demo
        setReferralData({
          code: user?.referralCode || 'ROYAL123',
          totalReferrals: 8,
          totalCommission: 45.75,
          pendingCommission: 12.25,
          history: [
            { id: '1', amount: 15.50, date: '2024-01-15', status: 'confirmed', username: 'Knight_Player', plan: 'Knight' },
            { id: '2', amount: 20.25, date: '2024-01-14', status: 'confirmed', username: 'Bishop_Warrior', plan: 'Bishop' },
            { id: '3', amount: 10.00, date: '2024-01-13', status: 'pending', username: 'Queen_Noble', plan: 'Queen' },
          ],
          referredUsers: [
            { id: '1', username: 'Knight_Player', plan: 'Knight', joinedAt: '2024-01-15' },
            { id: '2', username: 'Bishop_Warrior', plan: 'Bishop', joinedAt: '2024-01-14' },
            { id: '3', username: 'Queen_Noble', plan: 'Queen', joinedAt: '2024-01-13' },
            { id: '4', username: 'Rook_Guardian', plan: 'King', joinedAt: '2024-01-12' },
            { id: '5', username: 'Pawn_Soldier', plan: 'Knight', joinedAt: '2024-01-11' },
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReferralData()
  }, [user])

  const getPlanPiece = (plan: string) => {
    switch (plan) {
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
              <span className="text-lg">Consulting the royal recruitment records...</span>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !referralData) {
    return (
      <div className="min-h-screen relative">
        <div className="chess-board-pattern absolute inset-0 opacity-5"></div>
        <div className="relative py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="royal-modal rounded-2xl p-8 border border-yellow-500/30 max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-center">
                <motion.div
                  className="text-6xl mb-4 inline-block"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  📜
                </motion.div>
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">Recruitment Records Unavailable</h2>
                <p className="text-gray-300 text-lg">Using demonstration data for royal review</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralData.code)
      setCopied(true)
      addNotification({
        userId: user?.id || '',
        title: 'Royal Decree Copied!',
        message: 'Recruitment code copied to your royal scroll',
        type: 'success',
        read: false,
      })
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      addNotification({
        userId: user?.id || '',
        title: 'Royal Scroll Error',
        message: 'Could not copy recruitment code to scroll',
        type: 'error',
        read: false,
      })
    }
  }

  const handleShare = async () => {
    const shareText = `Join me in the ForgeChain Royal Kingdom! Use my noble recruitment code: ${referralData.code}`
    const shareUrl = `${window.location.origin}/register?ref=${referralData.code}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join the ForgeChain Royal Kingdom',
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(shareUrl)
        addNotification({
          userId: user?.id || '',
          title: 'Royal Invitation Copied!',
          message: 'Recruitment link copied to your scroll',
          type: 'success',
          read: false,
        })
      } catch (error) {
        addNotification({
          userId: user?.id || '',
          title: 'Share Failed',
          message: 'Could not share royal recruitment link',
          type: 'error',
          read: false,
        })
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const stats = [
    {
      label: 'Noble Recruits',
      value: referralData.totalReferrals,
      icon: '⚔️',
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/20 to-blue-600/10'
    },
    {
      label: 'Active Warriors',
      value: referralData.totalReferrals, // All referrals are considered active
      icon: '🛡️',
      color: 'text-green-400',
      bgGradient: 'from-green-500/20 to-green-600/10'
    },
    {
      label: 'Total Rewards',
      value: `${referralData.totalCommission} USDT`,
      icon: '💰',
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/20 to-purple-600/10'
    },
    {
      label: 'Pending Rewards',
      value: `${referralData.pendingCommission} USDT`,
      icon: '⏳',
      color: 'text-yellow-400',
      bgGradient: 'from-yellow-500/20 to-yellow-600/10'
    },
  ]

  return (
    <div className="min-h-screen relative">
      <div className="chess-board-pattern absolute inset-0 opacity-5"></div>
      
      <div className="relative py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
            className="mb-12 text-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="text-6xl mb-4 inline-block chess-piece-shadow"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              👥
            </motion.div>
            <h1 className="text-4xl font-bold gradient-text mb-3">
              Royal Recruitment Chamber
            </h1>
            <p className="text-xl text-gray-300">
              Expand your kingdom and earn noble rewards, {user?.plan || 'Knight'}
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className={`glass-morphism rounded-xl p-6 border border-white/10 bg-gradient-to-br ${stat.bgGradient}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <motion.div
                    className="text-3xl"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: index === 0 ? [0, 10, -10, 0] : 0
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: index * 0.5 
                    }}
                  >
                    {stat.icon}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Referral Code Section */}
          <motion.div 
            className="glass-morphism rounded-xl p-8 border border-white/10 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-center mb-8">
              <motion.div
                className="text-4xl mb-4 inline-block"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                📜
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4">Your Royal Recruitment Decree</h3>
              <p className="text-gray-400">Share this code to recruit nobles to your kingdom and earn 10% recruitment rewards</p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={referralData.code}
                    readOnly
                    className="royal-input w-full text-center text-xl font-bold tracking-wider"
                  />
                  <motion.div
                    className="absolute inset-0 border border-yellow-500/50 rounded-lg pointer-events-none"
                    animate={{ 
                      boxShadow: [
                        '0 0 10px rgba(212, 175, 55, 0.3)',
                        '0 0 20px rgba(212, 175, 55, 0.5)',
                        '0 0 10px rgba(212, 175, 55, 0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <motion.button
                  onClick={handleCopyCode}
                  className="flex-1 royal-button py-3 px-4 rounded-lg font-bold flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Copied to Scroll!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Royal Decree</span>
                    </>
                  )}
                </motion.button>
                
                <motion.button
                  onClick={handleShare}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center space-x-2 hover:from-purple-700 hover:to-purple-800 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Kingdom</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Tabs Navigation */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-black/20 rounded-xl p-1">
              {[
                { key: 'overview', label: 'Overview', icon: '🏰' },
                { key: 'recruits', label: 'Noble Recruits', icon: '⚔️' },
                { key: 'history', label: 'Reward History', icon: '💰' }
              ].map((tab) => (
                <motion.button
                  key={tab.key}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setActiveTab(tab.key as any)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <div className="glass-morphism rounded-xl p-8 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-6">Recruitment Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-4">📊 Kingdom Statistics</h4>
                      <div className="space-y-3 text-gray-400">
                        <div className="flex justify-between">
                          <span>Total Recruits:</span>
                          <span className="text-blue-400 font-bold">{referralData.totalReferrals}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Rewards Earned:</span>
                          <span className="text-green-400 font-bold">{referralData.totalCommission} USDT</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pending Rewards:</span>
                          <span className="text-yellow-400 font-bold">{referralData.pendingCommission} USDT</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average per Recruit:</span>
                          <span className="text-purple-400 font-bold">
                            {referralData.totalReferrals > 0 
                              ? (referralData.totalCommission / referralData.totalReferrals).toFixed(2) 
                              : '0.00'} USDT
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-green-400 mb-4">💡 Recruitment Tips</h4>
                      <ul className="space-y-2 text-gray-400 text-sm">
                        <li className="flex items-start">
                          <span className="text-yellow-400 mr-2">⭐</span>
                          Share your royal decree on social platforms
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-400 mr-2">⭐</span>
                          Explain the benefits of joining your kingdom
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-400 mr-2">⭐</span>
                          Help new recruits understand the royal system
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-400 mr-2">⭐</span>
                          Earn 10% rewards from each recruit's plan value
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'recruits' && (
                <div className="glass-morphism rounded-xl p-8 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-6">Your Noble Recruits</h3>
                  {referralData.referredUsers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {referralData.referredUsers.map((recruit, index) => (
                        <motion.div
                          key={recruit.id}
                          className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <motion.div
                              className="text-3xl"
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                            >
                              {getPlanPiece(recruit.plan)}
                            </motion.div>
                            <div>
                              <p className="font-bold text-white">{recruit.username}</p>
                              <p className="text-sm text-gray-400">{recruit.plan} Plan</p>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            <p>Joined: {new Date(recruit.joinedAt).toLocaleDateString()}</p>
                          </div>
                          
                          <div className="mt-3 flex justify-between items-center">
                            <span className="inline-block px-2 py-1 text-xs rounded bg-green-500/20 text-green-400">
                              Active Noble
                            </span>
                            <span className="text-xs text-purple-400 font-bold">
                              10% Reward
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      className="text-center py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="text-6xl mb-4">⚔️</div>
                      <p className="text-gray-400 text-lg">No noble recruits yet</p>
                      <p className="text-gray-500 mt-2">Share your royal decree to start building your army</p>
                    </motion.div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="glass-morphism rounded-xl p-8 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-6">Recruitment Reward History</h3>
                  {referralData.history.length > 0 ? (
                    <div className="space-y-4">
                      {referralData.history.map((reward, index) => (
                        <motion.div
                          key={reward.id}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center space-x-4">
                            <motion.div
                              className="text-2xl"
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                            >
                              {getPlanPiece(reward.plan)}
                            </motion.div>
                            <div>
                              <p className="text-white font-medium">Recruitment Reward</p>
                              <p className="text-sm text-gray-400">
                                From {reward.username} ({reward.plan} Plan)
                              </p>
                              <p className="text-xs text-gray-500">{reward.date}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-white font-bold">+{reward.amount} USDT</p>
                            <span className={`inline-block px-3 py-1 text-xs rounded-full ${getStatusColor(reward.status)}`}>
                              {reward.status}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      className="text-center py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="text-6xl mb-4">💰</div>
                      <p className="text-gray-400 text-lg">No recruitment rewards yet</p>
                      <p className="text-gray-500 mt-2">Start recruiting to earn your first rewards</p>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Chess Pieces */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['👥', '⚔️', '🛡️', '💰', '👑', '📜'].map((piece, index) => (
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

export default ChessReferrals