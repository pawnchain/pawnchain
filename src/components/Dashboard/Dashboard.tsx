'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, Users, Target, Clock, Wallet, Award } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import TriangleVisualization from './TriangleVisualization'
import ProgressBar from './ProgressBar'
import ReferralModal from './ReferralModal'
import ChessDepositInstructions from '@/components/Deposit/ChessDepositInstructions'
import TransactionModal from '@/components/Modals/TransactionModal'

interface DashboardProps {
  onNavigate: (page: string) => void
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth()
  const [triangleData, setTriangleData] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReferralModal, setShowReferralModal] = useState(false)
  const [depositInfo, setDepositInfo] = useState<any | null>(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [triangleResponse, transactionsResponse] = await Promise.all([
          fetch('/api/triangle'),
          fetch('/api/transactions'),
        ])

        if (triangleResponse.ok) {
          const data = await triangleResponse.json()
          setTriangleData(data)
        } else {
          setError('Failed to fetch triangle data')
        }

        if (transactionsResponse.ok) {
          const data = await transactionsResponse.json()
          setTransactions(data)
        } else {
          setError('Failed to fetch transactions')
        }

      } catch (err) {
        setError('An error occurred while fetching data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Check for pending deposit from registration
    try {
      const raw = localStorage.getItem('pending_deposit')
      if (raw) {
        const dep = JSON.parse(raw)
        setDepositInfo(dep)
      }
    } catch {}
  }, [])

  const handlePayoutRequest = async (amount: number, walletAddress: string) => {
    try {
      const response = await fetch('/api/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, walletAddress }),
      })

      if (response.ok) {
        // Refresh transactions
        const transactionsResponse = await fetch('/api/transactions')
        if (transactionsResponse.ok) {
          const data = await transactionsResponse.json()
          setTransactions(data)
        }
      } else {
        const error = await response.json()
        alert(`Payout failed: ${error.message}`)
      }
    } catch (err) {
      alert('An error occurred while requesting payout')
    }
  }

  const stats = [
    {
      label: 'Current Balance',
      value: `${user?.balance || 0} USDT`,
      icon: Wallet,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Earned',
      value: `${user?.totalEarned || 0} USDT`,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      label: 'Triangle Position',
      value: user?.trianglePosition || 'Pending',
      icon: Target,
      color: 'bg-purple-500',
    },
    {
      label: 'Active Plan',
      value: user?.plan || 'None',
      icon: Award,
      color: 'bg-yellow-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user?.username}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Triangle Progress */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Triangle Progress</h2>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-500">Active</span>
                </div>
              </div>

              {loading && <p>Loading triangle data...</p>}
              {error && <p>{error}</p>}
              {triangleData && (
                <>
                  <ProgressBar 
                    current={triangleData.completion}
                    total={100} 
                    label="Positions Filled"
                    color="blue"
                  />
                  <div className="mt-8">
                    <TriangleVisualization data={triangleData} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowReferralModal(true)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="font-medium text-gray-900">Invite Friends</div>
                  <div className="text-sm text-gray-500">Share your referral code</div>
                </button>
                <button 
                  onClick={() => handlePayoutRequest(0, '')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors"
                >
                  <div className="font-medium text-gray-900">Request Payout</div>
                  <div className="text-sm text-gray-500">Withdraw your earnings</div>
                </button>
                <button 
                  onClick={() => onNavigate('triangle-detail')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                >
                  <div className="font-medium text-gray-900">View Triangle</div>
                  <div className="text-sm text-gray-500">See your triangle details</div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              {loading && <p>Loading recent activity...</p>}
              {error && <p>{error}</p>}
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tx.type}</p>
                        <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No recent activity.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {showReferralModal && user?.referralCode && (
        <ReferralModal 
          referralCode={user.referralCode}
          onClose={() => setShowReferralModal(false)}
        />
      )}
      {depositInfo && (
        <ChessDepositInstructions
          depositInfo={depositInfo}
          onModalClose={() => {
            setDepositInfo(null)
            localStorage.removeItem('pending_deposit')
          }}
        />
      )}
      {showTransactionModal && currentTransactionId && (
        <TransactionModal
          transactionId={currentTransactionId}
          type="DEPOSIT"
          onClose={() => {
            setShowTransactionModal(false)
            setCurrentTransactionId(null)
            // Refresh data to show updated status
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}

export default Dashboard