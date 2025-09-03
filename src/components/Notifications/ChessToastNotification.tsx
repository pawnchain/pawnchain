'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, AlertCircle, Info, X, Crown, Shield, Sword } from 'lucide-react'
import { Notification } from '@/types'

interface ChessToastNotificationProps {
  notification: Notification
  onClose: (id: string) => void
}

const ChessToastNotification: React.FC<ChessToastNotificationProps> = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification.type !== 'error') {
      const timer = setTimeout(() => {
        onClose(notification.id)
      }, 6000)

      return () => clearTimeout(timer)
    }
  }, [notification.id, notification.type, onClose])

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-400" />
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-400" />
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-400" />
      default:
        return <Info className="h-6 w-6 text-blue-400" />
    }
  }

  const getBgGradient = () => {
    switch (notification.type) {
      case 'success':
        return 'from-green-500/20 to-green-600/10 border-green-500/30'
      case 'error':
        return 'from-red-500/20 to-red-600/10 border-red-500/30'
      case 'warning':
        return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30'
      default:
        return 'from-blue-500/20 to-blue-600/10 border-blue-500/30'
    }
  }

  const getChessPiece = () => {
    switch (notification.type) {
      case 'success':
        return '👑'
      case 'error':
        return '💀'
      case 'warning':
        return '⚠️'
      default:
        return '📜'
    }
  }

  return (
    <motion.div
      className={`glass-morphism-strong rounded-xl border ${getBgGradient()} shadow-2xl pointer-events-auto overflow-hidden`}
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      layout
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <motion.div
            className="flex-shrink-0 mt-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            {getIcon()}
          </motion.div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <motion.p 
                  className="text-sm font-bold text-white mb-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {notification.title}
                </motion.p>
                <motion.p 
                  className="text-sm text-gray-300 leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {notification.message}
                </motion.p>
              </div>
              
              {/* Chess piece decoration */}
              <motion.div
                className="text-2xl opacity-30 ml-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {getChessPiece()}
              </motion.div>
            </div>
          </div>
          
          {/* Close Button */}
          <motion.button
            className="flex-shrink-0 p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => onClose(notification.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <X className="h-4 w-4 text-gray-300" />
          </motion.button>
        </div>
      </div>
      
      {/* Progress bar for auto-dismiss */}
      {notification.type !== 'error' && (
        <motion.div
          className="h-1 bg-gradient-to-r from-yellow-500 to-yellow-600"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 6, ease: "linear" }}
        />
      )}
    </motion.div>
  )
}

export default ChessToastNotification