'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Search, Filter, Eye } from 'lucide-react'

interface Transaction {
  id: string
  userId: string
  user: string
  type: 'DEPOSIT' | 'PAYOUT' | 'REFERRAL' | 'BONUS' | 'REFUND'
  amount: number
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'
  txHash?: string
  plan: string
  walletAddress?: string
  createdAt: string
  expiresAt?: string
}

const ChessAdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/transactions')
        if (response.ok) {
          const data = await response.json()
          // Check if data is an array or has a transactions property
          if (Array.isArray(data)) {
            setTransactions(data)
          } else if (data && data.transactions && Array.isArray(data.transactions)) {
            setTransactions(data.transactions)
          } else {
            setTransactions([])
          }
        } else {
          // Handle HTTP errors properly instead of showing mock data
          console.error('Failed to fetch transactions:', response.status, response.statusText)
          setTransactions([])
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
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
      case 'COMPLETED':
      case 'CONFIRMED':
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
      case 'REFERRAL':
        return '👥'
      default:
        return '💰'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'Royal Deposit'
      case 'PAYOUT':
        return 'Treasury Withdrawal'
      case 'REFERRAL':
        return 'Recruitment Bonus'
      default:
        return 'Transaction'
    }
  }

  const filteredTransactions = transactions ? transactions.filter(transaction => {
    const matchesSearch = (transaction.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false
    const matchesType = filterType === 'all' || transaction.type === filterType
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  }) : []

  const handleTransactionAction = async (transactionId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: action === 'approve' ? 'CONFIRMED' : 'REJECTED' 
        })
      })
      
      if (response.ok) {
        // Update transaction status in local state
        setTransactions(transactions.map(transaction => 
          transaction.id === transactionId 
            ? { ...transaction, status: action === 'approve' ? 'CONFIRMED' : 'REJECTED' }
            : transaction
        ))
      } else {
        // Handle HTTP errors
        const errorData = await response.json()
        console.error('Failed to update transaction:', errorData)
        alert(`Failed to ${action} transaction: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to update transaction:', error)
      alert(`Network error. Failed to ${action} transaction. Please try again.`)
    }
  }

  const totalAmounts = {
    deposits: transactions ? transactions.filter(t => t.type === 'DEPOSIT').reduce((sum, t) => sum + t.amount, 0) : 0,
    payouts: transactions ? transactions.filter(t => t.type === 'PAYOUT').reduce((sum, t) => sum + t.amount, 0) : 0,
    referrals: transactions ? transactions.filter(t => t.type === 'REFERRAL').reduce((sum, t) => sum + t.amount, 0) : 0,
    pending: transactions ? transactions.filter(t => t.status === 'PENDING').length : 0
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
              <span className="text-lg">Examining royal treasury records...</span>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-text flex items-center">
                  <motion.span
                    className="mr-3 text-4xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    💰
                  </motion.span>
                  Royal Treasury Ledger
                </h1>
                <p className="text-gray-400 mt-2">Monitor and manage all kingdom financial transactions</p>
              </div>
              
              <motion.div
                className="text-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-2xl font-bold text-white">{transactions ? transactions.length : 0}</p>
                <p className="text-sm text-gray-400">Total Transactions</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: 'Total Deposits',
                value: `${totalAmounts.deposits.toFixed(2)} USDT`,
                icon: '⬇️',
                color: 'text-blue-400',
                bgGradient: 'from-blue-500/20 to-blue-600/10'
              },
              {
                title: 'Total Payouts',
                value: `${totalAmounts.payouts.toFixed(2)} USDT`,
                icon: '⬆️',
                color: 'text-green-400',
                bgGradient: 'from-green-500/20 to-green-600/10'
              },
              {
                title: 'Referral Bonuses',
                value: `${totalAmounts.referrals.toFixed(2)} USDT`,
                icon: '👥',
                color: 'text-purple-400',
                bgGradient: 'from-purple-500/20 to-purple-600/10'
              },
              {
                title: 'Pending Actions',
                value: totalAmounts.pending,
                icon: '⏳',
                color: 'text-yellow-400',
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
                    <p className="text-xl font-bold text-white">{item.value}</p>
                  </div>
                  <motion.div
                    className="text-3xl"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: index === 3 ? [0, 10, -10, 0] : 0
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

          {/* Filters */}
          <motion.div 
            className="glass-morphism rounded-xl p-6 border border-white/10 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by user, transaction ID, or wallet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="royal-input pl-10 w-full"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="royal-input w-full"
              >
                <option value="all">All Types</option>
                <option value="DEPOSIT">Deposits ⬇️</option>
                <option value="PAYOUT">Payouts ⬆️</option>
                <option value="REFERRAL">Referrals 👥</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="royal-input w-full"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            
            <div className="mt-4 text-sm text-gray-400">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
          </motion.div>

          {/* Transactions Table */}
          <motion.div 
            className="glass-morphism rounded-xl border border-white/10 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-b border-yellow-500/30">
                    <th className="text-left p-4 font-bold text-yellow-400">Transaction</th>
                    <th className="text-left p-4 font-bold text-yellow-400">Noble</th>
                    <th className="text-left p-4 font-bold text-yellow-400">Type</th>
                    <th className="text-left p-4 font-bold text-yellow-400">Amount</th>
                    <th className="text-left p-4 font-bold text-yellow-400">Status</th>
                    <th className="text-left p-4 font-bold text-yellow-400">Date</th>
                    <th className="text-left p-4 font-bold text-yellow-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-white text-sm">{transaction.txHash || 'Internal'}</p>
                          <p className="text-xs text-gray-400">{transaction.walletAddress}</p>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <motion.div
                            className="text-2xl"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                          >
                            {getPlanPiece(transaction.plan)}
                          </motion.div>
                          <div>
                            <p className="font-bold text-white">{transaction.user}</p>
                            <p className="text-xs text-gray-400">{transaction.plan} Plan</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getTypeIcon(transaction.type)}</span>
                          <span className="text-white">{getTypeLabel(transaction.type)}</span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <p className="text-white font-bold">
                          {transaction.type === 'PAYOUT' ? '-' : '+'}{transaction.amount} USDT
                        </p>
                      </td>
                      
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div>
                          <p className="text-gray-400 text-sm">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <motion.button
                            onClick={() => {
                              setSelectedTransaction(transaction)
                              setShowTransactionModal(true)
                            }}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          
                          {transaction.status === 'PENDING' && (
                            <>
                              <motion.button
                                onClick={() => handleTransactionAction(transaction.id, 'approve')}
                                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </motion.button>
                              
                              <motion.button
                                onClick={() => handleTransactionAction(transaction.id, 'reject')}
                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredTransactions.length === 0 && (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-6xl mb-4">💰</div>
                <p className="text-gray-400 text-lg">No transactions found</p>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <AnimatePresence>
        {showTransactionModal && selectedTransaction && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTransactionModal(false)}
          >
            <motion.div
              className="royal-modal rounded-2xl p-8 max-w-2xl w-full border border-yellow-500/30 max-h-[80vh] overflow-y-auto"
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
                  {getTypeIcon(selectedTransaction.type)}
                </motion.div>
                <h3 className="text-2xl font-bold gradient-text mb-2">
                  {getTypeLabel(selectedTransaction.type)} Details
                </h3>
                <p className="text-gray-300">Royal Transaction Archive</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-bold text-yellow-400 mb-2">Transaction Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">ID:</span>
                        <span className="text-white">{selectedTransaction.id || 'Internal'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-blue-400">{getTypeLabel(selectedTransaction.type)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white font-bold">
                          {selectedTransaction.type === 'payout' ? '-' : '+'}{selectedTransaction.amount} USDT
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={getStatusColor(selectedTransaction.status).includes('green') ? 'text-green-400' : 
                                        getStatusColor(selectedTransaction.status).includes('yellow') ? 'text-yellow-400' : 'text-red-400'}>
                          {selectedTransaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-bold text-green-400 mb-2">Timing Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white">{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
                      </div>
                      {selectedTransaction.expiresAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Expires:</span>
                          <span className="text-yellow-400">{new Date(selectedTransaction.expiresAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-bold text-purple-400 mb-2">User Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Username:</span>
                        <span className="text-white">{selectedTransaction.user}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Plan:</span>
                        <span className="text-blue-400">{selectedTransaction.plan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">User ID:</span>
                        <span className="text-white">{selectedTransaction.userId}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-bold text-blue-400 mb-2">Wallet Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Address:</span>
                        <p className="text-white font-mono text-xs mt-1 break-all">{selectedTransaction.walletAddress}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center space-x-3">
                {selectedTransaction.status === 'PENDING' && (
                  <>
                    <motion.button
                      onClick={() => {
                        handleTransactionAction(selectedTransaction.id, 'approve')
                        setShowTransactionModal(false)
                      }}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Approve Transaction
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        handleTransactionAction(selectedTransaction.id, 'reject')
                        setShowTransactionModal(false)
                      }}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Reject Transaction
                    </motion.button>
                  </>
                )}
                <motion.button
                  onClick={() => setShowTransactionModal(false)}
                  className="royal-button px-6 py-2 rounded-lg font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close Details
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chess Pieces */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['💰', '⬇️', '⬆️', '👥', '📊', '💎'].map((piece, index) => (
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

export default ChessAdminTransactions