'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet as WalletIcon, TrendingUp, Download, Clock, AlertTriangle, Crown, Shield, Sword, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'
import ChessTransactionModal from '@/components/Modals/ChessTransactionModal'

const ChessWallet: React.FC = () => {
  const { user, logout } = useAuth()
  const { addNotification } = useNotifications()
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [walletData, setWalletData] = useState({ 
    balance: 0, 
    pendingEarnings: 0, 
    totalEarned: 0, 
    referralBonus: 0,
    positionInfo: null as { positionKey: string; triangleComplete: boolean; earnedFromPosition: number; filledPositions?: number } | null
  })
  const [transactions, setTransactions] = useState<Array<{ id: string; type: string; amount: number; status: string; date: string }>>([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/user/wallet')
        if (!res.ok) throw new Error('Failed to load wallet')
        const data = await res.json()
        setWalletData({ 
          balance: data.balance, 
          pendingEarnings: data.pendingEarnings, 
          totalEarned: data.totalEarned, 
          referralBonus: data.referralBonus,
          positionInfo: data.positionInfo
        })
        setTransactions(data.history)
      } catch (e: any) {
        setError(e.message || 'Failed to load wallet')
        // Mock data for demo
        setWalletData({
          balance: 125.50,
          pendingEarnings: 45.25,
          totalEarned: 89.75,
          referralBonus: 35.75,
          positionInfo: {
            positionKey: 'A',
            triangleComplete: true,
            earnedFromPosition: 54.00,
            filledPositions: 15
          }
        })
        setTransactions([
          { id: '1', type: 'DEPOSIT', amount: 100, status: 'CONFIRMED', date: '2024-01-15' },
          { id: '2', type: 'REFERRAL_BONUS', amount: 15.75, status: 'CONFIRMED', date: '2024-01-16' },
          { id: '3', type: 'PAYOUT', amount: 50, status: 'PENDING', date: '2024-01-17' },
        ])
      } finally {
        setLoading(false)
      }
    }
    load()
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

  const canRequestPayout = () => {
    if (!walletData.positionInfo) return false
    
    // Only position A can request payout
    if (walletData.positionInfo.positionKey !== 'A') return false
    
    // Triangle must be complete (all 15 positions filled)
    if (!walletData.positionInfo.triangleComplete) return false
    
    // Check if all 15 positions are filled
    if (walletData.positionInfo.filledPositions !== 15) return false
    
    return true
  }

  const getPayoutButtonText = () => {
    if (!walletData.positionInfo) return 'No Royal Position'
    
    if (walletData.positionInfo.positionKey !== 'A') {
      return `Only Sovereign Can Claim Treasury (You are ${walletData.positionInfo.positionKey})`
    }
    
    if (!walletData.positionInfo.triangleComplete || walletData.positionInfo.filledPositions !== 15) {
      return `Kingdom Not Complete (${walletData.positionInfo.filledPositions || 0}/15 positions filled)`
    }
    
    return 'Claim Royal Treasury & Split Kingdom'
  }

  const handlePayoutRequest = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      addNotification({ 
        userId: user?.id || '', 
        title: 'Invalid Royal Decree', 
        message: 'Please specify a valid treasury amount to claim', 
        type: 'error', 
        read: false 
      })
      return
    }

    if (parseFloat(payoutAmount) > walletData.balance) {
      addNotification({ 
        userId: user?.id || '', 
        title: 'Insufficient Royal Funds', 
        message: 'The requested amount exceeds your royal treasury balance', 
        type: 'error', 
        read: false 
      })
      return
    }

    try {
      const res = await fetch('/api/payout', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          amount: parseFloat(payoutAmount), 
          walletAddress: user?.walletAddress 
        }) 
      })
      const responseData = await res.json()
      
      if (!res.ok) {
        addNotification({ 
          userId: user?.id || '', 
          title: 'Treasury Claim Failed', 
          message: responseData.message || 'Failed to process royal treasury claim', 
          type: 'error', 
          read: false 
        })
      } else {
        // Show transaction modal instead of success notification
        setCurrentTransactionId(responseData.transactionId)
        setShowTransactionModal(true)
        setShowPayoutModal(false)
        setPayoutAmount('')
        
        addNotification({ 
          userId: user?.id || '', 
          title: 'Royal Decree Submitted', 
          message: 'Your treasury claim is being reviewed by the royal council.', 
          type: 'info', 
          read: false 
        })
      }
    } catch {
      addNotification({ 
        userId: user?.id || '', 
        title: 'Royal Network Error', 
        message: 'Failed to submit treasury claim to the royal council', 
        type: 'error', 
        read: false 
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-400'
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'REJECTED':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return '⬇️'
      case 'PAYOUT':
        return '⬆️'
      case 'REFERRAL_BONUS':
        return '👥'
      default:
        return '💰'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'Treasury Deposit'
      case 'PAYOUT':
        return 'Royal Withdrawal'
      case 'REFERRAL_BONUS':
        return 'Recruitment Bonus'
      default:
        return 'Transaction'
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
              <span className="text-lg">Examining royal treasury...</span>
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
              💰
            </motion.div>
            <h1 className="text-4xl font-bold gradient-text mb-3">
              Royal Treasury
            </h1>
            <p className="text-xl text-gray-300">
              Manage your royal funds and kingdom finances, noble {user?.plan || 'Knight'}
            </p>
          </motion.div>

          {error && (
            <motion.div 
              className="mb-8 royal-modal rounded-xl p-4 border border-yellow-500/30"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-yellow-400 mr-3" />
                <div>
                  <h3 className="font-bold text-yellow-400">Treasury Advisory</h3>
                  <p className="text-gray-300">Using demonstration data for royal review</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: 'Royal Treasury Balance',
                value: `${walletData.balance.toFixed(2)} USDT`,
                subtitle: 'Available for royal decrees',
                icon: '💎',
                color: 'text-blue-400',
                bgGradient: 'from-blue-500/20 to-blue-600/10'
              },
              {
                title: 'Pending Royal Earnings',
                value: `${walletData.pendingEarnings.toFixed(2)} USDT`,
                subtitle: 'Awaiting council approval',
                icon: '⏳',
                color: 'text-yellow-400',
                bgGradient: 'from-yellow-500/20 to-yellow-600/10'
              },
              {
                title: 'Position Rewards',
                value: `${walletData.totalEarned.toFixed(2)} USDT`,
                subtitle: walletData.positionInfo ? 
                  `Position ${walletData.positionInfo.positionKey}: ${walletData.positionInfo.earnedFromPosition.toFixed(2)} USDT` : 
                  'Based on royal standing',
                icon: getPlanPiece(user?.plan || ''),
                color: 'text-green-400',
                bgGradient: 'from-green-500/20 to-green-600/10'
              },
              {
                title: 'Recruitment Rewards',
                value: `${walletData.referralBonus.toFixed(2)} USDT`,
                subtitle: 'Noble recruitment bonuses',
                icon: '👥',
                color: 'text-purple-400',
                bgGradient: 'from-purple-500/20 to-purple-600/10'
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
                    <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
                  </div>
                  <motion.div
                    className="text-3xl"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: index === 2 ? [0, 10, -10, 0] : 0
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

          {/* Payout Request Section */}
          <motion.div 
            className="glass-morphism rounded-xl p-8 border border-white/10 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="text-3xl"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  👑
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Royal Treasury Claims</h3>
                  <p className="text-gray-400">Withdraw your royal earnings</p>
                </div>
              </div>
              
              {canRequestPayout() && (
                <motion.div
                  className="text-2xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🏆
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-yellow-400 mb-4">Treasury Status</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Royal Position:</span>
                    <span className="text-white font-bold">
                      {walletData.positionInfo?.positionKey || 'Unknown'} 
                      {walletData.positionInfo?.positionKey === 'A' && ' (Sovereign)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Kingdom Status:</span>
                    <span className={walletData.positionInfo?.triangleComplete ? 'text-green-400' : 'text-yellow-400'}>
                      {walletData.positionInfo?.triangleComplete ? 'Complete' : 'In Formation'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Positions Filled:</span>
                    <span className="text-blue-400">
                      {walletData.positionInfo?.filledPositions || 0}/15
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <motion.button
                  className={`w-full py-4 px-6 rounded-lg font-bold text-center transition-all ${
                    canRequestPayout()
                      ? 'royal-button'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={() => canRequestPayout() && setShowPayoutModal(true)}
                  disabled={!canRequestPayout()}
                  whileHover={canRequestPayout() ? { scale: 1.05 } : {}}
                  whileTap={canRequestPayout() ? { scale: 0.95 } : {}}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>{canRequestPayout() ? '👑' : '🔒'}</span>
                    <span>{getPayoutButtonText()}</span>
                  </div>
                </motion.button>
                
                {canRequestPayout() && (
                  <motion.p 
                    className="text-center text-sm text-green-400 mt-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    ✨ Your kingdom is ready for the treasury ceremony!
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Transaction History */}
          <motion.div 
            className="glass-morphism rounded-xl p-8 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <motion.span
                className="mr-3 text-3xl"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                📜
              </motion.span>
              Royal Transaction Chronicle
            </h3>
            
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction, index) => (
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
                        {getTypeIcon(transaction.type)}
                      </motion.div>
                      <div>
                        <p className="text-white font-medium">{getTypeLabel(transaction.type)}</p>
                        <p className="text-sm text-gray-400">{transaction.date}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-white font-bold">
                        {transaction.type === 'PAYOUT' ? '-' : '+'}{transaction.amount} USDT
                      </p>
                      <span className={`inline-block px-3 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
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
                transition={{ delay: 1 }}
              >
                <div className="text-6xl mb-4">📜</div>
                <p className="text-gray-400 text-lg">No royal transactions recorded yet</p>
                <p className="text-gray-500 mt-2">Your treasury chronicle will appear here</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Payout Modal */}
      <AnimatePresence>
        {showPayoutModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPayoutModal(false)}
          >
            <motion.div
              className="royal-modal rounded-2xl p-8 max-w-md w-full border border-yellow-500/30"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <motion.div
                  className="text-6xl mb-4 inline-block"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity
                  }}
                >
                  👑
                </motion.div>
                <h3 className="text-2xl font-bold gradient-text mb-2">Royal Treasury Claim</h3>
                <p className="text-gray-300">Specify the amount to withdraw from your royal treasury</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Claim Amount (USDT)
                  </label>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="royal-input w-full"
                    placeholder="Enter amount..."
                    max={walletData.balance}
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {walletData.balance.toFixed(2)} USDT
                  </p>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">⚠️ Royal Decree Warning</h4>
                  <p className="text-sm text-gray-300">
                    Claiming treasury funds from position A will trigger the kingdom division ceremony. 
                    All positions will be redistributed and new triangles formed.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => setShowPayoutModal(false)}
                    className="flex-1 py-3 px-4 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handlePayoutRequest}
                    className="flex-1 royal-button py-3 px-4 rounded-lg font-bold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Submit Royal Claim
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Modal */}
      <AnimatePresence>
        {showTransactionModal && currentTransactionId && (
          <ChessTransactionModal
            transactionId={currentTransactionId}
            type="PAYOUT"
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
        {['💰', '💎', '👑', '🏆', '⚡', '✨'].map((piece, index) => (
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

export default ChessWallet