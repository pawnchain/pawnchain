'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Triangle, Users, Crown, Shield, Sword, Castle, Eye, TrendingUp } from 'lucide-react'

interface TriangleData {
  id: string
  planType: string
  isComplete: boolean
  completion: string
  filledPositions: number
  totalPositions: number
  createdAt: string
  completedAt: string | null
  payoutProcessed: boolean
  positions: Array<{
    id: string
    positionKey: string
    level: number
    position: number
    user: {
      username: string
      plan: string
    } | null
  }>
}

const ChessAdminTriangles: React.FC = () => {
  const [triangles, setTriangles] = useState<TriangleData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTriangle, setSelectedTriangle] = useState<TriangleData | null>(null)
  const [showTriangleModal, setShowTriangleModal] = useState(false)
  const [filterPlan, setFilterPlan] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const fetchTriangles = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/admin/triangles')
        if (response.ok) {
          const data = await response.json()
          setTriangles(data)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to fetch triangles')
          setTriangles([])
        }
      } catch (error: any) {
        console.error('Failed to fetch triangles:', error)
        setError('Network error while fetching triangles')
        setTriangles([])
      } finally {
        setLoading(false)
      }
    }

    fetchTriangles()
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

  const getStatusColor = (isComplete: boolean, payoutProcessed: boolean) => {
    if (payoutProcessed) return 'bg-gray-500/20 text-gray-400'
    if (isComplete) return 'bg-green-500/20 text-green-400'
    return 'bg-yellow-500/20 text-yellow-400'
  }

  const getStatusLabel = (isComplete: boolean, payoutProcessed: boolean) => {
    if (payoutProcessed) return 'Cycled'
    if (isComplete) return 'Complete'
    return 'Active'
  }

  const filteredTriangles = triangles.filter(triangle => {
    const matchesPlan = filterPlan === 'all' || triangle.planType === filterPlan
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && !triangle.isComplete) ||
      (filterStatus === 'complete' && triangle.isComplete && !triangle.payoutProcessed) ||
      (filterStatus === 'cycled' && triangle.payoutProcessed)
    
    return matchesPlan && matchesStatus
  })

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
              <span className="text-lg">Surveying royal formations...</span>
            </motion.div>
          </div>
        </div>
      </div>
    )
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-text flex items-center">
                  <motion.span
                    className="mr-3 text-4xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    🏰
                  </motion.span>
                  Royal Triangle Formations
                </h1>
                <p className="text-gray-400 mt-2">Monitor and manage all kingdom battle formations</p>
              </div>
              
              <motion.div
                className="text-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-2xl font-bold text-white">{triangles.length}</p>
                <p className="text-sm text-gray-400">Total Formations</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div 
            className="glass-morphism rounded-xl p-6 border border-white/10 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="royal-input w-full"
              >
                <option value="all">All Plans</option>
                <option value="King">King ♔</option>
                <option value="Queen">Queen ♕</option>
                <option value="Bishop">Bishop ♗</option>
                <option value="Knight">Knight ♘</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="royal-input w-full"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Formations</option>
                <option value="complete">Complete Formations</option>
                <option value="cycled">Cycled Formations</option>
              </select>
            </div>
            
            <div className="mt-4 text-sm text-gray-400">
              Showing {filteredTriangles.length} of {triangles.length} royal formations
            </div>
          </motion.div>

          {/* Triangles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTriangles.map((triangle, index) => (
              <motion.div
                key={triangle.id}
                className="glass-morphism rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => {
                  setSelectedTriangle(triangle)
                  setShowTriangleModal(true)
                }}
              >
                {/* Triangle Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="text-3xl"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                    >
                      {getPlanPiece(triangle.planType)}
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{triangle.planType}</h3>
                      <p className="text-sm text-gray-400">Formation #{triangle.id.slice(-6)}</p>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(triangle.isComplete, triangle.payoutProcessed)}`}>
                    {getStatusLabel(triangle.isComplete, triangle.payoutProcessed)}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Formation Progress</span>
                    <span className="text-white font-bold">{triangle.filledPositions}/15</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${triangle.completion}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{triangle.completion}% Complete</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-2 bg-white/5 rounded">
                    <p className="text-gray-400">Created</p>
                    <p className="text-white font-medium">
                      {new Date(triangle.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded">
                    <p className="text-gray-400">Warriors</p>
                    <p className="text-blue-400 font-bold">{triangle.filledPositions}</p>
                  </div>
                </div>

                {/* View Details Button */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedTriangle(triangle)
                    setShowTriangleModal(true)
                  }}
                  className="w-full mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Eye className="w-4 h-4" />
                  <span>View Formation</span>
                </motion.button>
              </motion.div>
            ))}
          </div>

          {filteredTriangles.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-6xl mb-4">🏰</div>
              <p className="text-gray-400 text-lg">No formations found</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Triangle Details Modal */}
      <AnimatePresence>
        {showTriangleModal && selectedTriangle && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTriangleModal(false)}
          >
            <motion.div
              className="royal-modal rounded-2xl p-8 max-w-4xl w-full border border-yellow-500/30 max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-8">
                <motion.div
                  className="text-6xl mb-4 inline-block"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity
                  }}
                >
                  {getPlanPiece(selectedTriangle.planType)}
                </motion.div>
                <h3 className="text-2xl font-bold gradient-text mb-2">
                  {selectedTriangle.planType} Formation Details
                </h3>
                <p className="text-gray-300">Formation #{selectedTriangle.id.slice(-8)}</p>
              </div>

              {/* Formation Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <h4 className="font-bold text-blue-400 mb-2">Progress</h4>
                  <p className="text-2xl font-bold text-white">{selectedTriangle.completion}%</p>
                  <p className="text-sm text-gray-400">{selectedTriangle.filledPositions}/15 positions</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <h4 className="font-bold text-green-400 mb-2">Status</h4>
                  <p className="text-lg font-bold text-white">
                    {getStatusLabel(selectedTriangle.isComplete, selectedTriangle.payoutProcessed)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {selectedTriangle.completedAt ? 
                      `Completed ${new Date(selectedTriangle.completedAt).toLocaleDateString()}` :
                      `Created ${new Date(selectedTriangle.createdAt).toLocaleDateString()}`
                    }
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <h4 className="font-bold text-purple-400 mb-2">Plan Type</h4>
                  <p className="text-lg font-bold text-white">{selectedTriangle.planType}</p>
                  <p className="text-sm text-gray-400">Investment tier</p>
                </div>
              </div>

              {/* Position Grid */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-white mb-6 text-center">Formation Layout</h4>
                <div className="grid grid-cols-5 gap-3">
                  {selectedTriangle.positions.map((position, index) => (
                    <motion.div
                      key={position.id}
                      className={`p-3 rounded-lg border text-center ${
                        position.user 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-gray-500/10 border-gray-500/30'
                      }`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-2xl mb-1">
                        {position.user ? getPlanPiece(position.user.plan) : '🏰'}
                      </div>
                      <p className="text-xs font-bold text-yellow-400">{position.positionKey}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {position.user?.username || 'Vacant'}
                      </p>
                      {position.user && (
                        <span className="inline-block mt-1 px-1 py-0.5 text-xs rounded bg-blue-500/20 text-blue-400">
                          {position.user.plan}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <motion.button
                  onClick={() => setShowTriangleModal(false)}
                  className="royal-button px-6 py-2 rounded-lg font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close Formation View
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chess Pieces */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['🏰', '⚔️', '🛡️', '👑', '📊', '💎'].map((piece, index) => (
          <motion.div
            key={index}
            className="absolute text-4xl text-white/5"
            style={{
              left: `${5 + (index * 18)}%`,
              top: `${15 + (index * 12)}%`,
            }}
            animate={{
              y: [0, -25, 0],
              rotate: [0, 180, 360],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 6 + index * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.8,
            }}
          >
            {piece}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ChessAdminTriangles