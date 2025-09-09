'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import ChessJoinTriangleModal from '@/components/Modals/ChessJoinTriangleModal'

const WithdrawalProcessing: React.FC = () => {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(10)
  const [showJoinModal, setShowJoinModal] = useState(false)

  useEffect(() => {
    // Check if user should be on this page
    if (!user || !user.hasPendingWithdrawal) {
      router.push('/dashboard')
      return
    }

    // Redirect to login if user account is deleted (old logic)
    if (user && (user.deletedAt || !user.isActive)) {
      logout()
      router.push('/login')
      return
    }

    // Countdown timer for automatic refresh
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Refresh the page to check for status updates
          window.location.reload()
          return 10
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [user, router, logout])

  // If user doesn't have a pending withdrawal, don't render anything
  if (!user || !user.hasPendingWithdrawal) {
    return null
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <div className="chess-board-pattern absolute inset-0 opacity-5"></div>
      
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="glass-morphism rounded-2xl p-8 border border-white/10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="text-6xl mb-6 inline-block"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            ⏳
          </motion.div>
          
          <h1 className="text-3xl font-bold gradient-text mb-4">
            Withdrawal Processing
          </h1>
          
          <p className="text-xl text-gray-300 mb-6">
            Your treasury withdrawal is currently being processed by our administrative team.
          </p>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-blue-400 mb-2">Transaction Details</h3>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-400">Transaction ID:</span>
                <span className="text-white font-mono">
                  {user.withdrawalTransaction?.transactionId || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white font-bold">
                  {user.withdrawalTransaction?.amount || 0} USDT
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-yellow-400 font-bold">
                  {user.withdrawalTransaction?.status || 'PENDING'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Destination:</span>
                <span className="text-white font-mono text-sm">
                  {user.walletAddress}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-400 mb-6">
            Once the administrative team confirms your withdrawal, you'll be able to join a new triangle formation.
          </p>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <p className="text-yellow-400 text-sm">
              ⚠️ After confirmation, you can join a new triangle with the same account. 
              Your username and wallet address will remain unchanged.
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <span>Refreshing in</span>
            <span className="text-blue-400 font-bold">{timeLeft}</span>
            <span>seconds...</span>
          </div>
        </motion.div>
      </div>

      {/* Join Triangle Modal for post-withdrawal */}
      {showJoinModal && (
        <ChessJoinTriangleModal
          onClose={() => setShowJoinModal(false)}
          onJoinSuccess={() => {
            setShowJoinModal(false)
            router.push('/dashboard')
          }}
        />
      )}
    </div>
  )
}

export default WithdrawalProcessing