'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Users, Target, Clock, Wallet, Award, Crown, Shield, Sword, Castle, Zap, Star } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ChessTriangleVisualization from './ChessTriangleVisualization'
import ChessProgressBar from './ChessProgressBar'
import ChessReferralModal from './ChessReferralModal'
import ChessPayoutRequestModal from './ChessPayoutRequestModal'
import ChessTransactionModal from '@/components/Modals/ChessTransactionModal'

interface ChessDashboardProps {
  onNavigate: (page: string) => void
}

const ChessDashboard: React.FC<ChessDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth()
  const [triangleData, setTriangleData] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReferralModal, setShowReferralModal] = useState(false)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [depositInfo, setDepositInfo] = useState<any | null>(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [triangleResponse, transactionsResponse] = await Promise.all([
          fetch('/api/triangle'),
          fetch('/api/transactions'),
        ])

        if (triangleResponse.ok) {
          const data = await triangleResponse.json()
          setTriangleData(data)
        } else {
          setError('Failed to fetch triangle data')
        }

        if (transactionsResponse.ok) {
          const data = await transactionsResponse.json()
          setTransactions(data)
        } else {
          setError('Failed to fetch transactions')
        }

      } catch (err) {
        setError('An error occurred while fetching data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    try {
      const raw = localStorage.getItem('pending_deposit')
      if (raw) {
        const dep = JSON.parse(raw)
        setDepositInfo(dep)
        setShowPayoutModal(true)
      }
    } catch {}
  }, [])

  const handlePayoutRequest = async (amount: number, walletAddress: string) => {
    try {
      const response = await fetch('/api/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, walletAddress }),
      })

      if (response.ok) {
        const transactionsResponse = await fetch('/api/transactions')
        if (transactionsResponse.ok) {
          const data = await transactionsResponse.json()
          setTransactions(data)
        }
        setShowPayoutModal(false)
      } else {
        const error = await response.json()
        alert(`Payout failed: ${error.message}`)
      }
    } catch (err) {
      alert('An error occurred while requesting payout')
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'King': return Crown
      case 'Queen': return Shield
      case 'Bishop': return Sword
      case 'Knight': return Castle
      default: return Award
    }
  }

  const getPlanPiece = (plan: string) => {
    switch (plan) {
      case 'King': return '♔'
      case 'Queen': return '♕'
      case 'Bishop': return '♗'
      case 'Knight': return '♘'
      default: return '♙'
    }
  }

  const stats = [
    {
      label: 'Royal Treasury',
      value: `${user?.balance || 0}`,
      unit: 'USDT',
      icon: Wallet,
      color: 'from-blue-500 to-blue-600',
      piece: '💰',
    },
    {
      label: 'Total Conquered',
      value: `${user?.totalEarned || 0}`,
      unit: 'USDT',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      piece: '⚔️',
    },
    {
      label: 'Battle Position',
      value: user?.trianglePosition || 'Awaiting',
      unit: '',
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      piece: '🎯',
    },
    {
      label: 'Noble Rank',
      value: user?.plan || 'Peasant',
      unit: '',
      icon: getPlanIcon(user?.plan || ''),
      color: 'from-yellow-500 to-yellow-600',
      piece: getPlanPiece(user?.plan || ''),
    },
  ]

  return (
    <div className="min-h-screen relative">
      <div className="chess-board-pattern absolute inset-0 opacity-5"></div>
      
      <div className="relative py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
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
              {getPlanPiece(user?.plan || '')}
            </motion.div>
            <h1 className="text-4xl font-bold gradient-text mb-3">
              Welcome Back, {user?.username}
            </h1>
            <p className="text-xl text-gray-300">
              Your kingdom awaits your command, noble {user?.plan || 'Knight'}
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="royal-card rounded-xl p-6 group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-400 mb-1">{stat.label}</p>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      {stat.unit && <span className="text-sm text-gray-400">{stat.unit}</span>}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <motion.div
                  className="absolute top-2 right-2 text-2xl opacity-20"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {stat.piece}
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Triangle Progress */}
            <div className="lg:col-span-2">
              <motion.div 
                className="glass-morphism-strong rounded-2xl p-8 border border-white/20"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="text-3xl chess-piece-shadow"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      ⚔️
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Battle Formation</h2>
                      <p className="text-gray-400">Your triangle conquest progress</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                    <Zap className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">Active Campaign</span>
                  </div>
                </div>

                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="loading-spinner w-8 h-8"></div>
                    <span className="ml-3 text-gray-400">Loading battle formation...</span>
                  </div>
                )}
                
                {error && (
                  <div className="text-center py-12">
                    <p className="text-red-400">{error}</p>
                  </div>
                )}
                
                {triangleData && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <ChessProgressBar 
                      current={triangleData.completion}
                      total={100} 
                      label="Formation Strength"
                      color="gold"
                    />
                    <div className="mt-10">
                      <ChessTriangleVisualization data={triangleData} />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Quick Actions & Activity */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <motion.div 
                className="glass-morphism-strong rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <div className="flex items-center space-x-2 mb-6">
                  <motion.div
                    className="text-2xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ⚡
                  </motion.div>
                  <h3 className="text-xl font-bold text-white">Royal Commands</h3>
                </div>
                
                <div className="space-y-4">
                  {[
                    {
                      title: 'Recruit Knights',
                      description: 'Expand your army with referrals',
                      icon: Users,
                      color: 'from-blue-500 to-blue-600',
                      action: () => setShowReferralModal(true),
                      piece: '🛡️'
                    },
                    {
                      title: 'Treasury Withdrawal',
                      description: 'Claim your conquered gold',
                      icon: TrendingUp,
                      color: 'from-green-500 to-green-600',
                      action: () => setShowPayoutModal(true),
                      piece: '💎'
                    },
                    {
                      title: 'Battle Formation',
                      description: 'Inspect your triangle army',
                      icon: Target,
                      color: 'from-purple-500 to-purple-600',
                      action: () => onNavigate('triangle-detail'),
                      piece: '⚔️'
                    }
                  ].map((action, index) => (
                    <motion.button
                      key={index}
                      onClick={action.action}
                      className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300 group relative overflow-hidden"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      <div className="flex items-center space-x-4 relative z-10">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                          <action.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white group-hover:text-yellow-400 transition-colors">
                            {action.title}
                          </div>
                          <div className="text-sm text-gray-400">
                            {action.description}
                          </div>
                        </div>
                        <motion.div
                          className="text-2xl opacity-30 group-hover:opacity-60"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          {action.piece}
                        </motion.div>
                      </div>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div 
                className="glass-morphism-strong rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                <div className="flex items-center space-x-2 mb-6">
                  <motion.div
                    className="text-2xl"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    📜
                  </motion.div>
                  <h3 className="text-xl font-bold text-white">Royal Chronicles</h3>
                </div>
                
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="loading-spinner w-6 h-6"></div>
                    <span className="ml-3 text-gray-400">Loading chronicles...</span>
                  </div>
                )}
                
                {error && (
                  <div className="text-center py-8">
                    <p className="text-red-400">{error}</p>
                  </div>
                )}
                
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx, index) => (
                      <motion.div 
                        key={tx.id} 
                        className="flex items-center space-x-4 p-3 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
                          <motion.div
                            className="text-lg"
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          >
                            {tx.type === 'DEPOSIT' ? '⬇️' : tx.type === 'PAYOUT' ? '⬆️' : '➡️'}
                          </motion.div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{tx.type}</p>
                          <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-yellow-400">{tx.amount} USDT</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            tx.status === 'COMPLETED' ? 'status-confirmed' : 
                            tx.status === 'PENDING' ? 'status-pending' : 'status-rejected'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <div className="text-4xl mb-3 opacity-30">📜</div>
                    <p className="text-gray-400">No royal chronicles yet.</p>
                    <p className="text-sm text-gray-500 mt-1">Your conquests will appear here.</p>
                  </motion.div>
                )}
              </motion.div>

              {/* Kingdom Status */}
              <motion.div 
                className="glass-morphism-strong rounded-2xl p-6 border border-white/20"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <motion.div
                    className="text-2xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  >
                    👑
                  </motion.div>
                  <h3 className="text-lg font-bold text-white">Kingdom Status</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Rank</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getPlanPiece(user?.plan || '')}</span>
                      <span className="font-bold text-yellow-400">{user?.plan || 'Peasant'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Army Size</span>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-400" />
                      <span className="font-bold text-blue-400">
                        {triangleData ? `${Math.floor(triangleData.completion * 15 / 100)}/15` : '0/15'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-gray-300">Battle Ready</span>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-green-400" />
                      <span className="font-bold text-green-400">
                        {triangleData?.completion >= 100 ? 'Victory!' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showReferralModal && user?.referralCode && (
          <ChessReferralModal 
            referralCode={user.referralCode}
            onClose={() => setShowReferralModal(false)}
          />
        )}
        
        {showPayoutModal && (
          <ChessPayoutRequestModal 
            onClose={() => setShowPayoutModal(false)}
            onSubmit={handlePayoutRequest}
            onDepositConfirm={async () => {
              try {
                const response = await fetch('/api/transactions/deposit-confirm', { 
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ transactionId: depositInfo?.transactionId })
                })
                
                if (response.ok) {
                  setShowPayoutModal(false)
                  setCurrentTransactionId(depositInfo?.transactionId || depositInfo?.txHash)
                  setShowTransactionModal(true)
                  localStorage.removeItem('pending_deposit')
                } else {
                  console.error('Failed to confirm deposit')
                  alert('Failed to confirm deposit. Please try again.')
                }
              } catch (error) {
                console.error('Failed to confirm deposit:', error)
                alert('Network error. Please try again.')
              }
            }}
            deposit={depositInfo || undefined}
          />
        )}
        
        {showTransactionModal && currentTransactionId && (
          <ChessTransactionModal
            transactionId={currentTransactionId}
            type="DEPOSIT"
            onClose={() => {
              setShowTransactionModal(false)
              setCurrentTransactionId(null)
              window.location.reload()
            }}
          />
        )}
      </AnimatePresence>

      {/* Floating Chess Pieces */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['♔', '♕', '♗', '♘', '♖', '♙'].map((piece, index) => (
          <motion.div
            key={index}
            className="absolute text-6xl text-white/5"
            style={{
              left: `${10 + (index * 15)}%`,
              top: `${20 + (index * 10)}%`,
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
    </div>
  )
}

export default ChessDashboard