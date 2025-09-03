'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ChessProgressBarProps {
  current: number
  total: number
  label: string
  color?: 'gold' | 'blue' | 'green' | 'purple' | 'red'
}

const ChessProgressBar: React.FC<ChessProgressBarProps> = ({ 
  current, 
  total, 
  label, 
  color = 'gold' 
}) => {
  const percentage = Math.min((current / total) * 100, 100)
  
  const colorClasses = {
    gold: 'from-yellow-500 to-yellow-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
  }

  const glowClasses = {
    gold: 'shadow-yellow-500/30',
    blue: 'shadow-blue-500/30',
    green: 'shadow-green-500/30',
    purple: 'shadow-purple-500/30',
    red: 'shadow-red-500/30',
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <motion.div
            className="text-xl"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            ⚔️
          </motion.div>
          <span className="text-lg font-bold text-white">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-yellow-400">
            {current.toFixed(1)}%
          </span>
          <p className="text-xs text-gray-400">
            {Math.floor(percentage * 15 / 100)}/15 positions
          </p>
        </div>
      </div>
      
      <div className="relative">
        <div className="royal-progress h-6 rounded-full">
          <motion.div
            className={`royal-progress-fill bg-gradient-to-r ${colorClasses[color]} rounded-full relative overflow-hidden`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ 
              boxShadow: `0 0 20px ${glowClasses[color].replace('shadow-', '').replace('/30', '')}30`
            }}
          >
            {/* Animated shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
        
        {/* Progress markers */}
        <div className="absolute top-0 left-0 w-full h-6 flex items-center">
          {[25, 50, 75].map((mark) => (
            <motion.div
              key={mark}
              className="absolute w-0.5 h-8 bg-white/20"
              style={{ left: `${mark}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: percentage > mark ? 1 : 0.3 }}
              transition={{ delay: 1 }}
            />
          ))}
        </div>
      </div>
      
      {/* Progress milestones */}
      <div className="flex justify-between mt-3 text-xs text-gray-400">
        <span className={percentage >= 25 ? 'text-yellow-400' : ''}>Quarter</span>
        <span className={percentage >= 50 ? 'text-yellow-400' : ''}>Half</span>
        <span className={percentage >= 75 ? 'text-yellow-400' : ''}>Three-Quarters</span>
        <span className={percentage >= 100 ? 'text-green-400 font-bold' : ''}>Victory!</span>
      </div>
    </div>
  )
}

export default ChessProgressBar