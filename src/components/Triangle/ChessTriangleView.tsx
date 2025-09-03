'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Clock, Target, Award, TrendingUp, AlertCircle, Crown, Shield, Sword, Castle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ChessTriangleVisualization from '@/components/Dashboard/ChessTriangleVisualization'
import ChessProgressBar from '@/components/Dashboard/ChessProgressBar'

interface Position {
  id: string
  positionKey: string
  username: string | null
  planType: string | null
}

interface TriangleData {
  id: string
  planType: string
  isComplete: boolean
  positions: Position[]
}

const ChessTriangleView: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'history'>('overview')
  const [triangleData, setTriangleData] = useState<TriangleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userPosition, setUserPosition] = useState<string | null>(null)

  useEffect(() => {
    const fetchTriangleData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/user/position')
        if (!response.ok) {
          if (response.status === 404) {
            setError('You have not joined any triangle yet')
            return
          }
          throw new Error('Failed to fetch triangle data')
        }
        const data = await response.json()
        setTriangleData(data.triangle)
        setUserPosition(data.positionKey)
      } catch (err: any) {
        setError(err.message || 'Failed to load triangle data')
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
              <span className="text-lg">Consulting the royal cartographer...</span>
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
              className="royal-modal rounded-2xl p-8 border border-yellow-500/30 max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-center">
                <motion.div
                  className="text-6xl mb-4 inline-block"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🏰
                </motion.div>
                <h2 className="text-2xl font-bold gradient-text mb-4">No Kingdom Found</h2>
                <p className="text-gray-300 text-lg">{error}</p>
                <p className="text-gray-400 mt-3">Join a triangle to view your kingdom map</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  if (!triangleData) {
    return (
      <div className="min-h-screen relative">
        <div className="chess-board-pattern absolute inset-0 opacity-5"></div>
        <div className="relative py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-400">No triangle data available</p>
          </div>
        </div>
      </div>
    )
  }

  const filledPositions = triangleData.positions.filter(p => p.username).length
  const totalPositions = 15
  const completion = (filledPositions / totalPositions) * 100
  
  const mockTriangleData = {
    positions: triangleData.positions.map(p => 
      p.username ? {
        id: p.id,
        username: p.username,
        plan: p.planType || 'Unknown'
      } : null
    ),
    currentUserPosition: triangleData.positions.findIndex(p => p.positionKey === userPosition),
    completion,
  }

  const getExpectedPayout = (positionKey: string) => {
    if (positionKey === 'A') return '4x Plan'
    if (positionKey === 'B' || positionKey === 'C') return '3x Plan'
    if (['B1', 'B2', 'C1', 'C2'].includes(positionKey)) return '2x Plan'
    return '4x Plan'
  }

  const triangleStats = [
    {
      label: 'Total Positions',
      value: totalPositions.toString(),
      icon: Users,
      color: 'text-blue-400',
      piece: '👥'
    },
    {
      label: 'Filled Positions',
      value: filledPositions.toString(),
      icon: Target,
      color: 'text-green-400',
      piece: '⚔️'
    },
    {
      label: 'Your Position',
      value: userPosition || 'Unknown',
      icon: Award,
      color: 'text-purple-400',
      piece: getPlanPiece(user?.plan || '')
    },
    {
      label: 'Expected Payout',
      value: userPosition ? getExpectedPayout(userPosition) : 'Unknown',
      icon: TrendingUp,
      color: 'text-yellow-400',
      piece: '💰'
    },
  ]

  const positionHistory = triangleData.positions
    .filter(p => p.username)
    .map((p, index) => ({
      position: p.positionKey,
      user: p.username!,
      timestamp: 'Recently joined',
      status: 'confirmed',
    }))

  return (
    <div className="min-h-screen relative">
      <div className="chess-board-pattern absolute inset-0 opacity-5"></div>
      
      <div className="relative py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
            className="mb-12 text-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
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
              {getPlanPiece(triangleData.planType)}
            </motion.div>
            <h1 className="text-4xl font-bold gradient-text mb-3">
              Royal Triangle Map
            </h1>
            <p className="text-xl text-gray-300">
              Survey your kingdom's formation, noble {user?.plan || 'Knight'}
            </p>
          </motion.div>

          {/* Triangle Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {triangleStats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="glass-morphism rounded-xl p-6 border border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                  <motion.div
                    className="text-3xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                  >
                    {stat.piece}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Triangle Complete Alert */}
          {triangleData.isComplete && userPosition === 'A' && (
            <motion.div 
              className="royal-modal rounded-xl p-6 mb-8 border border-green-500/30"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center">
                <motion.div
                  className="text-4xl mr-4"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  👑
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-400 mb-2">
                    🎉 Kingdom Complete! Royal Treasury Awaits
                  </h3>
                  <p className="text-green-300 mb-3">
                    Magnificent! Your triangle fortress stands complete with all 15 positions filled. 
                    As the sovereign ruler of position A, you may now claim the royal treasury and 
                    initiate the triangle division ceremony.
                  </p>
                  <motion.button 
                    onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'wallet' }))}
                    className="royal-button px-6 py-2 rounded-lg font-bold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Enter Royal Treasury →
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Progress Overview */}
          <motion.div 
            className="glass-morphism rounded-xl p-8 border border-white/10 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <motion.span
                className="mr-3 text-3xl"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                ⚔️
              </motion.span>
              Kingdom Formation Progress
            </h3>
            <ChessProgressBar 
              current={filledPositions} 
              total={totalPositions} 
              label="Battle Formation"
              color="gold"
            />
            <div className="mt-6 text-center">
              <p className="text-gray-300">
                {filledPositions} of {totalPositions} noble warriors have joined your cause
              </p>
              {!triangleData.isComplete && (
                <p className="text-yellow-400 mt-2">
                  {totalPositions - filledPositions} more positions needed to complete the formation
                </p>
              )}
            </div>
          </motion.div>

          {/* Triangle Visualization */}
          <motion.div 
            className="glass-morphism rounded-xl p-8 border border-white/10 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Battle Formation Diagram
            </h3>
            <ChessTriangleVisualization triangleData={mockTriangleData} />
          </motion.div>

          {/* Tabs Navigation */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-black/20 rounded-xl p-1">
              {[
                { key: 'overview', label: 'Overview', icon: '🏰' },
                { key: 'positions', label: 'Positions', icon: '⚔️' },
                { key: 'history', label: 'History', icon: '📜' }
              ].map((tab) => (
                <motion.button
                  key={tab.key}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setActiveTab(tab.key as any)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <div className="glass-morphism rounded-xl p-8 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-6">Kingdom Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-3">Your Position Details</h4>
                      <div className="space-y-2 text-gray-400">
                        <p>Position: <span className="text-yellow-400 font-bold">{userPosition || 'Unknown'}</span></p>
                        <p>Plan: <span className="text-blue-400">{user?.plan || 'Unknown'}</span></p>
                        <p>Expected Reward: <span className="text-green-400">{userPosition ? getExpectedPayout(userPosition) : 'Unknown'}</span></p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-3">Formation Status</h4>
                      <div className="space-y-2 text-gray-400">
                        <p>Progress: <span className="text-purple-400">{completion.toFixed(1)}% Complete</span></p>
                        <p>Status: <span className={triangleData.isComplete ? 'text-green-400' : 'text-yellow-400'}>
                          {triangleData.isComplete ? 'Battle Ready' : 'Recruiting'}
                        </span></p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'positions' && (
                <div className="glass-morphism rounded-xl p-8 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-6">Position Roster</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {triangleData.positions.map((position, index) => (
                      <motion.div
                        key={position.positionKey}
                        className={`p-4 rounded-lg border ${
                          position.username 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-gray-500/10 border-gray-500/30'
                        } ${position.positionKey === userPosition ? 'ring-2 ring-yellow-500' : ''}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">
                            {position.username ? getPlanPiece(position.planType || '') : '🏰'}
                          </div>
                          <div>
                            <p className="font-bold text-white">Position {position.positionKey}</p>
                            <p className="text-sm text-gray-400">
                              {position.username || 'Vacant'}
                            </p>
                            {position.positionKey === userPosition && (
                              <span className="text-xs text-yellow-400 font-bold">YOUR POSITION</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="glass-morphism rounded-xl p-8 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-6">Formation History</h3>
                  {positionHistory.length > 0 ? (
                    <div className="space-y-4">
                      {positionHistory.map((entry, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">⚔️</div>
                            <div>
                              <p className="text-white font-medium">{entry.user}</p>
                              <p className="text-sm text-gray-400">Joined Position {entry.position}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">{entry.timestamp}</p>
                            <span className="inline-block px-2 py-1 text-xs rounded bg-green-500/20 text-green-400">
                              {entry.status}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📜</div>
                      <p className="text-gray-400">No formation history available</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Chess Pieces */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['♔', '♕', '♗', '♘', '♖', '♙'].map((piece, index) => (
          <motion.div
            key={index}
            className="absolute text-6xl text-white/5"
            style={{
              left: `${10 + (index * 15)}%`,
              top: `${20 + (index * 10)}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{
              duration: 8 + index * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5,
            }}
          >
            {piece}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ChessTriangleView