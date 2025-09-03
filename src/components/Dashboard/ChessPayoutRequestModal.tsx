'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, X, DollarSign, Shield, Clock, Copy, CheckCircle } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'

interface ChessPayoutRequestModalProps {
  onClose: () => void
  onSubmit?: (amount: number, walletAddress: string) => void
  onDepositConfirm?: () => void
  deposit?: {
    transactionId: string
    amount: number
    coin: string
    network: string
    walletAddress: string
    positionId: string
    positionKey: string
    txHash?: string
  }
}

const ChessPayoutRequestModal: React.FC<ChessPayoutRequestModalProps> = ({
  onClose,
  onSubmit,
  onDepositConfirm,
  deposit
}) => {
  const [amount, setAmount] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const { addNotification } = useNotifications()

  const copyToClipboard = async (text: string, itemName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(itemName)
      setTimeout(() => setCopiedItem(null), 3000)
      addNotification({
        userId: 'system',
        title: 'Royal Scroll Updated',
        message: `${itemName} copied to your royal archives`,
        type: 'success',
        read: false
      })
    } catch (err) {
      addNotification({
        userId: 'system',
        title: 'Scroll Error',
        message: 'Failed to copy to royal archives',
        type: 'error',
        read: false
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (deposit) {
      // This is a deposit confirmation
      if (onDepositConfirm) {
        setIsSubmitting(true)
        try {
          await onDepositConfirm()
        } finally {
          setIsSubmitting(false)
        }
      }
      return
    }

    // This is a payout request
    const requestAmount = parseFloat(amount)
    if (!amount || requestAmount <= 0) {
      addNotification({
        userId: 'system',
        title: 'Invalid Royal Decree',
        message: 'Please specify a valid treasury amount to claim',
        type: 'error',
        read: false
      })
      return
    }

    if (onSubmit) {
      setIsSubmitting(true)
      try {
        await onSubmit(requestAmount, '')
        setAmount('')
        onClose()
      } catch (error) {
        console.error('Payout request failed:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="royal-modal rounded-2xl p-8 max-w-lg w-full border border-yellow-500/30"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {deposit ? (
            // Deposit Instructions Mode
            <>
              <div className="text-center mb-8">
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
                  💰
                </motion.div>
                <h2 className="text-3xl font-bold gradient-text mb-2">Complete Royal Tribute</h2>
                <p className="text-gray-300">Send tribute to secure your position in the royal army</p>
              </div>

              <div className="space-y-6">
                {/* Amount */}
                <div className="glass-morphism rounded-xl p-6 border border-green-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">💎</div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Tribute Amount</p>
                        <p className="text-3xl font-bold text-green-400">
                          {deposit.amount} {deposit.coin}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => copyToClipboard(deposit.amount.toString(), 'Amount')}
                      className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {copiedItem === 'Amount' ? (
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      ) : (
                        <Copy className="h-6 w-6 text-gray-300" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Wallet Address */}
                <div className="glass-morphism rounded-xl p-6 border border-blue-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="text-4xl">🏦</div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-400 mb-1">Royal Treasury Vault</p>
                        <p className="font-mono text-lg text-blue-400 break-all">
                          {deposit.walletAddress}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => copyToClipboard(deposit.walletAddress, 'Wallet Address')}
                      className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ml-4"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {copiedItem === 'Wallet Address' ? (
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      ) : (
                        <Copy className="h-6 w-6 text-gray-300" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Network */}
                <div className="glass-morphism rounded-xl p-6 border border-purple-500/30">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">🌐</div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Royal Network</p>
                      <p className="text-xl font-bold text-purple-400">
                        {deposit.network}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full royal-button py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center space-x-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Clock className="h-5 w-5" />
                        </motion.div>
                        <span>Submitting Royal Tribute...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <Crown className="h-5 w-5" />
                        <span>⚔️ I Have Sent the Royal Tribute</span>
                      </span>
                    )}
                  </motion.button>
                </form>
              </div>
            </>
          ) : (
            // Payout Request Mode
            <>
              <div className="text-center mb-8">
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
                  👑
                </motion.div>
                <h2 className="text-3xl font-bold gradient-text mb-2">Request Royal Payout</h2>
                <p className="text-gray-300">Claim your royal treasury earnings</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payout Amount (USDT)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="royal-input pl-10 w-full"
                      placeholder="Enter amount..."
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">Security Notice</span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Payout requests are processed securely and require admin approval for security purposes.
                  </p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-400">Processing Time</span>
                  </div>
                  <p className="text-xs text-gray-300">
                    All payout requests may take 24-48 hours to complete and will trigger triangle cycling.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                    className="flex-1 royal-button py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  >
                    {isSubmitting ? 'Processing...' : 'Request Payout'}
                  </motion.button>
                </div>
              </form>
            </>
          )}

          {/* Close Button */}
          <motion.button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="h-6 w-6 text-gray-300" />
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ChessPayoutRequestModal