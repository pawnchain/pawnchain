'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Share2, X, Crown, Users, CheckCircle } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'

interface ChessReferralModalProps {
  referralCode: string
  onClose: () => void
}

const ChessReferralModal: React.FC<ChessReferralModalProps> = ({ referralCode, onClose }) => {
  const [copied, setCopied] = useState(false)
  const { addNotification } = useNotifications()

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode)
      setCopied(true)
      addNotification({
        userId: 'system',
        title: 'Royal Decree Copied',
        message: 'Referral code copied to your royal scroll',
        type: 'success',
        read: false
      })
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      addNotification({
        userId: 'system',
        title: 'Scroll Error',
        message: 'Failed to copy referral code',
        type: 'error',
        read: false
      })
    }
  }

  const handleShare = async () => {
    const shareText = `Join me in the ForgeChain Kingdom! Use my royal referral code: ${referralCode}`
    const shareUrl = `${window.location.origin}/register?ref=${referralCode}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join ForgeChain Kingdom',
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl)
        addNotification({
          userId: 'system',
          title: 'Royal Invitation Copied',
          message: 'Recruitment link copied to your scroll',
          type: 'success',
          read: false
        })
      } catch (error) {
        addNotification({
          userId: 'system',
          title: 'Recruitment Failed',
          message: 'Could not copy recruitment link',
          type: 'error',
          read: false
        })
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
          {/* Header */}
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
            <h2 className="text-3xl font-bold gradient-text mb-2">Royal Recruitment</h2>
            <p className="text-gray-300">Expand your kingdom and earn royal commissions</p>
          </div>

          {/* Referral Code Display */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Your Royal Decree Code
            </label>
            <div className="relative">
              <div className="glass-morphism rounded-xl p-4 border border-yellow-500/30">
                <div className="flex items-center justify-between">
                  <motion.code 
                    className="text-2xl font-mono font-bold gradient-text tracking-wider"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {referralCode}
                  </motion.code>
                  <motion.button
                    onClick={handleCopyCode}
                    className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {copied ? (
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    ) : (
                      <Copy className="h-6 w-6 text-gray-300" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            <motion.button
              onClick={handleCopyCode}
              className="w-full royal-button py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Copy className="h-5 w-5" />
              <span>Copy Royal Code</span>
            </motion.button>
            
            <motion.button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-500 hover:to-blue-500 transition-all duration-300 flex items-center justify-center space-x-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Share2 className="h-5 w-5" />
              <span>Share Kingdom Invitation</span>
            </motion.button>
          </div>

          {/* How It Works */}
          <div className="glass-morphism rounded-xl p-6 border border-white/10 mb-6">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              <span>Royal Recruitment Process</span>
            </h4>
            <div className="space-y-3">
              {[
                { step: 1, text: 'Share your royal decree code with worthy allies', icon: '📜' },
                { step: 2, text: 'They join your kingdom using your code', icon: '🏰' },
                { step: 3, text: 'Earn 10% commission on their tribute', icon: '💰' },
                { step: 4, text: 'Build your empire and claim greater rewards', icon: '👑' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    {item.step}
                  </div>
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-lg">{item.icon}</span>
                    <p className="text-sm text-gray-300">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

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

export default ChessReferralModal