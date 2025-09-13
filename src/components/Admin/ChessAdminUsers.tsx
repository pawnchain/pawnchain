'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Search, Filter, Crown, Shield, Sword, Castle, Edit, Trash2, Eye, CheckSquare, Square } from 'lucide-react'

interface User {
  id: string
  username: string
  walletAddress: string
  plan: string
  trianglePosition?: number
  triangleId?: string
  referralCode: string
  balance: number
  totalEarned: number
  createdAt: string
  status: 'active' | 'suspended' | 'pending'
}

const ChessAdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlan, setFilterPlan] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]) // For bulk selection
  const [isSelecting, setIsSelecting] = useState(false) // Toggle bulk selection mode

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/admin/users')
        if (response.ok) {
          const data = await response.json()
          // Fix: API returns array directly, not { users: [...] }
          setUsers(Array.isArray(data) ? data : [])
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to fetch users')
          setUsers([])
        }
      } catch (error: any) {
        console.error('Failed to fetch users:', error)
        setError('Network error while fetching users')
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'suspended':
        return 'bg-red-500/20 text-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    
    return matchesSearch && matchesPlan && matchesStatus
  })

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'delete') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      if (response.ok) {
        // Update user status in local state
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, status: action === 'suspend' ? 'suspended' : action === 'activate' ? 'active' : user.status }
            : user
        ).filter(user => action !== 'delete' || user.id !== userId))
      } else {
        const errorData = await response.json()
        console.error('Failed to update user:', errorData.error)
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  // Handle bulk user selection
  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  // Select all users in current view
  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      // If all are selected, deselect all
      setSelectedUsers([])
    } else {
      // Select all users in current view
      setSelectedUsers(filteredUsers.map(user => user.id))
    }
  }

  // Handle bulk delete action
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to delete')
      return
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`
    )
    
    if (!confirmDelete) return

    try {
      const response = await fetch('/api/admin/users/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUsers })
      })

      if (response.ok) {
        // Remove deleted users from the list
        setUsers(users.filter(user => !selectedUsers.includes(user.id)))
        setSelectedUsers([]) // Clear selection
        setIsSelecting(false) // Exit selection mode
        alert(`Successfully deleted ${selectedUsers.length} user(s)`)
      } else {
        const errorData = await response.json()
        alert(`Failed to delete users: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Failed to delete users:', error)
      alert('Network error while deleting users')
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
              <span className="text-lg">Consulting the royal registry...</span>
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
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    👥
                  </motion.span>
                  Royal Subject Registry
                </h1>
                <p className="text-gray-400 mt-2">Manage kingdom inhabitants and their royal standings</p>
              </div>
              
              <motion.div
                className="text-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-2xl font-bold text-white">{(users || []).length}</p>
                <p className="text-sm text-gray-400">Total Subjects</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by username, wallet, or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="royal-input pl-10 w-full"
                />
              </div>
              
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
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              
              {/* Bulk Actions */}
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => setIsSelecting(!isSelecting)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    isSelecting 
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                      : 'bg-white/10 hover:bg-white/20 text-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSelecting ? 'Cancel' : 'Select'}
                </motion.button>
                
                {isSelecting && (
                  <motion.button
                    onClick={handleBulkDelete}
                    className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={selectedUsers.length === 0}
                  >
                    Delete
                  </motion.button>
                )}
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-400">
              Showing {filteredUsers.length} of {(users || []).length} royal subjects
              {isSelecting && selectedUsers.length > 0 && (
                <span className="ml-2 text-yellow-400">
                  {selectedUsers.length} selected
                </span>
              )}
            </div>
          </motion.div>

          {/* Users Table */}
          <motion.div 
            className="glass-morphism rounded-xl border border-white/10 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-b border-yellow-500/30">
                    {isSelecting && (
                      <th className="text-left p-4 font-bold text-yellow-400 w-12">
                        <motion.button
                          onClick={selectAllUsers}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 ? (
                            <CheckSquare className="w-5 h-5 text-yellow-400" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </motion.button>
                      </th>
                    )}
                    <th className="text-left p-4 font-bold text-yellow-400">Noble</th>
                    <th className="text-left p-4 font-bold text-yellow-400">Plan</th>
                    <th className="text-left p-4 font-bold text-yellow-400">Position</th>
                    <th className="text-left p-4 font-bold text-yellow-400">Treasury</th>
                    <th className="text-left p-4 font-bold text-yellow-400">Status</th>
                    <th className="text-left p-4 font-bold text-yellow-400">Joined</th>
                    <th className="text-left p-4 font-bold text-yellow-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      className={`border-b border-white/5 hover:bg-white/5 transition-all ${
                        selectedUsers.includes(user.id) ? 'bg-yellow-500/10' : ''
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    >
                      {isSelecting && (
                        <td className="p-4">
                          <motion.button
                            onClick={() => toggleUserSelection(user.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {selectedUsers.includes(user.id) ? (
                              <CheckSquare className="w-5 h-5 text-yellow-400" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </motion.button>
                        </td>
                      )}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <motion.div
                            className="text-2xl"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                          >
                            {getPlanPiece(user.plan)}
                          </motion.div>
                          <div>
                            <p className="font-bold text-white">{user.username}</p>
                            <p className="text-xs text-gray-400">{user.walletAddress}</p>
                            <p className="text-xs text-gray-500">Code: {user.referralCode}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium">
                          {user.plan}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        {user.trianglePosition ? (
                          <div>
                            <p className="text-white font-medium">Position {user.trianglePosition}</p>
                            <p className="text-xs text-gray-400">{user.triangleId}</p>
                          </div>
                        ) : (
                          <span className="text-gray-500">No Position</span>
                        )}
                      </td>
                      
                      <td className="p-4">
                        <div>
                          <p className="text-white font-bold">{user.balance.toFixed(2)} USDT</p>
                          <p className="text-xs text-gray-400">Earned: {user.totalEarned.toFixed(2)}</p>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <p className="text-gray-400 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <motion.button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowUserModal(true)
                            }}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          
                          <motion.button
                            onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                            className={`p-2 rounded transition-colors ${
                              user.status === 'active' 
                                ? 'bg-yellow-600 hover:bg-yellow-700' 
                                : 'bg-green-600 hover:bg-green-700'
                            } text-white`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title={user.status === 'active' ? 'Suspend' : 'Activate'}
                          >
                            {user.status === 'active' ? '⏸️' : '▶️'}
                          </motion.button>
                          
                          <motion.button
                            onClick={() => handleUserAction(user.id, 'delete')}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredUsers.length === 0 && (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-6xl mb-4">👥</div>
                <p className="text-gray-400 text-lg">No subjects found</p>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserModal && selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUserModal(false)}
          >
            <motion.div
              className="royal-modal rounded-2xl p-8 max-w-2xl w-full border border-yellow-500/30 max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
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
                  {getPlanPiece(selectedUser.plan)}
                </motion.div>
                <h3 className="text-2xl font-bold gradient-text mb-2">{selectedUser.username}</h3>
                <p className="text-gray-300">Royal Subject Details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-bold text-yellow-400 mb-2">Account Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Username:</span>
                        <span className="text-white">{selectedUser.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Plan:</span>
                        <span className="text-blue-400">{selectedUser.plan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={getStatusColor(selectedUser.status).includes('green') ? 'text-green-400' : 
                                        getStatusColor(selectedUser.status).includes('yellow') ? 'text-yellow-400' : 'text-red-400'}>
                          {selectedUser.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Joined:</span>
                        <span className="text-white">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-bold text-green-400 mb-2">Financial Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Balance:</span>
                        <span className="text-white font-bold">{selectedUser.balance.toFixed(2)} USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Earned:</span>
                        <span className="text-green-400">{selectedUser.totalEarned.toFixed(2)} USDT</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-bold text-purple-400 mb-2">Kingdom Position</h4>
                    <div className="space-y-2 text-sm">
                      {selectedUser.trianglePosition ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Triangle ID:</span>
                            <span className="text-white">{selectedUser.triangleId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Position:</span>
                            <span className="text-purple-400">{selectedUser.trianglePosition}</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-500">No active triangle position</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-bold text-blue-400 mb-2">Referral Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Referral Code:</span>
                        <span className="text-blue-400 font-mono">{selectedUser.referralCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Wallet Address:</span>
                        <span className="text-white font-mono text-xs">{selectedUser.walletAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <motion.button
                  onClick={() => setShowUserModal(false)}
                  className="royal-button px-6 py-2 rounded-lg font-bold"
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

      {/* Floating Chess Pieces */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {['👥', '♔', '♕', '♗', '♘', '👑'].map((piece, index) => (
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

export default ChessAdminUsers