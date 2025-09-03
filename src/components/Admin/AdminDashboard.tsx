'use client'

import React, { useEffect, useState } from 'react'
import { Users, Triangle, DollarSign, Clock, TrendingUp, AlertCircle } from 'lucide-react'

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>({ totalUsers: 0, activeTriangles: 0, pendingDeposits: 0, totalRevenue: 0 })
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [pendingActions, setPendingActions] = useState<any[]>([])
  const [triangles, setTriangles] = useState<{ active: { planType: string; count: number }[]; completed: { planType: string; count: number }[] } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/overview')
      if (!res.ok) throw new Error('Failed to load admin overview')
      const data = await res.json()
      console.log('Admin dashboard data loaded:', data)
      setStats(data.stats)
      setRecentTransactions(data.recentTransactions)
      setPendingActions(data.pendingActions)
      if (data.triangles) setTriangles(data.triangles)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>Loading admin overview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-2 text-gray-600">Manage ForgeChain Networks operations</p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        {error && <div className="mb-4 text-red-600">{error}</div>}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers.toLocaleString(), change: '+0%', changeType: 'neutral', icon: Users },
            { label: 'Active Triangles', value: stats.activeTriangles.toString(), change: '+0%', changeType: 'neutral', icon: Triangle },
            { label: 'Pending Deposits', value: stats.pendingDeposits.toString(), change: '+0%', changeType: 'neutral', icon: Clock },
            { label: 'Total Revenue', value: `${stats.totalRevenue}`, change: '+0%', changeType: 'neutral', icon: DollarSign },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${getChangeColor(stat.changeType)}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <stat.icon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
                  <span className="text-blue-600 text-sm font-medium">Latest 10</span>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {transaction.type === 'deposit' ? (
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                          ) : (
                            <DollarSign className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.user}</p>
                          <p className="text-sm text-gray-500">
                            {transaction.type} • {transaction.plan || '-'} Plan
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{transaction.amount}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{new Date(transaction.time).toLocaleString()}</p>
                        <div className="mt-2 flex items-center justify-end space-x-2">
                          <button
                            onClick={async () => {
                              await fetch(`/api/admin/transactions/${transaction.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'COMPLETED' }) })
                              // Reload data
                              await loadData()
                            }}
                            className="px-2 py-1 rounded bg-green-600 text-white text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={async () => {
                              await fetch(`/api/admin/transactions/${transaction.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'REJECTED' }) })
                              // Reload data  
                              await loadData()
                            }}
                            className="px-2 py-1 rounded bg-red-600 text-white text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pending Actions */}
          <div className="space-y-6">
            {triangles && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Triangles by Plan</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Active</h4>
                    <ul className="space-y-1 text-sm text-gray-800">
                      {triangles.active.map((t) => (
                        <li key={`active-${t.planType}`}>{t.planType}: {t.count}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Completed</h4>
                    <ul className="space-y-1 text-sm text-gray-800">
                      {triangles.completed.map((t) => (
                        <li key={`completed-${t.planType}`}>{t.planType}: {t.count}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Actions</h3>
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {pendingActions.map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {action.type === 'deposit_approval' ? 'Deposit' : 'Payout'} - {action.user}
                        </p>
                        <p className="text-sm text-gray-600">{action.amount}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(action.priority)}`}>
                        {action.priority}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'admin-transactions' }))}
                  className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Review All Actions
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button onClick={() => { localStorage.setItem('tx_type_filter', 'DEPOSIT'); window.dispatchEvent(new CustomEvent('navigate', { detail: 'admin-transactions' })) }} className="w-full text-left p-3 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 transition-colors text-sm">
                  Review Pending Deposits
                </button>
                <button onClick={() => { localStorage.setItem('tx_type_filter', 'PAYOUT'); window.dispatchEvent(new CustomEvent('navigate', { detail: 'admin-transactions' })) }} className="w-full text-left p-3 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 transition-colors text-sm">
                  Process Payouts
                </button>
                <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'admin-plans' }))} className="w-full text-left p-3 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 transition-colors text-sm">
                  Manage Plans
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 transition-colors text-sm">
                  View System Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard