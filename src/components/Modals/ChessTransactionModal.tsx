'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle, XCircle, AlertTriangle, Crown, Skull } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'

interface TransactionStatus {
  id: string
  type: string
  amount: number
  status: string
  message: string
  closable: boolean
  deleteAccount: boolean
  rejectionReason?: string
}

interface ChessTransactionModalProps {
  transactionId: string
  type: 'DEPOSIT' | 'PAYOUT'
  onClose?: () => void
}

const ChessTransactionModal: React.FC<ChessTransactionModalProps> = ({
  transactionId,
  type,
  onClose
}) => {
  const [status, setStatus] = useState<TransactionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { logout } = useAuth()
  const { addNotification } = useNotifications()

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/transactions/${transactionId}/status`)
        if (response.ok) {
          const data = await response.json()
          setStatus(data)
          setLoading(false)
        } else {
          setError('Failed to check transaction status')
          setLoading(false)
        }
      } catch (err) {
        setError('Network error')
        setLoading(false)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [transactionId])

  const handleClose = async () => {
    if (!status?.closable) return

    if (status.deleteAccount) {
      try {
        const response = await fetch('/api/user/delete-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            transactionId,
            reason: `Modal closed after ${type} ${status.status}`
          })
        })

        if (response.ok) {
          addNotification({
            userId: 'system',
            title: 'Kingdom Banishment',
            message: 'Your account has been dissolved. You may seek redemption by rejoining.',
            type: 'info',
            read: false
          })
          
          await logout()
          window.dispatchEvent(new CustomEvent('navigate', { detail: 'register' }))
        } else {
          throw new Error('Failed to delete account')
        }
      } catch (err) {
        addNotification({
          userId: 'system',
          title: 'Banishment Failed',
          message: 'Failed to process account dissolution',
          type: 'error',
          read: false
        })
      }
    } else {
      onClose?.()
    }
  }

  const getStatusIcon = () => {
    if (loading) return <Clock className="h-12 w-12 text-blue-400 animate-spin" />
    
    switch (status?.status) {
      case 'PENDING':
        return (
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Clock className="h-12 w-12 text-yellow-400" />
          </motion.div>
        )
      case 'CONFIRMED':
      case 'COMPLETED':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="h-12 w-12 text-green-400" />
          </motion.div>
        )
      case 'REJECTED':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <XCircle className="h-12 w-12 text-red-400" />
          </motion.div>
        )
      default:
        return <AlertTriangle className="h-12 w-12 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (status?.status) {
      case 'PENDING':
        return 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5'
      case 'CONFIRMED':
      case 'COMPLETED':
        return 'border-green-500/50 bg-gradient-to-br from-green-500/10 to-green-600/5'
      case 'REJECTED':
        return 'border-red-500/50 bg-gradient-to-br from-red-500/10 to-red-600/5'
      default:
        return 'border-gray-500/50 bg-gradient-to-br from-gray-500/10 to-gray-600/5'
    }
  }

  const getStatusTitle = () => {
    switch (status?.status) {
      case 'PENDING':
        return type === 'DEPOSIT' ? 'Royal Tribute Processing' : 'Treasury Withdrawal Processing'
      case 'CONFIRMED':
      case 'COMPLETED':
        return type === 'DEPOSIT' ? 'Tribute Accepted!' : 'Treasury Granted!'
      case 'REJECTED':
        return type === 'DEPOSIT' ? 'Tribute Rejected' : 'Withdrawal Denied'
      default:
        return 'Royal Processing'
    }
  }

  if (error) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="royal-modal rounded-2xl p-8 max-w-md w-full border border-red-500/50"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="text-center">
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                💀
              </motion.div>
              <h3 className="text-2xl font-bold text-red-400 mb-4">Royal Scroll Error</h3>
              <p className="text-gray-300 mb-6">{error}</p>
              <motion.button
                onClick={() => window.location.reload()}
                className="px-6 py-3 btn-danger rounded-xl font-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Retry Quest
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
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
          className={`royal-modal rounded-2xl p-8 max-w-lg w-full border-2 ${getStatusColor()}`}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="text-center">
            {/* Status Icon */}
            <motion.div
              className="mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              {getStatusIcon()}
            </motion.div>
            
            {/* Title */}
            <motion.h3 
              className="text-2xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {getStatusTitle()}
            </motion.h3>
            
            {/* Transaction ID */}
            <motion.div 
              className="glass-morphism rounded-xl p-4 mb-6 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-sm text-gray-400 mb-1">Royal Scroll ID</p>
              <p className="font-mono text-lg font-bold text-yellow-400">{transactionId}</p>
            </motion.div>

            {status && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {/* Amount */}
                <div className="mb-6">
                  <p className="text-3xl font-bold text-white mb-2">
                    {status.amount.toFixed(2)} USDT
                  </p>
                  <p className="text-lg text-gray-300">
                    Status: <span className={`font-bold ${
                      status.status === 'COMPLETED' ? 'text-green-400' :
                      status.status === 'PENDING' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>{status.status}</span>
                  </p>
                </div>

                {/* Message */}
                <motion.div 
                  className="glass-morphism rounded-xl p-6 mb-6 border border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-gray-300 leading-relaxed">
                    {status.message}
                  </p>
                  
                  {status.rejectionReason && (
                    <motion.div 
                      className="mt-4 p-4 bg-gradient-to-r from-red-500/20 to-red-600/10 border border-red-500/30 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <div className="flex items-start space-x-2">
                        <Skull className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-400 font-bold text-sm mb-1">Royal Judgment:</p>
                          <p className="text-red-300 text-sm">{status.rejectionReason}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Action Button */}
                {status.closable ? (
                  <motion.button
                    onClick={handleClose}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                      status.deleteAccount
                        ? 'btn-danger'
                        : 'btn-success'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    {status.deleteAccount ? (
                      <span className="flex items-center justify-center space-x-2">
                        <Skull className="h-5 w-5" />
                        <span>Accept Banishment</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <Crown className="h-5 w-5" />
                        <span>Return to Kingdom</span>
                      </span>
                    )}
                  </motion.button>
                ) : (
                  <motion.div 
                    className="flex items-center justify-center space-x-3 text-gray-400 py-4"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Clock className="h-6 w-6" />
                    </motion.div>
                    <span className="text-lg font-medium">Royal deliberation in progress...</span>
                  </motion.div>
                )}
              </motion.div>
            )}
            
            {loading && (
              <motion.div 
                className="flex items-center justify-center space-x-3 text-gray-400 py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="loading-spinner w-8 h-8"></div>
                <span className="text-lg">Consulting the royal archives...</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ChessTransactionModal