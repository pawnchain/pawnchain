'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, TrendingUp, Clock, AlertTriangle, Crown, Shield, Sword, Castle } from 'lucide-react'

interface AdminStats {
  totalUsers: number
  activeTriangles: number
  pendingDeposits: number
  pendingPayouts: number
  totalRevenue: number
}

interface RecentTransaction {
  id: string
  user: string
  type: string
  plan: string
  amount: string
  status: string
  time: string
}

interface PendingAction {
  id: string
  type: string
  user: string
  amount: string
  priority: 'high' | 'medium' | 'low'
}

const ChessAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/admin/overview')
        if (!response.ok) {
          throw new Error('Failed to fetch admin data')
        }
        const data = await response.json()
        setStats(data.stats)
        setRecentTransactions(data.recentTransactions)
        setPendingActions(data.pendingActions)
      } catch (err: any) {
        setError(err.message || 'Failed to load admin data')
        // Clear any previous data to avoid showing stale data
        setStats(null)
        setRecentTransactions([])
        setPendingActions([])
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  const getPlanPiece = (plan: string) => {
    switch (plan) {
      case 'King': return '♔'
      case 'Queen': return '♕'
      case 'Bishop': return '♗'
      case 'Knight': return '♘'
      default: return '♔'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'rejected':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'low':
        return 'bg-green-500/20 text-green-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
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
              <span className="text-lg">Consulting the royal council archives...</span>
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
              👑
            </motion.div>
            <h1 className="text-4xl font-bold gradient-text mb-3">
              Royal Council Chamber
            </h1>
            <p className="text-xl text-gray-300">
              Command center for the ForgeChain Kingdom
            </p>
          </motion.div>

          {error && (
            <motion.div 
              className="mb-8 royal-modal rounded-xl p-4 border border-red-500/30"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-400 mr-3" />
                <div>
                  <h3 className="font-bold text-red-400">Royal Advisory</h3>
                  <p className="text-gray-300">Error loading data: {error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {[
                {
                  title: 'Total Subjects',
                  value: stats.totalUsers,
                  icon: '👥',
                  color: 'text-blue-400',
                  bgGradient: 'from-blue-500/20 to-blue-600/10'
                },
                {
                  title: 'Active Kingdoms',
                  value: stats.activeTriangles,
                  icon: '🏰',
                  color: 'text-purple-400',
                  bgGradient: 'from-purple-500/20 to-purple-600/10'
                },
                {
                  title: 'Pending Deposits',
                  value: stats.pendingDeposits,
                  icon: '⬇️',
                  color: 'text-yellow-400',
                  bgGradient: 'from-yellow-500/20 to-yellow-600/10'
                },
                {
                  title: 'Pending Payouts',
                  value: stats.pendingPayouts,
                  icon: '⬆️',
                  color: 'text-green-400',
                  bgGradient: 'from-green-500/20 to-green-600/10'
                },
                {
                  title: 'Royal Treasury',
                  value: `${stats.totalRevenue.toLocaleString()} USDT`,
                  icon: '💰',
                  color: 'text-gold-400',
                  bgGradient: 'from-yellow-500/20 to-yellow-600/10'
                }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className={`glass-morphism rounded-xl p-6 border border-white/10 bg-gradient-to-br ${item.bgGradient}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">{item.title}</p>
                      <p className="text-2xl font-bold text-white">{item.value}</p>
                    </div>
                    <motion.div
                      className="text-3xl"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: index === 1 ? [0, 10, -10, 0] : 0
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        delay: index * 0.5 
                      }}
                    >
                      {item.icon}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Transactions */}
            <motion.div 
              className="glass-morphism rounded-xl p-8 border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <motion.span
                  className="mr-3 text-3xl"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  📜
                </motion.span>
                Recent Royal Transactions
              </h3>
              
              {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
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
                          {getPlanPiece(transaction.plan)}
                        </motion.div>
                        <div>
                          <p className="text-white font-medium">{transaction.user}</p>
                          <p className="text-sm text-gray-400 capitalize">
                            {transaction.type} - {transaction.plan} Plan
                          </p>
                          <p className="text-xs text-gray-500">{transaction.time}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-white font-bold">{transaction.amount}</p>
                        <span className={`inline-block px-3 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📜</div>
                  <p className="text-gray-400">No recent transactions</p>
                </div>
              )}
            </motion.div>

            {/* Pending Actions */}
            <motion.div 
              className="glass-morphism rounded-xl p-8 border border-white/10"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <motion.span
                  className="mr-3 text-3xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⚠️
                </motion.span>
                Pending Royal Decrees
              </h3>
              
              {pendingActions.length > 0 ? (
                <div className="space-y-4">
                  {pendingActions.map((action, index) => (
                    <motion.div
                      key={action.id}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <motion.div
                            className="text-2xl"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                          >
                            {action.type.includes('deposit') ? '⬇️' : action.type.includes('payout') ? '⬆️' : '👤'}
                          </motion.div>
                          <div>
                            <p className="text-white font-medium capitalize">
                              {action.type.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-gray-400">{action.user}</p>
                          </div>
                        </div>
                        
                        <span className={`px-3 py-1 text-xs rounded-full ${getPriorityColor(action.priority)}`}>
                          {action.priority} priority
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className="text-white font-bold">{action.amount}</p>
                        <div className="flex space-x-2">
                          <motion.button
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Approve
                          </motion.button>
                          <motion.button
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Reject
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">✅</div>
                  <p className="text-gray-400">No pending actions</p>
                  <p className="text-gray-500 text-sm mt-2">All royal matters resolved</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div 
            className="mt-8 glass-morphism rounded-xl p-8 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <motion.span
                className="mr-3 text-3xl"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                ⚡
              </motion.span>
              Royal Quick Actions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Manage Users', icon: '👥', action: 'admin-users' },
                { label: 'View Transactions', icon: '💰', action: 'admin-transactions' },
                { label: 'System Settings', icon: '⚙️', action: 'admin-settings' },
                { label: 'Kingdom Plans', icon: '📋', action: 'admin-plans' }
              ].map((item, index) => (
                <motion.button
                  key={index}
                  className="p-4 royal-button rounded-lg font-bold flex items-center justify-center space-x-2"
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: item.action }))}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Chess Pieces */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['👑', '🏰', '⚔️', '🛡️', '💰', '📜'].map((piece, index) => (
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

export default ChessAdminDashboard