'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Crown, Shield, Sword, Castle } from 'lucide-react'

interface TriangleUser {
  id: string
  username: string
  plan: string
}

interface ChessTriangleVisualizationProps {
  data: {
    positions: (TriangleUser | null)[]
    currentUserPosition: number
    completion: number
  }
}

const ChessTriangleVisualization: React.FC<ChessTriangleVisualizationProps> = ({ data }) => {
  const { positions, currentUserPosition } = data

  const levels = [
    { start: 0, count: 1, label: 'Supreme Commander' },
    { start: 1, count: 2, label: 'Royal Generals' },
    { start: 3, count: 4, label: 'Elite Captains' },
    { start: 7, count: 8, label: 'Brave Warriors' },
  ]

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'King': return Crown
      case 'Queen': return Shield
      case 'Bishop': return Sword
      case 'Knight': return Castle
      default: return Crown
    }
  }

  const getPlanPiece = (plan: string) => {
    switch (plan) {
      case 'King': return '♔'
      case 'Queen': return '♕'
      case 'Bishop': return '♗'
      case 'Knight': return '♘'
      default: return '♙'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'King': return 'from-yellow-500 to-yellow-600'
      case 'Queen': return 'from-purple-500 to-purple-600'
      case 'Bishop': return 'from-green-500 to-green-600'
      case 'Knight': return 'from-blue-500 to-blue-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const renderPosition = (position: TriangleUser | null, index: number, levelIndex: number) => {
    const isCurrentUser = index === currentUserPosition
    const isEmpty = position === null
    const PlanIcon = position ? getPlanIcon(position.plan) : Crown

    return (
      <motion.div
        key={index}
        className={`
          triangle-position relative w-16 h-16 rounded-xl border-2 transition-all duration-300 cursor-pointer
          ${isEmpty 
            ? 'border-dashed border-white/30 bg-white/5 hover:bg-white/10' 
            : isCurrentUser
            ? 'triangle-node current-user border-purple-500 bg-gradient-to-br from-purple-500/30 to-purple-600/20'
            : 'triangle-node filled border-yellow-500/60 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10'
          }
          flex items-center justify-center group
        `}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          delay: levelIndex * 0.2 + (index - levels[levelIndex].start) * 0.1,
          type: "spring",
          stiffness: 200,
          damping: 15
        }}
        whileHover={{ 
          scale: 1.15,
          rotate: isEmpty ? 0 : 5,
          zIndex: 20
        }}
        whileTap={{ scale: 0.95 }}
      >
        {isEmpty ? (
          <motion.div 
            className="text-white/40 text-2xl font-bold"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            +
          </motion.div>
        ) : (
          <motion.div
            className="text-3xl chess-piece-shadow"
            animate={{ 
              rotate: isCurrentUser ? [0, 5, -5, 0] : 0,
              scale: isCurrentUser ? [1, 1.1, 1] : 1
            }}
            transition={{ 
              duration: isCurrentUser ? 3 : 0,
              repeat: isCurrentUser ? Infinity : 0
            }}
          >
            {getPlanPiece(position.plan)}
          </motion.div>
        )}
        
        {/* Tooltip */}
        <motion.div 
          className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 px-3 py-2 glass-morphism rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 border border-white/20"
          initial={{ y: 10 }}
          whileHover={{ y: 0 }}
        >
          <div className="text-center">
            <p className="text-sm font-bold text-white">
              {isCurrentUser ? 'Your Position' : isEmpty ? 'Vacant Position' : position.username}
            </p>
            {!isEmpty && (
              <p className="text-xs text-gray-300">{position.plan} Rank</p>
            )}
            <p className="text-xs text-yellow-400">Position {index + 1}</p>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/20"></div>
        </motion.div>
        
        {/* Position number badge */}
        <motion.div 
          className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-gray-800 to-gray-900 text-white text-xs rounded-full flex items-center justify-center font-bold border border-white/20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: levelIndex * 0.2 + (index - levels[levelIndex].start) * 0.1 + 0.3 }}
        >
          {index + 1}
        </motion.div>

        {/* Rank indicator for filled positions */}
        {!isEmpty && (
          <motion.div 
            className={`absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br ${getPlanColor(position.plan)} rounded-full flex items-center justify-center border border-white/30`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: levelIndex * 0.2 + (index - levels[levelIndex].start) * 0.1 + 0.5 }}
          >
            <PlanIcon className="h-3 w-3 text-white" />
          </motion.div>
        )}

        {/* Current user glow effect */}
        {isCurrentUser && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 -z-10"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
    )
  }

  return (
    <div className="w-full">
      <motion.div 
        className="flex flex-col items-center space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {levels.map((level, levelIndex) => (
          <motion.div 
            key={levelIndex}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: levelIndex * 0.2, duration: 0.6 }}
          >
            {/* Level Label */}
            <motion.div 
              className="mb-4 px-4 py-2 rounded-full glass-morphism border border-white/20"
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-sm font-medium text-yellow-400">{level.label}</p>
            </motion.div>
            
            {/* Positions Row */}
            <div className="flex justify-center space-x-4">
              {Array.from({ length: level.count }).map((_, posIndex) => {
                const actualIndex = level.start + posIndex
                return renderPosition(positions[actualIndex], actualIndex, levelIndex)
              })}
            </div>
            
            {/* Connection Lines */}
            {levelIndex < levels.length - 1 && (
              <motion.div 
                className="mt-4 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: levelIndex * 0.2 + 0.5 }}
              >
                <svg width="100" height="30" className="text-white/20">
                  <defs>
                    <linearGradient id={`gradient-${levelIndex}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="transparent" />
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <line 
                    x1="20" y1="5" x2="80" y2="25" 
                    stroke={`url(#gradient-${levelIndex})`} 
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  <line 
                    x1="80" y1="5" x2="20" y2="25" 
                    stroke={`url(#gradient-${levelIndex})`} 
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                </svg>
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Legend */}
      <motion.div 
        className="mt-12 flex flex-wrap justify-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        {[
          { label: 'Your Position', class: 'border-purple-500 bg-gradient-to-br from-purple-500/30 to-purple-600/20', icon: '👑' },
          { label: 'Allied Forces', class: 'border-yellow-500/60 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10', icon: '⚔️' },
          { label: 'Vacant Posts', class: 'border-dashed border-white/30 bg-white/5', icon: '🏰' },
        ].map((item, index) => (
          <motion.div 
            key={index}
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className={`w-6 h-6 border-2 rounded-lg ${item.class} flex items-center justify-center`}>
              <span className="text-xs">{item.icon}</span>
            </div>
            <span className="text-sm text-gray-300 font-medium">{item.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default ChessTriangleVisualization