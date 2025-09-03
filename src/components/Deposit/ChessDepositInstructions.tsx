'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Copy, CheckCircle, Crown, Wallet, Shield, AlertTriangle } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import ChessTransactionModal from '@/components/Modals/ChessTransactionModal'

interface DepositInfo {
  positionId: string
  positionKey: string
  amount: number
  coin: string
  walletAddress: string
  network: string
  transactionId: string
  txHash?: string
}

interface ChessDepositInstructionsProps {
  depositInfo: DepositInfo
  onModalClose?: () => void
  onAccountDelete?: () => void
}

const ChessDepositInstructions: React.FC<ChessDepositInstructionsProps> = ({
  depositInfo,
  onModalClose,
  onAccountDelete
}) => {
  const [isConfirming, setIsConfirming] = useState(false)
  const [showModal, setShowModal] = useState(false)
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

  const handleDepositConfirmation = async () => {
    setIsConfirming(true)
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: depositInfo.transactionId })
      })

      if (response.ok) {
        setShowModal(true)
        addNotification({
          userId: 'system',
          title: 'Tribute Submitted',
          message: 'The royal treasury is reviewing your tribute. Await royal approval.',
          type: 'info',
          read: false
        })
      } else {
        throw new Error('Failed to submit deposit confirmation')
      }
    } catch (error) {
      addNotification({
        userId: 'system',
        title: 'Tribute Error',
        message: 'Failed to submit tribute confirmation. Please try again.',
        type: 'error',
        read: false
      })
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <>
      <div className="min-h-screen relative">
        <div className="chess-board-pattern absolute inset-0 opacity-5"></div>
        
        <div className="relative py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="glass-morphism-strong rounded-2xl p-8 border border-yellow-500/30"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Header */}
              <motion.div 
                className="text-center mb-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-yellow-500/30"
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
                  <Clock className="h-12 w-12 text-yellow-400" />
                </motion.div>
                <h1 className="text-4xl font-bold gradient-text mb-3">
                  Complete Royal Tribute
                </h1>
                <p className="text-xl text-gray-300">
                  Send tribute to secure your position in the royal army
                </p>
              </motion.div>

              {/* Position Info */}
              <motion.div 
                className="glass-morphism rounded-xl p-6 mb-8 border border-purple-500/30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Crown className="h-6 w-6 text-yellow-400" />
                  <span>Your Royal Assignment</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-4 rounded-lg bg-white/5">
                    <p className="text-sm text-gray-400 mb-2">Battle Position</p>
                    <motion.p 
                      className="text-3xl font-bold text-purple-400"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {depositInfo.positionKey}
                    </motion.p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/5">
                    <p className="text-sm text-gray-400 mb-2">Royal Seal ID</p>
                    <p className="font-mono text-lg text-gray-300">
                      {depositInfo.positionId.slice(-8)}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Payment Instructions */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Wallet className="h-7 w-7 text-yellow-400" />
                  <span>Royal Treasury Instructions</span>
                </h3>
                
                <div className="grid gap-6">
                  {/* Amount Card */}
                  <motion.div 
                    className="glass-morphism rounded-xl p-6 border border-green-500/30"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">💰</div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Tribute Amount</p>
                          <p className="text-3xl font-bold text-green-400">
                            {depositInfo.amount} {depositInfo.coin}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => copyToClipboard(depositInfo.amount.toString(), 'Amount')}
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
                  </motion.div>

                  {/* Wallet Address Card */}
                  <motion.div 
                    className="glass-morphism rounded-xl p-6 border border-blue-500/30"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="text-4xl">🏦</div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-400 mb-1">Royal Treasury Vault</p>
                          <p className="font-mono text-lg text-blue-400 break-all">
                            {depositInfo.walletAddress}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => copyToClipboard(depositInfo.walletAddress, 'Wallet Address')}
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
                  </motion.div>

                  {/* Network Card */}
                  <motion.div 
                    className="glass-morphism rounded-xl p-6 border border-purple-500/30"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">🌐</div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Royal Network</p>
                          <p className="text-xl font-bold text-purple-400">
                            {depositInfo.network}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Transaction ID Card */}
                  <motion.div 
                    className="glass-morphism rounded-xl p-6 border border-yellow-500/30"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="text-4xl">📜</div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-400 mb-1">Royal Scroll ID (For Support)</p>
                          <p className="font-mono text-lg text-yellow-400">
                            {depositInfo.txHash || `DP${depositInfo.transactionId.slice(-5)}`}
                          </p>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => copyToClipboard(depositInfo.txHash || depositInfo.transactionId, 'Transaction ID')}
                        className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ml-4"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {copiedItem === 'Transaction ID' ? (
                          <CheckCircle className="h-6 w-6 text-green-400" />
                        ) : (
                          <Copy className="h-6 w-6 text-gray-300" />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                </div>

                {/* Royal Warnings */}
                <motion.div 
                  className="bg-gradient-to-r from-red-500/15 to-yellow-500/15 border border-red-500/30 rounded-xl p-6 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-7 w-7 text-red-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-red-400 mb-3 text-lg">
                        Royal Decree & Warnings:
                      </h4>
                      <ul className="text-sm text-gray-300 space-y-2">
                        <li className="flex items-start space-x-2">
                          <span className="text-yellow-400">⚔️</span>
                          <span>Send the EXACT tribute amount specified above</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-400">🌐</span>
                          <span>Use the {depositInfo.network} network only</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-green-400">🛡️</span>
                          <span>Your royal position is permanently reserved (no time limit)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-purple-400">📜</span>
                          <span>Keep your scroll ID for royal support purposes</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-orange-400">⚡</span>
                          <span>Only declare tribute sent after making the payment</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-400">💀</span>
                          <span className="font-bold">Lesser tribute = account banishment & gold forfeiture</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-400">🏰</span>
                          <span>Send from your registered royal vault to avoid rejection</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>

                {/* Confirmation Button */}
                <motion.div 
                  className="mt-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  <motion.button
                    onClick={handleDepositConfirmation}
                    disabled={isConfirming}
                    className="w-full royal-button py-6 px-8 rounded-xl font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    whileHover={!isConfirming ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!isConfirming ? { scale: 0.98 } : {}}
                  >
                    {isConfirming ? (
                      <motion.div
                        className="flex items-center justify-center space-x-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Clock className="h-6 w-6" />
                        </motion.div>
                        <span>Royal Processing...</span>
                      </motion.div>
                    ) : (
                      <span className="flex items-center justify-center space-x-3">
                        <Crown className="h-6 w-6" />
                        <span>⚔️ I Have Sent the Royal Tribute</span>
                      </span>
                    )}
                  </motion.button>
                  
                  <motion.p 
                    className="text-center text-gray-400 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                  >
                    Only declare tribute sent after you have completed the payment.
                    <br />
                    <span className="text-yellow-400 font-medium">
                      You will see a royal confirmation that cannot be dismissed until the treasury processes your tribute.
                    </span>
                  </motion.p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Floating Chess Pieces */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {['♔', '♕', '♗', '♘', '♖', '♙'].map((piece, index) => (
            <motion.div
              key={index}
              className="absolute text-8xl text-white/5"
              style={{
                left: `${5 + (index * 15)}%`,
                top: `${10 + (index * 12)}%`,
              }}
              animate={{
                y: [0, -40, 0],
                rotate: [0, 180, 360],
                opacity: [0.05, 0.15, 0.05],
              }}
              transition={{
                duration: 10 + index * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.7,
              }}
            >
              {piece}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Transaction Modal */}
      <AnimatePresence>
        {showModal && (
          <ChessTransactionModal
            transactionId={depositInfo.transactionId}
            type="DEPOSIT"
            onClose={() => {
              setShowModal(false)
              onModalClose?.()
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default ChessDepositInstructions