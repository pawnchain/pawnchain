'use client'

import React, { useEffect, useState } from 'react'
import { Search, Filter, Eye, Trash2, User, Crown } from 'lucide-react'

const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlan, setSelectedPlan] = useState('all')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/users')
        if (!res.ok) throw new Error('Failed to load users')
        const data = await res.json()
        setUsers(data.map((u: any) => ({
          id: u.id,
          username: u.username,
          walletAddress: u.walletAddress,
          plan: u.planType,
          status: u.isAdmin ? 'admin' : (u.status === 'CONFIRMED' ? 'active' : 'pending'),
          joinedDate: u.createdAt,
          triangleId: u.triangleId || '-',
          trianglePosition: u.positionKey || '-',
          triangleComplete: u.triangleComplete || false,
          filledPositions: u.filledPositions || 0,
          balance: u.balance ? `${u.balance.toFixed(2)}` : '0.00',
          totalEarned: u.totalEarned ? `${u.totalEarned.toFixed(2)}` : '0.00',
          planEarnings: u.planEarnings ? `${u.planEarnings.toFixed(2)}` : '0.00',
          referralBonus: u.referralBonus ? `${u.referralBonus.toFixed(2)}` : '0.00',
          referralCode: u.id.slice(-8), // Last 8 characters of ObjectId
          referrals: u.referralCount ? u.referralCount.toString() : '0',
          isAdmin: u.isAdmin,
        })))
      } catch (e: any) {
        setError(e.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>Loading users...</p>
        </div>
      </div>
    )
  }

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlan = selectedPlan === 'all' || user.plan === selectedPlan
    return matchesSearch && matchesPlan
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending_payout':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getPlanIcon = (plan: string) => {
    const icons = {
      King: '♔',
      Queen: '♕',
      Bishop: '♗',
      Knight: '♘',
    }
    return icons[plan as keyof typeof icons] || '•'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">Manage all user accounts and activities</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by username or wallet address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Plans</option>
                <option value="King">King</option>
                <option value="Queen">Queen</option>
                <option value="Bishop">Bishop</option>
                <option value="Knight">Knight</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Triangle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referrals</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500 font-mono">
                            {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getPlanIcon(user.plan)}</span>
                        <span className="text-sm font-medium text-gray-900">{user.plan}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{user.triangleId.slice(0, 8)}...</div>
                        <div className="text-gray-500">Position: {user.trianglePosition}</div>
                        <div className="text-xs text-gray-400">
                          {user.triangleComplete ? 
                            `Complete (${user.filledPositions}/15)` : 
                            `Progress (${user.filledPositions}/15)`
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{user.balance} USDT</div>
                        <div className="text-gray-500">Plan: {user.planEarnings} USDT</div>
                        <div className="text-gray-500">Bonus: {user.referralBonus} USDT</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Crown className="h-4 w-4 text-yellow-600 mr-1" />
                        <span className="font-medium">{user.referrals}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Username</label>
                    <p className="text-sm text-gray-900">{selectedUser.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Wallet Address</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedUser.walletAddress}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Plan</label>
                    <p className="text-sm text-gray-900">{selectedUser.plan}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Triangle</label>
                    <p className="text-sm text-gray-900">
                      {selectedUser.triangleId !== '-' ? 
                        `${selectedUser.triangleId.slice(0, 8)}... (Position: ${selectedUser.trianglePosition})` : 
                        'Not assigned'
                      }
                    </p>
                    {selectedUser.triangleId !== '-' && (
                      <p className="text-xs text-gray-500">
                        {selectedUser.triangleComplete ? 'Complete' : 'In Progress'} 
                        ({selectedUser.filledPositions}/15 positions)
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Available Balance</label>
                    <p className="text-sm text-gray-900">{selectedUser.balance} USDT</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Plan Earnings</label>
                    <p className="text-sm text-gray-900">{selectedUser.planEarnings} USDT</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Referral Bonus</label>
                    <p className="text-sm text-gray-900">{selectedUser.referralBonus} USDT</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Referral Code</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedUser.referralCode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Total Referrals</label>
                    <p className="text-sm text-gray-900">{selectedUser.referrals} users</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center space-x-3 mt-6">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/admin/users/${selectedUser.id}/pending-transactions`)
                        const data = await res.json()
                        const pending = data[0]
                        if (!pending) return
                        await fetch(`/api/admin/transactions/${pending.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'COMPLETED' }) })
                        alert('Approved latest pending transaction')
                      } catch {}
                    }}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
                  >
                    Approve Pending
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/admin/users/${selectedUser.id}/pending-transactions`)
                        const data = await res.json()
                        const pending = data[0]
                        if (!pending) return
                        await fetch(`/api/admin/transactions/${pending.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'REJECTED' }) })
                        alert('Rejected latest pending transaction')
                      } catch {}
                    }}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
                  >
                    Reject Pending
                  </button>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers