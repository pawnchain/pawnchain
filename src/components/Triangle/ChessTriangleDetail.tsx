'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Shield, Users, Target, TrendingUp, Clock, ArrowLeft } from 'lucide-react'

const ChessTriangleDetail: React.FC = () => {
  const [triangleData, setTriangleData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null)

  useEffect(() => {
    const fetchTriangleData = async () => {
      try {
        const response = await fetch('/api/triangle')
        if (response.ok) {
          const data = await response.json()
          setTriangleData(data)
        } else {
          setError('Failed to fetch triangle data')
        }
      } catch (err) {
        setError('An error occurred while fetching triangle data')
      } finally {
        setLoading(false)
      }
    }

    fetchTriangleData()
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

  const goBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'triangle' }))
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
              <span className="text-lg">Examining royal archives...</span>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen relative">
        <div className="chess-board-pattern absolute inset-0 opacity-5"></div>
        <div className="relative py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="royal-modal rounded-2xl p-8 border border-red-500/30 max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-center">
                <motion.div
                  className="text-6xl mb-4 inline-block"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  💀
                </motion.div>
                <h2 className="text-2xl font-bold text-red-400 mb-4">Archives Corrupted</h2>
                <p className="text-gray-300 text-lg">{error}</p>
                <motion.button
                  onClick={goBack}
                  className="mt-6 royal-button px-6 py-2 rounded-lg font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="inline-block w-4 h-4 mr-2" />
                  Return to Triangle View
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  const mockDetailedData = {
    id: 'triangle-001',
    planType: 'King',
    isComplete: false,
    filledPositions: 8,
    totalPositions: 15,
    createdAt: new Date().toISOString(),
    positions: [
      { key: 'A', username: 'KingPlayer', plan: 'King', joinedAt: '2024-01-15' },
      { key: 'B', username: 'QueenPlayer', plan: 'Queen', joinedAt: '2024-01-16' },
      { key: 'C', username: 'BishopPlayer', plan: 'Bishop', joinedAt: '2024-01-17' },
      { key: 'B1', username: 'Knight1', plan: 'Knight', joinedAt: '2024-01-18' },
      { key: 'B2', username: null, plan: null, joinedAt: null },
      { key: 'C1', username: 'Knight2', plan: 'Knight', joinedAt: '2024-01-19' },
      { key: 'C2', username: null, plan: null, joinedAt: null },
      // ... more positions
    ]
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
            <div className="flex items-center space-x-4 mb-6">
              <motion.button
                onClick={goBack}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-6 h-6 text-gray-300" />
              </motion.button>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Triangle Battle Plans</h1>
                <p className="text-gray-400">Detailed formation analysis and strategy</p>
              </div>
            </div>
          </motion.div>

          {/* Triangle Overview */}
          <motion.div 
            className="glass-morphism rounded-xl p-8 border border-white/10 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
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
                  {getPlanPiece(mockDetailedData.planType)}
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Formation Type</h3>
                <p className="text-yellow-400 text-lg">{mockDetailedData.planType} Triangle</p>
              </div>
              
              <div className="text-center">
                <motion.div
                  className="text-6xl mb-4 inline-block"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⚔️
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Battle Progress</h3>
                <p className="text-green-400 text-lg">
                  {mockDetailedData.filledPositions}/{mockDetailedData.totalPositions} Warriors
                </p>
              </div>
              
              <div className="text-center">
                <motion.div
                  className="text-6xl mb-4 inline-block"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  {mockDetailedData.isComplete ? '🏆' : '⏳'}
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Status</h3>
                <p className={`text-lg ${mockDetailedData.isComplete ? 'text-green-400' : 'text-yellow-400'}`}>
                  {mockDetailedData.isComplete ? 'Battle Ready' : 'Recruiting'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Detailed Position Grid */}
          <motion.div 
            className="glass-morphism rounded-xl p-8 border border-white/10 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Shield className="mr-3 text-yellow-400" />
              Detailed Position Analysis
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {Array.from({ length: 15 }, (_, i) => {
                const positionKeys = ['A', 'B', 'C', 'B1', 'B2', 'C1', 'C2', 'B1a', 'B1b', 'B2a', 'B2b', 'C1a', 'C1b', 'C2a', 'C2b']
                const position = mockDetailedData.positions[i] || { 
                  key: positionKeys[i] || `P${i+1}`, 
                  username: i < 8 ? `Player${i+1}` : null, 
                  plan: i < 8 ? ['King', 'Queen', 'Bishop', 'Knight'][i % 4] : null 
                }
                
                return (
                  <motion.div
                    key={i}
                    className={`relative p-4 rounded-lg border cursor-pointer transition-all ${
                      position.username 
                        ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
                        : 'bg-gray-500/10 border-gray-500/30 hover:bg-gray-500/20'
                    } ${selectedPosition === position.key ? 'ring-2 ring-yellow-500' : ''}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedPosition(selectedPosition === position.key ? null : position.key)}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">
                        {position.username ? getPlanPiece(position.plan || '') : '🏰'}
                      </div>
                      <p className="font-bold text-white text-sm">{position.key}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {position.username || 'Vacant'}
                      </p>
                      {position.username && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400">
                            {position.plan}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Position level indicator */}
                    <div className="absolute top-1 right-1">
                      {i === 0 && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1 rounded">L1</span>}
                      {(i === 1 || i === 2) && <span className="text-xs bg-blue-500/20 text-blue-400 px-1 rounded">L2</span>}
                      {(i >= 3 && i <= 6) && <span className="text-xs bg-purple-500/20 text-purple-400 px-1 rounded">L3</span>}
                      {i >= 7 && <span className="text-xs bg-green-500/20 text-green-400 px-1 rounded">L4</span>}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Position Details Modal */}
          <AnimatePresence>
            {selectedPosition && (
              <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPosition(null)}
              >
                <motion.div
                  className="royal-modal rounded-2xl p-8 max-w-md w-full border border-yellow-500/30"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-center">
                    <motion.div
                      className="text-6xl mb-4 inline-block"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🏰
                    </motion.div>
                    <h3 className="text-2xl font-bold gradient-text mb-4">
                      Position {selectedPosition}
                    </h3>
                    
                    <div className="space-y-4 text-left">
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="font-bold text-yellow-400 mb-2">Position Details</h4>
                        <p className="text-gray-300">Level: Level {selectedPosition === 'A' ? '1' : selectedPosition.length === 1 ? '2' : selectedPosition.length === 2 ? '3' : '4'}</p>
                        <p className="text-gray-300">Type: {selectedPosition === 'A' ? 'Apex' : 'Support'}</p>
                        <p className="text-gray-300">Reward Multiplier: {selectedPosition === 'A' ? '4x' : selectedPosition.length === 1 ? '3x' : '2x'}</p>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-4">
                        <h4 className="font-bold text-green-400 mb-2">Occupancy Status</h4>
                        <p className="text-gray-300">
                          Status: <span className="text-green-400">Filled</span>
                        </p>
                        <p className="text-gray-300">Joined: 3 days ago</p>
                      </div>
                    </div>
                    
                    <motion.button
                      onClick={() => setSelectedPosition(null)}
                      className="mt-6 royal-button px-6 py-2 rounded-lg font-bold w-full"
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

          {/* Formation Strategy */}
          <motion.div 
            className="glass-morphism rounded-xl p-8 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Target className="mr-3 text-purple-400" />
              Battle Strategy Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-yellow-400 mb-4">Formation Strengths</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Strong foundation with {mockDetailedData.filledPositions} warriors
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Balanced plan distribution
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Steady recruitment progress
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-blue-400 mb-4">Strategic Opportunities</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <span className="text-blue-400 mr-2">→</span>
                    {15 - mockDetailedData.filledPositions} positions awaiting recruitment
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-400 mr-2">→</span>
                    Focus on lower tier recruitment
                  </li>
                  <li className="flex items-center">
                    <span className="text-blue-400 mr-2">→</span>
                    Completion will trigger payout cycle
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Chess Pieces */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['♔', '♕', '♗', '♘'].map((piece, index) => (
          <motion.div
            key={index}
            className="absolute text-4xl text-white/10"
            style={{
              left: `${15 + (index * 20)}%`,
              top: `${30 + (index * 15)}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 90, 180, 270, 360],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 6 + index * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 1.5,
            }}
          >
            {piece}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ChessTriangleDetail